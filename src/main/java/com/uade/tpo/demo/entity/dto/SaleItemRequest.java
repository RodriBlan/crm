package com.uade.tpo.demo.entity.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class SaleItemRequest {
    @NotNull(message="Producto requerido")
    private Long productId;
    @NotNull(message="La cantidad es obligatoria")
    @Positive(message="La cantidad debe ser mayor a cero")
    private Integer quantity;
}