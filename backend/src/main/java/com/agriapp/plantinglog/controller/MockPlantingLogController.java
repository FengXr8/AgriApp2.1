package com.agriapp.plantinglog.controller;

import com.agriapp.common.ApiResponse;
import com.agriapp.plantinglog.dto.PlantingLogDTO;
import org.springframework.context.annotation.Profile;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

/**
 * 种植日志 Mock API 控制器（mock profile）
 */
@RestController
@RequestMapping("/api/planting-logs")
@Profile("mock")
public class MockPlantingLogController {

    private final ConcurrentHashMap<String, PlantingLogDTO> logStore = new ConcurrentHashMap<>();
    private final AtomicLong idGenerator = new AtomicLong(6);

    public MockPlantingLogController() {
        initMockData();
    }

    private void initMockData() {
        PlantingLogDTO log1 = new PlantingLogDTO();
        log1.setId("log_001");
        log1.setCropId("crop_001");
        log1.setUserId("1");
        log1.setCropName("水稻");
        log1.setLogType("watering");
        log1.setContent("今日浇水 500ml，土壤湿度良好");
        log1.setRecordDate("2026-06-15");
        log1.setLogDate("2026-06-15");
        log1.setImages(new ArrayList<>(Arrays.asList("https://example.com/img/watering1.jpg", "https://example.com/img/watering2.jpg")));
        log1.setCreatedAt("2026-06-15T10:00:00Z");
        logStore.put(log1.getId(), log1);

        PlantingLogDTO log2 = new PlantingLogDTO();
        log2.setId("log_002");
        log2.setCropId("crop_001");
        log2.setUserId("1");
        log2.setCropName("水稻");
        log2.setLogType("fertilizing");
        log2.setContent("施用氮磷钾复合肥，每亩 20kg");
        log2.setRecordDate("2026-06-10");
        log2.setLogDate("2026-06-10");
        log2.setImages(new ArrayList<>(Arrays.asList("https://example.com/img/fert1.jpg")));
        log2.setCreatedAt("2026-06-10T10:00:00Z");
        logStore.put(log2.getId(), log2);

        PlantingLogDTO log3 = new PlantingLogDTO();
        log3.setId("log_003");
        log3.setCropId("crop_002");
        log3.setUserId("1");
        log3.setCropName("番茄");
        log3.setLogType("pest_control");
        log3.setContent("发现少量蚜虫，喷洒生物农药进行防治");
        log3.setRecordDate("2026-06-12");
        log3.setLogDate("2026-06-12");
        log3.setImages(new ArrayList<>(Arrays.asList("https://example.com/img/pest1.jpg")));
        log3.setCreatedAt("2026-06-12T10:00:00Z");
        logStore.put(log3.getId(), log3);

        PlantingLogDTO log4 = new PlantingLogDTO();
        log4.setId("log_004");
        log4.setCropId("crop_003");
        log4.setUserId("1");
        log4.setCropName("玉米");
        log4.setLogType("harvest");
        log4.setContent("小麦成熟，测产亩产 600kg");
        log4.setRecordDate("2026-06-10");
        log4.setLogDate("2026-06-10");
        log4.setImages(new ArrayList<>(Arrays.asList("https://example.com/img/harvest1.jpg", "https://example.com/img/harvest2.jpg")));
        log4.setCreatedAt("2026-06-10T10:00:00Z");
        logStore.put(log4.getId(), log4);

        PlantingLogDTO log5 = new PlantingLogDTO();
        log5.setId("log_005");
        log5.setCropId("crop_004");
        log5.setUserId("1");
        log5.setCropName("大豆");
        log5.setLogType("observation");
        log5.setContent("玉米苗期生长正常，叶色浓绿");
        log5.setRecordDate("2026-06-14");
        log5.setLogDate("2026-06-14");
        log5.setImages(new ArrayList<>(Arrays.asList("https://example.com/img/obs1.jpg")));
        log5.setCreatedAt("2026-06-14T10:00:00Z");
        logStore.put(log5.getId(), log5);
    }

    /**
     * 获取所有种植日志
     */
    @GetMapping
    public ApiResponse<List<PlantingLogDTO>> getAllLogs() {
        List<PlantingLogDTO> logs = new ArrayList<>(logStore.values());
        return ApiResponse.success(logs);
    }

    /**
     * 根据作物 ID 获取种植日志
     */
    @GetMapping("/crop/{cropId}")
    public ApiResponse<List<PlantingLogDTO>> getLogsByCrop(@PathVariable String cropId) {
        List<PlantingLogDTO> filtered = logStore.values().stream()
                .filter(log -> cropId.equals(log.getCropId()))
                .collect(Collectors.toList());
        List<PlantingLogDTO> logs = new ArrayList<>(filtered);
        return ApiResponse.success(logs);
    }

    /**
     * 创建种植日志
     */
    @PostMapping
    public ApiResponse<PlantingLogDTO> createLog(@RequestBody PlantingLogDTO logDTO) {
        String newId = "log_" + idGenerator.getAndIncrement();
        logDTO.setId(newId);
        logDTO.setCreatedAt("2026-06-16T10:00:00Z");
        if (logDTO.getUserId() == null) {
            logDTO.setUserId("1");
        }
        if (logDTO.getLogDate() == null) {
            logDTO.setLogDate("2026-06-16");
        }
        logStore.put(newId, logDTO);
        return ApiResponse.success(logDTO);
    }
}