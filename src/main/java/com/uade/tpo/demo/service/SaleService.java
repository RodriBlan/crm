package com.uade.tpo.demo.service;

import java.util.List;

import com.uade.tpo.demo.entity.dto.SaleRequest;
import com.uade.tpo.demo.entity.dto.SaleResponse;

public interface SaleService {

    SaleResponse createSale(SaleRequest request);

    void deleteSale(Long saleId);

    List<SaleResponse> getAllSales();

    List<SaleResponse> getSalesByClient(Long clientId);

    SaleResponse getSaleById(Long saleId);

    SaleResponse updateSaleStatus(Long saleId, String status);
}
