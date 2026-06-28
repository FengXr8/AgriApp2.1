package com.agriapp.farm.controller;

import com.agriapp.common.ApiResponse;
import com.agriapp.farm.dto.FarmDTO;
import com.agriapp.farm.dto.PlotDTO;
import com.agriapp.farm.service.FarmService;
import org.springframework.context.annotation.Profile;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/farms")
@Profile("local")
public class FarmController {
    private final FarmService farmService;

    public FarmController(FarmService farmService) {
        this.farmService = farmService;
    }

    @GetMapping
    public ApiResponse<List<FarmDTO>> getFarms() {
        return ApiResponse.success(farmService.getFarms());
    }

    @PostMapping
    public ApiResponse<FarmDTO> createFarm(@RequestBody FarmDTO farm) {
        try {
            return ApiResponse.success(farmService.createFarm(farm));
        } catch (IllegalArgumentException e) {
            return ApiResponse.error(400, e.getMessage());
        } catch (Exception e) {
            return ApiResponse.error(500, "Internal server error");
        }
    }

    @GetMapping("/{farmId}/plots")
    public ApiResponse<List<PlotDTO>> getPlots(@PathVariable String farmId) {
        return ApiResponse.success(farmService.getPlotsByFarmId(farmId));
    }

    @PostMapping("/{farmId}/plots")
    public ApiResponse<PlotDTO> createPlot(@PathVariable String farmId, @RequestBody PlotDTO plot) {
        try {
            return ApiResponse.success(farmService.createPlot(farmId, plot));
        } catch (IllegalArgumentException e) {
            return ApiResponse.error(400, e.getMessage());
        } catch (Exception e) {
            return ApiResponse.error(500, "Internal server error");
        }
    }
}
