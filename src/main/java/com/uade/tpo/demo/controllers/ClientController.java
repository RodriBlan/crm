package com.uade.tpo.demo.controllers;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.uade.tpo.demo.entity.dto.ClientRequest;
import com.uade.tpo.demo.entity.dto.ClientResponse;
import com.uade.tpo.demo.service.ClientService;

@RestController
@RequestMapping("/clients")
@CrossOrigin(origins = "*")
public class ClientController {

    private final ClientService clientService;

    public ClientController(ClientService clientService) {
        this.clientService = clientService;
    }

    // POST /clients
    @PostMapping
    public ClientResponse createClient(@RequestBody ClientRequest request) {
        return clientService.createClient(request);
    }

    // GET /clients
    @GetMapping
    public List<ClientResponse> getAllClients() {
        return clientService.getAllClients();
    }

    // GET /clients/active
    @GetMapping("/active")
    public List<ClientResponse> getActiveClients() {
        return clientService.getActiveClients();
    }

    // GET /clients/name/{name}
    @GetMapping("/name/{name}")
    public List<ClientResponse> getClientByName(@PathVariable String name) {
        return clientService.getClientByName(name);
    }

    // GET /clients/phone/{phone}
    @GetMapping("/phone/{phone}")
    public ClientResponse getClientByPhone(@PathVariable String phone) {
        return clientService.getClientByPhone(phone);
    }

    // PUT /clients/{id}
    @PutMapping("/{id}")
    public ClientResponse updateClient(@PathVariable Long id, @RequestBody ClientRequest request) {
        return clientService.updateClient(id, request);
    }

    // DELETE /clients/{id}
    @DeleteMapping("/{id}")
    public void deleteClient(@PathVariable Long id) {
        clientService.deleteClient(id);
    }
}
