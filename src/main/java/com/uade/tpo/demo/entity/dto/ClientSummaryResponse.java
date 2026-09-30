package com.uade.tpo.demo.entity.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ClientSummaryResponse {
    private long total;
    private long active;
    private long inactive;
}
