package com.uade.tpo.demo.controllers.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.authentication.logout.LogoutHandler;

import com.uade.tpo.demo.entity.Role;

import static org.springframework.security.config.http.SessionCreationPolicy.STATELESS;

import lombok.RequiredArgsConstructor;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final AuthenticationProvider authenticationProvider;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .authorizeHttpRequests(auth -> auth
                // Endpoints públicos
                .requestMatchers("/api/v1/auth/**").permitAll()
                .requestMatchers("/error/**").permitAll()
                // Carritos: GET /carritos/{id} solo ADMIN, el resto solo USER
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/carritos/{id}").hasAuthority(Role.ADMIN.name())
                .requestMatchers("/carritos/**").hasAuthority(Role.USER.name())
                
                .requestMatchers(org.springframework.http.HttpMethod.POST, "/categories").hasAuthority(Role.ADMIN.name())
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/categories/**").hasAnyAuthority(Role.USER.name(), Role.ADMIN.name())
                
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/ordenes").hasAuthority(Role.ADMIN.name())
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/ordenes/{id}").hasAnyAuthority(Role.USER.name(), Role.ADMIN.name())
                
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/products").hasAuthority(Role.ADMIN.name())
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/products/user").hasAuthority(Role.USER.name())
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/products/public").hasAuthority(Role.USER.name())
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/products/**").hasAnyAuthority(Role.USER.name(), Role.ADMIN.name())
                .requestMatchers(org.springframework.http.HttpMethod.POST, "/products").hasAuthority(Role.ADMIN.name())
                .requestMatchers(org.springframework.http.HttpMethod.PATCH, "/products/**").hasAuthority(Role.ADMIN.name())
                .requestMatchers(org.springframework.http.HttpMethod.DELETE, "/products/**").hasAuthority(Role.ADMIN.name())
    
                .requestMatchers("/usuarios/**").hasAuthority(Role.ADMIN.name())
                // Cualquier otro endpoint requiere autenticación
                .anyRequest().authenticated()
            )
            .sessionManagement(session -> session.sessionCreationPolicy(STATELESS))
            .authenticationProvider(authenticationProvider)
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}

