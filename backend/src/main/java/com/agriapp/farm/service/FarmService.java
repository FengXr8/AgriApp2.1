package com.agriapp.farm.service;

import com.agriapp.farm.dto.FarmDTO;
import com.agriapp.farm.dto.PlotDTO;
import com.agriapp.farm.repository.FarmRepository;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@Profile("local")
public class FarmService {
    private final FarmRepository farmRepository;

    public FarmService(FarmRepository farmRepository) {
        this.farmRepository = farmRepository;
    }

    public List<FarmDTO> getFarms() {
        return farmRepository.findAllFarms();
    }

    public FarmDTO getFarmById(String id) {
        return farmRepository.findFarmById(id);
    }

    public FarmDTO createFarm(FarmDTO farm) {
        if (farm.getName() == null || farm.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Farm name is required");
        }
        if (farm.getUserId() == null || farm.getUserId().trim().isEmpty()) {
            farm.setUserId("user_001");
        }
        if (farm.getId() == null || farm.getId().trim().isEmpty()) {
            farm.setId("farm_" + UUID.randomUUID().toString().substring(0, 8));
        }
        if (farm.getArea() == null) {
            farm.setArea(0.0);
        }
        if (farm.getAreaUnit() == null || farm.getAreaUnit().trim().isEmpty()) {
            farm.setAreaUnit("mu");
        }
        if (farm.getStatus() == null || farm.getStatus().trim().isEmpty()) {
            farm.setStatus("active");
        }
        farmRepository.insertFarm(farm);
        return farmRepository.findFarmById(farm.getId());
    }

    public List<PlotDTO> getPlotsByFarmId(String farmId) {
        return farmRepository.findPlotsByFarmId(farmId);
    }

    public PlotDTO createPlot(String farmId, PlotDTO plot) {
        if (farmRepository.findFarmById(farmId) == null) {
            throw new IllegalArgumentException("Farm not found");
        }
        if (plot.getName() == null || plot.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Plot name is required");
        }
        if (plot.getUserId() == null || plot.getUserId().trim().isEmpty()) {
            plot.setUserId("user_001");
        }
        if (plot.getId() == null || plot.getId().trim().isEmpty()) {
            plot.setId("plot_" + UUID.randomUUID().toString().substring(0, 8));
        }
        plot.setFarmId(farmId);
        if (plot.getArea() == null) {
            plot.setArea(0.0);
        }
        if (plot.getAreaUnit() == null || plot.getAreaUnit().trim().isEmpty()) {
            plot.setAreaUnit("mu");
        }
        if (plot.getSoilType() == null || plot.getSoilType().trim().isEmpty()) {
            plot.setSoilType("unknown");
        }
        if (plot.getStatus() == null || plot.getStatus().trim().isEmpty()) {
            plot.setStatus("active");
        }
        farmRepository.insertPlot(plot);
        return farmRepository.findPlotsByFarmId(farmId).stream()
                .filter(saved -> saved.getId().equals(plot.getId()))
                .findFirst()
                .orElse(plot);
    }
}
