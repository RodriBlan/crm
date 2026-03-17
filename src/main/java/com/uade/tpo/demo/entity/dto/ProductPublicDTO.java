package com.uade.tpo.demo.entity.dto;

import java.util.List;

public class ProductPublicDTO {
    private Long id;
    private String description;
    private Double price;
    private List<String> imageUrls;
    private Double descuento;
    private Long category;
    private Integer stock = null; // Siempre null para el público

    public ProductPublicDTO(Long id, String description, Double price, List<String> imageUrls, Double descuento, Long category) {
        this.id = id;
        this.description = description;
        this.price = price;
        this.imageUrls = imageUrls;
        this.descuento = descuento;
        this.category = category;
        this.stock = null;
    }

    // Getters y setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }
    public List<String> getImageUrls() { return imageUrls; }
    public void setImageUrls(List<String> imageUrls) { this.imageUrls = imageUrls; }
    public Double getDescuento() { return descuento; }
    public void setDescuento(Double descuento) { this.descuento = descuento; }
    public Long getCategory() { return category; }
    public void setCategory(Long category) { this.category = category; }
    public Integer getStock() { return null; }
    public void setStock(Integer stock) { this.stock = null; }
}
