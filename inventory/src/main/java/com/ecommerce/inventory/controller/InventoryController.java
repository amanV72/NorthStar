package com.ecommerce.inventory.controller;

import com.ecommerce.inventory.dto.StockRequest;
import com.ecommerce.inventory.dto.InventoryResponse;
import com.ecommerce.inventory.services.InventoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/inventory")
@Tag(name = "Inventory", description = "Check and manage product stock")
public class InventoryController {
    private final InventoryService inventoryService;

    @GetMapping("/{productId}")
    @Operation(summary = "Get stock details for a product")
    public ResponseEntity<InventoryResponse> getInventory(@PathVariable Long productId) {
        InventoryResponse inventory = inventoryService.getInventory(productId);
        return inventory == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(inventory);
    }

    ///Admin endpoint
    @PostMapping("/{productId}/restock")
    @Operation(summary = "Add stock for a product")
    public ResponseEntity<Void> addStock(
            @PathVariable Long productId,
            @Valid @RequestBody StockRequest request
            ){
        if (request.getQuantity() <= 0) {
            return ResponseEntity.badRequest().build();
        }
        inventoryService.addStock(productId,request.getQuantity());
        return ResponseEntity.noContent().build();
    }



    @GetMapping("/{productId}/availability")
    @Operation(summary = "Check whether a product has sufficient stock")
    public ResponseEntity<Boolean> checkInventory(
            @PathVariable Long productId,
            @RequestParam("qty")Integer quantity
            ){
        boolean isAvailable=inventoryService.hasSufficientStockForRest(productId,quantity);

        return ResponseEntity.ok(isAvailable);
    }

}
