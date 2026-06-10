package com.uade.tpo.demo.controllers;

import java.net.URI;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import com.uade.tpo.demo.entity.dto.SaleRequest;
import com.uade.tpo.demo.entity.dto.SaleResponse;
import com.uade.tpo.demo.service.SaleService;

@RestController
@RequestMapping("/sales")
public class SaleController {

    @Autowired
    private SaleService saleService;

    // POST /sales
    @PostMapping
    public ResponseEntity<SaleResponse> createSale(@RequestBody @Valid SaleRequest request) {
        SaleResponse created = saleService.createSale(request);
        return ResponseEntity.created(URI.create("/sales/" + created.getId())).body(created);
    }

    // GET /sales
    @GetMapping
    public ResponseEntity<List<SaleResponse>> getAllSales() {
        return ResponseEntity.ok(saleService.getAllSales());
    }

    // GET /sales/{id}
    @GetMapping("/{saleId}")
    public ResponseEntity<SaleResponse> getSaleById(@PathVariable Long saleId) {
        return ResponseEntity.ok(saleService.getSaleById(saleId));
    }

    // GET /sales/client/{clientId}  → historial de compras del cliente
    @GetMapping("/client/{clientId}")
    public ResponseEntity<List<SaleResponse>> getSalesByClient(@PathVariable Long clientId) {
        return ResponseEntity.ok(saleService.getSalesByClient(clientId));
    }

    // PATCH /sales/{id}/status?status=CANCELLED
    @PatchMapping("/{saleId}/status")
    public ResponseEntity<SaleResponse> updateSaleStatus(
            @PathVariable Long saleId,
            @RequestParam String status) {
        return ResponseEntity.ok(saleService.updateSaleStatus(saleId, status));
    }

    // DELETE /sales/{id}
    @DeleteMapping("/{saleId}")
    public ResponseEntity<Void> deleteSale(@PathVariable Long saleId) {
        saleService.deleteSale(saleId);
        return ResponseEntity.noContent().build();
    }
}
