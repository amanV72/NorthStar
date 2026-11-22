package com.ecommerce.product.controller;


import com.ecommerce.product.dto.ProductRequest;
import com.ecommerce.product.dto.ProductResponse;
import com.ecommerce.product.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/products")
@Tag(name = "Products", description = "Browse and manage the product catalog")
public class ProductController {
    private final ProductService productService;

    @GetMapping("/seller")
    @Operation(summary = "List products owned by the current seller")
    public ResponseEntity<List<ProductResponse>> getSellerProducts(
            @RequestHeader("X-User-ID") String sellerId) {
        return ResponseEntity.ok(productService.fetchSellerProducts(sellerId));
    }

    @PostMapping("/seller")
    @Operation(summary = "Create a product for the current seller")
    public ResponseEntity<ProductResponse> createSellerProduct(
            @RequestHeader("X-User-ID") String sellerId,
            @RequestHeader(value = "X-User-Name", required = false) String sellerName,
            @Valid @RequestBody ProductRequest productRequest) {
        return new ResponseEntity<>(
                productService.createProductForSeller(sellerId, sellerName, productRequest),
                HttpStatus.CREATED);
    }

    @PutMapping("/seller/{id}")
    @Operation(summary = "Update a product owned by the current seller")
    public ResponseEntity<ProductResponse> updateSellerProduct(
            @RequestHeader("X-User-ID") String sellerId,
            @PathVariable Long id,
            @Valid @RequestBody ProductRequest productRequest) {
        return productService.updateSellerProduct(sellerId, id, productRequest)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping(value = {"/seller/{id}/image", "/{id}/image"}, consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload or replace product photo (1 photo per product)")
    public ResponseEntity<ProductResponse> uploadProductImage(
            @RequestHeader(value = "X-User-ID", required = false) String sellerId,
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {
        return productService.uploadProductImage(sellerId, id, file)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping(value = {"/seller/upload-image", "/seller/image", "/images/upload"}, consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload standalone product photo during creation")
    public ResponseEntity<Map<String, String>> uploadStandaloneImage(
            @RequestHeader(value = "X-User-ID", required = false) String sellerId,
            @RequestParam("file") MultipartFile file) {
        String uid = (sellerId != null && !sellerId.isBlank()) ? sellerId : "seller";
        String imageUrl = productService.uploadStandaloneImage(uid, file);
        return ResponseEntity.ok(Map.of("imageUrl", imageUrl));
    }

    @GetMapping("/images/{fileName:.+}")
    @Operation(summary = "Serve product image")
    public ResponseEntity<Resource> getProductImage(@PathVariable String fileName) {
        return productService.loadImage(fileName);
    }

    @DeleteMapping("/seller/{id}")
    @Operation(summary = "Deactivate a product owned by the current seller")
    public ResponseEntity<Void> deleteSellerProduct(
            @RequestHeader("X-User-ID") String sellerId,
            @PathVariable Long id) {
        return productService.deleteSellerProduct(sellerId, id)
                ? ResponseEntity.noContent().build()
                : ResponseEntity.notFound().build();
    }

    @GetMapping("/simulate")
    @Operation(summary = "Simulate a product-service failure")
    public ResponseEntity<String> simulateFailureRetry(@RequestParam(defaultValue = "false") boolean fail) {
        if(fail){
            throw  new RuntimeException("Simulated Failure for Testing");
        }
        return  ResponseEntity.ok("Product Service is ok");
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a product by id")
    public ResponseEntity<ProductResponse> getProductById(
            @PathVariable String id) {
        return productService.getProductById(id)
                .map(ResponseEntity::ok)
                .orElseGet(()->ResponseEntity.notFound().build());
    }

    @GetMapping
    @Operation(summary = "List active products")
    public ResponseEntity<List<ProductResponse>> getProduct() {
        return new ResponseEntity<>(productService.fetchAllProduct(),HttpStatus.OK);
    }

    @PostMapping
    @Operation(summary = "Create a product")
    public ResponseEntity<ProductResponse> createProduct(@Valid @RequestBody ProductRequest productRequest) {
        return new ResponseEntity<>(productService.createProduct(productRequest),HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a product")
    public ResponseEntity<ProductResponse> updateProduct(@PathVariable Long id,@Valid @RequestBody ProductRequest productRequest) {

        return productService.updateProduct(id,productRequest)
                .map(ResponseEntity::ok)
                .orElseGet(()->ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Deactivate a product")
    public ResponseEntity<Void> updateProduct(@PathVariable Long id) {
        boolean isDeleted=productService.deleteProduct(id);
        return isDeleted?ResponseEntity.noContent().build():ResponseEntity.notFound().build();
    }

    @GetMapping("/search")
    @Operation(summary = "Search products")
    public ResponseEntity<List<ProductResponse>> searchProducts(@RequestParam String keyword) {
      return ResponseEntity.ok(productService.findProducts(keyword));
       }



}
