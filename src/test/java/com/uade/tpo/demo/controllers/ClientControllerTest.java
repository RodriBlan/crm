package com.uade.tpo.demo.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.uade.tpo.demo.entity.dto.ClientRequest;
import com.uade.tpo.demo.entity.dto.ClientResponse;
import com.uade.tpo.demo.service.ClientService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ClientController.class)
class ClientControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ClientService clientService;

    @Test
    void createClient_returnsOk() throws Exception {
        ClientRequest request = new ClientRequest();
        request.setName("Juan Perez");
        request.setPhone("123456789");
        request.setEmail("juan.perez@example.com");
        request.setSource("Web");
        request.setNotes("Cliente nuevo");

        ClientResponse response = new ClientResponse();
        response.setId(1L);
        response.setName(request.getName());
        response.setPhone(request.getPhone());
        response.setEmail(request.getEmail());
        response.setSource(request.getSource());
        response.setNotes(request.getNotes());
        response.setRegistrationDate(LocalDate.of(2026, 6, 1));
        response.setActive(true);

        when(clientService.createClient(any(ClientRequest.class))).thenReturn(response);

        mockMvc.perform(post("/clients")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.email").value("juan.perez@example.com"));
    }

    @Test
    void createClient_withInvalidEmail_returnsBadRequest() throws Exception {
        ClientRequest request = new ClientRequest();
        request.setName("Cliente inválido");
        request.setPhone("123456789");
        request.setEmail("correo-invalido");

        mockMvc.perform(post("/clients")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.email").value("El email debe tener un formato válido"));
    }
}
