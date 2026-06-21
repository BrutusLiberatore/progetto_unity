package com.gameshop.controller;

import com.gameshop.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/webhooks")
public class WebhookController {

    @Autowired
    private PaymentService paymentService;

    @Value("${stripe.webhook.secret}")
    private String webhookSecret;

    @PostMapping("/stripe")
    @Transactional
    public ResponseEntity<?> handleStripeWebhook(@RequestBody String payload, @RequestHeader("Stripe-Signature") String signature) {
        try {
            Map<String, Object> event = paymentService.constructWebhookEvent(payload, signature, webhookSecret);
            
            String eventType = (String) event.get("type");
            Map<String, Object> data = (Map<String, Object>) event.get("data");
            Map<String, Object> object = (Map<String, Object>) data.get("object");
            
            switch (eventType) {
                case "payment_intent.succeeded":
                    handlePaymentSuccess(object);
                    break;
                case "payment_intent.payment_failed":
                    handlePaymentFailed(object);
                    break;
                case "charge.refunded":
                    handleChargeRefunded(object);
                    break;
                default:
                    System.out.println("Unhandled event type: " + eventType);
            }
            
            return ResponseEntity.ok(Map.of("received", true));
        } catch (Exception e) {
            System.out.println("Webhook error: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    private void handlePaymentSuccess(Map<String, Object> paymentIntent) {
        String paymentIntentId = (String) paymentIntent.get("id");
        System.out.println("Payment succeeded: " + paymentIntentId);
        
        try {
            paymentService.markOrderAsCompleted(paymentIntentId);
        } catch (Exception e) {
            System.out.println("Error marking order as completed: " + e.getMessage());
        }
    }

    private void handlePaymentFailed(Map<String, Object> paymentIntent) {
        String paymentIntentId = (String) paymentIntent.get("id");
        String lastPaymentError = (String) paymentIntent.get("last_payment_error");
        System.out.println("Payment failed: " + paymentIntentId + " - " + lastPaymentError);
        
        try {
            paymentService.markOrderAsFailed(paymentIntentId, lastPaymentError);
        } catch (Exception e) {
            System.out.println("Error marking order as failed: " + e.getMessage());
        }
    }

    private void handleChargeRefunded(Map<String, Object> charge) {
        String chargeId = (String) charge.get("id");
        System.out.println("Charge refunded: " + chargeId);
    }
}