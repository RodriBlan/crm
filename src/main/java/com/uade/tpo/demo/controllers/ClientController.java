package com.uade.tpo.demo.controllers;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import com.uade.tpo.demo.entity.dto.ClientRequest;
import com.uade.tpo.demo.entity.dto.ClientResponse;
import com.uade.tpo.demo.entity.dto.ClientSummaryResponse;
import com.uade.tpo.demo.service.ClientService;

@RestController
@RequestMapping("/clients")
@Validated
public class ClientController {

    private final ClientService clientService;

    public ClientController(ClientService clientService) {
        this.clientService = clientService;
    }

    // POST /clients
    @PostMapping
    public ResponseEntity<ClientResponse> createClient(@RequestBody @Valid ClientRequest request) {
        return ResponseEntity.ok(clientService.createClient(request));
    }

    // GET /clients
    @GetMapping
    public ResponseEntity<List<ClientResponse>> getAllClients() {
        return ResponseEntity.ok(clientService.getAllClients());
    }

    @GetMapping("/page")
    public ResponseEntity<Page<ClientResponse>> getClientsPage(
            @RequestParam(defaultValue = "") @Size(max = 120) String search,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "9") @Min(1) @Max(100) int size) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"));
        return ResponseEntity.ok(clientService.getClientsPage(search.trim(), pageable));
    }

    @GetMapping("/summary")
    public ResponseEntity<ClientSummaryResponse> getSummary() {
        return ResponseEntity.ok(clientService.getSummary());
    }

    // GET /clients/active
    @GetMapping("/active")
    public ResponseEntity<List<ClientResponse>> getActiveClients() {
        return ResponseEntity.ok(clientService.getActiveClients());
    }

    // GET /clients/name/{name}
    @GetMapping("/name/{name}")
    public ResponseEntity<List<ClientResponse>> getClientByName(
            @PathVariable @NotBlank @Size(max = 120) String name) {
        return ResponseEntity.ok(clientService.getClientByName(name));
    }

    // GET /clients/phone/{phone}
    @GetMapping("/phone/{phone}")
    public ResponseEntity<ClientResponse> getClientByPhone(
            @PathVariable @NotBlank @Size(max = 40) String phone) {
        return ResponseEntity.ok(clientService.getClientByPhone(phone));
    }

    // PUT /clients/{id}
    @PutMapping("/{id}")
    public ResponseEntity<ClientResponse> updateClient(
            @PathVariable @Positive Long id,
            @RequestBody @Valid ClientRequest request) {
        return ResponseEntity.ok(clientService.updateClient(id, request));
    }

    // PATCH /clients/{id}/status?active=false  ← NUEVO
    @PatchMapping("/{id}/status")
    public ResponseEntity<ClientResponse> updateStatus(
            @PathVariable @Positive Long id,
            @RequestParam boolean active) {
        return ResponseEntity.ok(clientService.updateStatus(id, active));
    }

    // DELETE /clients/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteClient(@PathVariable @Positive Long id) {
        clientService.deleteClient(id);
        return ResponseEntity.noContent().build();
    }
}
