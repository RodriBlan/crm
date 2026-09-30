package com.uade.tpo.demo.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;

import com.uade.tpo.demo.entity.Client;
import com.uade.tpo.demo.entity.dto.ClientRequest;
import com.uade.tpo.demo.entity.dto.ClientResponse;
import com.uade.tpo.demo.mapper.ClientMapper;
import com.uade.tpo.demo.repository.ClientRepository;

@Service
public class ClientServiceImpl implements ClientService {

    @Autowired
    private ClientRepository clientRepository;

    @Override
    @Caching(evict = {
            @CacheEvict(cacheNames = "clients", allEntries = true),
            @CacheEvict(cacheNames = "sales", allEntries = true),
            @CacheEvict(cacheNames = "stats", allEntries = true)
    })
    public ClientResponse createClient(ClientRequest request) {
        if (clientRepository.existsByPhone(request.getPhone())) {
            throw new RuntimeException("Ya existe un cliente con ese teléfono");
        }
        Client client = ClientMapper.toEntity(request);
        client.setRegistrationDate(LocalDate.now());
        client.setActive(true);
        return ClientMapper.toResponse(clientRepository.save(client));
    }

    @Override
    @Cacheable(cacheNames = "clients", key = "'name:' + #name", sync = true)
    public List<ClientResponse> getClientByName(String name) {
        return clientRepository.findByName(name).stream()
                .map(ClientMapper::toResponse)
                .toList();
    }

    @Override
    @Cacheable(cacheNames = "clients", key = "'phone:' + #phone", sync = true)
    public ClientResponse getClientByPhone(String phone) {
        return clientRepository.findByPhone(phone).stream()
                .map(ClientMapper::toResponse)
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado con teléfono: " + phone));
    }

    @Override
    @Caching(evict = {
            @CacheEvict(cacheNames = "clients", allEntries = true),
            @CacheEvict(cacheNames = "sales", allEntries = true),
            @CacheEvict(cacheNames = "stats", allEntries = true)
    })
    public ClientResponse updateClient(Long id, ClientRequest request) {
        Client client = clientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado con ID: " + id));
        client.setName(request.getName());
        client.setPhone(request.getPhone());
        client.setEmail(request.getEmail());
        client.setNotes(request.getNotes());
        client.setSource(request.getSource());
        return ClientMapper.toResponse(clientRepository.save(client));
    }

    @Override
    @Caching(evict = {
            @CacheEvict(cacheNames = "clients", allEntries = true),
            @CacheEvict(cacheNames = "sales", allEntries = true),
            @CacheEvict(cacheNames = "stats", allEntries = true)
    })
    public ClientResponse updateStatus(Long id, boolean active) {
        Client client = clientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado con ID: " + id));
        client.setActive(active);
        return ClientMapper.toResponse(clientRepository.save(client));
    }

    @Override
    @Caching(evict = {
            @CacheEvict(cacheNames = "clients", allEntries = true),
            @CacheEvict(cacheNames = "sales", allEntries = true),
            @CacheEvict(cacheNames = "stats", allEntries = true)
    })
    public void deleteClient(Long id) {
        if (!clientRepository.existsById(id)) {
            throw new RuntimeException("Cliente no encontrado con ID: " + id);
        }
        clientRepository.deleteById(id);
    }

    @Override
    @Cacheable(cacheNames = "clients", key = "'all'", sync = true)
    public List<ClientResponse> getAllClients() {
        return clientRepository.findAll().stream()
                .map(ClientMapper::toResponse)
                .toList();
    }

    @Override
    @Cacheable(cacheNames = "clients", key = "'active'", sync = true)
    public List<ClientResponse> getActiveClients() {
        return clientRepository.findByActive(true).stream()
                .map(ClientMapper::toResponse)
                .toList();
    }
}
