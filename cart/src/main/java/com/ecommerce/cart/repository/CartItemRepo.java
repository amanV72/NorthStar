package com.ecommerce.cart.repository;


import com.ecommerce.cart.model.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CartItemRepo extends JpaRepository<CartItem,Long> {

    CartItem findByUserIdAndProductId(String userId,String productId);

    void deleteByUserIdAndProductId(String userId,String productId);
    void deleteByUserId(String userId);

    List<CartItem> findByUserId(String userId);

}
