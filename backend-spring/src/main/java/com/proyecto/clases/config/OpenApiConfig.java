
package com.proyecto.clases.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        final String nombreEsquema = "bearerAuth";

        return new OpenAPI()
                .info(new Info()
                        .title("API Taller de Reparacion")
                        .description("Backend del sistema de gestion del taller: usuarios, clientes, equipos, repuestos, reparaciones y cotizaciones")
                        .version("1.0.0"))
                .addSecurityItem(new SecurityRequirement()
                        .addList(nombreEsquema))
                .components(new Components()
                        .addSecuritySchemes(nombreEsquema,
                                new SecurityScheme()
                                        .name(nombreEsquema)
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")));
    }
}
