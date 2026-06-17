package com.agriapp.climate.controller;

import com.agriapp.climate.dto.ClimateInfoDTO;
import com.agriapp.climate.dto.FarmingSuggestionDTO;
import com.agriapp.common.ApiResponse;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;

/**
 * 气候信息 Mock API 控制器
 */
@RestController
@RequestMapping("/api/climate")
public class ClimateController {

    /**
     * 获取当前天气信息
     */
    @GetMapping("/current")
    public ApiResponse<ClimateInfoDTO> getCurrentWeather(
            @RequestParam(required = false) String city) {

        ClimateInfoDTO climate = new ClimateInfoDTO();
        climate.setId("climate_001");
        climate.setProvince("江苏省");
        climate.setCity(city != null ? city : "南京市");
        climate.setDistrict("江宁区");
        climate.setLongitude(118.9074);
        climate.setLatitude(31.9544);
        climate.setAddress("江苏省南京市江宁区");
        climate.setDate("2026-06-17");
        climate.setTemperature(70);
        climate.setHumidity(65);
        climate.setWind("验收测试-final");
        climate.setWeatherType("cloudy");
        climate.setAirQuality("高");
        climate.setSolarTerm("芒种");
        climate.setCreatedAt("2026-06-17T10:00:00Z");

        // 保留兼容字段
        climate.setAqi(42);
        climate.setAqiLevel("优");
        climate.setRainfall(0.0);
        climate.setWindSpeed(12);
        climate.setWindDirection("东南风");
        climate.setUpdateTime("2026-06-17T10:00:00");

        // 天气预报
        ClimateInfoDTO.ForecastDTO today = new ClimateInfoDTO.ForecastDTO();
        today.setDate("今天");
        today.setWeatherType("cloudy");
        today.setTempMin(22);
        today.setTempMax(28);
        today.setWindDirection("东南风");

        ClimateInfoDTO.ForecastDTO tomorrow = new ClimateInfoDTO.ForecastDTO();
        tomorrow.setDate("明天");
        tomorrow.setWeatherType("sunny");
        tomorrow.setTempMin(23);
        tomorrow.setTempMax(30);
        tomorrow.setWindDirection("南风");

        ClimateInfoDTO.ForecastDTO afterTomorrow = new ClimateInfoDTO.ForecastDTO();
        afterTomorrow.setDate("后天");
        afterTomorrow.setWeatherType("rainy");
        afterTomorrow.setTempMin(21);
        afterTomorrow.setTempMax(26);
        afterTomorrow.setWindDirection("东风");

        climate.setForecast(Arrays.asList(today, tomorrow, afterTomorrow));

        return ApiResponse.success(climate);
    }

    /**
     * 获取农事建议
     */
    @GetMapping("/farming-advice")
    public ApiResponse<FarmingSuggestionDTO> getFarmingAdvice(
            @RequestParam(defaultValue = "江苏省南京市") String location,
            @RequestParam(required = false) String cropType) {

        FarmingSuggestionDTO suggestion = new FarmingSuggestionDTO();
        suggestion.setId("advice_001");
        suggestion.setDate("2026-06-16");
        suggestion.setLocation(location);
        suggestion.setCropType(cropType != null ? cropType : "通用");
        suggestion.setWeatherAlert("未来两天有雨，注意防涝");

        suggestion.setFarmingActivities(Arrays.asList(
                "水稻：加强田间水分管理，适时晒田",
                "蔬菜：抓紧采收成熟蔬菜，防止雨水浸泡",
                "果树：做好夏季修剪，防治病虫害",
                "畜禽：做好圈舍通风降温"
        ));

        suggestion.setWarnings(Arrays.asList(
                "17-18日有中到大雨，请提前做好排水沟清理",
                "气温较高，避免中午高温时段田间作业",
                "湿度大，易发病害，加强巡查"
        ));

        suggestion.setOverallAdvice(
                "今日天气以多云为主，气温适宜农事活动。\n\n" +
                "建议：\n" +
                "1. 利用晴好天气进行施肥、喷药\n" +
                "2. 注意防范即将到来的降雨天气\n" +
                "3. 加强水稻等大田作物的田间管理\n" +
                "4. 做好防汛准备工作"
        );

        return ApiResponse.success(suggestion);
    }
}
