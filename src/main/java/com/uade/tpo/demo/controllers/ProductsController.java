package com.uade.tpo.demo.controllers;

import java.net.URI;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.uade.tpo.demo.entity.Category;
import com.uade.tpo.demo.entity.Product;
import com.uade.tpo.demo.entity.dto.ProductPublicDTO;
import com.uade.tpo.demo.entity.dto.ProductRequest;
import com.uade.tpo.demo.entity.dto.ProductUpdateRequest;
import com.uade.tpo.demo.exceptions.CategoryInexistentException;
import com.uade.tpo.demo.exceptions.ProductDuplicateException;
import com.uade.tpo.demo.exceptions.ProductInexistentException;
import com.uade.tpo.demo.service.CategoryService;
import com.uade.tpo.demo.service.ProductService;

import io.micrometer.core.ipc.http.HttpSender.Response;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;


@RestController
@RequestMapping("products")
public class ProductsController {

    @Autowired
    private ProductService productService;




    

    @GetMapping
    public ResponseEntity<Page<Product>> getProducts( //chequeado
        //return ResponseEntity.ok(categoryService.getCategories());
        @RequestParam(required = false) Integer page,
        @RequestParam(required = false) Integer size){
            if (page == null || size == null) 
                return ResponseEntity.ok(productService.getProducts(PageRequest.of(0,Integer.MAX_VALUE)));
           
                // Implement pagination logic here if needed
                return ResponseEntity.ok(productService.getProducts(PageRequest.of(page, size)));
        }
    


    @DeleteMapping("/{productId}")
    public ResponseEntity<Product> deleteProduct(@PathVariable Long productId) { //chequeado
        productService.deleteProduct(productId);
        return ResponseEntity.noContent().build();

}

@PostMapping
public ResponseEntity<Object> createProduct(@RequestBody ProductRequest productRequest)//chequeado
    throws ProductDuplicateException {
    Product product = productService.createProduct(
        productRequest.getDescription(),
        productRequest.getPrice(),
        productRequest.getStock(),
        productRequest.getImageUrls(),
        productRequest.getDescuento(),
        productRequest.getCategory()
    );
    return ResponseEntity.created(URI.create("/products/" + product.getId())).body(product);


}

@PatchMapping("/{productId}")
public ResponseEntity<Product> updateProduct(  //chequeado
        @PathVariable Long productId,
        @RequestBody ProductUpdateRequest request) throws ProductInexistentException {
    
    Product updatedProduct = productService.updateProduct(productId, request);
    return ResponseEntity.ok(updatedProduct);
}

@GetMapping("/discounted")
public ResponseEntity<Page<Product>> getDiscountedProducts() { //chequeado
    Page<Product> products = productService.getProductByDiscount();
    return ResponseEntity.ok(products);
}

@GetMapping("/{productId}")
public ResponseEntity<Product> getProductById(@PathVariable Long productId) { //chequeado
    return productService.getProductById(productId)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
}

@GetMapping("/search")
public ResponseEntity<Page<Product>> getProductByDescription( //chequeado
        @RequestParam String description,               // texto a buscar
        @RequestParam(required = false) Integer page,   // opcional
        @RequestParam(required = false) Integer size) { // opcional

    PageRequest pageRequest = (page != null && size != null)
            ? PageRequest.of(page, size)
            : PageRequest.of(0, Integer.MAX_VALUE);   // por defecto trae todos

    Page<Product> products = productService.getProductByDescription(description, pageRequest);
    return ResponseEntity.ok(products);
}
@GetMapping("/{productId}/image_description")
@PreAuthorize("isAuthenticated()")
public ResponseEntity<?> getProductDescriptionAndImageUrl(@PathVariable Long productId) {
    return productService.getProductById(productId)
            .map(product -> {
                java.util.Map<String, Object> result = new java.util.HashMap<>();
                result.put("description", product.getDescription());
                result.put("imageUrl", product.getImageUrls());
                return ResponseEntity.ok().body(result);
            })
            .orElse(ResponseEntity.notFound().build());
}

@GetMapping("/user")
public ResponseEntity<Page<ProductPublicDTO>> getProductsPublic(
    @RequestParam(required = false) Integer page,
    @RequestParam(required = false) Integer size) {
    Page<Product> products = (page == null || size == null)
        ? productService.getProducts(PageRequest.of(0, Integer.MAX_VALUE))
        : productService.getProducts(PageRequest.of(page, size));
    Page<ProductPublicDTO> publicProducts = products.map(product -> new ProductPublicDTO(
        product.getId(),
        product.getDescription(),
        product.getPrice(),
        product.getImageUrls(),
        product.getDescuento(),
        product.getCategory() != null ? product.getCategory().getId() : null
    ));
    return ResponseEntity.ok(publicProducts);
}

@GetMapping("/category/{categoryId}")
public ResponseEntity<Page<Product>> getProductsByCategory(
        @PathVariable Long categoryId,
        @RequestParam(required = false) Integer page,
        @RequestParam(required = false) Integer size) throws CategoryInexistentException {
    PageRequest pageRequest = (page != null && size != null)
            ? PageRequest.of(page, size)
            : PageRequest.of(0, Integer.MAX_VALUE);
    Page<Product> products = productService.getProductsByCategory(categoryId, pageRequest);
    return ResponseEntity.ok(products);
}

@GetMapping("/price")
public ResponseEntity<Page<Product>> getProductsByPrice(
        @RequestParam Double minPrice,
        @RequestParam Double maxPrice,
        @RequestParam(required = false) Integer page,
        @RequestParam(required = false) Integer size) {
    PageRequest pageRequest = (page != null && size != null)
            ? PageRequest.of(page, size)
            : PageRequest.of(0, Integer.MAX_VALUE);
    Page<Product> products = productService.getProductsByPrice(minPrice, maxPrice);
    return ResponseEntity.ok(products);
}





}

