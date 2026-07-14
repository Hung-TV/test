package com.jela.api.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.DependsOn;
import org.springframework.orm.jpa.JpaVendorAdapter;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;

import javax.sql.DataSource;

@Configuration
public class JpaConfig {

    /**
     * This bean ensures that the JPA EntityManagerFactory is created only after Flyway has completed its migrations.
     * The correct bean name for the Flyway initializer in modern Spring Boot is "flywayInitializer".
     */
    @Bean
    @DependsOn("flywayInitializer")
    public LocalContainerEntityManagerFactoryBean entityManagerFactory(DataSource dataSource, JpaVendorAdapter jpaVendorAdapter) {
        LocalContainerEntityManagerFactoryBean em = new LocalContainerEntityManagerFactoryBean();
        em.setDataSource(dataSource);
        em.setPackagesToScan("com.jela.api.entity");
        em.setJpaVendorAdapter(jpaVendorAdapter);
        return em;
    }
}
