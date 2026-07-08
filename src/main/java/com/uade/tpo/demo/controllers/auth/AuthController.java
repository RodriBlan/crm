package com.uade.tpo.demo.controllers.auth;

import com.uade.tpo.demo.entity.dto.AuthResponse;
import com.uade.tpo.demo.entity.dto.AccessRequestResponse;
import com.uade.tpo.demo.entity.dto.LoginRequest;
import com.uade.tpo.demo.entity.dto.RegisterRequest;
import com.uade.tpo.demo.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @Value("${app.auth.registration-enabled:false}")
    private boolean registrationEnabled;

    // POST /auth/register — solo para crear el admin la primera vez
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody @Valid RegisterRequest request) {
        if (!registrationEnabled) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Registro deshabilitado.");
        }
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/request-access")
    public ResponseEntity<AccessRequestResponse> requestAccess(@RequestBody @Valid RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.requestAccess(request));
    }

    @GetMapping("/access-requests")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AccessRequestResponse>> getPendingAccessRequests() {
        return ResponseEntity.ok(authService.getPendingAccessRequests());
    }

    @PatchMapping("/access-requests/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AccessRequestResponse> approveAccessRequest(@PathVariable Long id) {
        return ResponseEntity.ok(authService.approveAccessRequest(id));
    }

    @PatchMapping("/access-requests/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AccessRequestResponse> rejectAccessRequest(@PathVariable Long id) {
        return ResponseEntity.ok(authService.rejectAccessRequest(id));
    }

    // POST /auth/login
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @RequestBody @Valid LoginRequest request,
            HttpServletRequest httpRequest) {
        // A09: pasamos la IP al service para logging
        String ip = getClientIp(httpRequest);
        return ResponseEntity.ok(authService.login(request, ip));
    }

    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
