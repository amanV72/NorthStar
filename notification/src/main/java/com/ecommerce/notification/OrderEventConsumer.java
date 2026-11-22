package com.ecommerce.notification;

import com.ecommerce.notification.payload.OrderCreatedEventDto;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Service;

import java.util.function.Consumer;

@Service
@Slf4j
public class OrderEventConsumer {

    @Bean
    public Consumer<OrderCreatedEventDto> orderSuccess(){
        return event ->{
            log.info("Received order event order ID: {}",event.getOrderId());
            log.info("Received order event user ID: {}",event.getUserId());

        };
    }
}
