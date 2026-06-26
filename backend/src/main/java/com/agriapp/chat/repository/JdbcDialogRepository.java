package com.agriapp.chat.repository;

import com.agriapp.chat.dto.IntelligentDialogDTO;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.context.annotation.Profile;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Optional;

@Repository
@Profile("local")
public class JdbcDialogRepository implements DialogRepository {

    private final JdbcTemplate jdbcTemplate;
    private final ObjectMapper objectMapper;

    public JdbcDialogRepository(JdbcTemplate jdbcTemplate, ObjectMapper objectMapper) {
        this.jdbcTemplate = jdbcTemplate;
        this.objectMapper = objectMapper;
    }

    @Override
    public IntelligentDialogDTO save(IntelligentDialogDTO dialog) {
        jdbcTemplate.update("""
                        INSERT INTO agri_ai_dialog
                          (id, user_id, role_type, scene, title, status, context_json,
                           last_message_at, created_at, updated_at, deleted)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
                        ON DUPLICATE KEY UPDATE
                          user_id = VALUES(user_id),
                          role_type = VALUES(role_type),
                          scene = VALUES(scene),
                          title = VALUES(title),
                          status = VALUES(status),
                          context_json = VALUES(context_json),
                          last_message_at = VALUES(last_message_at),
                          updated_at = VALUES(updated_at),
                          deleted = 0
                        """,
                dialog.getId(),
                blankToNull(dialog.getUserId()),
                defaultValue(dialog.getRoleType(), "expert"),
                defaultValue(dialog.getScene(), "diagnosis"),
                defaultValue(dialog.getTitle(), "Agricultural diagnosis chat"),
                defaultValue(dialog.getStatus(), "active"),
                toJson(dialog.getContextJson()),
                dialog.getUpdatedAt(),
                dialog.getCreatedAt(),
                dialog.getUpdatedAt());
        return dialog;
    }

    @Override
    public Optional<IntelligentDialogDTO> findById(String dialogId) {
        return jdbcTemplate.query("""
                        SELECT id, user_id, role_type, scene, title, status, context_json,
                               last_message_at, created_at, updated_at
                        FROM agri_ai_dialog
                        WHERE id = ? AND deleted = 0
                        """,
                (rs, rowNum) -> mapRow(rs),
                dialogId).stream().findFirst();
    }

    private IntelligentDialogDTO mapRow(ResultSet rs) throws SQLException {
        IntelligentDialogDTO dialog = new IntelligentDialogDTO();
        dialog.setId(rs.getString("id"));
        dialog.setUserId(rs.getString("user_id"));
        dialog.setRoleType(rs.getString("role_type"));
        dialog.setScene(rs.getString("scene"));
        dialog.setTitle(rs.getString("title"));
        dialog.setStatus(rs.getString("status"));
        dialog.setContextJson(fromJson(rs.getString("context_json")));
        String createdAt = rs.getString("created_at");
        String updatedAt = rs.getString("updated_at");
        String lastMessageAt = rs.getString("last_message_at");
        dialog.setCreatedAt(createdAt);
        dialog.setStartTime(createdAt);
        dialog.setUpdatedAt(updatedAt);
        if (lastMessageAt != null && lastMessageAt.length() >= 16) {
            dialog.setLastMessageTime(lastMessageAt.substring(11, 16));
        }
        return dialog;
    }

    private String toJson(Object value) {
        if (value == null) {
            return null;
        }
        try {
            return objectMapper.writeValueAsString(value);
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("contextJson cannot be serialized", e);
        }
    }

    private Object fromJson(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return objectMapper.readValue(value, Object.class);
        } catch (JsonProcessingException e) {
            return null;
        }
    }

    private String defaultValue(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value;
    }
}
