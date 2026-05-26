package com.uade.tpo.demo.entity.dto;

import lombok.Data;

@Data
public class ClientRequest {
    private String name;
    private String phone;
    private String email;       // ← AGREGADO
    private String source;
    private String notes;
}