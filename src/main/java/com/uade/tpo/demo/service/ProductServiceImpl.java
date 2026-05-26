package com.uade.tpo.demo.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.uade.tpo.demo.entity.Category;
import com.uade.tpo.demo.entity.Product;
import com.uade.tpo.demo.entity.dto.ProductRequest;
import com.uade.tpo.demo.entity.dto.ProductResponse;
import com.uade.tpo.demo.entity.dto.ProductUpdateRequest;
import com.uade.tpo.demo.exceptions.ProductDuplicateException;
import com.uade.tpo.demo.exceptions.ProductInexistentException;
import com.uade.tpo.demo.mapper.ProductMapper;
import com.uade.tpo.demo.repository.CategoryRepository;
import com.uade.tpo.demo.repository.ProductRepository;

@Service
public class ProductServiceImpl implements ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ProductMapper productMapper;

    // ─────────────── CREATE ───────────────
    @Override
    public ProductResponse createProduct(ProductRequest request) throws ProductDuplicateException {
        // Validar duplicado por nombre
        Page<Product> existing = productRepository.findByDescription(request.getName(), PageRequest.of(0, 1));
        if (!existing.isEmpty()) {
            throw new ProductDuplicateException();
        }

        Product product = productMapper.toEntity(request);

        // Asignar categoría si viene el ID
        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Categoría no encontrada con ID: " + request.getCategoryId()));
            product.setCategory(category);
        }

        Product saved = productRepository.save(product);
        return productMapper.toResponse(saved);
    }

    // ─────────────── UPDATE ───────────────
    @Override
    public ProductResponse updateProduct(Long productId, ProductUpdateRequest request) throws ProductInexistentException {
        Product product = productRepository.findById(productId)
                .orElseThrow(ProductInexistentException::new);

        productMapper.updateEntity(product, request);

        // Actualizar categoría si viene
        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Categoría no encontrada con ID: " + request.getCategoryId()));
            product.setCategory(category);
        }

        Product updated = productRepository.save(product);
        return productMapper.toResponse(updated);
    }

    // ─────────────── DELETE ───────────────
    @Override
    public void deleteProduct(Long productId) throws ProductInexistentException {
        if (!productRepository.existsById(productId)) {
            throw new ProductInexistentException();
        }
        productRepository.deleteById(productId);
    }

    // ─────────────── GET ALL ───────────────
    @Override
    public Page<ProductResponse> getProducts(Pageable pageable) {
        return productRepository.findAll(pageable).map(productMapper::toResponse);
    }

    // ─────────────── GET BY DESCRIPTION ───────────────
    @Override
    public Page<ProductResponse> getProductByDescription(String description, Pageable pageable) {
        return productRepository.findByDescription(description, pageable).map(productMapper::toResponse);
    }

    // ─────────────── GET BY CATEGORY ───────────────
    @Override
    public Page<ProductResponse> getProductsByCategory(Long categoryId, Pageable pageable) {
        return productRepository.findByCategoryId(categoryId, pageable).map(productMapper::toResponse);
    }

    // ─────────────── GET BY PRICE RANGE ───────────────
    @Override
    public Page<ProductResponse> getProductsByPrice(Double minPrice, Double maxPrice, Pageable pageable) {
        return productRepository.findByPriceBetween(minPrice, maxPrice, pageable).map(productMapper::toResponse);
    }

    // ─────────────── GET WITH DISCOUNT ───────────────
    @Override
    public Page<ProductResponse> getProductByDiscount(Pageable pageable) {
        return productRepository.findByDiscount(pageable).map(productMapper::toResponse);
    }
}
