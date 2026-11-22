package com.ecommerce.user.controllers;


import com.ecommerce.user.dto.UserRequest;
import com.ecommerce.user.dto.UserResponse;
import com.ecommerce.user.services.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/users")
@Slf4j
@Tag(name = "Users", description = "Register and manage users")
public class UserController {


    private final UserService userService;
    @GetMapping
    @Operation(summary = "List users")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return new ResponseEntity<>(userService.fetchUsers(), HttpStatus.OK);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a user by id")
    public ResponseEntity<UserResponse> getUser(@PathVariable String id) {
        log.info("Request received for user: {}",id);

        return userService.fetchOneUser(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());

    }

    @PostMapping
    @Operation(summary = "Register a user")
    public ResponseEntity<String> createUsers(@Valid @RequestBody UserRequest user) {
        userService.addUser(user);
        return ResponseEntity.ok("User added!");
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a user")
    public ResponseEntity<String> updateUser(@PathVariable String id, @Valid @RequestBody UserRequest user) {
        boolean isUpdated = userService.updateUser(id, user);
        return isUpdated ? ResponseEntity.ok("Updated") : ResponseEntity.notFound().build();
    }
}
