package com.uade.tpo.demo.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
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
        List<?> salesThisMonth = saleRepository.findSalesThisMonth();
        stats.setSalesThisMonth((long) salesThisMonth.size());
        stats.setRevenueThisMonth(saleRepository.getRevenueThisMonth());

        // Top 5 productos
        List<Object[]> topProductsRaw = saleRepository.findTopProducts();
        List<TopProductDTO> topProducts = topProductsRaw.stream()
                .limit(5)
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
        List<Object[]> topClientsRaw = saleRepository.findTopClients();
        List<TopClientDTO> topClients = topClientsRaw.stream()
                .limit(5)
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
