package com.uade.tpo.demo.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import com.uade.tpo.demo.entity.dto.StatsResponse;
import com.uade.tpo.demo.entity.dto.StatsResponse.TopClientDTO;
import com.uade.tpo.demo.entity.dto.StatsResponse.TopProductDTO;
import com.uade.tpo.demo.repository.SaleRepository;

@Service
public class StatsServiceImpl implements StatsService {

    @Autowired
    private SaleRepository saleRepository;

    @Override
    @Cacheable(cacheNames = "stats", key = "'dashboard'", sync = true)
    public StatsResponse getStats() {
        StatsResponse stats = new StatsResponse();

        // Totales generales
        stats.setTotalSales((long) saleRepository.count());
        stats.setTotalRevenue(saleRepository.getTotalRevenue());

        // Mes actual
        stats.setSalesThisMonth(saleRepository.countSalesThisMonth());
        stats.setRevenueThisMonth(saleRepository.getRevenueThisMonth());

        // Top 5 productos
        var topProducts = saleRepository.findTopProducts(PageRequest.of(0, 5)).stream()
                .map(row -> {
                    TopProductDTO dto = new TopProductDTO();
                    dto.setProductId(((Number) row[0]).longValue());
                    dto.setProductName((String) row[1]);
                    dto.setTotalQuantitySold(((Number) row[2]).longValue());
                    dto.setTotalRevenue(((Number) row[3]).doubleValue());
                    return dto;
                })
                .toList();
        stats.setTopProducts(topProducts);

        // Top 5 clientes
        var topClients = saleRepository.findTopClients(PageRequest.of(0, 5)).stream()
                .map(row -> {
                    TopClientDTO dto = new TopClientDTO();
                    dto.setClientId(((Number) row[0]).longValue());
                    dto.setClientName((String) row[1]);
                    dto.setTotalPurchases(((Number) row[2]).longValue());
                    dto.setTotalSpent(((Number) row[3]).doubleValue());
                    return dto;
                })
                .toList();
        stats.setTopClients(topClients);

        return stats;
    }
}
