package com.shopeasy.agent.controller;

import com.shopeasy.agent.model.Product;
import com.shopeasy.agent.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST API for product management.
 *
 * Endpoints:
 *   GET    /api/products       → list all products
 *   GET    /api/products/{id}  → get product by ID
 *   POST   /api/products       → add a new product
 *   PUT    /api/products/{id}  → update an existing product
 *   DELETE /api/products/{id}  → delete a product
 */
@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductRepository productRepository;

    /** List all products */
    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts() {
        return ResponseEntity.ok(productRepository.findAll());
    }

    /** Get a single product by ID */
    @GetMapping("/{id}")
    public ResponseEntity<?> getProduct(@PathVariable String id) {
        return productRepository.findById(id)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Product not found: " + id)));
    }

    /**
     * Add a new product.
     * Body: { "id": "P007", "name": "...", "description": "...", "price": 99.99, "category": "...", "stock": 10 }
     */
    @PostMapping
    public ResponseEntity<?> addProduct(@RequestBody Product product) {
        if (productRepository.existsById(product.getId())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "Product with ID " + product.getId() + " already exists"));
        }
        Product saved = productRepository.save(product);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    /**
     * Update an existing product (price, stock, description etc.)
     * Body: same as POST — any fields you want to update
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateProduct(@PathVariable String id, @RequestBody Product updated) {
        if (!productRepository.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Product not found: " + id));
        }
        updated.setId(id);
        return ResponseEntity.ok(productRepository.save(updated));
    }

    /** Delete a product */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable String id) {
        if (!productRepository.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Product not found: " + id));
        }
        productRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Product " + id + " deleted"));
    }
}
