package com.uade.tpo.demo.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.uade.tpo.demo.entity.dto.ProductRequest;
import com.uade.tpo.demo.entity.dto.ProductResponse;
import com.uade.tpo.demo.entity.dto.ProductUpdateRequest;
import com.uade.tpo.demo.exceptions.ProductDuplicateException;
import com.uade.tpo.demo.exceptions.ProductInexistentException;

public interface ProductService {

    ProductResponse createProduct(ProductRequest request) throws ProductDuplicateException;

    ProductResponse updateProduct(Long productId, ProductUpdateRequest request) throws ProductInexistentException;

    void deleteProduct(Long productId) throws ProductInexistentException;

    Page<ProductResponse> getProducts(Pageable pageable);

    Page<ProductResponse> getProductByDescription(String description, Pageable pageable);

    Page<ProductResponse> getProductsByCategory(Long categoryId, Pageable pageable);

    Page<ProductResponse> getProductsByPrice(Double minPrice, Double maxPrice, Pageable pageable);

    Page<ProductResponse> getProductByDiscount(Pageable pageable);
}
