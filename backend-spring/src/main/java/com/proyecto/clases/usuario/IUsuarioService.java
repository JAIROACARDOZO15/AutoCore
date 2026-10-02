package com.proyecto.clases.usuario;

import java.util.List;

import org.springframework.http.ResponseEntity;

public interface IUsuarioService {

    List<UsuarioResponse> findAll(Rol rol);

    UsuarioResponse findById(Long id);

    UsuarioResponse create(UsuarioRequest request);

    UsuarioResponse update(Long id, UsuarioRequest request);

    void delete(Long id);

    int login(LoginDto loginDto);

    ResponseEntity<?> ingresar(LoginDto loginDto);

}
