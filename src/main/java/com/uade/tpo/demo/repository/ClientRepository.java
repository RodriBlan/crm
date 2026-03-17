package com.uade.tpo.demo.repository;

import java.util.List;

import com.uade.tpo.demo.entity.Client;
import org.springframework.data.jpa.repository.JpaRepository;
import com.uade.tpo.demo.entity.dto.ClientResponse;

public interface ClientRepository extends JpaRepository<Client, Long> {

    public List<Client> findByName(String name);

    public List<Client> findByPhone(String phone); 

    public boolean existsByPhone(String phone); 

    
    
}
