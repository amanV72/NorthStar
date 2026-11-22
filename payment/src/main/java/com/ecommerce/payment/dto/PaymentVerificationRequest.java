package com.ecommerce.payment.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PaymentVerificationRequest {
    @NotBlank
    private String paymentId;

    @NotBlank
    private String orderId;

    @NotBlank
    private String signature;
}
