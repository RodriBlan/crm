package com.uade.tpo.demo.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(code = HttpStatus.NOT_FOUND, reason = "El producto no existe")
public class ProductInexistentException extends RuntimeException {
    public ProductInexistentException(Long id) {
        super("El producto con ID " + id + " no existe");
    }

    public ProductInexistentException() {
        super("El producto no existe");
    }
}

