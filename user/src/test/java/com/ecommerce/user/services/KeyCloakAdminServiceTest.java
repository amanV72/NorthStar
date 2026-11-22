package com.ecommerce.user.services;

import com.ecommerce.user.dto.UserRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.*;
import org.springframework.test.util.ReflectionTestUtils;

import org.springframework.web.client.RestTemplate;

import java.net.URI;
import java.util.HashMap;


import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.util.List;
import java.util.Map;

@ExtendWith(MockitoExtension.class)
@DisplayName("Keycloak Admin Service Tests")
class KeyCloakAdminServiceTest {

    @Mock
    private RestTemplate restTemplate;

    @InjectMocks
    private KeyCloakAdminService adminService;

    private UserRequest userRequest;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(
                adminService, "adminUsername", "testAdmin");

        ReflectionTestUtils.setField(
                adminService, "adminPassword", "testPassword");

        ReflectionTestUtils.setField(
                adminService, "keycloakServerUrl",
                "http://localhost:8080");

        ReflectionTestUtils.setField(
                adminService, "realm", "testRealm");

        ReflectionTestUtils.setField(
                adminService, "clientId", "testClient");

        ReflectionTestUtils.setField(
                adminService, "clientUUID", "testClientUuid");

        this.userRequest = UserRequest.builder()
                .username("amanV27")
                .firstName("Aman")
                .lastName("Verma")
                .phone("9969673093")
                .email("aman@gmail.com")
                .password("1234567")
                .username("amanV72")
                .build();
    }


    @Nested
    @DisplayName("Tests for admin token")
    class AdminTokenTests {

        @Test
        @DisplayName("Fetch Admin token Successfully")
        void fetchAdminTokenSuccessfully() {
            //Given
            Map<String, Object> responseBody = new HashMap<>();
            responseBody.put("access_token", "test access token");

            ResponseEntity<Map> response = new ResponseEntity<>(responseBody, HttpStatus.OK);

            when(restTemplate.postForEntity(anyString(),
                    any(HttpEntity.class),
                    eq(Map.class)))
                    .thenReturn(response);

            //when
            String result = adminService.getAdminAccessToken();

            //The
            assertNotNull(result);
            assertEquals("test access token", result);
            verify(restTemplate, times(1)).postForEntity(
                    eq("http://localhost:8080/realms/testRealm/protocol/openid-connect/token"),
                    any(HttpEntity.class),
                    eq(Map.class)
            );
        }

        @Test
        @DisplayName("Failed to Fetch Admin token")
        void failedToFetchAdminToken() {
            //Given
            ResponseEntity<Map> response = new ResponseEntity<>(null, HttpStatus.UNAUTHORIZED);

            when(restTemplate.postForEntity(anyString(),
                    any(HttpEntity.class),
                    eq(Map.class)))
                    .thenReturn(response);

            //when
            final RuntimeException exception = assertThrows(
                    RuntimeException.class,
                    () -> adminService.getAdminAccessToken()
            );

            //Then
            assertEquals("Cannot get admin token", exception.getMessage());
            verify(restTemplate, times(1)).postForEntity(
                    eq("http://localhost:8080/realms/testRealm/protocol/openid-connect/token"),
                    any(HttpEntity.class),
                    eq(Map.class)
            );
        }

        @Test
        @DisplayName("Response body is null")
        void responseBodyIsNull() {
            //Given

            ResponseEntity<Map> response = new ResponseEntity<>(null, HttpStatus.OK);

            when(restTemplate.postForEntity(anyString(),
                    any(HttpEntity.class),
                    eq(Map.class)))
                    .thenReturn(response);

            //when
            final RuntimeException exception = assertThrows(
                    RuntimeException.class,
                    () -> adminService.getAdminAccessToken()
            );


            //Then
            assertEquals("Cannot get admin token", exception.getMessage());
            verify(restTemplate, times(1)).postForEntity(
                    eq("http://localhost:8080/realms/testRealm/protocol/openid-connect/token"),
                    any(HttpEntity.class),
                    eq(Map.class)
            );
        }

        @Test
        @DisplayName("Admin Token is null")
        void adminTokenIsNull() {
            //Given
            Map<String, Object> responseBody = new HashMap<>();
            responseBody.put("access_token", null);

            ResponseEntity<Map> response = new ResponseEntity<>(responseBody, HttpStatus.OK);

            when(restTemplate.postForEntity(anyString(),
                    any(HttpEntity.class),
                    eq(Map.class)))
                    .thenReturn(response);

            //when
            final RuntimeException exception = assertThrows(
                    RuntimeException.class,
                    () -> adminService.getAdminAccessToken()
            );


            //Then
            assertEquals("Access Token is Null", exception.getMessage());
            verify(restTemplate, times(1)).postForEntity(
                    eq("http://localhost:8080/realms/testRealm/protocol/openid-connect/token"),
                    any(HttpEntity.class),
                    eq(Map.class)
            );
        }

    }

    @Nested
    @DisplayName("Tests for Create User")
    class CreateUserTests {

        @Test
        @DisplayName("create a user successfully")
        void createAUserSuccessfully() {
            //Given
            String token = "adminTestToken";


            URI location = URI.create(
                    "http://localhost:8080/admin/realms/testRealm/users/testKeycloakId"
            );
            ResponseEntity<String> response = ResponseEntity
                    .status(HttpStatus.CREATED)
                    .location(location).build();

            when(restTemplate.postForEntity(anyString(),
                    any(HttpEntity.class),
                    eq(String.class))).thenReturn(response);

            //When
            String result = adminService.createUser(token, userRequest);

            //Then
            assertNotNull(result);
            assertEquals("testKeycloakId", result);
            verify(restTemplate, times(1)).postForEntity(
                    eq("http://localhost:8080/admin/realms/testRealm/users"),
                    any(HttpEntity.class),
                    eq(String.class)
            );


        }

        @Test
        @DisplayName("Failed to create user")
        void failedToCreateUser() {
            //Given
            String token = "adminTestToken";


            URI location = URI.create(
                    "http://localhost:8080/admin/realms/testRealm/users/testKeycloakId"
            );
            ResponseEntity<String> response = ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .location(location).build();

            when(restTemplate.postForEntity(anyString(),
                    any(HttpEntity.class),
                    eq(String.class))).thenReturn(response);

            //When
            final RuntimeException exception = assertThrows(
                    RuntimeException.class,
                    () -> adminService.createUser(token, userRequest)
            );

            //Then
            assertEquals("Failed to create User in keycloak" + response.getBody(), exception.getMessage());
            verify(restTemplate, times(1)).postForEntity(
                    eq("http://localhost:8080/admin/realms/testRealm/users"),
                    any(HttpEntity.class),
                    eq(String.class)
            );
        }

        @Test
        @DisplayName("User created but location header absent")
        void locationHeaderAbsent() {
            //Given
            String token = "adminTestToken";

            ResponseEntity<String> response = ResponseEntity
                    .status(HttpStatus.CREATED)
                    .build();

            when(restTemplate.postForEntity(anyString(),
                    any(HttpEntity.class),
                    eq(String.class))).thenReturn(response);

            //When
            final RuntimeException exception = assertThrows(
                    RuntimeException.class,
                    () -> adminService.createUser(token, userRequest)
            );

            //Then
            assertEquals("Keycloak did not return a location header" + response.getBody(), exception.getMessage());
            verify(restTemplate, times(1)).postForEntity(
                    eq("http://localhost:8080/admin/realms/testRealm/users"),
                    any(HttpEntity.class),
                    eq(String.class)
            );
        }
    }

    @Nested
    @DisplayName("Tests for Assigning role to user")
    class AssignRoleTests {

        @Test
        @DisplayName("assign roles to User successfully")
        void assignRoleToUserSuccessfully() {

            // Given
            String username = "testUsername";
            String roleName = "testRoleName";
            String userId = "testUserId";

            String adminToken = "testAdminToken";

            // Mock getAdminAccessToken()
            Map<String, Object> tokenBody = new HashMap<>();
            tokenBody.put("access_token", adminToken);

            ResponseEntity<Map> tokenResponse =
                    new ResponseEntity<>(tokenBody, HttpStatus.OK);

            when(restTemplate.postForEntity(
                    anyString(),
                    any(HttpEntity.class),
                    eq(Map.class)
            )).thenReturn(tokenResponse);

            // Mock getRealmRoleRepresentation()
            Map<String, Object> roleResponseBody = new HashMap<>();
            roleResponseBody.put("id", "testRoleId");
            roleResponseBody.put("name", roleName);

            ResponseEntity<Map> roleResponse =
                    new ResponseEntity<>(roleResponseBody, HttpStatus.OK);

            when(restTemplate.exchange(
                    anyString(),
                    eq(HttpMethod.GET),
                    any(HttpEntity.class),
                    eq(Map.class)
            )).thenReturn(roleResponse);

            // Mock assign role request
            when(restTemplate.postForEntity(
                    anyString(),
                    any(HttpEntity.class),
                    eq(Void.class)
            )).thenReturn(
                    new ResponseEntity<>(HttpStatus.OK)
            );

            // When
            adminService.assignClientRoleToUser(
                    username,
                    roleName,
                    userId
            );


            // Then

// Verify token request
            verify(restTemplate, times(1)).postForEntity(
                    anyString(),
                    any(HttpEntity.class),
                    eq(Map.class)
            );

// Capture and verify role GET request
            ArgumentCaptor<HttpEntity> getEntityCaptor =
                    ArgumentCaptor.forClass(HttpEntity.class);

            verify(restTemplate, times(1)).exchange(
                    anyString(),
                    eq(HttpMethod.GET),
                    getEntityCaptor.capture(),
                    eq(Map.class)
            );

            HttpEntity capturedGetEntity = getEntityCaptor.getValue();

            assertEquals(
                    "Bearer " + adminToken,
                    capturedGetEntity.getHeaders()
                            .getFirst(HttpHeaders.AUTHORIZATION)
            );


// Capture and verify role assignment request
            ArgumentCaptor<HttpEntity> postEntityCaptor =
                    ArgumentCaptor.forClass(HttpEntity.class);

            verify(restTemplate, times(1)).postForEntity(
                    anyString(),
                    postEntityCaptor.capture(),
                    eq(Void.class)
            );

            HttpEntity capturedPostEntity =
                    postEntityCaptor.getValue();

            assertEquals(
                    "Bearer " + adminToken,
                    capturedPostEntity.getHeaders()
                            .getFirst(HttpHeaders.AUTHORIZATION)
            );

            List<Map<String, Object>> body =
                    (List<Map<String, Object>>) capturedPostEntity.getBody();

            Map<String, Object> role = body.get(0);

            assertEquals("testRoleId", role.get("id"));
            assertEquals("testRoleName", role.get("name"));

        }

        @Test
        @DisplayName("Should fail when admin token request fails")
        void shouldFailWhenAdminTokenRequestFails() {

            ResponseEntity<Map> tokenResponse =
                    new ResponseEntity<>(HttpStatus.UNAUTHORIZED);

            when(restTemplate.postForEntity(
                    anyString(),
                    any(HttpEntity.class),
                    eq(Map.class)
            )).thenReturn(tokenResponse);

            RuntimeException exception = assertThrows(
                    RuntimeException.class,
                    () -> adminService.assignClientRoleToUser(
                            "testUsername",
                            "testRoleName",
                            "testUserId"
                    )
            );

            assertEquals("Cannot get admin token", exception.getMessage());

            verify(restTemplate).postForEntity(
                    anyString(),
                    any(HttpEntity.class),
                    eq(Map.class)
            );

            verify(restTemplate, never()).exchange(
                    anyString(),
                    any(),
                    any(HttpEntity.class),
                    eq(Map.class)
            );

            verify(restTemplate, never()).postForEntity(
                    anyString(),
                    any(HttpEntity.class),
                    eq(Void.class)
            );
        }

        @Test
        @DisplayName("Should fail when admin token response body is null")
        void shouldFailWhenTokenResponseBodyIsNull() {

            ResponseEntity<Map> tokenResponse =
                    new ResponseEntity<>(null, HttpStatus.OK);

            when(restTemplate.postForEntity(
                    anyString(),
                    any(HttpEntity.class),
                    eq(Map.class)
            )).thenReturn(tokenResponse);

            RuntimeException exception = assertThrows(
                    RuntimeException.class,
                    () -> adminService.assignClientRoleToUser(
                            "testUsername",
                            "testRoleName",
                            "testUserId"
                    )
            );

            assertEquals("Cannot get admin token", exception.getMessage());

            verify(restTemplate, never()).exchange(
                    anyString(),
                    any(),
                    any(HttpEntity.class),
                    eq(Map.class)
            );
        }

        @Test
        @DisplayName("Should fail when access token is missing")
        void shouldFailWhenAccessTokenIsMissing() {

            Map<String, Object> tokenBody = new HashMap<>();

            ResponseEntity<Map> tokenResponse =
                    new ResponseEntity<>(tokenBody, HttpStatus.OK);

            when(restTemplate.postForEntity(
                    anyString(),
                    any(HttpEntity.class),
                    eq(Map.class)
            )).thenReturn(tokenResponse);

            RuntimeException exception = assertThrows(
                    RuntimeException.class,
                    () -> adminService.assignClientRoleToUser(
                            "testUsername",
                            "testRoleName",
                            "testUserId"
                    )
            );

            assertEquals("Access Token is Null", exception.getMessage());

            verify(restTemplate, never()).exchange(
                    anyString(),
                    any(),
                    any(HttpEntity.class),
                    eq(Map.class)
            );
        }

        @Test
        @DisplayName("Should fail when role lookup fails")
        void shouldFailWhenRoleLookupFails() {

            String adminToken = "testAdminToken";

            // Token succeeds
            Map<String, Object> tokenBody = new HashMap<>();
            tokenBody.put("access_token", adminToken);

            when(restTemplate.postForEntity(
                    anyString(),
                    any(HttpEntity.class),
                    eq(Map.class)
            )).thenReturn(
                    new ResponseEntity<>(tokenBody, HttpStatus.OK)
            );

            // Role lookup fails
            when(restTemplate.exchange(
                    anyString(),
                    eq(HttpMethod.GET),
                    any(HttpEntity.class),
                    eq(Map.class)
            )).thenReturn(
                    new ResponseEntity<>(HttpStatus.NOT_FOUND)
            );

            RuntimeException exception = assertThrows(
                    RuntimeException.class,
                    () -> adminService.assignClientRoleToUser(
                            "testUsername",
                            "testRoleName",
                            "testUserId"
                    )
            );

            assertEquals(
                    "Failed to fetch Realm roles",
                    exception.getMessage()
            );

            // Final role assignment should never happen
            verify(restTemplate, never()).postForEntity(
                    anyString(),
                    any(HttpEntity.class),
                    eq(Void.class)
            );
        }

        @Test
        @DisplayName("Should fail when role response body is null")
        void shouldFailWhenRoleResponseBodyIsNull() {

            String adminToken = "testAdminToken";

            Map<String, Object> tokenBody = new HashMap<>();
            tokenBody.put("access_token", adminToken);

            when(restTemplate.postForEntity(
                    anyString(),
                    any(HttpEntity.class),
                    eq(Map.class)
            )).thenReturn(
                    new ResponseEntity<>(tokenBody, HttpStatus.OK)
            );

            when(restTemplate.exchange(
                    anyString(),
                    eq(HttpMethod.GET),
                    any(HttpEntity.class),
                    eq(Map.class)
            )).thenReturn(
                    new ResponseEntity<>(null, HttpStatus.OK)
            );

            RuntimeException exception = assertThrows(
                    RuntimeException.class,
                    () -> adminService.assignClientRoleToUser(
                            "testUsername",
                            "testRoleName",
                            "testUserId"
                    )
            );

            assertEquals(
                    "Failed to fetch Realm roles",
                    exception.getMessage()
            );

            verify(restTemplate, never()).postForEntity(
                    anyString(),
                    any(HttpEntity.class),
                    eq(Void.class)
            );
        }

        @Test
        @DisplayName("Should fail when assigning role returns non-2xx")
        void shouldFailWhenRoleAssignmentFails() {

            String adminToken = "testAdminToken";

            // Token
            Map<String, Object> tokenBody = new HashMap<>();
            tokenBody.put("access_token", adminToken);

            when(restTemplate.postForEntity(
                    anyString(),
                    any(HttpEntity.class),
                    eq(Map.class)
            )).thenReturn(
                    new ResponseEntity<>(tokenBody, HttpStatus.OK)
            );

            // Role
            Map<String, Object> roleBody = new HashMap<>();
            roleBody.put("id", "testRoleId");
            roleBody.put("name", "testRoleName");

            when(restTemplate.exchange(
                    anyString(),
                    eq(HttpMethod.GET),
                    any(HttpEntity.class),
                    eq(Map.class)
            )).thenReturn(
                    new ResponseEntity<>(roleBody, HttpStatus.OK)
            );

            // Role assignment fails
            when(restTemplate.postForEntity(
                    anyString(),
                    any(HttpEntity.class),
                    eq(Void.class)
            )).thenReturn(
                    new ResponseEntity<>(HttpStatus.FORBIDDEN)
            );

            RuntimeException exception = assertThrows(
                    RuntimeException.class,
                    () -> adminService.assignClientRoleToUser(
                            "testUsername",
                            "testRoleName",
                            "testUserId"
                    )
            );

            assertTrue(exception.getMessage().contains("Failed to assign role"));
            assertTrue(exception.getMessage().contains("FORBIDDEN"));
        }
    }


}