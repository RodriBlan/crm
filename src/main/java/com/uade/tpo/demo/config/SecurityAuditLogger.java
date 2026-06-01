package com.uade.tpo.demo.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * A09 - Security Logging & Monitoring
 * Registra eventos de seguridad en el log de la aplicación.
 * En producción estos logs deberían ir a un sistema centralizado (ej: CloudWatch, Papertrail).
 */
@Component
public class SecurityAuditLogger {

    private static final Logger log = LoggerFactory.getLogger("SECURITY_AUDIT");
    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    public void logLoginSuccess(String username, String ip) {
        log.info("[{}] LOGIN_SUCCESS | user={} | ip={}", now(), username, ip);
    }

    public void logLoginFailure(String username, String ip) {
        log.warn("[{}] LOGIN_FAILURE | user={} | ip={}", now(), username, ip);
    }

    public void logLoginBlocked(String ip) {
        log.warn("[{}] LOGIN_BLOCKED | ip={} | reason=rate_limit", now(), ip);
    }

    public void logUnauthorizedAccess(String path, String ip) {
        log.warn("[{}] UNAUTHORIZED | path={} | ip={}", now(), path, ip);
    }

    public void logResourceDeleted(String resource, Long id, String username) {
        log.info("[{}] DELETE | resource={} | id={} | user={}", now(), resource, id, username);
    }

    private String now() {
        return LocalDateTime.now().format(FMT);
    }
}
