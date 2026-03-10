package com.electronics.product.service;

import com.electronics.product.model.Product;
import com.electronics.product.model.Category;
import com.electronics.product.model.Review;
import com.electronics.product.repository.ProductRepository;
import com.electronics.product.repository.CategoryRepository;
import com.electronics.product.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ProductService {
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    private final ReviewRepository reviewRepository;

    public List<Review> getReviewsByProductId(Long productId) {
        return reviewRepository.findByProductId(productId);
    }

    public Review addReview(Review review) {
        if (review.getDate() == null) {
            review.setDate(java.time.LocalDateTime.now());
        }
        Review savedReview = reviewRepository.save(review);
        updateProductRating(review.getProductId());
        return savedReview;
    }

    public Review updateReview(Long id, Review newReviewData) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Review not found"));
        review.setRating(newReviewData.getRating());
        review.setComment(newReviewData.getComment());
        Review saved = reviewRepository.save(review);
        updateProductRating(review.getProductId());
        return saved;
    }

    public void deleteReview(Long id) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Review not found"));
        Long productId = review.getProductId();
        reviewRepository.deleteById(id);
        updateProductRating(productId);
    }

    private void updateProductRating(Long productId) {
        productRepository.findById(productId).ifPresent(product -> {
            List<Review> reviews = reviewRepository.findByProductId(productId);
            if (reviews.isEmpty()) {
                product.setVotes(0);
                product.setRate(0.0);
            } else {
                double avg = reviews.stream()
                        .mapToInt(Review::getRating)
                        .average()
                        .orElse(0.0);
                product.setVotes(reviews.size());
                product.setRate(avg);
            }
            productRepository.save(product);
        });
    }

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public Optional<Product> getProductById(Long id) {
        return productRepository.findById(id);
    }

    public List<Product> getProductsByCategory(String category) {
        return productRepository.findByCategory(category);
    }

    public Product saveProduct(Product product) {
        return productRepository.save(product);
    }

    public Product updateProduct(Long id, Product productDetails) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        product.setName(productDetails.getName());
        product.setShortName(productDetails.getShortName());
        product.setDescription(productDetails.getDescription());
        product.setPrice(productDetails.getPrice());
        product.setDiscount(productDetails.getDiscount());
        product.setCategory(productDetails.getCategory());
        product.setImg(productDetails.getImg());
        product.setStockQuantity(productDetails.getStockQuantity());
        product.setRate(productDetails.getRate());
        product.setVotes(productDetails.getVotes());
        product.setQuantity(productDetails.getQuantity());
        product.setSold(productDetails.getSold());

        return productRepository.save(product);
    }

    public List<Product> getTopSellingProducts() {
        return productRepository.findTop5ByOrderBySoldDesc();
    }

    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }

    // Categories
    public java.util.List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    public Category createCategory(Category category) {
        return categoryRepository.save(category);
    }

    public Category updateCategory(Long id, Category categoryDetails) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        category.setName(categoryDetails.getName());
        category.setDisplayName(categoryDetails.getDisplayName());
        return categoryRepository.save(category);
    }

    public void deleteCategory(Long id) {
        categoryRepository.deleteById(id);
    }
}
