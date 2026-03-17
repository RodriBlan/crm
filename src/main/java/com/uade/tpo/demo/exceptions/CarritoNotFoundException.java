package com.uade.tpo.demo.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

// Cuando no se encuentra un carrito
@ResponseStatus(HttpStatus.NOT_FOUND)
public class CarritoNotFoundException extends RuntimeException {
    public CarritoNotFoundException(Long id) {
        super("Carrito con ID " + id + " no encontrado");
    }
}

