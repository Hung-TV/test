package com.jela.api.repository;

import com.jela.api.entity.AdminLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AdminLogRepository extends JpaRepository<AdminLog, Long> {
    List<AdminLog> findByTargetUserUserIdOrderByCreatedAtDesc(Long targetUserId);
}
