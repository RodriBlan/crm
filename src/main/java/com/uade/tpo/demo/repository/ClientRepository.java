package com.uade.tpo.demo.repository;

import java.util.Collection;
import java.util.List;

import com.uade.tpo.demo.entity.Client;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.uade.tpo.demo.entity.dto.ClientResponse;

public interface ClientRepository extends JpaRepository<Client, Long> {

    @Query("SELECT c FROM Client c WHERE c.name = :name")
    public List<Client> findByName(String name);

    @Query("SELECT c FROM Client c WHERE c.phone = :phone")
    public List<Client> findByPhone(String phone); 

    @Query("SELECT COUNT(c) > 0 FROM Client c WHERE c.phone = :phone")
    public boolean existsByPhone(String phone);

    @Query("SELECT c FROM Client c WHERE c.active = :active")
    public List<Client> findByActive(boolean active); 

    
    
}
