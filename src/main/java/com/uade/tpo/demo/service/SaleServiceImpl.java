package com.uade.tpo.demo.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.uade.tpo.demo.entity.Client;
import com.uade.tpo.demo.entity.Product;
import com.uade.tpo.demo.entity.Sale;
import com.uade.tpo.demo.entity.SaleItem;
import com.uade.tpo.demo.entity.SaleStatus;
import com.uade.tpo.demo.entity.dto.SaleItemRequest;
import com.uade.tpo.demo.entity.dto.SaleRequest;
import com.uade.tpo.demo.entity.dto.SaleResponse;
import com.uade.tpo.demo.mapper.SaleMapper;
import com.uade.tpo.demo.repository.ClientRepository;
import com.uade.tpo.demo.repository.ProductRepository;
import com.uade.tpo.demo.repository.SaleRepository;

@Service
public class SaleServiceImpl implements SaleService {

    @Autowired
    private SaleRepository saleRepository;

    @Autowired
    private ClientRepository clientRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private SaleMapper saleMapper;

    // ─────────────── CREATE ───────────────
    @Override
    @Transactional
    public SaleResponse createSale(SaleRequest request) {

        // 1. Buscar cliente
        Client client = clientRepository.findById(request.getClientId())
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado con ID: " + request.getClientId()));

        // 2. Construir venta
        Sale sale = new Sale();
        sale.setClient(client);
        sale.setDate(LocalDateTime.now());
        sale.setStatus(SaleStatus.COMPLETED);
        sale.setNotes(request.getNotes());

        // 3. Construir items y calcular total
        List<SaleItem> items = new ArrayList<>();
        double total = 0.0;

        for (SaleItemRequest itemReq : request.getItems()) {
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new RuntimeException("Producto no encontrado con ID: " + itemReq.getProductId()));

            // Validar stock
            if (product.getStock() < itemReq.getQuantity()) {
                throw new RuntimeException("Stock insuficiente para el producto: " + product.getName());
            }

            // Descontar stock
            product.setStock(product.getStock() - itemReq.getQuantity());
            productRepository.save(product);

            // Crear item
            SaleItem item = new SaleItem();
            item.setProduct(product);
            item.setQuantity(itemReq.getQuantity());
            item.setUnitPrice(product.getPrice());  // snapshot del precio actual
            item.setSale(sale);

            items.add(item);
            total += item.getQuantity() * item.getUnitPrice();
        }

        sale.setItems(items);
        sale.setTotal(total);

        Sale saved = saleRepository.save(sale);
        return saleMapper.toResponse(saved);
    }

    // ─────────────── DELETE ───────────────
    @Override
    @Transactional
    public void deleteSale(Long saleId) {
        Sale sale = saleRepository.findById(saleId)
                .orElseThrow(() -> new RuntimeException("Venta no encontrada con ID: " + saleId));

        // Devolver stock al eliminar la venta
        if (sale.getStatus() == SaleStatus.COMPLETED) {
            for (SaleItem item : sale.getItems()) {
                Product product = item.getProduct();
                product.setStock(product.getStock() + item.getQuantity());
                productRepository.save(product);
            }
        }

        saleRepository.deleteById(saleId);
    }

    // ─────────────── GET ALL ───────────────
    @Override
    public List<SaleResponse> getAllSales() {
        return saleRepository.findAll().stream()
                .map(saleMapper::toResponse)
                .toList();
    }

    // ─────────────── GET BY CLIENT ───────────────
    @Override
    public List<SaleResponse> getSalesByClient(Long clientId) {
        return saleRepository.findByClientIdOrderByDateDesc(clientId).stream()
                .map(saleMapper::toResponse)
                .toList();
    }

    // ─────────────── GET BY ID ───────────────
    @Override
    public SaleResponse getSaleById(Long saleId) {
        Sale sale = saleRepository.findById(saleId)
                .orElseThrow(() -> new RuntimeException("Venta no encontrada con ID: " + saleId));
        return saleMapper.toResponse(sale);
    }

    // ─────────────── UPDATE STATUS ───────────────
    @Override
    @Transactional
    public SaleResponse updateSaleStatus(Long saleId, String status) {
        Sale sale = saleRepository.findById(saleId)
                .orElseThrow(() -> new RuntimeException("Venta no encontrada con ID: " + saleId));

        SaleStatus newStatus;
        try {
            newStatus = SaleStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Estado inválido: " + status + ". Valores válidos: PENDING, COMPLETED, CANCELLED");
        }

        // Si se cancela una venta completada, devolver stock
        if (newStatus == SaleStatus.CANCELLED && sale.getStatus() == SaleStatus.COMPLETED) {
            for (SaleItem item : sale.getItems()) {
                Product product = item.getProduct();
                product.setStock(product.getStock() + item.getQuantity());
                productRepository.save(product);
            }
        }

        sale.setStatus(newStatus);
        Sale updated = saleRepository.save(sale);
        return saleMapper.toResponse(updated);
    }
}
