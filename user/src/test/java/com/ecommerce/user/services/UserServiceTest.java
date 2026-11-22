package com.ecommerce.user.services;

import com.ecommerce.user.dto.AddressDTO;
import com.ecommerce.user.dto.UserRequest;
import com.ecommerce.user.dto.UserResponse;
import com.ecommerce.user.models.Address;
import com.ecommerce.user.models.User;
import com.ecommerce.user.models.UserRole;
import com.ecommerce.user.repositories.UserRepo;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.mockito.Mockito.*;

import static org.junit.jupiter.api.Assertions.*;


@ExtendWith(MockitoExtension.class)
@DisplayName("UserServiceUnitTest")
class UserServiceTest {
    @Mock
    private UserRepo userRepo;
    @Mock
    private KeyCloakAdminService adminService;

    @InjectMocks
    private UserService userService;


    private User user;
    private Address address;
    private UserResponse userResponse;
    private AddressDTO addressDTO;
    private UserRequest userRequest;

    @BeforeEach
    void setUp() {
        this.address = Address.builder()
                .id(123L)
                .street("asddfg")
                .city("mumbai")
                .state("Maharashtra")
                .country("India")
                .zipcode("400104")
                .build();
        this.addressDTO = AddressDTO.builder()
                .state(this.address.getState())
                .zipcode(this.address.getZipcode())
                .street(this.address.getStreet())
                .country(this.address.getCountry())
                .city(this.address.getCity())
                .build();
        this.user = User.builder()
                .username("amanV27")
                .id("12345")
                .userRole(UserRole.CUSTOMER)
                .email("aman@gmaill.com")
                .phone("9969673039")
                .address(this.address)
                .firstName("Aman")
                .lastName("Verma")
                .build();

        this.userRequest = UserRequest.builder()
                .username("amanV27")
                .firstName("Aman")
                .lastName("Verma")
                .phone("9969673093")
                .email("aman@gmail.com")
                .address(this.addressDTO)
                .password("1234567")
                .username("amanV72")
                .build();

        this.userResponse = UserResponse.builder()
                .username(this.user.getUsername())
                .id(this.user.getId())
                .userRole(this.user.getUserRole())
                .address(this.addressDTO)
                .phone(this.user.getPhone())
                .email(this.user.getEmail())
                .firstName(this.user.getFirstName())
                .lastName(this.user.getLastName())
                .build();

    }


    @Nested
    @DisplayName("AddUserTests")
    class AddUserTests {

        @Test
        @DisplayName("Should add user successfully when valid")
        void ShouldAddUserSuccessfully() {
            //Given
            String adminToken = "testAdminToken";
            String keycloakUserId = "testId";

            when(adminService.getAdminAccessToken()).thenReturn(adminToken);
            when(adminService.createUser(adminToken, userRequest)).thenReturn(keycloakUserId);
            user.setKeycloakId(keycloakUserId);
            when(userRepo.save(any(User.class))).thenReturn(user);

            //When
            userService.addUser(userRequest);

            //Then
            verify(adminService, times(1))
                    .getAdminAccessToken();

            verify(adminService, times(1))
                    .createUser(adminToken, userRequest);

            verify(adminService, times(1))
                    .assignClientRoleToUser(
                            userRequest.getUsername(),
                            "USER",
                            keycloakUserId
                    );

            ArgumentCaptor<User> userCaptor =
                    ArgumentCaptor.forClass(User.class);

            verify(userRepo).save(userCaptor.capture());

            User savedUser = userCaptor.getValue();

            assertEquals(keycloakUserId, savedUser.getKeycloakId());
            assertEquals(userRequest.getUsername(), savedUser.getUsername());

        }

        @Test
        @DisplayName("Should add user successfully when address is null")
        void ShouldAddUserSuccessfullyWhenAddressIsNull() {
            //Given
            String adminToken = "testAdminToken";
            String keycloakUserId = "testId";
            userRequest.setAddress(null);

            when(adminService.getAdminAccessToken()).thenReturn(adminToken);
            when(adminService.createUser(adminToken, userRequest)).thenReturn(keycloakUserId);
            user.setKeycloakId(keycloakUserId);
            when(userRepo.save(any(User.class))).thenReturn(user);

            //When
            userService.addUser(userRequest);

            //Then
            verify(adminService, times(1))
                    .getAdminAccessToken();

            verify(adminService, times(1))
                    .createUser(adminToken, userRequest);

            verify(adminService, times(1))
                    .assignClientRoleToUser(
                            userRequest.getUsername(),
                            "USER",
                            keycloakUserId
                    );

            ArgumentCaptor<User> userCaptor =
                    ArgumentCaptor.forClass(User.class);

            verify(userRepo).save(userCaptor.capture());

            User savedUser = userCaptor.getValue();

            assertEquals(keycloakUserId, savedUser.getKeycloakId());
            assertEquals(userRequest.getUsername(), savedUser.getUsername());

        }


        @Test
        @DisplayName("failed to get keycloak admin token ")
        void failedToGetKeycloakAdminToken() {
            //Given
            String userId = "12345";



            when(adminService.getAdminAccessToken()).thenThrow(new RuntimeException("Response body is null"));

            //When
            final RuntimeException exception = assertThrows(
                    RuntimeException.class,
                    () -> userService.addUser(userRequest));

            verify(adminService, times(1))
                    .getAdminAccessToken();

            verify(adminService, never())
                    .createUser(anyString(), any(UserRequest.class));

            verify(adminService, never())
                    .assignClientRoleToUser(
                            anyString(),
                            anyString(),
                            anyString()
                    );

            verify(userRepo, never())
                    .save(any(User.class));

        }

        @Test
        @DisplayName("failed to create keycloak user ")
        void failedToCreateKeycloakUser() {
            //Given
            String adminToken = "testAdminToken";
            String keycloakUserId = "testId";
            when(adminService.getAdminAccessToken()).thenReturn(adminToken);
            when(adminService.createUser(adminToken, userRequest)).thenThrow(new RuntimeException("Failed to create User in keycloak"));

            //When
            final RuntimeException exception = assertThrows(
                    RuntimeException.class,
                    () -> userService.addUser(userRequest));

            verify(adminService, times(1))
                    .getAdminAccessToken();

            verify(adminService, times(1))
                    .createUser(anyString(), any(UserRequest.class));

            verify(adminService, never())
                    .assignClientRoleToUser(
                            anyString(),
                            anyString(),
                            anyString()
                    );

            verify(userRepo, never())
                    .save(any(User.class));

        }


    }

    @Nested
    @DisplayName("FetchUserTests")
    class FetchUserTests {

        @Test
        @DisplayName("Should fetch a user successfully when valid")
        void ShouldFetchAUserSuccessfully() {
            //Given
            final String id = "12345";

            when(userRepo.findById(id)).thenReturn(Optional.of(user));

            //When
            Optional<UserResponse> userRes = userService.fetchOneUser(id);

            //Then
            assertTrue(userRes.isPresent());
            assertEquals(userResponse, userRes.get());
            verify(userRepo, times(1)).findById(id);
        }
        @Test
        @DisplayName("Should fetch user successfully when address is null")
        void shouldFetchUserSuccessfullyWhenAddressIsNull() {

            // Given
            final String id = "12345";

            user.setAddress(null);

            when(userRepo.findById(id))
                    .thenReturn(Optional.of(user));

            // When
            Optional<UserResponse> userRes =
                    userService.fetchOneUser(id);

            // Then
            assertTrue(userRes.isPresent());

            UserResponse response = userRes.get();

            assertEquals(user.getUsername(), response.getUsername());
            assertEquals(user.getId(), response.getId());
            assertNull(response.getAddress());

            verify(userRepo, times(1)).findById(id);
        }

        @Test
        @DisplayName("Should return empty when a user is not present")
        void shouldReturnEmptyIfAUserNotPresent() {
            //Given
            final String id = "12345";

            when(userRepo.findById(id)).thenReturn(Optional.empty());

            //When
            Optional<UserResponse> userRes = userService.fetchOneUser(id);

            //Then
            assertTrue(userRes.isEmpty());
            verify(userRepo, times(1)).findById(id);
        }

        @Test
        @DisplayName("Should fetch all user successfully when valid")
        void ShouldFetchAllUserSuccessfully() {
            //Given

            when(userRepo.findAll()).thenReturn(List.of(user));

            //When
            List<UserResponse> userRes = userService.fetchUsers();

            //Then
            assertNotNull(userRes);
            assertEquals(List.of(userResponse), userRes);
            verify(userRepo, times(1)).findAll();
        }

        @Test
        @DisplayName("Should return empty when no user is present")
        void shouldReturnEmptyIfNoUserIsPresent() {
            //Given

            when(userRepo.findAll()).thenReturn(List.of());

            //When
            List<UserResponse> userRes = userService.fetchUsers();

            //Then
            assertEquals(List.of(), userRes);
            verify(userRepo, times(1)).findAll();
        }

    }

    @Nested
    @DisplayName("UpdateUserTests")
    class UpdateUserTests {

        @Test
        @DisplayName("Should update a user successfully")
        void ShouldUpdateAUserSuccessfully() {
            //Given
            final String id = "12345";
            userRequest.setPhone("7977667890");
            userRequest.setFirstName("Chanda");

            when(userRepo.findById(id)).thenReturn(Optional.of(user));

            //When
            boolean isUpdated = userService.updateUser(id, userRequest);

            //Then
            assertTrue(isUpdated);
            verify(userRepo, times(1)).findById(id);

            ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
            verify(userRepo).save(userCaptor.capture());
            User updatedUser = userCaptor.getValue();

            assertEquals("7977667890", updatedUser.getPhone());
            assertEquals("Chanda", updatedUser.getFirstName());
        }

        @Test
        @DisplayName("Should return false when a user is not present")
        void shouldReturnFalseIfAUserNotPresent() {
            //Given
            final String id = "12345";

            when(userRepo.findById(id)).thenReturn(Optional.empty());

            //When
            boolean isUpdated = userService.updateUser(id, userRequest);

            //Then
            assertFalse(isUpdated);
            verify(userRepo, times(1)).findById(id);
            verify(userRepo, times(0)).save(any(User.class));
        }

    }
}