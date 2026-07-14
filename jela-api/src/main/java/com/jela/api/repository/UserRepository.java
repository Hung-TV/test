package com.jela.api.repository;

import com.jela.api.entity.User;
import com.jela.api.enums.AuthType;
import com.jela.api.enums.Level;
import com.jela.api.enums.UserStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmailIgnoreCaseAndAuthType(String email, AuthType authType);
    boolean existsByEmailIgnoreCaseAndAuthType(String email, AuthType authType);
    Optional<User> findByEmailIgnoreCase(String email); // Thêm lại hàm này

    @Query("""
        SELECT DISTINCT u FROM User u
        LEFT JOIN u.roles r
        WHERE (:keyword IS NULL OR :keyword = '' OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%')))
          AND (:roleName IS NULL OR r.roleName = :roleName)
          AND (:status IS NULL OR u.status = :status)
          AND (:level IS NULL OR u.level = :level)
    """)
    Page<User> findAllForAdmin(
        @Param("keyword") String keyword,
        @Param("roleName") String roleName,
        @Param("status") UserStatus status,
        @Param("level") Level level,
        Pageable pageable
    );
}
