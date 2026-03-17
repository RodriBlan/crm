package com.uade.tpo.demo.entity;

import java.sql.Date;
import java.time.LocalDate;

import jakarta.annotation.Generated;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import lombok.Data;

@Data
@Entity
public class Client {
    
    private String name;
    private String phone;
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private LocalDate registrationDate;
    private boolean isActive;
    private String notes;
    private String source;
    //@OneToMany(mappedBy = "client")
    //private List<Sale> sales;


}
