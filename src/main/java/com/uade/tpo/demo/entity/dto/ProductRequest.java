package com.uade.tpo.demo.entity.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

@Data
public class ProductRequest {
    @NotBlank(message="Completar el campo con un nombre")
    private String name;
    private String description;
    @NotNull(message="Completar el campo con un precio")
    @PositiveOrZero(message="El precio no puede ser negativo")
    private Double price;
    @NotNull(message="Completar el campo con un stock")
    @PositiveOrZero(message="El stock no puede ser negativo")
    private Integer stock;
    @PositiveOrZero(message="El descuento no puede ser negativo")
    private Double descuento;
    @NotNull(message="Seleccionar una categoría")
    private Long categoryId;    // se recibe el ID, no la entidad entera
}