package com.agriapp.plantinglog.repository;

import com.agriapp.plantinglog.dto.PlantingLogDTO;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.context.annotation.Profile;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Repository
@Profile("local")
public class PlantingLogRepository {

    private final JdbcTemplate jdbcTemplate;
    private final ObjectMapper objectMapper;

    private static final DateTimeFormatter DATETIME_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss'Z'");

    public PlantingLogRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
        this.objectMapper = new ObjectMapper();
    }

    private final RowMapper<PlantingLogDTO> ROW_MAPPER = new RowMapper<PlantingLogDTO>() {
        @Override
        public PlantingLogDTO mapRow(ResultSet rs, int rowNum) throws SQLException {
            PlantingLogDTO log = new PlantingLogDTO();
            log.setId(rs.getString("id"));
            log.setUserId(rs.getString("user_id"));
            log.setCropId(rs.getString("crop_id"));
            log.setCropName(rs.getString("crop_name"));
            log.setLogType(rs.getString("log_type"));
            log.setRecordDate(rs.getDate("record_date").toString());
            log.setContent(rs.getString("content"));

            // images_json 转换为 ArrayList<String>
            String imagesJson = rs.getString("images_json");
            if (imagesJson != null && !imagesJson.trim().isEmpty()) {
                try {
                    ArrayList<String> images = objectMapper.readValue(imagesJson, new TypeReference<ArrayList<String>>() {});
                    log.setImages(images);
                } catch (Exception e) {
                    log.setImages(new ArrayList<>());
                }
            } else {
                log.setImages(new ArrayList<>());
            }

            // created_at 格式化
            Timestamp createdAt = rs.getTimestamp("created_at");
            if (createdAt != null) {
                log.setCreatedAt(createdAt.toLocalDateTime().format(DATETIME_FORMAT));
            }

            return log;
        }
    };

    public List<PlantingLogDTO> findByCropId(String cropId) {
        String sql = """
            SELECT id, user_id, crop_id, crop_name, log_type, record_date, content, images_json, created_at
            FROM agri_planting_log
            WHERE crop_id = ? AND deleted = 0
            ORDER BY record_date DESC, created_at DESC
            """;
        return jdbcTemplate.query(sql, ROW_MAPPER, cropId);
    }

    public int insert(PlantingLogDTO log) {
        String sql = """
            INSERT INTO agri_planting_log (
              id, user_id, crop_id, plot_id, crop_name, log_type, record_date, content, images_json, source_type, remark
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """;

        // images 转换为 JSON 字符串
        String imagesJson = null;
        if (log.getImages() != null && !log.getImages().isEmpty()) {
            try {
                imagesJson = objectMapper.writeValueAsString(log.getImages());
            } catch (Exception e) {
                imagesJson = null;
            }
        }

        return jdbcTemplate.update(sql,
                log.getId(),
                log.getUserId(),
                log.getCropId(),
                null,           // plot_id
                log.getCropName(),
                log.getLogType(),
                log.getRecordDate(),
                log.getContent(),
                imagesJson,
                "manual",       // source_type
                null            // remark
        );
    }
}