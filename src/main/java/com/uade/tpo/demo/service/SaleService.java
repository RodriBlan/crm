package com.uade.tpo.demo.service;

import java.util.List;

import com.uade.tpo.demo.entity.dto.SaleRequest;
import com.uade.tpo.demo.entity.dto.SaleResponse;
import com.uade.tpo.demo.entity.dto.SaleSummaryResponse;
import com.uade.tpo.demo.entity.SaleStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface SaleService {

    SaleResponse createSale(SaleRequest request);

    void deleteSale(Long saleId);

    List<SaleResponse> getAllSales();

    List<SaleResponse> getSalesByClient(Long clientId);

    SaleResponse getSaleById(Long saleId);

    SaleResponse updateSaleStatus(Long saleId, String status);

    Page<SaleResponse> getSalesPage(String search, SaleStatus status, Pageable pageable);

    SaleSummaryResponse getSummary();
}
