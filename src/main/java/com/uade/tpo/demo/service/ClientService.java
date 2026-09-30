package com.uade.tpo.demo.service;

import java.util.List;

import com.uade.tpo.demo.entity.dto.ClientRequest;
import com.uade.tpo.demo.entity.dto.ClientResponse;
import com.uade.tpo.demo.entity.dto.ClientSummaryResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ClientService {

    ClientResponse createClient(ClientRequest request);

    List<ClientResponse> getClientByName(String name);

    ClientResponse getClientByPhone(String phone);

    ClientResponse updateClient(Long id, ClientRequest request);

    ClientResponse updateStatus(Long id, boolean active);  // ← NUEVO

    void deleteClient(Long id);

    List<ClientResponse> getAllClients();

    List<ClientResponse> getActiveClients();

    Page<ClientResponse> getClientsPage(String search, Pageable pageable);

    ClientSummaryResponse getSummary();
}
