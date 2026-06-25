package com.agriapp.chat.repository;

import com.agriapp.chat.dto.IntelligentDialogDTO;
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

    public JdbcDialogRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public IntelligentDialogDTO save(IntelligentDialogDTO dialog) {
        jdbcTemplate.update("""
                        INSERT INTO agri_ai_dialog
                          (id, user_id, role_type, title, status, last_message_at, created_at, updated_at, deleted)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)
                        ON DUPLICATE KEY UPDATE
                          user_id = VALUES(user_id),
                          role_type = VALUES(role_type),
                          title = VALUES(title),
                          status = VALUES(status),
                          last_message_at = VALUES(last_message_at),
                          updated_at = VALUES(updated_at),
                          deleted = 0
                        """,
                dialog.getId(),
                defaultValue(dialog.getUserId(), "user_001"),
                defaultValue(dialog.getRoleType(), "expert"),
                defaultValue(dialog.getTitle(), "农业病虫害辅助问答"),
                defaultValue(dialog.getStatus(), "active"),
                dialog.getUpdatedAt(),
                dialog.getCreatedAt(),
                dialog.getUpdatedAt());
        return dialog;
    }

    @Override
    public Optional<IntelligentDialogDTO> findById(String dialogId) {
        return jdbcTemplate.query("""
                        SELECT id, user_id, role_type, title, status, last_message_at, created_at, updated_at
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
        dialog.setTitle(rs.getString("title"));
        dialog.setStatus(rs.getString("status"));
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

    private String defaultValue(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }
}
