package com.ecommerce.order.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@Entity
@NoArgsConstructor
@AllArgsConstructor
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long productId;

    private String sellerId;

    private Integer quantity;
    private Long price;

    @ManyToOne
    @JoinColumn(name = "order_id",nullable = false,referencedColumnName = "id")
    private Order order;
}
