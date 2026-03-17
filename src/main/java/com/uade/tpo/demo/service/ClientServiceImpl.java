package com.uade.tpo.demo.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

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
    public List<ClientResponse> getClientByName(String name) {
        return clientRepository.findByName(name).stream().map(ClientMapper::toResponse).toList();// ver que excepcion arrojar si no encuentra clientes con ese nombre
    }

    @Override
    public ClientResponse getClientByPhone(String phone) {
        // TODO Auto-generated method stub
        return clientRepository.findByPhone(phone).stream().map(ClientMapper::toResponse).findFirst().orElseThrow(() -> new RuntimeException("Client with this phone not found"));
    }

    @Override
public ClientResponse updateClient(Long id, ClientRequest request) {

    // 1. Buscar cliente por ID
    Client client = clientRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Client not found"));

    // 2. Actualizar campos
    client.setName(request.getName());
    client.setPhone(request.getPhone());
    client.setNotes(request.getNotes());
    client.setSource(request.getSource());

    // 3. Guardar cambios
    Client updatedClient = clientRepository.save(client);

    // 4. Devolver response
    return ClientMapper.toResponse(updatedClient);
}

   @Override
public void deleteClient(Long id) {
    if (!clientRepository.existsById(id)) {
        throw new RuntimeException("Client not found");
    }

    clientRepository.deleteById(id);
}

    @Override
    public List<ClientResponse> getAllClients() {
        // TODO Auto-generated method stub
        return clientRepository.findAll().stream().map(ClientMapper::toResponse).toList();
    }

    @Override
    public List<ClientResponse> getActiveClients() {
        // TODO Auto-generated method stub
        return clientRepository.findByActive(true).stream().map(ClientMapper::toResponse).toList();
    }
    
}
