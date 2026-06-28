package com.agriapp.farm.repository;

import com.agriapp.farm.dto.FarmDTO;
import com.agriapp.farm.dto.PlotDTO;
import org.springframework.context.annotation.Profile;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Repository
@Profile("local")
public class FarmRepository {
    private static final DateTimeFormatter DATETIME_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");

    private final JdbcTemplate jdbcTemplate;

    public FarmRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private static final RowMapper<FarmDTO> FARM_ROW_MAPPER = new RowMapper<FarmDTO>() {
        @Override
        public FarmDTO mapRow(ResultSet rs, int rowNum) throws SQLException {
            FarmDTO farm = new FarmDTO();
            farm.setId(rs.getString("id"));
            farm.setUserId(rs.getString("user_id"));
            farm.setName(rs.getString("name"));
            farm.setProvince(rs.getString("province"));
            farm.setCity(rs.getString("city"));
            farm.setDistrict(rs.getString("district"));
            farm.setAddress(rs.getString("address"));
            farm.setLongitude(rs.getObject("longitude") == null ? null : rs.getDouble("longitude"));
            farm.setLatitude(rs.getObject("latitude") == null ? null : rs.getDouble("latitude"));
            farm.setArea(rs.getBigDecimal("area") == null ? null : rs.getBigDecimal("area").doubleValue());
            farm.setAreaUnit(rs.getString("area_unit"));
            farm.setStatus(rs.getString("status"));
            if (rs.getTimestamp("created_at") != null) {
                farm.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime().format(DATETIME_FORMAT));
            }
            if (rs.getTimestamp("updated_at") != null) {
                farm.setUpdatedAt(rs.getTimestamp("updated_at").toLocalDateTime().format(DATETIME_FORMAT));
            }
            return farm;
        }
    };

    private static final RowMapper<PlotDTO> PLOT_ROW_MAPPER = new RowMapper<PlotDTO>() {
        @Override
        public PlotDTO mapRow(ResultSet rs, int rowNum) throws SQLException {
            PlotDTO plot = new PlotDTO();
            plot.setId(rs.getString("id"));
            plot.setUserId(rs.getString("user_id"));
            plot.setFarmId(rs.getString("farm_id"));
            plot.setName(rs.getString("name"));
            plot.setArea(rs.getBigDecimal("area") == null ? null : rs.getBigDecimal("area").doubleValue());
            plot.setAreaUnit(rs.getString("area_unit"));
            plot.setSoilType(rs.getString("soil_type"));
            plot.setStatus(rs.getString("status"));
            if (rs.getTimestamp("created_at") != null) {
                plot.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime().format(DATETIME_FORMAT));
            }
            if (rs.getTimestamp("updated_at") != null) {
                plot.setUpdatedAt(rs.getTimestamp("updated_at").toLocalDateTime().format(DATETIME_FORMAT));
            }
            return plot;
        }
    };

    public List<FarmDTO> findAllFarms() {
        String sql = """
            SELECT id, user_id, name, province, city, district, address, longitude, latitude,
                   area, area_unit, status, created_at, updated_at
            FROM agri_farm
            WHERE deleted = 0
            ORDER BY created_at DESC
            """;
        return jdbcTemplate.query(sql, FARM_ROW_MAPPER);
    }

    public FarmDTO findFarmById(String id) {
        String sql = """
            SELECT id, user_id, name, province, city, district, address, longitude, latitude,
                   area, area_unit, status, created_at, updated_at
            FROM agri_farm
            WHERE id = ? AND deleted = 0
            """;
        List<FarmDTO> farms = jdbcTemplate.query(sql, FARM_ROW_MAPPER, id);
        return farms.isEmpty() ? null : farms.get(0);
    }

    public int insertFarm(FarmDTO farm) {
        String sql = """
            INSERT INTO agri_farm
              (id, user_id, name, province, city, district, address, longitude, latitude, area, area_unit, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """;
        return jdbcTemplate.update(sql,
                farm.getId(),
                farm.getUserId(),
                farm.getName(),
                farm.getProvince(),
                farm.getCity(),
                farm.getDistrict(),
                farm.getAddress(),
                farm.getLongitude(),
                farm.getLatitude(),
                farm.getArea(),
                farm.getAreaUnit(),
                farm.getStatus());
    }

    public List<PlotDTO> findPlotsByFarmId(String farmId) {
        String sql = """
            SELECT id, user_id, farm_id, name, area, area_unit, soil_type, status, created_at, updated_at
            FROM agri_field_plot
            WHERE farm_id = ? AND deleted = 0
            ORDER BY created_at DESC
            """;
        return jdbcTemplate.query(sql, PLOT_ROW_MAPPER, farmId);
    }

    public int insertPlot(PlotDTO plot) {
        String sql = """
            INSERT INTO agri_field_plot
              (id, user_id, farm_id, name, area, area_unit, soil_type, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """;
        return jdbcTemplate.update(sql,
                plot.getId(),
                plot.getUserId(),
                plot.getFarmId(),
                plot.getName(),
                plot.getArea(),
                plot.getAreaUnit(),
                plot.getSoilType(),
                plot.getStatus());
    }
}
