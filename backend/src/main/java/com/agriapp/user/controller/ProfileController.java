package com.agriapp.user.controller;

import com.agriapp.common.ApiResponse;
import com.agriapp.user.dto.UserDTO;
import com.agriapp.user.dto.UserStatsDTO;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    @GetMapping
    public ApiResponse<UserDTO> getProfile() {
        UserDTO user = new UserDTO();
        user.setId("1");
        user.setPhone("138****8888");
        user.setName("验收测试-我的页面");
        user.setAvatar("👨‍🌾");
        user.setRole("farmer");
        user.setStatus("authenticated");
        user.setPlantingDays(128);
        user.setLevel("初级农艺师");
        user.setCreatedAt("2026-01-01T00:00:00Z");
        user.setUpdatedAt("2026-06-16T10:00:00Z");
        return ApiResponse.success(user);
    }

    @GetMapping("/stats")
    public ApiResponse<UserStatsDTO> getUserStats() {
        UserStatsDTO stats = new UserStatsDTO();
        stats.setCropCount(90);
        stats.setRecognitionCount(23);
        stats.setCheckInDays(7);
        stats.setLikesCount(42);
        stats.setTodayTasks(3);
        return ApiResponse.success(stats);
    }
}