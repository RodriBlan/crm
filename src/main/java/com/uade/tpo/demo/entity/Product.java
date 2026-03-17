package com.uade.tpo.demo.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import lombok.Data;

import java.util.List;

@Entity
@Data
public class Product {

    public Product() {}

    public Product(String description, Double price, Integer stock, List<String> imageUrls, Double descuento, Category category) {
        this.description = description;
        this.price = price;
        this.stock = stock;
        this.imageUrls = imageUrls;
        this.descuento = descuento;
        this.active = true;
        this.category = category;
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column
    private String description;

    @Column
    private Double price;

    @Column
    private Integer stock;

    @Column
    private List<String> imageUrls;

    @Column
    private Double descuento;

    @Column
    private Boolean active=true;

    @ManyToOne
    @JoinColumn(name = "category_id", referencedColumnName = "id")
    @JsonBackReference
    private Category category;

    public List<String> getImageUrls() { return imageUrls; }
    public void setImageUrls(List<String> imageUrls) { this.imageUrls = imageUrls; }
}
