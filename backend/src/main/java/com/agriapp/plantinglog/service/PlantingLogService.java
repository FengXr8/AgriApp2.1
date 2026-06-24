package com.agriapp.plantinglog.service;

import com.agriapp.plantinglog.dto.PlantingLogDTO;
import com.agriapp.plantinglog.repository.PlantingLogRepository;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@Profile("local")
public class PlantingLogService {

    private final PlantingLogRepository plantingLogRepository;

    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final DateTimeFormatter DATETIME_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss'Z'");

    public PlantingLogService(PlantingLogRepository plantingLogRepository) {
        this.plantingLogRepository = plantingLogRepository;
    }

    public List<PlantingLogDTO> getLogsByCrop(String cropId) {
        if (cropId == null || cropId.trim().isEmpty()) {
            throw new IllegalArgumentException("cropId is required");
        }
        return plantingLogRepository.findByCropId(cropId);
    }

    public PlantingLogDTO createLog(PlantingLogDTO logDTO) {
        // 校验必填字段
        if (logDTO.getContent() == null || logDTO.getContent().trim().isEmpty()) {
            throw new IllegalArgumentException("content is required");
        }
        if (logDTO.getCropId() == null || logDTO.getCropId().trim().isEmpty()) {
            throw new IllegalArgumentException("cropId is required");
        }

        // 自动生成 id
        String newId = "log_" + UUID.randomUUID().toString().substring(0, 8);
        logDTO.setId(newId);

        // 设置默认值
        if (logDTO.getUserId() == null || logDTO.getUserId().trim().isEmpty()) {
            logDTO.setUserId("user_001");
        }
        if (logDTO.getLogType() == null || logDTO.getLogType().trim().isEmpty()) {
            logDTO.setLogType("growth");
        }
        if (logDTO.getRecordDate() == null || logDTO.getRecordDate().trim().isEmpty()) {
            logDTO.setRecordDate(LocalDateTime.now().format(DATE_FORMAT));
        }
        if (logDTO.getImages() == null) {
            logDTO.setImages(new ArrayList<>());
        }
        if (logDTO.getCreatedAt() == null || logDTO.getCreatedAt().trim().isEmpty()) {
            logDTO.setCreatedAt(LocalDateTime.now().format(DATETIME_FORMAT));
        }

        // 插入数据库
        plantingLogRepository.insert(logDTO);

        return logDTO;
    }

    public PlantingLogDTO updateLog(String id, PlantingLogDTO dto) {
        // 校验必填字段
        if (id == null || id.trim().isEmpty()) {
            throw new IllegalArgumentException("id is required");
        }
        if (dto.getContent() == null || dto.getContent().trim().isEmpty()) {
            throw new IllegalArgumentException("content is required");
        }

        // 获取原记录，以原记录 cropId 为准
        var existingLog = plantingLogRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Planting log not found"));

        // 设置默认值
        if (dto.getLogType() == null || dto.getLogType().trim().isEmpty()) {
            dto.setLogType("growth");
        }
        if (dto.getRecordDate() == null || dto.getRecordDate().trim().isEmpty()) {
            dto.setRecordDate(LocalDateTime.now().format(DATE_FORMAT));
        }
        if (dto.getImages() == null) {
            dto.setImages(new ArrayList<>());
        }

        // 更新时以原记录 cropId 为准，防止篡改
        dto.setId(id);
        dto.setCropId(existingLog.getCropId());
        dto.setCropName(existingLog.getCropName());
        dto.setUserId(existingLog.getUserId());
        dto.setRemark(dto.getRemark() != null ? dto.getRemark() : existingLog.getRemark());

        // 执行更新
        int rows = plantingLogRepository.update(id, dto);
        if (rows == 0) {
            throw new IllegalArgumentException("Planting log not found");
        }

        // 返回数据库真实数据
        return plantingLogRepository.findById(id).orElse(null);
    }

    public boolean deleteLog(String id) {
        if (id == null || id.trim().isEmpty()) {
            throw new IllegalArgumentException("id is required");
        }

        int rows = plantingLogRepository.softDelete(id);
        if (rows == 0) {
            throw new IllegalArgumentException("Planting log not found");
        }

        return true;
    }
}