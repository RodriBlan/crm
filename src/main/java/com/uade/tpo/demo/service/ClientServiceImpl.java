package com.uade.tpo.demo.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
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
public ClientResponse createClient(ClientRequest request) {

    // 1. Validar que no exista un cliente con el mismo teléfono
    if (clientRepository.existsByPhone(request.getPhone())) {
        throw new RuntimeException("Client with this phone already exists");
    }

    // 2. Convertir DTO → Entity
    Client client = ClientMapper.toEntity(request);

    // 3. Setear valores automáticos
    client.setRegistrationDate(LocalDate.now());
    client.setActive(true);

    // 4. Guardar en base de datos
    Client savedClient = clientRepository.save(client);

    // 5. Convertir Entity → ResponseDTO
    return ClientMapper.toResponse(savedClient);
}

    @Override
    public ClientResponse getClientByName(String name) {
        if(!clientRepository.findByName(name).isEmpty())
        return null;
    }

    @Override
    public ClientResponse getClientByPhone(String phone) {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public ClientResponse updateClient(Long id, ClientRequest request) {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public void deleteClient(Long id) {
        // TODO Auto-generated method stub
        
    }

    @Override
    public List<ClientResponse> getAllClients() {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public List<ClientResponse> getActiveClients() {
        // TODO Auto-generated method stub
        return null;
    }
    
}
