package com.ecommerce.user.models;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Address {

    @Id
    private Long id;
    private String street;
    private String city;
    private String state;
    private String country;
    private String zipcode;

}
