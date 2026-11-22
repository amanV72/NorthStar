package com.ecommerce.product.dto;

import lombok.Data;


@Data
public class ProductResponse {

    private String id;
    private String name;
    private String description;
    private Long price;
    private Integer stockQuantity;
    private String category;
    private String imageUrl;
    private String sellerId;
    private String sellerName;
    private Boolean active;
}
