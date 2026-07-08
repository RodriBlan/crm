package com.uade.tpo.demo.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * A09 / Fuerza bruta: limita los intentos de login/registro por IP.
 * Máximo 10 intentos en 5 minutos por IP.
 * Si se supera, devuelve 429 Too Many Requests.
 */
@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private static final int MAX_ATTEMPTS = 10;
    private static final long WINDOW_MS = 5 * 60 * 1000L; // 5 minutos

    // IP → [intentos, timestamp primer intento]
    private final Map<String, long[]> attempts = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        boolean sensitiveAuthEndpoint = request.getRequestURI().equals("/auth/login")
                || request.getRequestURI().equals("/auth/register")
                || request.getRequestURI().equals("/auth/request-access");

        if (!sensitiveAuthEndpoint || !request.getMethod().equals("POST")) {
            filterChain.doFilter(request, response);
            return;
        }

        String ip = getClientIp(request);
        long now = Instant.now().toEpochMilli();

        attempts.compute(ip, (key, val) -> {
            if (val == null || now - val[1] > WINDOW_MS) {
                return new long[]{1, now};
            }
            val[0]++;
            return val;
        });

        long[] record = attempts.get(ip);
        if (record[0] > MAX_ATTEMPTS) {
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType("application/json");
            response.getWriter().write("{\"message\":\"Demasiados intentos. Esperá 5 minutos.\"}");
            return;
        }

        filterChain.doFilter(request, response);
    }

    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
