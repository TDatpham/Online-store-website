package com.electronics.product;

import com.electronics.product.model.Product;
import com.electronics.product.model.Review;
import com.electronics.product.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {
    private final ProductService productService;

    @Override
    public void run(String... args) {
        if (productService.getAllProducts().isEmpty()) {
            Product p1 = new Product();
            p1.setName("PS5 Gamepad");
            p1.setShortName("PS5 Gamepad");
            p1.setCategory("Gaming");
            p1.setPrice(69.99);
            p1.setDiscount(40);
            p1.setDescription("PlayStation 5 Controller Skin High quality vinyl...");
            p1.setAddedDate("2024/2/2");
            p1.setImg("ps5Gamepad");
            p1.setRate(4.8);
            p1.setVotes(88);
            p1.setSold(105);
            p1.setStockQuantity(100);
            p1.setColors(java.util.List.of(
                    new com.electronics.product.model.ProductColor(null, "White", "#FFFFFF"),
                    new com.electronics.product.model.ProductColor(null, "Black", "#000000")));
            productService.saveProduct(p1);

            Product p2 = new Product();
            p2.setName("AK-900 Wired Keyboard");
            p2.setShortName("AK-9000 Keyboard");
            p2.setCategory("Gaming");
            p2.setPrice(85.00);
            p2.setDiscount(35);
            p2.setDescription("Elevate your gaming experience with the AK-900 Wired Keyboard...");
            p2.setAddedDate("2024/2/7");
            p2.setImg("wiredKeyboard");
            p2.setRate(4.5);
            p2.setVotes(75);
            p2.setSold(210);
            p2.setStockQuantity(50);
            p2.setColors(java.util.List.of(
                    new com.electronics.product.model.ProductColor(null, "RGB", "#FF00FF")));
            productService.saveProduct(p2);

            Product p3 = new Product();
            p3.setName("Iphone 14 series");
            p3.setShortName("Iphone 14 series");
            p3.setCategory("Phones");
            p3.setPrice(999.0);
            p3.setDiscount(10);
            p3.setDescription("Advanced dual-camera system. All-day battery life.");
            p3.setAddedDate("2024/1/15");
            p3.setImg("iphoneImg");
            p3.setRate(4.9);
            p3.setVotes(120);
            p3.setSold(50);
            p3.setStockQuantity(30);
            p3.setColors(java.util.List.of(
                    new com.electronics.product.model.ProductColor(null, "Purple", "#A590D0"),
                    new com.electronics.product.model.ProductColor(null, "Midnight", "#1A1A1A")));
            productService.saveProduct(p3);

            Product p4 = new Product();
            p4.setName("Canon EOS DSLR Camera");
            p4.setShortName("Cannon Camera");
            p4.setCategory("Camera");
            p4.setPrice(6499.0);
            p4.setDiscount(0);
            p4.setDescription("Capture life's precious moments with the CANON EOS DSLR Camera.");
            p4.setAddedDate("2024/3/7");
            p4.setImg("canonCamera");
            p4.setRate(4.0);
            p4.setVotes(94);
            p4.setSold(83);
            p4.setStockQuantity(15);
            p4.setColors(java.util.List.of(
                    new com.electronics.product.model.ProductColor(null, "Black", "#000000")));
            productService.saveProduct(p4);

            System.out.println("Initialized sample products with colors and stock.");
        }
    }
}
