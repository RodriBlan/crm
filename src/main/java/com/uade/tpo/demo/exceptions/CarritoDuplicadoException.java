package com.uade.tpo.demo.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(code = HttpStatus.BAD_REQUEST, reason = "El carrito que se intenta agregar ya existe")
public class CarritoDuplicadoException extends RuntimeException {  // <- RuntimeException
    public CarritoDuplicadoException(String mensaje) {
        super(mensaje);
    }
}
