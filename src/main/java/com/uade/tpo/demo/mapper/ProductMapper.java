package com.uade.tpo.demo.mapper;

import org.springframework.stereotype.Component;

import com.uade.tpo.demo.entity.Product;
import com.uade.tpo.demo.entity.dto.ProductRequest;
import com.uade.tpo.demo.entity.dto.ProductResponse;
import com.uade.tpo.demo.entity.dto.ProductUpdateRequest;

@Component
public class ProductMapper {

    public Product toEntity(ProductRequest request) {
        Product p = new Product();
        p.setName(request.getName());
        p.setDescription(request.getDescription());
        p.setPrice(request.getPrice());
        p.setStock(request.getStock());
        p.setDescuento(request.getDescuento());
        // category se setea en el service (necesita buscarla por ID)
        return p;
    }

    public ProductResponse toResponse(Product product) {
        ProductResponse r = new ProductResponse();
        r.setId(product.getId());
        r.setName(product.getName());
        r.setDescription(product.getDescription());
        r.setPrice(product.getPrice());
        r.setStock(product.getStock());
        r.setDescuento(product.getDescuento());
        r.setActive(product.getActive());
        if (product.getCategory() != null) {
            r.setCategoryId(product.getCategory().getId());
            r.setCategoryDescription(product.getCategory().getDescription());
        }
        return r;
    }

    public void updateEntity(Product product, ProductUpdateRequest request) {
        if (request.getName() != null)        product.setName(request.getName());
        if (request.getDescription() != null) product.setDescription(request.getDescription());
        if (request.getPrice() != null)       product.setPrice(request.getPrice());
        if (request.getStock() != null)       product.setStock(request.getStock());
        if (request.getDescuento() != null)   product.setDescuento(request.getDescuento());
        // category se actualiza en el service si viene categoryId
    }
}
