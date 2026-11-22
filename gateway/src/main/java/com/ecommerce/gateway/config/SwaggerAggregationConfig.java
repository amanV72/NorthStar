package com.ecommerce.gateway.config;

import jakarta.annotation.PostConstruct;
import org.springdoc.core.properties.AbstractSwaggerUiConfigProperties.SwaggerUrl;
import org.springdoc.core.properties.SwaggerUiConfigProperties;
import org.springframework.context.annotation.Configuration;

import java.util.LinkedHashSet;
import java.util.Set;

@Configuration
public class SwaggerAggregationConfig {

    private static final String[] SERVICES = {
            "user-service",
            "product-service",
            "order-service",
            "cart-service",
            "inventory-service",
            "payment-service"
    };

    private final SwaggerUiConfigProperties swaggerUiConfigProperties;

    public SwaggerAggregationConfig(SwaggerUiConfigProperties swaggerUiConfigProperties) {
        this.swaggerUiConfigProperties = swaggerUiConfigProperties;
    }

    @PostConstruct
    void configureServiceDocumentation() {
        Set<SwaggerUrl> serviceUrls = new LinkedHashSet<>();
        for (String service : SERVICES) {
            SwaggerUrl swaggerUrl = new SwaggerUrl();
            swaggerUrl.setName(service);
            swaggerUrl.setDisplayName(service);
            swaggerUrl.setUrl("/v3/api-docs/" + service);
            serviceUrls.add(swaggerUrl);
        }

        swaggerUiConfigProperties.setUrls(serviceUrls);
        swaggerUiConfigProperties.setUrlsPrimaryName("user-service");
        swaggerUiConfigProperties.setDisableSwaggerDefaultUrl(true);
        swaggerUiConfigProperties.setPersistAuthorization(true);
    }
}
