package com.uade.tpo.demo.entity.dto;

import com.uade.tpo.demo.entity.Category;

import lombok.Data;

import java.util.List;

@Data
public class ProductRequest {
    private String description;
    private Double price;
    private Integer stock;
    private List<String> imageUrls;
    private Double descuento;
    private Category category;
}
