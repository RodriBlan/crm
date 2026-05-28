package com.uade.tpo.demo.service;

import com.uade.tpo.demo.entity.dto.CategoryRequest;
import com.uade.tpo.demo.entity.dto.CategoryResponse;

import java.util.List;

public interface CategoryService {
    CategoryResponse createCategory(CategoryRequest request);
    List<CategoryResponse> getAllCategories();
    CategoryResponse updateCategory(Long id, CategoryRequest request);
    void deleteCategory(Long id);
}