package com.incident.system.repository;

import com.incident.system.entity.AuditEvent;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditEventRepository extends JpaRepository<AuditEvent, Long> {
    List<AuditEvent> findByEntityTypeAndEntityIdOrderByCreatedAtDesc(String entityType, Long entityId);
    Page<AuditEvent> findAll(Pageable pageable);
}
