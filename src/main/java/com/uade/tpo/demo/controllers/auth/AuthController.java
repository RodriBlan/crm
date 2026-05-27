package com.uade.tpo.demo.controllers.auth;

import com.uade.tpo.demo.entity.dto.AuthResponse;
import com.uade.tpo.demo.entity.dto.LoginRequest;
import com.uade.tpo.demo.entity.dto.RegisterRequest;
import com.uade.tpo.demo.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    // POST /auth/register  ← solo para crear el usuario admin la primera vez
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    // POST /auth/login  ← login normal
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }
}

