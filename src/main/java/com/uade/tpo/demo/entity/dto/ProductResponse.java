package com.uade.tpo.demo.entity.dto;

import lombok.Data;

@Data
public class ProductResponse {
    private Long id;
    private String name;
    private String description;
    private Double price;
    private Integer stock;
    private Double descuento;
    private Boolean active;
    private Long categoryId;
    private String categoryDescription;
}