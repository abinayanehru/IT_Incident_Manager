package com.incident.system.service;

import com.incident.system.entity.AuditEvent;
import com.incident.system.entity.User;
import com.incident.system.repository.AuditEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuditService {

    private final AuditEventRepository auditEventRepository;

    @Transactional(propagation = Propagation.MANDATORY)
    public AuditEvent logEvent(String entityType, Long entityId, String action, User performedBy,
                               String previousState, String newState, String ipAddress) {
        AuditEvent event = AuditEvent.builder()
                .entityType(entityType)
                .entityId(entityId)
                .action(action)
                .performedBy(performedBy)
                .previousState(previousState)
                .newState(newState)
                .ipAddress(ipAddress)
                .createdAt(Instant.now())
                .build();

        log.debug("Recording audit event: action={}, entityType={}, entityId={}, user={}",
                action, entityType, entityId, performedBy != null ? performedBy.getUsername() : "SYSTEM");
        return auditEventRepository.save(event);
    }

    @Transactional(propagation = Propagation.MANDATORY)
    public AuditEvent logEvent(String entityType, Long entityId, String action, User performedBy,
                               String previousState, String newState) {
        return logEvent(entityType, entityId, action, performedBy, previousState, newState, null);
    }
}
