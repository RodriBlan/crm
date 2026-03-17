package com.uade.tpo.demo.entity.dto;

import java.util.List;
import com.uade.tpo.demo.entity.Category;

import lombok.Data;

@Data
public class ProductUpdateRequest {
    private String description;
    private Double price;
    private Integer stock;
    private List<String> imageUrls;
    private Double descuento;
    private Category category;
}




