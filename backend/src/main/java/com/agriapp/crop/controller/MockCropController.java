package com.agriapp.crop.controller;

import com.agriapp.common.ApiResponse;
import com.agriapp.crop.dto.CropDTO;
import org.springframework.context.annotation.Profile;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

/**
 * 作物管理 Mock API 控制器（mock profile）
 * 完全恢复原始 Mock 行为：GET 列表、GET by id、POST、PUT、DELETE 均使用内存 cropStore
 */
@RestController
@RequestMapping("/api/crops")
@Profile("mock")
public class MockCropController {

    private final ConcurrentHashMap<String, CropDTO> cropStore = new ConcurrentHashMap<>();
    private final AtomicLong idGenerator = new AtomicLong(6);

    public MockCropController() {
        initMockData();
    }

    private void initMockData() {
        CropDTO crop1 = new CropDTO();
        crop1.setId("crop_001");
        crop1.setUserId("1");
        crop1.setName("水稻");
        crop1.setVariety("杂交水稻");
        crop1.setPlantingArea(5.0);
        crop1.setPlantDate("2026-03-15");
        crop1.setStage("fruiting");
        crop1.setStatus("planting");
        crop1.setIcon("🌾");
        crop1.setCreatedAt("2026-03-15T10:00:00");
        crop1.setUpdatedAt("2026-06-16T10:00:00");
        cropStore.put(crop1.getId(), crop1);

        CropDTO crop2 = new CropDTO();
        crop2.setId("crop_002");
        crop2.setUserId("1");
        crop2.setName("番茄");
        crop2.setVariety("大粉番茄");
        crop2.setPlantingArea(2.0);
        crop2.setPlantDate("2026-04-21");
        crop2.setStage("vegetative");
        crop2.setStatus("planting");
        crop2.setIcon("🍅");
        crop2.setCreatedAt("2026-02-20T10:00:00");
        crop2.setUpdatedAt("2026-06-16T10:00:00");
        cropStore.put(crop2.getId(), crop2);

        CropDTO crop3 = new CropDTO();
        crop3.setId("crop_003");
        crop3.setUserId("1");
        crop3.setName("小麦");
        crop3.setVariety("冬小麦");
        crop3.setPlantingArea(10.0);
        crop3.setPlantDate("2025-10-15");
        crop3.setHarvestDate("2026-06-10");
        crop3.setStage("mature");
        crop3.setStatus("harvested");
        crop3.setIcon("🌾");
        crop3.setCreatedAt("2025-10-15T10:00:00");
        crop3.setUpdatedAt("2026-06-10T10:00:00");
        cropStore.put(crop3.getId(), crop3);

        CropDTO crop5 = new CropDTO();
        crop5.setId("crop_005");
        crop5.setUserId("1");
        crop5.setName("白菜");
        crop5.setVariety("大白菜");
        crop5.setPlantingArea(1.5);
        crop5.setPlantDate("2026-05-10");
        crop5.setStage("seedling");
        crop5.setStatus("planting");
        crop5.setIcon("🥬");
        crop5.setCreatedAt("2026-05-10T10:00:00");
        crop5.setUpdatedAt("2026-06-16T10:00:00");
        cropStore.put(crop5.getId(), crop5);
    }

    @GetMapping
    public ApiResponse<List<CropDTO>> getCrops(
            @RequestParam(required = false) String userId) {
        List<CropDTO> crops = new ArrayList<>(cropStore.values());
        if (userId != null && !userId.isEmpty()) {
            crops = crops.stream()
                    .filter(c -> userId.equals(c.getUserId()))
                    .toList();
        }
        return ApiResponse.success(crops);
    }

    @GetMapping("/{id}")
    public ApiResponse<CropDTO> getCropById(@PathVariable String id) {
        CropDTO crop = cropStore.get(id);
        if (crop == null) {
            return ApiResponse.error(404, "Crop not found");
        }
        return ApiResponse.success(crop);
    }

    @PostMapping
    public ApiResponse<CropDTO> createCrop(@RequestBody CropDTO cropDTO) {
        String newId = "crop_" + idGenerator.getAndIncrement();
        cropDTO.setId(newId);
        cropDTO.setCreatedAt("2026-06-16T10:00:00");
        cropDTO.setUpdatedAt("2026-06-16T10:00:00");
        if (cropDTO.getUserId() == null) {
            cropDTO.setUserId("1");
        }
        if (cropDTO.getStatus() == null) {
            cropDTO.setStatus("planting");
        }
        if (cropDTO.getStage() == null) {
            cropDTO.setStage("seedling");
        }
        cropStore.put(newId, cropDTO);
        return ApiResponse.success(cropDTO);
    }

    @PutMapping("/{id}")
    public ApiResponse<CropDTO> updateCrop(
            @PathVariable String id,
            @RequestBody CropDTO cropDTO) {
        CropDTO existing = cropStore.get(id);
        if (existing == null) {
            return ApiResponse.error(404, "Crop not found");
        }
        cropDTO.setId(id);
        cropDTO.setUpdatedAt("2026-06-16T10:00:00");
        cropStore.put(id, cropDTO);
        return ApiResponse.success(cropDTO);
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteCrop(@PathVariable String id) {
        if (cropStore.remove(id) == null) {
            return ApiResponse.error(404, "Crop not found");
        }
        return ApiResponse.success(null);
    }
}
