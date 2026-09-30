package com.uade.tpo.demo.service;

import com.uade.tpo.demo.entity.Category;
import com.uade.tpo.demo.entity.dto.CategoryRequest;
import com.uade.tpo.demo.entity.dto.CategoryResponse;
import com.uade.tpo.demo.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;

    @Override
    @Caching(evict = {
            @CacheEvict(cacheNames = "categories", allEntries = true),
            @CacheEvict(cacheNames = "products", allEntries = true)
    })
    public CategoryResponse createCategory(CategoryRequest request) {
        if (categoryRepository.existsByDescription(request.getDescription())) {
            throw new RuntimeException("Ya existe una categoría con ese nombre.");
        }
        Category category = new Category();
        category.setDescription(request.getDescription());
        return toResponse(categoryRepository.save(category));
    }

    @Override
    @Cacheable(cacheNames = "categories", key = "'all'", sync = true)
    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Caching(evict = {
            @CacheEvict(cacheNames = "categories", allEntries = true),
            @CacheEvict(cacheNames = "products", allEntries = true)
    })
    public CategoryResponse updateCategory(Long id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada con ID: " + id));
        category.setDescription(request.getDescription());
        return toResponse(categoryRepository.save(category));
    }

    @Override
    @Caching(evict = {
            @CacheEvict(cacheNames = "categories", allEntries = true),
            @CacheEvict(cacheNames = "products", allEntries = true)
    })
    public void deleteCategory(Long id) {
        if (!categoryRepository.existsById(id)) {
            throw new RuntimeException("Categoría no encontrada con ID: " + id);
        }
        categoryRepository.deleteById(id);
    }

    private CategoryResponse toResponse(Category category) {
        CategoryResponse r = new CategoryResponse();
        r.setId(category.getId());
        r.setDescription(category.getDescription());
        return r;
    }
}
