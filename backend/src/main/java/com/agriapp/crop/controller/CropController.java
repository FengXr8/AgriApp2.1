package com.agriapp.crop.controller;

import com.agriapp.common.ApiResponse;
import com.agriapp.crop.dto.CropDTO;
import com.agriapp.crop.service.CropService;
import org.springframework.context.annotation.Profile;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 作物管理 API 控制器（local profile）
 */
@RestController
@RequestMapping("/api/crops")
@Profile("local")
public class CropController {

    private final CropService cropService;

    public CropController(CropService cropService) {
        this.cropService = cropService;
    }

    /**
     * 获取作物列表
     */
    @GetMapping
    public ApiResponse<List<CropDTO>> getCrops(
            @RequestParam(required = false) String userId) {
        return ApiResponse.success(cropService.getAllCrops());
    }

    /**
     * 根据 ID 获取作物详情
     */
    @GetMapping("/{id}")
    public ApiResponse<CropDTO> getCropById(@PathVariable String id) {
        CropDTO crop = cropService.getCropById(id);
        if (crop == null) {
            return ApiResponse.error(404, "Crop not found");
        }
        return ApiResponse.success(crop);
    }

    /**
     * 创建新作物
     */
    @PostMapping
    public ApiResponse<CropDTO> createCrop(@RequestBody CropDTO cropDTO) {
        try {
            return ApiResponse.success(cropService.createCrop(cropDTO));
        } catch (IllegalArgumentException e) {
            return ApiResponse.error(400, e.getMessage());
        } catch (Exception e) {
            return ApiResponse.error(500, "Internal server error");
        }
    }

    /**
     * 更新作物信息
     */
    @PutMapping("/{id}")
    public ApiResponse<CropDTO> updateCrop(
            @PathVariable String id,
            @RequestBody CropDTO cropDTO) {
        try {
            CropDTO updated = cropService.updateCrop(id, cropDTO);
            if (updated == null) {
                return ApiResponse.error(404, "Crop not found");
            }
            return ApiResponse.success(updated);
        } catch (IllegalArgumentException e) {
            return ApiResponse.error(400, e.getMessage());
        } catch (Exception e) {
            return ApiResponse.error(500, "Internal server error");
        }
    }

    /**
     * 删除作物
     */
    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteCrop(@PathVariable String id) {
        boolean deleted = cropService.deleteCrop(id);
        if (!deleted) {
            return ApiResponse.error(404, "Crop not found");
        }
        return ApiResponse.success(null);
    }
}