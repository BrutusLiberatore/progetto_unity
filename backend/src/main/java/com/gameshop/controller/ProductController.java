package com.gameshop.controller;

import com.gameshop.model.Product;
import com.gameshop.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductRepository productRepository;

    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts() {
        List<Product> products = productRepository.findByIsActiveTrue();
        return ResponseEntity.ok(products);
    }

    @GetMapping("/all")
    public ResponseEntity<List<Product>> getAllProductsIncludingInactive() {
        return ResponseEntity.ok(productRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProduct(@PathVariable Long id) {
        return productRepository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<List<Product>> getProductsByType(@PathVariable String type) {
        List<Product> products = productRepository.findByType(type);
        return ResponseEntity.ok(products);
    }

    @PostMapping
    public ResponseEntity<Product> createProduct(@RequestBody Product product) {
        Product saved = productRepository.save(product);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable Long id, @RequestBody Product productDetails) {
        return productRepository.findById(id)
            .map(product -> {
                product.setName(productDetails.getName());
                product.setDescription(productDetails.getDescription());
                product.setType(productDetails.getType());
                product.setPriceCents(productDetails.getPriceCents());
                product.setImageUrl(productDetails.getImageUrl());
                product.setIsActive(productDetails.getIsActive());
                Product updated = productRepository.save(product);
                return ResponseEntity.ok(updated);
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        return productRepository.findById(id)
            .map(product -> {
                product.setIsActive(false);
                productRepository.save(product);
                return ResponseEntity.ok(Map.of("message", "Prodotto eliminato"));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/init")
    public ResponseEntity<?> initProducts() {
        if (productRepository.count() > 0) {
            return ResponseEntity.ok(Map.of("message", "Prodotti già presenti", "count", productRepository.count()));
        }

        // Cristalli
        Product p1 = new Product();
        p1.setName("100 Cristalli");
        p1.setDescription("100 cristalli per il tuo gioco");
        p1.setType("currency");
        p1.setPriceCents(99);
        p1.setImageUrl("https://placehold.co/200x200/FFD700/3E2723?text=100+Cristalli");
        p1.setIsActive(true);
        productRepository.save(p1);

        Product p2 = new Product();
        p2.setName("500 Cristalli");
        p2.setDescription("500 cristalli - bonus 50 cristalli");
        p2.setType("currency");
        p2.setPriceCents(499);
        p2.setImageUrl("https://placehold.co/200x200/FFD700/3E2723?text=500+Cristalli");
        p2.setIsActive(true);
        productRepository.save(p2);

        Product p3 = new Product();
        p3.setName("1000 Cristalli");
        p3.setDescription("1000 cristalli - bonus 100 cristalli");
        p3.setType("currency");
        p3.setPriceCents(999);
        p3.setImageUrl("https://placehold.co/200x200/FFD700/3E2723?text=1000+Cristalli");
        p3.setIsActive(true);
        productRepository.save(p3);

        Product p4 = new Product();
        p4.setName("5000 Cristalli");
        p4.setDescription("5000 cristalli - bonus 500 cristalli");
        p4.setType("currency");
        p4.setPriceCents(4499);
        p4.setImageUrl("https://placehold.co/200x200/FFD700/3E2723?text=5000+Cristalli");
        p4.setIsActive(true);
        productRepository.save(p4);

        // Boost
        Product p5 = new Product();
        p5.setName("XP Boost 1h");
        p5.setDescription("Raddoppia l'XP guadagnato per 1 ora");
        p5.setType("boost");
        p5.setPriceCents(299);
        p5.setImageUrl("https://placehold.co/200x200/FF6B6B/3E2723?text=XP+Boost");
        p5.setIsActive(true);
        productRepository.save(p5);

        Product p6 = new Product();
        p6.setName("Drop Boost 24h");
        p6.setDescription("Aumenta il drop rate del 50% per 24 ore");
        p6.setType("boost");
        p6.setPriceCents(499);
        p6.setImageUrl("https://placehold.co/200x200/4CAF50/3E2723?text=Drop+Boost");
        p6.setIsActive(true);
        productRepository.save(p6);

        Product p7 = new Product();
        p7.setName("Pet VIP 30gg");
        p7.setDescription("Pet VIP esclusivo per 30 giorni");
        p7.setType("boost");
        p7.setPriceCents(999);
        p7.setImageUrl("https://placehold.co/200x200/9C27B0/FFFFFF?text=Pet+VIP");
        p7.setIsActive(true);
        productRepository.save(p7);

        return ResponseEntity.ok(Map.of(
            "message", "Prodotti inizializzati",
            "count", 7
        ));
    }
}