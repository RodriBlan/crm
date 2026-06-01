package com.uade.tpo.demo.service;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Previene ataques de fuerza bruta en el login.
 * Bloquea un usuario por 15 minutos luego de 5 intentos fallidos.
 */
@Service
public class LoginAttemptService {

    private static final int MAX_ATTEMPTS = 5;
    private static final int BLOCK_MINUTES = 15;

    // username → (intentos, último intento)
    private final Map<String, LoginAttemptData> attempts = new ConcurrentHashMap<>();

    public void loginSucceeded(String username) {
        attempts.remove(username);
    }

    public void loginFailed(String username) {
        LoginAttemptData data = attempts.getOrDefault(username, new LoginAttemptData());
        data.incrementAttempts();
        data.setLastAttempt(LocalDateTime.now());
        attempts.put(username, data);
    }

    public boolean isBlocked(String username) {
        LoginAttemptData data = attempts.get(username);
        if (data == null) return false;

        // Si pasaron más de BLOCK_MINUTES, resetear
        if (data.getLastAttempt().isBefore(LocalDateTime.now().minusMinutes(BLOCK_MINUTES))) {
            attempts.remove(username);
            return false;
        }

        return data.getAttempts() >= MAX_ATTEMPTS;
    }

    public int getRemainingAttempts(String username) {
        LoginAttemptData data = attempts.get(username);
        if (data == null) return MAX_ATTEMPTS;
        return Math.max(0, MAX_ATTEMPTS - data.getAttempts());
    }

    private static class LoginAttemptData {
        private int attempts = 0;
        private LocalDateTime lastAttempt = LocalDateTime.now();

        void incrementAttempts() { this.attempts++; }
        int getAttempts() { return attempts; }
        LocalDateTime getLastAttempt() { return lastAttempt; }
        void setLastAttempt(LocalDateTime t) { this.lastAttempt = t; }
    }
}

