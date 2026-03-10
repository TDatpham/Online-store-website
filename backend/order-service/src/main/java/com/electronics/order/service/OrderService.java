package com.electronics.order.service;

import com.electronics.order.model.Order;
import com.electronics.order.model.OrderItem;
import com.electronics.order.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
@RequiredArgsConstructor
public class OrderService {
    private final OrderRepository orderRepository;
    private final KafkaProducerService kafkaProducerService;
    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate;

    @Value("${product.service.url:http://localhost:8081}")
    private String productServiceUrl;

    public Order createOrder(Order order) {
        order.setOrderDate(LocalDateTime.now());
        order.setStatus("PENDING");
        Order savedOrder = orderRepository.save(order);

        // 1. Directly call product-service to reduce stock (synchronous, reliable)
        try {
            reduceStockDirectly(savedOrder.getItems());
        } catch (Exception e) {
            System.err.println("[OrderService] Failed to reduce stock via REST: " + e.getMessage());
        }

        // 2. Also send Kafka event as backup/async notification
        try {
            String orderJson = objectMapper.writeValueAsString(savedOrder);
            kafkaProducerService.sendOrderMessage(orderJson);
        } catch (Exception e) {
            System.err.println("[OrderService] Failed to send order event to Kafka: " + e.getMessage());
        }

        return savedOrder;
    }

    private void reduceStockDirectly(List<OrderItem> items) {
        if (items == null || items.isEmpty())
            return;

        List<Map<String, Object>> stockItems = new ArrayList<>();
        for (OrderItem item : items) {
            Map<String, Object> stockItem = new HashMap<>();
            stockItem.put("productId", item.getProductId());
            stockItem.put("quantity", item.getQuantity());
            stockItems.add(stockItem);
        }

        String url = productServiceUrl + "/api/products/reduce-stock";
        ResponseEntity<Map> response = restTemplate.postForEntity(url, stockItems, Map.class);
        System.out.println("[OrderService] Stock reduction response: " + response.getStatusCode());
    }

    public List<Order> getOrdersByUserId(Long userId) {
        return orderRepository.findByUserId(userId);
    }

    /** Admin: fetch all orders in the system. */
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    /** Admin: update the status of an order. */
    public Order updateStatus(Long id, String status) {
        return orderRepository.findById(id)
                .map(order -> {
                    order.setStatus(status);
                    return orderRepository.save(order);
                })
                .orElseThrow(() -> new RuntimeException("Order not found"));
    }
}
