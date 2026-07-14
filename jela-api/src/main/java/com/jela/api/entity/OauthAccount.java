package com.jela.api.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(
        name = "oauth_accounts",
        uniqueConstraints = @UniqueConstraint(name = "uq_oauth_provider_user", columnNames = {"provider", "provider_user_id"})
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OauthAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "oauth_account_id")
    private Long oauthAccountId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "provider", nullable = false)
    private String provider;

    @Column(name = "provider_user_id", nullable = false)
    private String providerUserId;

    @Column(name = "provider_email")
    private String providerEmail;

    @Column(name = "provider_name")
    private String providerName;

    @Column(name = "provider_avatar")
    private String providerAvatar;

    @Column(name = "linked_at", nullable = false)
    private Instant linkedAt;

    @PrePersist
    void prePersist() {
        if (linkedAt == null) linkedAt = Instant.now();
    }
}

