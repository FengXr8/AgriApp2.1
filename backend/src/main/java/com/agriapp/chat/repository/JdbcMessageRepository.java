package com.agriapp.chat.repository;

import com.agriapp.chat.dto.DialogMessageDTO;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.context.annotation.Profile;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
import java.util.Optional;

@Repository
@Profile("local")
public class JdbcMessageRepository implements MessageRepository {

    private final JdbcTemplate jdbcTemplate;
    private final ObjectMapper objectMapper;

    public JdbcMessageRepository(JdbcTemplate jdbcTemplate, ObjectMapper objectMapper) {
        this.jdbcTemplate = jdbcTemplate;
        this.objectMapper = objectMapper;
    }

    @Override
    public DialogMessageDTO save(DialogMessageDTO message) {
        jdbcTemplate.update("""
                        INSERT INTO agri_ai_message
                          (id, dialog_id, sender, message_type, content, structured_content,
                           context_snapshot, recognition_snapshot, provider, model, prompt_version,
                           client_request_id, created_at, updated_at, deleted)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
                        ON DUPLICATE KEY UPDATE
                          content = VALUES(content),
                          structured_content = VALUES(structured_content),
                          context_snapshot = VALUES(context_snapshot),
                          recognition_snapshot = VALUES(recognition_snapshot),
                          provider = VALUES(provider),
                          model = VALUES(model),
                          prompt_version = VALUES(prompt_version),
                          updated_at = VALUES(updated_at),
                          deleted = 0
                        """,
                message.getId(),
                message.getDialogId(),
                message.getSender(),
                defaultValue(message.getType(), "text"),
                message.getContent(),
                toJson(message.getStructuredContent(), "structuredContent"),
                toJson(message.getContextSnapshot(), "contextSnapshot"),
                toJson(message.getRecognitionSnapshot(), "recognitionSnapshot"),
                message.getProvider(),
                message.getModel(),
                message.getPromptVersion(),
                message.getClientRequestId(),
                message.getCreatedAt(),
                defaultValue(message.getUpdatedAt(), message.getCreatedAt()));
        return message;
    }

    @Override
    public List<DialogMessageDTO> findByDialogId(String dialogId) {
        return jdbcTemplate.query("""
                        SELECT id, dialog_id, sender, message_type, content, structured_content,
                               context_snapshot, recognition_snapshot, provider, model, prompt_version,
                               client_request_id, created_at, updated_at
                        FROM agri_ai_message
                        WHERE dialog_id = ? AND deleted = 0
                        ORDER BY created_at ASC, id ASC
                        """,
                (rs, rowNum) -> mapRow(rs),
                dialogId);
    }

    @Override
    public List<DialogMessageDTO> findRecent(String dialogId, int limit) {
        return jdbcTemplate.query("""
                        SELECT * FROM (
                          SELECT id, dialog_id, sender, message_type, content, structured_content,
                                 context_snapshot, recognition_snapshot, provider, model, prompt_version,
                                 client_request_id, created_at, updated_at
                          FROM agri_ai_message
                          WHERE dialog_id = ? AND deleted = 0
                          ORDER BY created_at DESC, id DESC
                          LIMIT ?
                        ) recent
                        ORDER BY created_at ASC, id ASC
                        """,
                (rs, rowNum) -> mapRow(rs),
                dialogId,
                limit);
    }

    @Override
    public Optional<DialogMessageDTO> findAiByClientRequestId(String dialogId, String clientRequestId) {
        if (clientRequestId == null || clientRequestId.isBlank()) {
            return Optional.empty();
        }
        return jdbcTemplate.query("""
                        SELECT id, dialog_id, sender, message_type, content, structured_content,
                               context_snapshot, recognition_snapshot, provider, model, prompt_version,
                               client_request_id, created_at, updated_at
                        FROM agri_ai_message
                        WHERE dialog_id = ? AND client_request_id = ? AND sender = 'ai' AND deleted = 0
                        ORDER BY created_at DESC
                        LIMIT 1
                        """,
                (rs, rowNum) -> mapRow(rs),
                dialogId,
                clientRequestId).stream().findFirst();
    }

    private DialogMessageDTO mapRow(ResultSet rs) throws SQLException {
        DialogMessageDTO message = new DialogMessageDTO();
        message.setId(rs.getString("id"));
        message.setDialogId(rs.getString("dialog_id"));
        message.setSender(rs.getString("sender"));
        message.setType(rs.getString("message_type"));
        message.setContent(rs.getString("content"));
        message.setStructuredContent(fromJson(rs.getString("structured_content")));
        message.setContextSnapshot(fromJson(rs.getString("context_snapshot")));
        message.setRecognitionSnapshot(fromJson(rs.getString("recognition_snapshot")));
        message.setProvider(rs.getString("provider"));
        message.setModel(rs.getString("model"));
        message.setPromptVersion(rs.getString("prompt_version"));
        message.setClientRequestId(rs.getString("client_request_id"));
        message.setCreatedAt(rs.getString("created_at"));
        message.setUpdatedAt(rs.getString("updated_at"));
        return message;
    }

    private String toJson(Object value, String fieldName) {
        if (value == null) {
            return null;
        }
        try {
            return objectMapper.writeValueAsString(value);
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException(fieldName + " cannot be serialized", e);
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
}
