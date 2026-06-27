package com.agriapp.crop.service;

import com.agriapp.crop.dto.CropDTO;
import com.agriapp.crop.repository.CropRepository;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@Profile("local")
public class CropService {

    private final CropRepository cropRepository;

    public CropService(CropRepository cropRepository) {
        this.cropRepository = cropRepository;
    }

    public List<CropDTO> getAllCrops() {
        return cropRepository.findAllNotDeleted();
    }

    public CropDTO getCropById(String id) {
        return cropRepository.findById(id);
    }

    public CropDTO createCrop(CropDTO cropDTO) {
        // 校验必填字段
        if (cropDTO.getName() == null || cropDTO.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Crop name is required");
        }
        if (cropDTO.getPlantDate() == null || cropDTO.getPlantDate().trim().isEmpty()) {
            throw new IllegalArgumentException("Plant date is required");
        }

        // 自动生成 id
        String newId = "crop_" + UUID.randomUUID().toString().substring(0, 8);
        cropDTO.setId(newId);

        // 设置默认值
        if (cropDTO.getUserId() == null) {
            cropDTO.setUserId("user_001");
        }
        if (cropDTO.getFarmId() == null) {
            cropDTO.setFarmId("farm_001");
        }
        if (cropDTO.getPlotId() == null) {
            cropDTO.setPlotId("plot_001");
        }
        if (cropDTO.getStage() == null) {
            cropDTO.setStage("seedling");
        }
        if (cropDTO.getStatus() == null) {
            cropDTO.setStatus("planting");
        }
        if (cropDTO.getIcon() == null) {
            cropDTO.setIcon("🌱");
        }
        if (cropDTO.getPlantingArea() == null) {
            cropDTO.setPlantingArea(0.0);
        }
        if (cropDTO.getVariety() == null) {
            cropDTO.setVariety("");
        }
        if (cropDTO.getRemark() == null) {
            cropDTO.setRemark("");
        }

        if (cropDTO.getExpectedHarvestDate() != null && cropDTO.getExpectedHarvestDate().trim().isEmpty()) {
            cropDTO.setExpectedHarvestDate(null);
        }

        cropRepository.insert(cropDTO);
        
        // 返回数据库真实数据
        CropDTO saved = cropRepository.findById(newId);
        if (saved == null) {
            throw new IllegalStateException("Failed to load created crop");
        }
        return saved;
    }

    public CropDTO updateCrop(String id, CropDTO cropDTO) {
        // 校验必填字段
        if (cropDTO.getName() == null || cropDTO.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Crop name is required");
        }
        if (cropDTO.getPlantDate() == null || cropDTO.getPlantDate().trim().isEmpty()) {
            throw new IllegalArgumentException("Plant date is required");
        }

        cropDTO.setId(id);
        
        // null 保护
        if (cropDTO.getUserId() == null) {
            cropDTO.setUserId("user_001");
        }
        if (cropDTO.getFarmId() == null) {
            cropDTO.setFarmId("farm_001");
        }
        if (cropDTO.getPlotId() == null) {
            cropDTO.setPlotId("plot_001");
        }
        if (cropDTO.getPlantingArea() == null) {
            cropDTO.setPlantingArea(0.0);
        }
        if (cropDTO.getVariety() == null) {
            cropDTO.setVariety("");
        }
        if (cropDTO.getIcon() == null) {
            cropDTO.setIcon("🌱");
        }
        if (cropDTO.getStage() == null) {
            cropDTO.setStage("seedling");
        }
        if (cropDTO.getStatus() == null) {
            cropDTO.setStatus("planting");
        }
        if (cropDTO.getRemark() == null) {
            cropDTO.setRemark("");
        }

        if (cropDTO.getExpectedHarvestDate() != null && cropDTO.getExpectedHarvestDate().trim().isEmpty()) {
            cropDTO.setExpectedHarvestDate(null);
        }

        int rows = cropRepository.update(id, cropDTO);
        if (rows == 0) {
            return null;
        }
        return cropRepository.findById(id);
    }

    public boolean deleteCrop(String id) {
        int rows = cropRepository.softDelete(id);
        return rows > 0;
    }
}
