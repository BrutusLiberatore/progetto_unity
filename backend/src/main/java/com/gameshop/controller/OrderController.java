package com.gameshop.controller;

import com.gameshop.model.Order;
import com.gameshop.model.OrderItem;
import com.gameshop.model.User;
import com.gameshop.repository.OrderRepository;
import com.gameshop.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.ArrayList;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<List<Map<String, Object>>> getAllOrders() {
        List<Order> orders = orderRepository.findAllByOrderByCreatedAtDesc();
        List<Map<String, Object>> result = new ArrayList<>();
        
        for (Order order : orders) {
            Map<String, Object> o = new HashMap<>();
            o.put("id", order.getId());
            o.put("userId", order.getUserId());
            o.put("totalCents", order.getTotalCents());
            o.put("status", order.getStatus() != null ? order.getStatus().name() : null);
            o.put("stripePaymentIntentId", order.getStripePaymentIntentId());
            o.put("createdAt", order.getCreatedAt() != null ? order.getCreatedAt().toLocalDate().toString() : null);
            
            if (order.getUserId() != null) {
                userRepository.findById(order.getUserId()).ifPresent(user -> {
                    Map<String, Object> userMap = new HashMap<>();
                    userMap.put("id", user.getId());
                    userMap.put("username", user.getUsername());
                    userMap.put("email", user.getEmail());
                    o.put("user", userMap);
                });
            }
            
            List<Map<String, Object>> itemsList = new ArrayList<>();
            for (OrderItem item : order.getItems()) {
                Map<String, Object> itemMap = new HashMap<>();
                itemMap.put("id", item.getId());
                itemMap.put("productId", item.getProductId());
                itemMap.put("productName", item.getProductName());
                itemMap.put("quantity", item.getQuantity());
                itemMap.put("priceCents", item.getPriceCents());
                itemsList.add(itemMap);
            }
            o.put("items", itemsList);
            result.add(o);
        }
        
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    public ResponseEntity<Map<String, Object>> getOrder(@PathVariable Long id) {
        return orderRepository.findById(id)
            .map(order -> {
                Map<String, Object> o = new HashMap<>();
                o.put("id", order.getId());
                o.put("userId", order.getUserId());
                o.put("totalCents", order.getTotalCents());
                o.put("status", order.getStatus() != null ? order.getStatus().name() : null);
                o.put("stripePaymentIntentId", order.getStripePaymentIntentId());
                o.put("createdAt", order.getCreatedAt() != null ? order.getCreatedAt().toLocalDate().toString() : null);
                
                List<Map<String, Object>> itemsList = new ArrayList<>();
                for (OrderItem item : order.getItems()) {
                    Map<String, Object> itemMap = new HashMap<>();
                    itemMap.put("id", item.getId());
                    itemMap.put("productId", item.getProductId());
                    itemMap.put("productName", item.getProductName());
                    itemMap.put("quantity", item.getQuantity());
                    itemMap.put("priceCents", item.getPriceCents());
                    itemsList.add(itemMap);
                }
                o.put("items", itemsList);
                return ResponseEntity.ok(o);
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/user/{userId}")
    @Transactional(readOnly = true)
    public ResponseEntity<List<Map<String, Object>>> getOrdersByUser(@PathVariable Long userId) {
        List<Order> orders = orderRepository.findByUserIdOrderByCreatedAtDesc(userId);
        List<Map<String, Object>> result = new ArrayList<>();
        
        for (Order order : orders) {
            Map<String, Object> o = new HashMap<>();
            o.put("id", order.getId());
            o.put("userId", order.getUserId());
            o.put("totalCents", order.getTotalCents());
            o.put("status", order.getStatus() != null ? order.getStatus().name() : null);
            o.put("stripePaymentIntentId", order.getStripePaymentIntentId());
            o.put("createdAt", order.getCreatedAt() != null ? order.getCreatedAt().toLocalDate().toString() : null);
            
            List<Map<String, Object>> itemsList = new ArrayList<>();
            for (OrderItem item : order.getItems()) {
                Map<String, Object> itemMap = new HashMap<>();
                itemMap.put("id", item.getId());
                itemMap.put("productId", item.getProductId());
                itemMap.put("productName", item.getProductName());
                itemMap.put("quantity", item.getQuantity());
                itemMap.put("priceCents", item.getPriceCents());
                itemsList.add(itemMap);
            }
            o.put("items", itemsList);
            result.add(o);
        }
        
        return ResponseEntity.ok(result);
    }
}