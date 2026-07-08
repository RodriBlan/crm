package com.uade.tpo.demo.service;

import com.uade.tpo.demo.config.JwtService;
import com.uade.tpo.demo.config.SecurityAuditLogger;
import com.uade.tpo.demo.entity.Role;
import com.uade.tpo.demo.entity.User;
import com.uade.tpo.demo.entity.UserStatus;
import com.uade.tpo.demo.entity.dto.AccessRequestResponse;
import com.uade.tpo.demo.entity.dto.AuthResponse;
import com.uade.tpo.demo.entity.dto.LoginRequest;
import com.uade.tpo.demo.entity.dto.RegisterRequest;
import com.uade.tpo.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final SecurityAuditLogger auditLogger;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("El usuario ya existe: " + request.getUsername());
        }
        User user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.ADMIN)
                .status(UserStatus.ACTIVE)
                .build();
        userRepository.save(user);
        String token = jwtService.generateToken(user);
        return new AuthResponse(token, user.getUsername(), user.getRole().name());
    }

    public AccessRequestResponse requestAccess(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ya existe una solicitud o cuenta con ese usuario.");
        }
        User user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER)
                .status(UserStatus.PENDING)
                .build();
        return AccessRequestResponse.from(userRepository.save(user));
    }

    public AuthResponse login(LoginRequest request, String clientIp) {
        try {
            User userBeforeAuth = userRepository.findByUsername(request.getUsername()).orElse(null);
            if (userBeforeAuth != null && userBeforeAuth.getStatus() == UserStatus.PENDING) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Tu cuenta todavia esta pendiente de aprobacion.");
            }
            if (userBeforeAuth != null && userBeforeAuth.getStatus() == UserStatus.REJECTED) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Tu solicitud fue rechazada.");
            }
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
            );
            User user = userRepository.findByUsername(request.getUsername())
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
            auditLogger.logLoginSuccess(user.getUsername(), clientIp);
            String token = jwtService.generateToken(user);
            return new AuthResponse(token, user.getUsername(), user.getRole().name());
        } catch (BadCredentialsException e) {
            auditLogger.logLoginFailure(request.getUsername(), clientIp);
            throw new RuntimeException("Usuario o contrasena incorrectos.");
        }
    }

    public List<AccessRequestResponse> getPendingAccessRequests() {
        return userRepository.findByStatusOrderByIdDesc(UserStatus.PENDING)
                .stream()
                .map(AccessRequestResponse::from)
                .toList();
    }

    public AccessRequestResponse approveAccessRequest(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Solicitud no encontrada."));
        user.setStatus(UserStatus.ACTIVE);
        user.setRole(Role.USER);
        return AccessRequestResponse.from(userRepository.save(user));
    }

    public AccessRequestResponse rejectAccessRequest(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Solicitud no encontrada."));
        user.setStatus(UserStatus.REJECTED);
        return AccessRequestResponse.from(userRepository.save(user));
    }
}
