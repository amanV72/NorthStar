package com.ecommerce.user.services;


import com.ecommerce.user.dto.AddressDTO;
import com.ecommerce.user.dto.UserRequest;
import com.ecommerce.user.dto.UserResponse;
import com.ecommerce.user.models.Address;
import com.ecommerce.user.models.User;
import com.ecommerce.user.models.UserRole;
import com.ecommerce.user.repositories.UserRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepo userRepo;
    private final KeyCloakAdminService adminService;

    private UserResponse mapToUserResponse(User user) {
        UserResponse response = new UserResponse();
        response.setUsername(user.getUsername());
        response.setId(String.valueOf(user.getId()));
        response.setFirstName(user.getFirstName());
        response.setLastName(user.getLastName());
        response.setEmail(user.getEmail());
        response.setPhone(user.getPhone());
        response.setUserRole(user.getUserRole());
        if (user.getAddress() != null) {
            AddressDTO addressDTO = new AddressDTO();
            addressDTO.setStreet(user.getAddress().getStreet());
            addressDTO.setCity(user.getAddress().getCity());
            addressDTO.setState(user.getAddress().getState());
            addressDTO.setCountry(user.getAddress().getCountry());
            addressDTO.setZipcode(user.getAddress().getZipcode());
            response.setAddress(addressDTO);
        }

        return response;

    }

    private void mapToUser(User user, UserRequest userRequest) {

        user.setUsername(userRequest.getUsername());
        user.setFirstName(userRequest.getFirstName());
        user.setLastName(userRequest.getLastName());
        user.setEmail(userRequest.getEmail());
        user.setPhone(userRequest.getPhone());
        if (userRequest.getAddress() != null) {
            Address address = new Address();
            address.setCity(userRequest.getAddress().getCity());
            address.setStreet(userRequest.getAddress().getStreet());
            address.setState(userRequest.getAddress().getState());
            address.setZipcode(userRequest.getAddress().getZipcode());
            address.setCountry(userRequest.getAddress().getCountry());
            user.setAddress(address);
        }

    }


    public List<UserResponse> fetchUsers() {
        List<User> users = userRepo.findAll();

        return users.stream()
                .map(this::mapToUserResponse)
                .collect(Collectors.toList());
    }

    public void addUser(UserRequest userRequest) {
        String token = adminService.getAdminAccessToken();
        String keycloakUserId = adminService.createUser(token, userRequest);

        User user = new User();
        mapToUser(user, userRequest);
        user.setKeycloakId(keycloakUserId);
        UserRole requestedRole = userRequest.getUserRole() == UserRole.SELLER
                ? UserRole.SELLER
                : UserRole.CUSTOMER;
        user.setUserRole(requestedRole);
        String keycloakRole = requestedRole == UserRole.SELLER ? "SELLER" : "USER";
        adminService.assignClientRoleToUser(userRequest.getUsername(), keycloakRole, keycloakUserId);
        userRepo.save(user);
    }

    public Optional<UserResponse> fetchOneUser(String id) {
        if (id == null || id.isBlank()) {
            return Optional.empty();
        }

        // 1. Check MongoDB _id
        Optional<User> userOpt = userRepo.findById(id);
        if (userOpt.isPresent()) {
            return userOpt.map(this::mapToUserResponse);
        }

        // 2. Check Keycloak UUID
        userOpt = userRepo.findByKeycloakId(id);
        if (userOpt.isPresent()) {
            return userOpt.map(this::mapToUserResponse);
        }

        // 3. Check username
        userOpt = userRepo.findByUsername(id);
        if (userOpt.isPresent()) {
            return userOpt.map(this::mapToUserResponse);
        }

        // 4. Check email
        userOpt = userRepo.findByEmail(id);
        if (userOpt.isPresent()) {
            return userOpt.map(this::mapToUserResponse);
        }

        // 5. Fallback: Query Keycloak Admin REST API directly
        try {
            java.util.Map<String, Object> kcUser = adminService.getUserById(id);
            if (kcUser != null) {
                UserResponse resp = new UserResponse();
                resp.setId(id);
                resp.setUsername((String) kcUser.get("username"));
                resp.setFirstName((String) kcUser.get("firstName"));
                resp.setLastName((String) kcUser.get("lastName"));
                resp.setEmail((String) kcUser.get("email"));
                resp.setUserRole(UserRole.SELLER);

                try {
                    User newUser = User.builder()
                            .keycloakId(id)
                            .username((String) kcUser.get("username"))
                            .firstName((String) kcUser.get("firstName"))
                            .lastName((String) kcUser.get("lastName"))
                            .email((String) kcUser.get("email"))
                            .userRole(UserRole.SELLER)
                            .build();
                    userRepo.save(newUser);
                } catch (Exception ignored) {}

                return Optional.of(resp);
            }
        } catch (Exception ignored) {}

        return Optional.empty();
    }

    public boolean updateUser(String id, UserRequest userRequest) {
        return userRepo.findById(id)
                .map(existingUser -> {
                    mapToUser(existingUser, userRequest);
                    userRepo.save(existingUser);
                    return true;
                }).orElse(false);

    }


}
