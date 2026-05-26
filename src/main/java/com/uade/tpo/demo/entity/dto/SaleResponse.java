package com.uade.tpo.demo.entity.dto;

import java.time.LocalDateTime;
import java.util.List;

import com.uade.tpo.demo.entity.SaleStatus;

import lombok.Data;

@Data
public class SaleResponse {
    private Long id;
    private LocalDateTime date;
    private Double total;
    private SaleStatus status;
    private String notes;
    private Long clientId;
    private String clientName;
    private List<SaleItemResponse> items;
}
