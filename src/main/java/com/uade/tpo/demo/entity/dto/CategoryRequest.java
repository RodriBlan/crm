package com.uade.tpo.demo.entity.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CategoryRequest {
    @NotBlank(message="Completar el campo con una categoria")
    @Size(min = 2, message = "La categoría debe tener al menos 2 caracteres")
    private String description;
}