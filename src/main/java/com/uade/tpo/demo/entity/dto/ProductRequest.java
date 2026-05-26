package com.uade.tpo.demo.entity.dto;

import lombok.Data;

@Data
public class ProductRequest {
    private String name;
    private String description;
    private Double price;
    private Integer stock;
    private Double descuento;
    private Long categoryId;    // se recibe el ID, no la entidad entera
}