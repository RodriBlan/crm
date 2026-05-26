package com.uade.tpo.demo.mapper;

import org.springframework.stereotype.Component;

import com.uade.tpo.demo.entity.Client;
import com.uade.tpo.demo.entity.dto.ClientRequest;
import com.uade.tpo.demo.entity.dto.ClientResponse;

@Component
public class ClientMapper {

    public static Client toEntity(ClientRequest dto) {
        Client client = new Client();
        client.setName(dto.getName());
        client.setPhone(dto.getPhone());
        client.setEmail(dto.getEmail());        // ← AGREGADO
        client.setSource(dto.getSource());
        client.setNotes(dto.getNotes());
        return client;
    }

    public static ClientResponse toResponse(Client client) {
        ClientResponse dto = new ClientResponse();
        dto.setId(client.getId());
        dto.setName(client.getName());
        dto.setPhone(client.getPhone());
        dto.setEmail(client.getEmail());        // ← AGREGADO
        dto.setRegistrationDate(client.getRegistrationDate());
        dto.setActive(client.isActive());
        dto.setSource(client.getSource());
        dto.setNotes(client.getNotes());
        return dto;
    }
}