package com.uade.tpo.demo.controllers;

import java.net.URI;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import com.uade.tpo.demo.entity.dto.ProductRequest;
import com.uade.tpo.demo.entity.dto.ProductResponse;
import com.uade.tpo.demo.entity.dto.ProductUpdateRequest;
import com.uade.tpo.demo.exceptions.ProductDuplicateException;
import com.uade.tpo.demo.exceptions.ProductInexistentException;
import com.uade.tpo.demo.service.ProductService;

@RestController
@RequestMapping("/products")
@Validated
public class ProductsController {

    @Autowired
    private ProductService productService;

    // GET /products
    @GetMapping
    public ResponseEntity<Page<ProductResponse>> getProducts(
            @RequestParam(required = false) @Min(0) Integer page,
            @RequestParam(required = false) @Min(1) @Max(200) Integer size) {
        PageRequest pageRequest = (page != null && size != null)
                ? PageRequest.of(page, size)
                : PageRequest.of(0, Integer.MAX_VALUE);
        return ResponseEntity.ok(productService.getProducts(pageRequest));
    }

    // GET /products/{id}
    @GetMapping("/{productId}")
    public ResponseEntity<ProductResponse> getProductById(@PathVariable @Positive Long productId)
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
            @PathVariable @Positive Long productId,
            @RequestBody @Valid ProductUpdateRequest request) throws ProductInexistentException {
        return ResponseEntity.ok(productService.updateProduct(productId, request));
    }

    // DELETE /products/{id}
    @DeleteMapping("/{productId}")
    public ResponseEntity<Void> deleteProduct(@PathVariable @Positive Long productId)
            throws ProductInexistentException {
        productService.deleteProduct(productId);
        return ResponseEntity.noContent().build();
    }

    // GET /products/search?description=xxx
    @GetMapping("/search")
    public ResponseEntity<Page<ProductResponse>> getProductByDescription(
            @RequestParam @NotBlank @Size(max = 120) String description,
            @RequestParam(required = false) @Min(0) Integer page,
            @RequestParam(required = false) @Min(1) @Max(200) Integer size) {
        PageRequest pageRequest = (page != null && size != null)
                ? PageRequest.of(page, size)
                : PageRequest.of(0, Integer.MAX_VALUE);
        return ResponseEntity.ok(productService.getProductByDescription(description, pageRequest));
    }

    // GET /products/category/{categoryId}
    @GetMapping("/category/{categoryId}")
    public ResponseEntity<Page<ProductResponse>> getProductsByCategory(
            @PathVariable @Positive Long categoryId,
            @RequestParam(required = false) @Min(0) Integer page,
            @RequestParam(required = false) @Min(1) @Max(200) Integer size) {
        PageRequest pageRequest = (page != null && size != null)
                ? PageRequest.of(page, size)
                : PageRequest.of(0, Integer.MAX_VALUE);
        return ResponseEntity.ok(productService.getProductsByCategory(categoryId, pageRequest));
    }

    // GET /products/price?minPrice=xx&maxPrice=xx
    @GetMapping("/price")
    public ResponseEntity<Page<ProductResponse>> getProductsByPrice(
            @RequestParam @PositiveOrZero Double minPrice,
            @RequestParam @PositiveOrZero Double maxPrice,
            @RequestParam(required = false) @Min(0) Integer page,
            @RequestParam(required = false) @Min(1) @Max(200) Integer size) {
        PageRequest pageRequest = (page != null && size != null)
                ? PageRequest.of(page, size)
                : PageRequest.of(0, Integer.MAX_VALUE);
        return ResponseEntity.ok(productService.getProductsByPrice(minPrice, maxPrice, pageRequest));
    }

    // GET /products/discounted
    @GetMapping("/discounted")
    public ResponseEntity<Page<ProductResponse>> getDiscountedProducts(
            @RequestParam(required = false) @Min(0) Integer page,
            @RequestParam(required = false) @Min(1) @Max(200) Integer size) {
        PageRequest pageRequest = (page != null && size != null)
                ? PageRequest.of(page, size)
                : PageRequest.of(0, Integer.MAX_VALUE);
        return ResponseEntity.ok(productService.getProductByDiscount(pageRequest));
    }
}
