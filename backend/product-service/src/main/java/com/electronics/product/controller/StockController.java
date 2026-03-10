package com.electronics.product.controller;

import com.electronics.product.model.Product;
import com.electronics.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class StockController {

    private final ProductRepository productRepository;

    /**
     * Reduce stock for multiple products when an order is placed.
     * Request body: list of {productId, quantity}
     */
    @PostMapping("/reduce-stock")
    @Transactional
    public ResponseEntity<?> reduceStock(@RequestBody List<Map<String, Object>> items) {
        for (Map<String, Object> item : items) {
            Long productId = Long.valueOf(item.get("productId").toString());
            Integer quantity = Integer.valueOf(item.get("quantity").toString());

            productRepository.findById(productId).ifPresentOrElse(product -> {
                int currentStock = product.getStockQuantity() != null ? product.getStockQuantity() : 0;
                int currentSold = product.getSold() != null ? product.getSold() : 0;

                product.setStockQuantity(Math.max(0, currentStock - quantity));
                product.setSold(currentSold + quantity);
                productRepository.save(product);

                System.out.println("[StockController] Updated product " + productId
                        + ": stock=" + product.getStockQuantity()
                        + ", sold=" + product.getSold());
            }, () -> System.err.println("[StockController] Product not found: " + productId));
        }
        return ResponseEntity.ok(Map.of("status", "updated"));
    }
}
