package com.ecommerce.product.service;


import com.ecommerce.product.dto.ProductEventResponse;
import com.ecommerce.product.dto.ProductRequest;
import com.ecommerce.product.dto.ProductResponse;
import com.ecommerce.product.model.Product;
import com.ecommerce.product.repositories.ProductRepo;
import jakarta.annotation.PostConstruct;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.stream.function.StreamBridge;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductService {
    private final ProductRepo productRepo;

    private final StreamBridge streamBridge;
    private final Path uploadDir = Paths.get("uploads", "products").toAbsolutePath().normalize();

    @PostConstruct
    public void init() {
        try {
            Files.createDirectories(uploadDir);
        } catch (IOException e) {
            log.error("Could not initialize upload directory: {}", uploadDir, e);
        }
    }

    public Optional<ProductResponse> uploadProductImage(String sellerId, Long productId, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Upload file cannot be empty");
        }

        var query = (sellerId != null && !sellerId.isBlank())
                ? productRepo.findByIdAndSellerId(productId, sellerId)
                : productRepo.findById(productId);

        return query.map(product -> {
                    // Enforce "only photo per product": delete old photo if stored locally
                    deleteOldProductImage(product.getImageUrl());

                    String extension = getFileExtension(file.getOriginalFilename());
                    String fileName = "product_" + productId + "_" + System.currentTimeMillis() + "." + extension;
                    Path destination = uploadDir.resolve(fileName);

                    try {
                        Files.copy(file.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);
                    } catch (IOException e) {
                        throw new RuntimeException("Failed to store product image", e);
                    }

                    product.setImageUrl("/api/products/images/" + fileName);
                    Product saved = productRepo.save(product);
                    return productToProductResponse(saved);
                });
    }

    public String uploadStandaloneImage(String sellerId, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Upload file cannot be empty");
        }

        String extension = getFileExtension(file.getOriginalFilename());
        String cleanSeller = sellerId.replaceAll("[^a-zA-Z0-9]", "");
        String prefix = cleanSeller.length() > 8 ? cleanSeller.substring(0, 8) : cleanSeller;
        String fileName = "draft_" + prefix + "_" + UUID.randomUUID().toString().substring(0, 8) + "." + extension;
        Path destination = uploadDir.resolve(fileName);

        try {
            Files.copy(file.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new RuntimeException("Failed to store uploaded image", e);
        }

        return "/api/products/images/" + fileName;
    }

    public ResponseEntity<Resource> loadImage(String fileName) {
        try {
            Path filePath = uploadDir.resolve(fileName).normalize();
            if (!filePath.startsWith(uploadDir)) {
                return ResponseEntity.badRequest().build();
            }
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() && resource.isReadable()) {
                String contentType = Files.probeContentType(filePath);
                if (contentType == null) {
                    contentType = "application/octet-stream";
                }
                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CACHE_CONTROL, "public, max-age=86400")
                        .body(resource);
            }
        } catch (Exception e) {
            log.warn("Error reading product image {}: {}", fileName, e.getMessage());
        }
        return ResponseEntity.notFound().build();
    }

    private void deleteOldProductImage(String imageUrl) {
        if (imageUrl != null && imageUrl.startsWith("/api/products/images/")) {
            String oldFileName = imageUrl.substring("/api/products/images/".length());
            try {
                Path oldPath = uploadDir.resolve(oldFileName).normalize();
                if (oldPath.startsWith(uploadDir)) {
                    Files.deleteIfExists(oldPath);
                }
            } catch (Exception ignored) {
            }
        }
    }

    private String getFileExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "jpg";
        }
        String ext = filename.substring(filename.lastIndexOf(".") + 1).toLowerCase();
        if (ext.matches("^(jpg|jpeg|png|webp|gif|svg)$")) {
            return ext;
        }
        return "jpg";
    }


    public void productRequestToProduct(Product product, ProductRequest productRequest) {
        Long price= productRequest.getPrice().multiply(BigDecimal.valueOf(100)).longValueExact();

        product.setName(productRequest.getName());
        product.setDescription(productRequest.getDescription());
        product.setCategory(productRequest.getCategory());
        product.setPrice(price);
        if (productRequest.getStockQuantity() != null) {
            product.setStockQuantity(productRequest.getStockQuantity());
        }
        if (productRequest.getSellerName() != null && !productRequest.getSellerName().isBlank()) {
            product.setSellerName(productRequest.getSellerName());
        }
        product.setImageUrl(productRequest.getImageUrl());
    }

    public ProductResponse productToProductResponse(Product product) {
        ProductResponse productResponse = new ProductResponse();
        productResponse.setName(product.getName());
        productResponse.setCategory(product.getCategory());
        productResponse.setDescription(product.getDescription());
        productResponse.setPrice(product.getPrice());
        productResponse.setStockQuantity(product.getStockQuantity());
        productResponse.setActive(product.getActive());
        productResponse.setId(String.valueOf(product.getId()));
        productResponse.setImageUrl(product.getImageUrl());
        productResponse.setSellerId(product.getSellerId());
        productResponse.setSellerName(product.getSellerName());

        return productResponse;
    }


    @Transactional
    public ProductResponse createProduct(ProductRequest productRequest) {
        Product product = new Product();
        productRequestToProduct(product, productRequest);
        Product savedProduct = productRepo.save(product);
        ProductEventResponse event= new ProductEventResponse(savedProduct.getId(), productRequest.getStockQuantity());
        streamBridge.send("productCreated-out-0",event);
        return productToProductResponse(savedProduct);

    }

    @Transactional
    public ProductResponse createProductForSeller(String sellerId, String sellerName, ProductRequest productRequest) {
        Product product = new Product();
        productRequestToProduct(product, productRequest);
        product.setSellerId(sellerId);
        if (sellerName != null && !sellerName.isBlank()) {
            product.setSellerName(sellerName);
        }
        Product savedProduct = productRepo.save(product);
        ProductEventResponse event = new ProductEventResponse(savedProduct.getId(), productRequest.getStockQuantity());
        streamBridge.send("productCreated-out-0", event);
        return productToProductResponse(savedProduct);
    }

    @Transactional
    public ProductResponse createProductForSeller(String sellerId, ProductRequest productRequest) {
        return createProductForSeller(sellerId, null, productRequest);
    }

    public List<ProductResponse> fetchSellerProducts(String sellerId) {
        return productRepo.findBySellerIdAndActiveTrue(sellerId).stream()
                .map(this::productToProductResponse)
                .toList();
    }

    public Optional<ProductResponse> updateSellerProduct(String sellerId, Long id, ProductRequest productRequest) {
        return productRepo.findByIdAndSellerId(id, sellerId)
                .map(existingProduct -> {
                    productRequestToProduct(existingProduct, productRequest);
                    return productToProductResponse(productRepo.save(existingProduct));
                });
    }

    public boolean deleteSellerProduct(String sellerId, Long id) {
        return productRepo.findByIdAndSellerId(id, sellerId)
                .map(product -> {
                    product.setActive(false);
                    productRepo.save(product);
                    return true;
                }).orElse(false);
    }

    public Optional<ProductResponse> updateProduct(Long id, ProductRequest productRequest) {
        return productRepo.findById(id)
                .map(existingProduct -> {
                    productRequestToProduct(existingProduct, productRequest);
                    Product savedProduct = productRepo.save(existingProduct);
                    return productToProductResponse(savedProduct);

                });
    }

    public List<ProductResponse> fetchAllProduct() {
        return productRepo.findByActiveTrue().stream()
                .map(this::productToProductResponse)
                .collect(Collectors.toList());

    }

    public boolean deleteProduct(Long id) {

        return productRepo.findById(id).map(product -> {
            product.setActive(false);
            productRepo.save(product);
            return true;
        }).orElse(false);
    }

    public List<ProductResponse> findProducts(String keyword) {
        return productRepo.searchProducts(keyword).stream().map(this::productToProductResponse).collect(Collectors.toList());
    }

    public Optional<ProductResponse> getProductById(String id) {
        return productRepo.findByIdAndActiveTrue(Long.valueOf(id)).map(this::productToProductResponse);
    }
}
