package com.uade.tpo.demo.service;

import com.uade.tpo.demo.entity.Category;
import com.uade.tpo.demo.entity.Product;
import com.uade.tpo.demo.entity.dto.ProductUpdateRequest;

import com.uade.tpo.demo.exceptions.CategoryInexistentException;
import com.uade.tpo.demo.exceptions.ProductDuplicateException;
import com.uade.tpo.demo.exceptions.ProductInexistentException;
import com.uade.tpo.demo.repository.CategoryRepository;
import com.uade.tpo.demo.repository.ProductRepository;
import com.uade.tpo.demo.service.ProductService;
//import com.uade.tpo.demo.specifications.ProductSpecifications;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.stream.Collectors;


@Service
public class ProductServiceImpl implements ProductService {
    
    @Autowired
    private ProductRepository productRepository;
    @Autowired
    private CategoryRepository categoryRepository;

   @Override
public Product createProduct(String description, Double price, Integer stock, List<String> imageUrls, Double descuento, Category category) throws ProductDuplicateException {
        
  Page<Product> products = productRepository.findByDescription(description, PageRequest.of(0,1));
if (products.isEmpty()) {
    Product newProduct = new Product();
    newProduct.setDescription(description);
    newProduct.setPrice(price);
    newProduct.setStock(stock);
    newProduct.setImageUrls(imageUrls);
    newProduct.setDescuento(descuento);
    newProduct.setCategory(category);
    return productRepository.save(newProduct);
}
throw new ProductDuplicateException();
    }

@Override
public Product updateProduct(Long productId, ProductUpdateRequest request) throws ProductInexistentException {
    Product product = productRepository.findById(productId)
            .orElseThrow(ProductInexistentException::new); // lanza 404 si no existe

    // Solo actualizamos los campos que no sean nulos
    if (request.getDescription() != null) product.setDescription(request.getDescription());
    if (request.getPrice() != null) product.setPrice(request.getPrice());
    if (request.getStock() != null) product.setStock(request.getStock());
    if (request.getImageUrls() != null) product.setImageUrls(request.getImageUrls());
    if (request.getDescuento() != null) product.setDescuento(request.getDescuento());
    if (request.getCategory() != null) product.setCategory(request.getCategory());

    return productRepository.save(product);
}

    
    @Override
    public void deleteProduct(Long productId) {
        productRepository.deleteById(productId);
    }

    @Override
    public Page<Product> getProducts(PageRequest pageable) {
        return productRepository.findAll(pageable);
    }

  @Override
public Page<Product> getProductsByCategory(Long categoryId, Pageable pageable) throws CategoryInexistentException {
    if (!categoryRepository.existsById(categoryId)) {
        throw new CategoryInexistentException();
    }
    if (pageable == null) {
        pageable = PageRequest.of(0, Integer.MAX_VALUE);
    }
    return productRepository.findByCategoryId(categoryId, pageable);
}


   @Override
public Page<Product> getProductsByPrice(Double minPrice, Double maxPrice) {
    return productRepository.findProductByPrice(minPrice, maxPrice, PageRequest.of(0, Integer.MAX_VALUE));
}


    @Override
public Page<Product> getProductByDescription(String description, Pageable pageable) {
    return productRepository.findByDescription(description, pageable);
}


@Override
public Optional<Product> getProductById(Long id) {
    return productRepository.findById(id);
}


 @Override
public Page<Product> getProductByDiscount() {
    Pageable pageable = PageRequest.of(0, Integer.MAX_VALUE); // para traer todos
    return productRepository.findProductsWithDiscount(pageable);
}

    
    }




   
 

