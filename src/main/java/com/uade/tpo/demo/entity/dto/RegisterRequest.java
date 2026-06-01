package com.uade.tpo.demo.entity.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank(message="Completar el campo con un nombre de usuario")
    @Size(min = 3, message = "El nombre de usuario debe tener al menos 3 caracteres")
    private String username;
    @NotBlank(message="Completar el campo con una contraseña")
    @Size(min = 6, message = "La contraseña debe tener al menos 6 caracteres")
    private String password;
}

