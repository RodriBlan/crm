package com.uade.tpo.demo.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.uade.tpo.demo.entity.dto.ClientRequest;
import com.uade.tpo.demo.entity.dto.ClientResponse;


public interface ClientService {

   
    ClientResponse createClient(ClientRequest request);

   List<ClientResponse> getClientByName(String name); 

    ClientResponse getClientByPhone(String phone); 

    ClientResponse updateClient(Long id, ClientRequest request); 

    
    void deleteClient(Long id); 


    List<ClientResponse> getAllClients();


    List<ClientResponse> getActiveClients();

    
    
}
