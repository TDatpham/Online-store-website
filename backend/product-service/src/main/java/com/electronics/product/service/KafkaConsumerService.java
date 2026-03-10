package com.electronics.product.service;

import com.electronics.product.repository.ProductRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class KafkaConsumerService {
    private final ProductRepository productRepository;
    private final ObjectMapper objectMapper;

    @org.springframework.transaction.annotation.Transactional
    @KafkaListener(topics = "order-events", groupId = "product-group")
    public void consumeOrderEvent(String message) {
        try {
            System.out.println("Processing order event: " + message);
            JsonNode root = objectMapper.readTree(message);
            JsonNode items = root.get("items");
            if (items != null && items.isArray()) {
                for (JsonNode item : items) {
                    JsonNode productIdNode = item.get("productId");
                    JsonNode quantityNode = item.get("quantity");

                    if (productIdNode == null || quantityNode == null)
                        continue;

                    Long productId = productIdNode.asLong();
                    Integer quantity = quantityNode.asInt();

                    productRepository.findById(productId).ifPresentOrElse(product -> {
                        int currentStock = product.getStockQuantity() != null ? product.getStockQuantity() : 50;
                        int currentSold = product.getSold() != null ? product.getSold() : 0;
                        product.setStockQuantity(currentStock - quantity);
                        product.setSold(currentSold + quantity);
                        productRepository.save(product);
                        System.out.println("Updated product " + productId + ": stock=" + product.getStockQuantity()
                                + ", sold=" + product.getSold());
                    }, () -> System.err.println("Product not found: " + productId));
                }
            } else {
                System.err.println("No items found in order event");
            }
        } catch (Exception e) {
            System.err.println("Error processing order event: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
