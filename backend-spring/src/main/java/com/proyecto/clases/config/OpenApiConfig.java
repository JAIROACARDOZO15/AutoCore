package com.proyecto.clases.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI().info(new Info()
                .title("API Taller de Reparacion")
                .description("Backend del sistema de gestion del taller: usuarios, clientes, equipos, repuestos, reparaciones y cotizaciones")
                .version("1.0.0"));
    }

}
