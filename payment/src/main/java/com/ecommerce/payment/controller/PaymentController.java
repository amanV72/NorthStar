package com.ecommerce.payment.controller;

import com.ecommerce.payment.dto.PaymentVerificationRequest;
import com.ecommerce.payment.dto.PaymentVerificationResponse;
import com.ecommerce.payment.dto.RazorpayOrderDetails;
import com.ecommerce.payment.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Tag(name = "Payments", description = "Inspect and verify payments")
public class PaymentController {
    private final PaymentService paymentService;

    @GetMapping("/{paymentId}")
    @Operation(summary = "Get provider order details for a payment")
    public ResponseEntity<RazorpayOrderDetails> orderDetails(
            @RequestHeader("X-User-ID")String userId,
            @PathVariable Long paymentId){
        RazorpayOrderDetails details=paymentService.getRazorpayOrderDetails(paymentId,userId);
        return ResponseEntity.ok(details);
    }
    @PostMapping("/verify-payment")
    @Operation(summary = "Verify a payment provider signature")
    public ResponseEntity<PaymentVerificationResponse> verifyPayment(
            @RequestHeader("X-User-ID")String userId,
            @Valid @RequestBody PaymentVerificationRequest paymentVerificationDto){
        boolean verified=paymentService.verifyRazorpayPayment(paymentVerificationDto,userId);
        if (verified) {
            return ResponseEntity.ok(
                    new PaymentVerificationResponse(
                            "PAYMENT VERIFIED",
                            "Payment verified successfully"
                    )
            );
        }

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new PaymentVerificationResponse(
                        "UNAUTHORIZED PAYMENT",
                        "Payment verification failed"
                ));
    }

}
