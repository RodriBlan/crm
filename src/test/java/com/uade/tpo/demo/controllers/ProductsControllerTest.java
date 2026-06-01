package com.uade.tpo.demo.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.uade.tpo.demo.entity.dto.ProductRequest;
import com.uade.tpo.demo.entity.dto.ProductResponse;
import com.uade.tpo.demo.service.ProductService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ProductsController.class)
class ProductsControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ProductService productService;

    @Test
    void createProduct_returnsCreatedProduct() throws Exception {
        ProductRequest request = new ProductRequest();
        request.setName("Test Product");
        request.setDescription("Producto de prueba");
        request.setPrice(99.99);
        request.setStock(10);
        request.setDescuento(0.0);
        request.setCategoryId(1L);

        ProductResponse response = new ProductResponse();
        response.setId(100L);
        response.setName(request.getName());
        response.setDescription(request.getDescription());
        response.setPrice(request.getPrice());
        response.setStock(request.getStock());
        response.setDescuento(request.getDescuento());
        response.setCategoryId(request.getCategoryId());
        response.setActive(true);

        when(productService.createProduct(any(ProductRequest.class))).thenReturn(response);

        mockMvc.perform(post("/products")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(100))
                .andExpect(jsonPath("$.name").value("Test Product"))
                .andExpect(jsonPath("$.categoryId").value(1));
    }

    @Test
    void createProduct_withInvalidRequest_returnsBadRequest() throws Exception {
        ProductRequest request = new ProductRequest();
        request.setName("Invalid Product");
        request.setDescription("No cumple validación");
        request.setPrice(-10.0);
        request.setStock(-5);
        request.setDescuento(-1.0);
        // No categoryId para probar @NotNull

        mockMvc.perform(post("/products")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.price").value("El precio no puede ser negativo"))
                .andExpect(jsonPath("$.stock").value("El stock no puede ser negativo"));
    }
}
