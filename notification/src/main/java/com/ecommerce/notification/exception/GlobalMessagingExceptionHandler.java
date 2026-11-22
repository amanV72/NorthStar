package com.ecommerce.notification.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.integration.annotation.ServiceActivator;
import org.springframework.integration.context.IntegrationContextUtils;
import org.springframework.messaging.support.ErrorMessage;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class GlobalMessagingExceptionHandler {

    @ServiceActivator(inputChannel = IntegrationContextUtils.ERROR_CHANNEL_BEAN_NAME)
    public void handle(ErrorMessage errorMessage) {
        log.error("Unhandled notification messaging error", errorMessage.getPayload());
    }
}
