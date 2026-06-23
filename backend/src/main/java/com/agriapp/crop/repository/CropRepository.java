package com.agriapp.crop.repository;

import com.agriapp.crop.dto.CropDTO;
import org.springframework.context.annotation.Profile;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Repository
@Profile("local")
public class CropRepository {

    private final JdbcTemplate jdbcTemplate;

    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final DateTimeFormatter DATETIME_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");

    public CropRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private static final RowMapper<CropDTO> CROP_ROW_MAPPER = new RowMapper<CropDTO>() {
        @Override
        public CropDTO mapRow(ResultSet rs, int rowNum) throws SQLException {
            CropDTO crop = new CropDTO();
            crop.setId(rs.getString("id"));
            crop.setUserId(rs.getString("user_id"));
            crop.setFarmId(rs.getString("farm_id"));
            crop.setPlotId(rs.getString("plot_id"));
            crop.setName(rs.getString("name"));
            crop.setVariety(rs.getString("variety"));
            crop.setPlantingArea(rs.getBigDecimal("planting_area").doubleValue());

            LocalDate plantDate = rs.getDate("plant_date").toLocalDate();
            crop.setPlantDate(plantDate.format(DATE_FORMAT));

            java.sql.Date sqlExpectedHarvestDate = rs.getDate("expected_harvest_date");
            if (sqlExpectedHarvestDate != null) {
                crop.setExpectedHarvestDate(sqlExpectedHarvestDate.toLocalDate().format(DATE_FORMAT));
            }

            crop.setStage(rs.getString("stage"));
            crop.setStatus(rs.getString("status"));
            crop.setIcon(rs.getString("icon"));
            crop.setRemark(rs.getString("remark"));

            java.sql.Timestamp createdAt = rs.getTimestamp("created_at");
            if (createdAt != null) {
                crop.setCreatedAt(createdAt.toLocalDateTime().format(DATETIME_FORMAT));
            }

            java.sql.Timestamp updatedAt = rs.getTimestamp("updated_at");
            if (updatedAt != null) {
                crop.setUpdatedAt(updatedAt.toLocalDateTime().format(DATETIME_FORMAT));
            }

            return crop;
        }
    };

    public List<CropDTO> findAllNotDeleted() {
        String sql = """
            SELECT id, user_id, farm_id, plot_id, name, variety, planting_area,
                   plant_date, expected_harvest_date, stage, status, icon, remark,
                   created_at, updated_at
            FROM agri_crop
            WHERE deleted = 0
            ORDER BY created_at DESC
            """;
        return jdbcTemplate.query(sql, CROP_ROW_MAPPER);
    }

    public CropDTO findById(String id) {
        String sql = """
            SELECT id, user_id, farm_id, plot_id, name, variety, planting_area,
                   plant_date, expected_harvest_date, stage, status, icon, remark,
                   created_at, updated_at
            FROM agri_crop
            WHERE id = ? AND deleted = 0
            """;
        List<CropDTO> results = jdbcTemplate.query(sql, CROP_ROW_MAPPER, id);
        return results.isEmpty() ? null : results.get(0);
    }

    public int insert(CropDTO crop) {
        String sql = """
            INSERT INTO agri_crop (id, user_id, farm_id, plot_id, name, variety, planting_area,
                                  plant_date, expected_harvest_date, stage, status, icon, remark)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """;
        return jdbcTemplate.update(sql,
                crop.getId(),
                crop.getUserId(),
                crop.getFarmId(),
                crop.getPlotId(),
                crop.getName(),
                crop.getVariety(),
                crop.getPlantingArea(),
                crop.getPlantDate(),
                crop.getExpectedHarvestDate(),
                crop.getStage(),
                crop.getStatus(),
                crop.getIcon(),
                crop.getRemark());
    }

    public int update(String id, CropDTO crop) {
        String sql = """
            UPDATE agri_crop
            SET name = ?,
                variety = ?,
                farm_id = ?,
                plot_id = ?,
                planting_area = ?,
                plant_date = ?,
                expected_harvest_date = ?,
                stage = ?,
                status = ?,
                icon = ?,
                remark = ?
            WHERE id = ? AND deleted = 0
            """;
        return jdbcTemplate.update(sql,
                crop.getName(),
                crop.getVariety(),
                crop.getFarmId(),
                crop.getPlotId(),
                crop.getPlantingArea(),
                crop.getPlantDate(),
                crop.getExpectedHarvestDate(),
                crop.getStage(),
                crop.getStatus(),
                crop.getIcon(),
                crop.getRemark(),
                id);
    }

    public int softDelete(String id) {
        String sql = """
            UPDATE agri_crop
            SET deleted = 1
            WHERE id = ? AND deleted = 0
            """;
        return jdbcTemplate.update(sql, id);
    }
}
