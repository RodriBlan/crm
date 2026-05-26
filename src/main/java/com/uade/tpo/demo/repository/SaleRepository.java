package com.uade.tpo.demo.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.uade.tpo.demo.entity.Sale;

@Repository
public interface SaleRepository extends JpaRepository<Sale, Long> {

    // Historial de compras de un cliente
    List<Sale> findByClientIdOrderByDateDesc(Long clientId);

    // Ventas en un rango de fechas
    List<Sale> findByDateBetween(LocalDateTime from, LocalDateTime to);

    // Ventas del mes actual
    @Query("SELECT s FROM Sale s WHERE MONTH(s.date) = MONTH(CURRENT_DATE) AND YEAR(s.date) = YEAR(CURRENT_DATE)")
    List<Sale> findSalesThisMonth();

    // Total recaudado
    @Query("SELECT COALESCE(SUM(s.total), 0) FROM Sale s WHERE s.status = 'COMPLETED'")
    Double getTotalRevenue();

    // Total recaudado este mes
    @Query("SELECT COALESCE(SUM(s.total), 0) FROM Sale s WHERE s.status = 'COMPLETED' " +
           "AND MONTH(s.date) = MONTH(CURRENT_DATE) AND YEAR(s.date) = YEAR(CURRENT_DATE)")
    Double getRevenueThisMonth();

    // Top productos más vendidos (productId, productName, totalQty, totalRevenue)
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

