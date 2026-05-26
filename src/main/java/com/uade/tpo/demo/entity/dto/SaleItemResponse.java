package com.uade.tpo.demo.entity.dto;

import lombok.Data;

@Data
public class SaleItemResponse {
    private Long id;
    private Long productId;
    private String productName;
    private Integer quantity;
    private Double unitPrice;
    private Double subtotal;
}