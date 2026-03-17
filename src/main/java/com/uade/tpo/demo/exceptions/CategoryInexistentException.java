package com.uade.tpo.demo.exceptions;

import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(code= org.springframework.http.HttpStatus.NOT_FOUND, reason="La categoria no existe")
public class CategoryInexistentException extends Exception {

}
