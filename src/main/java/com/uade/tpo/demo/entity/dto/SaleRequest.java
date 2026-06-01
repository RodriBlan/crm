package com.uade.tpo.demo.entity.dto;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class SaleRequest {
    @NotNull(message="Completar el campo con un ID de cliente")
    private Long clientId;
    private String notes;
    @NotNull(message="La venta debe incluir productos")
    @Valid
    @Size(min=1, message="La venta debe contener al menos un producto")
    private List<SaleItemRequest> items;
    private String status; // opcional, si viene null se usa COMPLETED por defecto
}