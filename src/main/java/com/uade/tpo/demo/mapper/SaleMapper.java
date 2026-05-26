package com.uade.tpo.demo.mapper;

import java.util.List;

import org.springframework.stereotype.Component;

import com.uade.tpo.demo.entity.Sale;
import com.uade.tpo.demo.entity.SaleItem;
import com.uade.tpo.demo.entity.dto.SaleItemResponse;
import com.uade.tpo.demo.entity.dto.SaleResponse;

@Component
public class SaleMapper {

    public SaleResponse toResponse(Sale sale) {
        SaleResponse r = new SaleResponse();
        r.setId(sale.getId());
        r.setDate(sale.getDate());
        r.setTotal(sale.getTotal());
        r.setStatus(sale.getStatus());
        r.setNotes(sale.getNotes());
        r.setClientId(sale.getClient().getId());
        r.setClientName(sale.getClient().getName());

        if (sale.getItems() != null) {
            List<SaleItemResponse> items = sale.getItems().stream()
                    .map(this::toItemResponse)
                    .toList();
            r.setItems(items);
        }
        return r;
    }

    public SaleItemResponse toItemResponse(SaleItem item) {
        SaleItemResponse r = new SaleItemResponse();
        r.setId(item.getId());
        r.setProductId(item.getProduct().getId());
        r.setProductName(item.getProduct().getName());
        r.setQuantity(item.getQuantity());
        r.setUnitPrice(item.getUnitPrice());
        r.setSubtotal(item.getQuantity() * item.getUnitPrice());
        return r;
    }
}
