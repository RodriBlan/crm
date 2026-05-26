package com.uade.tpo.demo.entity.dto;

import java.util.List;
import lombok.Data;

@Data
public class SaleRequest {
    private Long clientId;
    private String notes;
    private List<SaleItemRequest> items;
}