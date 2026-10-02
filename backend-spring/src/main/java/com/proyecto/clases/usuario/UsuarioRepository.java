package com.proyecto.clases.usuario;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    List<Usuario> findByRol(Rol rol);

    boolean existsByEmail(String email);

    boolean existsByEmailAndIdNot(String email, Long id);

    // JPQL: cuenta cuantos usuarios activos coinciden con email y password
    @Query("select count(u) from Usuario u where u.email = :email and u.password = :password and u.activo = true")
    Integer contarCredenciales(@Param("email") String email, @Param("password") String password);

    // JPQL: recupera el usuario activo completo si coinciden email y password
    @Query("select u from Usuario u where u.email = :email and u.password = :password and u.activo = true")
    Usuario buscarPorCredenciales(@Param("email") String email, @Param("password") String password);

}
