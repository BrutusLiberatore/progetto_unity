package com.gameshop.service;

import com.gameshop.model.Order;
import com.gameshop.model.OrderItem;
import com.gameshop.model.Payment;
import com.gameshop.model.Product;
import com.gameshop.model.User;
import com.gameshop.model.UserBoost;
import com.gameshop.repository.OrderRepository;
import com.gameshop.repository.PaymentRepository;
import com.gameshop.repository.ProductRepository;
import com.gameshop.repository.UserBoostRepository;
import com.gameshop.repository.UserRepository;
import com.stripe.Stripe;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import com.stripe.model.PaymentIntent;
import com.stripe.net.Webhook;
import com.stripe.param.PaymentIntentCreateParams;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class PaymentService {

    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final UserBoostRepository userBoostRepository;
    private EmailService emailService;

    @Value("${stripe.api.key}")
    private String stripeApiKey;

    @Value("${stripe.webhook.secret}")
    private String webhookSecret;

    @Autowired
    public void setEmailService(EmailService emailService) {
        this.emailService = emailService;
    }

    public PaymentService(OrderRepository orderRepository, PaymentRepository paymentRepository, UserRepository userRepository, ProductRepository productRepository, UserBoostRepository userBoostRepository) {
        this.orderRepository = orderRepository;
        this.paymentRepository = paymentRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.userBoostRepository = userBoostRepository;
    }

    @Transactional
    public Map<String, String> createPaymentIntent(Long orderId) throws StripeException {
        Stripe.apiKey = stripeApiKey;

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));

        if (order.getStatus() != Order.OrderStatus.PENDING) {
            throw new RuntimeException("Order already processed, status: " + order.getStatus());
        }

        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(order.getTotalCents())
                .setCurrency("eur")
                .setAutomaticPaymentMethods(
                    PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                        .setEnabled(true)
                        .build()
                )
                .putMetadata("order_id", orderId.toString())
                .build();

        PaymentIntent paymentIntent = PaymentIntent.create(params);

        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setStripePaymentIntentId(paymentIntent.getId());
        payment.setStatus("pending");
        payment.setAmount(order.getTotalCents());
        paymentRepository.save(payment);

        order.setStripePaymentIntentId(paymentIntent.getId());
        orderRepository.save(order);

        Map<String, String> response = new HashMap<>();
        response.put("clientSecret", paymentIntent.getClientSecret());
        response.put("paymentId", paymentIntent.getId());
        return response;
    }

    @Transactional
    public String handleStripeWebhook(String payload, String sigHeader) {
        Stripe.apiKey = stripeApiKey;

        Event event;
        try {
            event = Webhook.constructEvent(payload, sigHeader, webhookSecret);
        } catch (SignatureVerificationException e) {
            return "Webhook signature verification failed";
        }

        if ("payment_intent.succeeded".equals(event.getType())) {
            var paymentIntent = event.getDataObjectDeserializer().getObject().orElse(null);
            if (paymentIntent instanceof PaymentIntent pi) {
                handleSuccessfulPayment(pi);
            }
        } else if ("payment_intent.payment_failed".equals(event.getType())) {
            var paymentIntent = event.getDataObjectDeserializer().getObject().orElse(null);
            if (paymentIntent instanceof PaymentIntent pi) {
                handleFailedPayment(pi);
            }
        }

        return "OK";
    }

    private void handleSuccessfulPayment(PaymentIntent paymentIntent) {
        String paymentIntentId = paymentIntent.getId();
        System.out.println("[PaymentService] handleSuccessfulPayment: " + paymentIntentId);
        
        Payment payment = paymentRepository.findByStripePaymentIntentId(paymentIntentId)
                .orElse(null);

        if (payment != null) {
            payment.setStatus("succeeded");
            paymentRepository.save(payment);

            Order order = payment.getOrder();
            if (order != null) {
                order.setStatus(Order.OrderStatus.COMPLETED);
                orderRepository.save(order);

                if (order.getUserId() != null) {
                    System.out.println("[PaymentService] Granting boosts for order " + order.getId() + " user " + order.getUserId());
                    grantBoostsForOrder(order);
                }
            }
        } else {
            System.out.println("[PaymentService] No payment found for PI: " + paymentIntentId);
        }
    }

    private void handleFailedPayment(PaymentIntent paymentIntent) {
        String paymentIntentId = paymentIntent.getId();
        
        Payment payment = paymentRepository.findByStripePaymentIntentId(paymentIntentId)
                .orElse(null);

        if (payment != null) {
            payment.setStatus("failed");
            paymentRepository.save(payment);

            Order order = payment.getOrder();
            if (order != null) {
                order.setStatus(Order.OrderStatus.FAILED);
                orderRepository.save(order);
            }
        }
    }

    public Map<String, Object> constructWebhookEvent(String payload, String signature, String webhookSecret) {
        try {
            Event event = Webhook.constructEvent(payload, signature, webhookSecret);
            Map<String, Object> result = new HashMap<>();
            result.put("type", event.getType());
            Map<String, Object> data = new HashMap<>();
            var dataObject = event.getDataObjectDeserializer().getObject().orElse(null);
            if (dataObject != null) {
                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                data.put("object", mapper.convertValue(dataObject, Map.class));
            }
            result.put("data", data);
            return result;
        } catch (SignatureVerificationException e) {
            throw new RuntimeException("Invalid webhook signature", e);
        }
    }

    @Transactional
    public void markOrderAsCompleted(String paymentIntentId) {
        paymentRepository.findByStripePaymentIntentId(paymentIntentId).ifPresent(payment -> {
            payment.setStatus("succeeded");
            paymentRepository.save(payment);

            Order order = payment.getOrder();
            if (order != null) {
                order.setStatus(Order.OrderStatus.COMPLETED);
                orderRepository.save(order);

                if (order.getUserId() != null) {
                    grantBoostsForOrder(order);
                }
                
                User user = order.getUserId() != null ? userRepository.findById(order.getUserId()).orElse(null) : null;
                String email = user != null ? user.getEmail() : null;
                String username = user != null ? user.getUsername() : "Cliente";
                if (email != null) {
                    try {
                        emailService.sendOrderConfirmationEmail(email, username, Map.of(
                            "id", order.getId(),
                            "totalCents", order.getTotalCents(),
                            "items", order.getItems().stream().map(item -> Map.of(
                                "productName", item.getProductName(),
                                "quantity", item.getQuantity()
                            )).toList()
                        ));
                    } catch (Exception e) {
                        System.out.println("Email error: " + e.getMessage());
                    }
                }
            }
        });
    }

    private void grantBoostsForOrder(Order order) {
        System.out.println("[PaymentService] grantBoostsForOrder: order " + order.getId() + ", items=" + order.getItems().size());
        for (OrderItem item : order.getItems()) {
            System.out.println("[PaymentService] OrderItem: productId=" + item.getProductId() + ", name=" + item.getProductName() + ", qty=" + item.getQuantity());
            Optional<Product> productOpt = productRepository.findById(item.getProductId());
            if (productOpt.isEmpty()) {
                System.out.println("[PaymentService] Product not found: " + item.getProductId());
                continue;
            }
            Product product = productOpt.get();
            System.out.println("[PaymentService] Product type: " + product.getType());
            if (!"boost".equals(product.getType())) continue;

            for (int i = 0; i < item.getQuantity(); i++) {
                UserBoost boost = new UserBoost();
                boost.setUserId(order.getUserId());
                boost.setProductName(product.getName());
                boost.setBoostType(parseBoostType(product.getName()));
                boost.setDurationMinutes(parseBoostDuration(product.getName()));
                boost.setMultiplier(2.0);
                boost.setIsActive(false);
                userBoostRepository.save(boost);
                System.out.println("[PaymentService] Boost granted: " + product.getName() + " to user " + order.getUserId());
            }
        }
    }

    private String parseBoostType(String productName) {
        String lower = productName.toLowerCase();
        if (lower.contains("xp")) return "xp";
        if (lower.contains("drop")) return "drop";
        if (lower.contains("score")) return "score";
        if (lower.contains("pet") || lower.contains("vip")) return "pet_vip";
        return "generic";
    }

    private int parseBoostDuration(String productName) {
        String lower = productName.toLowerCase();
        if (lower.contains("1h") || lower.contains("1 h")) return 60;
        if (lower.contains("2h") || lower.contains("2 h")) return 120;
        if (lower.contains("24h") || lower.contains("24 h") || lower.contains("24gg")) return 1440;
        if (lower.contains("30gg") || lower.contains("30 g")) return 43200;
        return 60;
    }

    public void markOrderAsFailed(String paymentIntentId, String reason) {
        paymentRepository.findByStripePaymentIntentId(paymentIntentId).ifPresent(payment -> {
            payment.setStatus("failed");
            paymentRepository.save(payment);

            Order order = payment.getOrder();
            if (order != null) {
                order.setStatus(Order.OrderStatus.FAILED);
                orderRepository.save(order);
            }
        });
    }
}