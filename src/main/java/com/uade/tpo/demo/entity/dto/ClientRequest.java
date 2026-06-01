package com.uade.tpo.demo.entity.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ClientRequest {
    @NotBlank(message="Completar el campo con un nombre")
    private String name;
    private String phone;
    @NotBlank(message="Completar el campo con un email")
    @Email(message="El email debe tener un formato válido")
    private String email;
    private String source;
    private String notes;
}