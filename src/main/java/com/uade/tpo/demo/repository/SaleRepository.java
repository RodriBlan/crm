package com.uade.tpo.demo.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.uade.tpo.demo.entity.Sale;

@Repository
public interface SaleRepository extends JpaRepository<Sale, Long> {

    // Historial de compras de un cliente
    List<Sale> findByClientIdOrderByDateDesc(Long clientId);

    // Ventas en un rango de fechas
    List<Sale> findByDateBetween(LocalDateTime from, LocalDateTime to);

    // El rango permite que PostgreSQL use el indice de sales.date.
    @Query(value = "SELECT s.* FROM sales s " +
            "WHERE s.date >= date_trunc('month', CURRENT_DATE) " +
            "AND s.date < date_trunc('month', CURRENT_DATE) + INTERVAL '1 month'",
            nativeQuery = true)
    List<Sale> findSalesThisMonth();

    // Total recaudado
    @Query("SELECT COALESCE(SUM(s.total), 0) FROM Sale s WHERE s.status = 'COMPLETED'")
    Double getTotalRevenue();

    // El mismo rango aprovecha el indice parcial de ventas completadas.
    @Query(value = "SELECT COALESCE(SUM(s.total), 0) FROM sales s " +
            "WHERE s.status = 'COMPLETED' " +
            "AND s.date >= date_trunc('month', CURRENT_DATE) " +
            "AND s.date < date_trunc('month', CURRENT_DATE) + INTERVAL '1 month'",
            nativeQuery = true)
    Double getRevenueThisMonth();

    // Top productos más vendidos
    @Query("SELECT si.product.id, si.product.name, SUM(si.quantity), SUM(si.quantity * si.unitPrice) " +
           "FROM SaleItem si WHERE si.sale.status = 'COMPLETED' " +
           "GROUP BY si.product.id, si.product.name ORDER BY SUM(si.quantity) DESC")
    List<Object[]> findTopProducts();

    // Top clientes por cantidad de compras
    @Query("SELECT s.client.id, s.client.name, COUNT(s), SUM(s.total) " +
           "FROM Sale s WHERE s.status = 'COMPLETED' " +
           "GROUP BY s.client.id, s.client.name ORDER BY COUNT(s) DESC")
    List<Object[]> findTopClients();
}
