package com.uade.tpo.demo.controllers;

import java.net.URI;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import com.uade.tpo.demo.entity.dto.ProductRequest;
import com.uade.tpo.demo.entity.dto.ProductResponse;
import com.uade.tpo.demo.entity.dto.ProductUpdateRequest;
import com.uade.tpo.demo.exceptions.ProductDuplicateException;
import com.uade.tpo.demo.exceptions.ProductInexistentException;
import com.uade.tpo.demo.service.ProductService;

@RestController
@RequestMapping("/products")
public class ProductsController {

    @Autowired
    private ProductService productService;

    // GET /products
    @GetMapping
    public ResponseEntity<Page<ProductResponse>> getProducts(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size) {
        PageRequest pageRequest = (page != null && size != null)
                ? PageRequest.of(page, size)
                : PageRequest.of(0, Integer.MAX_VALUE);
        return ResponseEntity.ok(productService.getProducts(pageRequest));
    }

    // GET /products/{id}
    @GetMapping("/{productId}")
    public ResponseEntity<ProductResponse> getProductById(@PathVariable Long productId)
            throws ProductInexistentException {
        return ResponseEntity.ok(
                productService.getProducts(PageRequest.of(0, Integer.MAX_VALUE))
                        .stream()
                        .filter(p -> p.getId().equals(productId))
                        .findFirst()
                        .orElseThrow(ProductInexistentException::new)
        );
    }

    // POST /products
    @PostMapping
    public ResponseEntity<ProductResponse> createProduct(@RequestBody @Valid ProductRequest request)
            throws ProductDuplicateException {
        ProductResponse created = productService.createProduct(request);
        return ResponseEntity.created(URI.create("/products/" + created.getId())).body(created);
    }

    // PATCH /products/{id}
    @PatchMapping("/{productId}")
    public ResponseEntity<ProductResponse> updateProduct(
            @PathVariable Long productId,
            @RequestBody @Valid ProductUpdateRequest request) throws ProductInexistentException {
        return ResponseEntity.ok(productService.updateProduct(productId, request));
    }

    // DELETE /products/{id}
    @DeleteMapping("/{productId}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long productId)
            throws ProductInexistentException {
        productService.deleteProduct(productId);
        return ResponseEntity.noContent().build();
    }

    // GET /products/search?description=xxx
    @GetMapping("/search")
    public ResponseEntity<Page<ProductResponse>> getProductByDescription(
            @RequestParam String description,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size) {
        PageRequest pageRequest = (page != null && size != null)
                ? PageRequest.of(page, size)
                : PageRequest.of(0, Integer.MAX_VALUE);
        return ResponseEntity.ok(productService.getProductByDescription(description, pageRequest));
    }

    // GET /products/category/{categoryId}
    @GetMapping("/category/{categoryId}")
    public ResponseEntity<Page<ProductResponse>> getProductsByCategory(
            @PathVariable Long categoryId,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size) {
        PageRequest pageRequest = (page != null && size != null)
                ? PageRequest.of(page, size)
                : PageRequest.of(0, Integer.MAX_VALUE);
        return ResponseEntity.ok(productService.getProductsByCategory(categoryId, pageRequest));
    }

    // GET /products/price?minPrice=xx&maxPrice=xx
    @GetMapping("/price")
    public ResponseEntity<Page<ProductResponse>> getProductsByPrice(
            @RequestParam Double minPrice,
            @RequestParam Double maxPrice,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size) {
        PageRequest pageRequest = (page != null && size != null)
                ? PageRequest.of(page, size)
                : PageRequest.of(0, Integer.MAX_VALUE);
        return ResponseEntity.ok(productService.getProductsByPrice(minPrice, maxPrice, pageRequest));
    }

    // GET /products/discounted
    @GetMapping("/discounted")
    public ResponseEntity<Page<ProductResponse>> getDiscountedProducts(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size) {
        PageRequest pageRequest = (page != null && size != null)
                ? PageRequest.of(page, size)
                : PageRequest.of(0, Integer.MAX_VALUE);
        return ResponseEntity.ok(productService.getProductByDiscount(pageRequest));
    }
}
