package com.uade.tpo.demo.service;

import java.util.Optional;
import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

import com.uade.tpo.demo.entity.Category;

import com.uade.tpo.demo.entity.Product;
import com.uade.tpo.demo.entity.dto.ProductUpdateRequest;
import com.uade.tpo.demo.exceptions.CategoryInexistentException;
import com.uade.tpo.demo.exceptions.ProductDuplicateException;
import com.uade.tpo.demo.exceptions.ProductInexistentException;

public interface ProductService {

    public Product createProduct(String description, Double price, Integer stock, List<String> imageUrls, Double descuento, Category category) throws ProductDuplicateException;
    public Product updateProduct(Long productId, ProductUpdateRequest request)throws ProductInexistentException;
    public void deleteProduct(Long productId);
    public Page<Product> getProducts(PageRequest pageRequest);
    public Page<Product> getProductsByCategory(Long categoryId, Pageable pageable) throws CategoryInexistentException;
    public Page<Product> getProductsByPrice(Double minPrice, Double maxPrice);
    //por descuento?
    public Page<Product> getProductByDescription(String description, Pageable pageable);
    public Optional<Product> getProductById(Long id);
    public Page <Product> getProductByDiscount();
    
}
