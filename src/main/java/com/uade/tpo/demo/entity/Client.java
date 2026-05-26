package com.uade.tpo.demo.entity;

import java.time.LocalDate;
import java.util.List;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
public class Client {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String phone;
    private String email;           // ← AGREGADO
    private LocalDate registrationDate;
    private boolean isActive;
    private String notes;
    private String source;

    @OneToMany(mappedBy = "client", cascade = CascadeType.ALL)
    private List<Sale> sales;       // ← relación con ventas
}
