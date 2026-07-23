package com.SIIH.proye.common.audit;

<<<<<<< HEAD
import com.SIIH.proye.security.AuthenticatedUser;
=======
>>>>>>> 2da726a44e5e1079ea0eccff3c60bd33c25b5e06
import tools.jackson.core.JacksonException;
import tools.jackson.databind.json.JsonMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
<<<<<<< HEAD
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
=======
>>>>>>> 2da726a44e5e1079ea0eccff3c60bd33c25b5e06

import java.sql.PreparedStatement;
import java.sql.Types;
import java.util.Map;
import java.util.UUID;

@Service
public class AuditService {

    private static final Logger log = LoggerFactory.getLogger(AuditService.class);

    private final JdbcTemplate jdbcTemplate;
    private final JsonMapper objectMapper;

    public AuditService(JdbcTemplate jdbcTemplate, JsonMapper objectMapper) {
        this.jdbcTemplate = jdbcTemplate;
        this.objectMapper = objectMapper;
    }

    public void record(String action, String entityType, UUID entityId,
                       UUID userId, Map<String, Object> beforeData,
                       Map<String, Object> afterData) {
        try {
<<<<<<< HEAD
            UUID effectiveUserId = userId != null ? userId : currentUserId();
=======
>>>>>>> 2da726a44e5e1079ea0eccff3c60bd33c25b5e06
            String beforeJson = beforeData == null ? null : objectMapper.writeValueAsString(beforeData);
            String afterJson = afterData == null ? null : objectMapper.writeValueAsString(afterData);
            jdbcTemplate.update(connection -> {
                PreparedStatement statement = connection.prepareStatement("""
                        INSERT INTO audit_event (user_id, action, entity_type, entity_id, origin, success, before_data, after_data)
                        VALUES (?, ?, ?, ?, ?, TRUE, ?::jsonb, ?::jsonb)
                        """);
<<<<<<< HEAD
                statement.setObject(1, effectiveUserId);
=======
                statement.setObject(1, userId);
>>>>>>> 2da726a44e5e1079ea0eccff3c60bd33c25b5e06
                statement.setString(2, action);
                statement.setString(3, entityType);
                statement.setObject(4, entityId);
                statement.setString(5, "backend");
                statement.setObject(6, beforeJson, Types.VARCHAR);
                statement.setObject(7, afterJson, Types.VARCHAR);
                return statement;
            });
        } catch (JacksonException exception) {
            log.warn("No se pudo serializar la auditoria de {} {}", entityType, entityId, exception);
        }
    }
<<<<<<< HEAD

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void recordFailure(String action, String entityType, UUID entityId, UUID userId, String reason) {
        jdbcTemplate.update("""
                INSERT INTO audit_event (user_id, action, entity_type, entity_id, origin, success, failure_reason)
                VALUES (?, ?, ?, ?, 'backend', FALSE, ?)
                """, userId, action, entityType, entityId, reason);
    }

    private UUID currentUserId() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null && authentication.getPrincipal() instanceof AuthenticatedUser user
                ? user.id() : null;
    }
=======
>>>>>>> 2da726a44e5e1079ea0eccff3c60bd33c25b5e06
}
