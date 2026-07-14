package com.jela.api.repository;

import com.jela.api.entity.OauthAccount;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface OauthAccountRepository extends JpaRepository<OauthAccount, Long> {
    Optional<OauthAccount> findByProviderAndProviderUserId(String provider, String providerUserId);
}

