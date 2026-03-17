package com.uade.tpo.demo.entity.dto;

import java.time.LocalDate;

import lombok.Data;

@Data
public class ClientResponse {
    private Long id;
    private String name;
    private String phone;
    private String source;
    private String notes;
    private LocalDate registrationDate;
    private boolean isActive;
    
}
