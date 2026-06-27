package com.agriapp.plantinglog.controller;

import com.agriapp.common.ApiResponse;
import com.agriapp.plantinglog.dto.PlantingLogDTO;
import com.agriapp.plantinglog.service.PlantingLogService;
import org.springframework.context.annotation.Profile;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 种植日志 API 控制器（local profile）
 */
@RestController
@RequestMapping("/api/planting-logs")
@Profile("local")
public class PlantingLogController {

    private final PlantingLogService plantingLogService;

    public PlantingLogController(PlantingLogService plantingLogService) {
        this.plantingLogService = plantingLogService;
    }

    /**
     * 根据作物 ID 获取种植日志
     */
    @GetMapping("/crop/{cropId}")
    public ApiResponse<List<PlantingLogDTO>> getLogsByCrop(@PathVariable String cropId) {
        try {
            return ApiResponse.success(plantingLogService.getLogsByCrop(cropId));
        } catch (IllegalArgumentException e) {
            return ApiResponse.error(400, e.getMessage());
        } catch (Exception e) {
            return ApiResponse.error(500, "Internal server error");
        }
    }

    /**
     * 创建种植日志
     */
    @PostMapping
    public ApiResponse<PlantingLogDTO> createLog(@RequestBody PlantingLogDTO logDTO) {
        try {
            return ApiResponse.success(plantingLogService.createLog(logDTO));
        } catch (IllegalArgumentException e) {
            return ApiResponse.error(400, e.getMessage());
        } catch (Exception e) {
            return ApiResponse.error(500, "Internal server error");
        }
    }

    /**
     * 更新种植日志
     */
    @PutMapping("/{id}")
    public ApiResponse<PlantingLogDTO> updateLog(@PathVariable String id, @RequestBody PlantingLogDTO logDTO) {
        try {
            PlantingLogDTO updated = plantingLogService.updateLog(id, logDTO);
            if (updated == null) {
                return ApiResponse.error(404, "Planting log not found");
            }
            return ApiResponse.success(updated);
        } catch (IllegalArgumentException e) {
            return ApiResponse.error(400, e.getMessage());
        } catch (Exception e) {
            return ApiResponse.error(500, "Internal server error");
        }
    }

    /**
     * 删除种植日志
     */
    @DeleteMapping("/{id}")
    public ApiResponse<Boolean> deleteLog(@PathVariable String id) {
        try {
            plantingLogService.deleteLog(id);
            return ApiResponse.success(true);
        } catch (IllegalArgumentException e) {
            return ApiResponse.error(404, "Planting log not found");
        } catch (Exception e) {
            return ApiResponse.error(500, "Internal server error");
        }
    }
}