package com.uade.tpo.demo.entity.dto;

import java.util.List;
import lombok.Data;

@Data
public class StatsResponse {

    // totales generales
    private Long totalSales;
    private Double totalRevenue;

    // ventas del mes actual
    private Long salesThisMonth;
    private Double revenueThisMonth;

    // top 5 productos más vendidos
    private List<TopProductDTO> topProducts;

    // top 5 clientes con más compras
    private List<TopClientDTO> topClients;

    @Data
    public static class TopProductDTO {
        private Long productId;
        private String productName;
        private Long totalQuantitySold;
        private Double totalRevenue;
    }

    @Data
    public static class TopClientDTO {
        private Long clientId;
        private String clientName;
        private Long totalPurchases;
        private Double totalSpent;
    }
}
