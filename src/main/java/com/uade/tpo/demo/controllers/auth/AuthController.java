package com.uade.tpo.demo.controllers.auth;

import com.uade.tpo.demo.entity.dto.AuthResponse;
import com.uade.tpo.demo.entity.dto.LoginRequest;
import com.uade.tpo.demo.entity.dto.RegisterRequest;
import com.uade.tpo.demo.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

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
