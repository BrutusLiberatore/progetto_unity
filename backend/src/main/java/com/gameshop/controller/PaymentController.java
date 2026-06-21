package com.gameshop.controller;

import com.gameshop.model.Order;
import com.gameshop.model.OrderItem;
import com.gameshop.model.Product;
import com.gameshop.repository.OrderRepository;
import com.gameshop.repository.ProductRepository;
import com.gameshop.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;

    @Autowired
    public PaymentController(PaymentService paymentService, OrderRepository orderRepository, ProductRepository productRepository) {
        this.paymentService = paymentService;
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
    }

    @PostMapping("/create-order")
    @Transactional
    public ResponseEntity<?> createOrder(@RequestBody Map<String, Object> request) {
        try {
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> items = (List<Map<String, Object>>) request.get("items");
            Long userId = request.get("userId") != null ? ((Number) request.get("userId")).longValue() : null;

            if (items == null || items.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Nessun elemento nel carrello"));
            }

            List<OrderItem> orderItems = new ArrayList<>();
            long totalCents = 0;

            for (Map<String, Object> item : items) {
                Long productId = ((Number) item.get("id")).longValue();
                int quantity = ((Number) item.get("quantity")).intValue();

                Product product = productRepository.findById(productId).orElse(null);
                if (product == null) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Prodotto non trovato: " + productId));
                }

                OrderItem orderItem = new OrderItem();
                orderItem.setProductId(productId);
                orderItem.setProductName(product.getName());
                orderItem.setQuantity(quantity);
                orderItem.setPriceCents(product.getPriceCents());
                orderItems.add(orderItem);

                totalCents += product.getPriceCents() * quantity;
            }

            Order order = new Order();
            order.setUserId(userId);
            order.setTotalCents(totalCents);
            order.setStatus(Order.OrderStatus.PENDING);
            order.setItems(orderItems);

            System.out.println("Creating order for userId: " + userId + ", total: " + totalCents);

            for (OrderItem item : orderItems) {
                item.setOrder(order);
            }

            Order savedOrder = orderRepository.save(order);
            System.out.println("Order saved with id: " + savedOrder.getId());

            return ResponseEntity.ok(Map.of(
                "orderId", savedOrder.getId(),
                "totalCents", savedOrder.getTotalCents(),
                "status", savedOrder.getStatus().name()
            ));

        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/intent")
    public ResponseEntity<?> createPaymentIntent(@RequestBody Map<String, Object> request) {
        try {
            Long orderId = ((Number) request.get("orderId")).longValue();
            Map<String, String> intent = paymentService.createPaymentIntent(orderId);
            return ResponseEntity.ok(intent);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/webhook")
    public ResponseEntity<String> handleWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader) {
        paymentService.handleStripeWebhook(payload, sigHeader);
        return ResponseEntity.ok("OK");
    }

    @PostMapping("/confirm")
    public ResponseEntity<?> confirmPayment(@RequestBody Map<String, Object> request) {
        try {
            String paymentIntentId = (String) request.get("paymentIntentId");
            if (paymentIntentId == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "paymentIntentId mancante"));
            }
            System.out.println("[PaymentController] Confirming payment: " + paymentIntentId);
            paymentService.markOrderAsCompleted(paymentIntentId);
            return ResponseEntity.ok(Map.of("message", "Pagamento confermato"));
        } catch (Exception e) {
            System.out.println("[PaymentController] Confirm error: " + e.getMessage());
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
}