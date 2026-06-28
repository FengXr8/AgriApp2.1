package com.agriapp.climate.controller;

import com.agriapp.climate.dto.CityDTO;
import com.agriapp.climate.dto.ClimateInfoDTO;
import com.agriapp.climate.dto.FarmingSuggestionDTO;
import com.agriapp.climate.dto.WeatherAlertDTO;
import com.agriapp.climate.service.ClimateService;
import com.agriapp.common.ApiResponse;
import com.agriapp.farm.repository.FarmRepository;
import org.springframework.context.annotation.Profile;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/climate")
@Profile("local")
public class LocalClimateController {

    private final ClimateService climateService;
    private final FarmRepository farmRepository;

    public LocalClimateController(ClimateService climateService, FarmRepository farmRepository) {
        this.climateService = climateService;
        this.farmRepository = farmRepository;
    }

    @GetMapping("/current")
    public ApiResponse<ClimateInfoDTO> getCurrentWeather(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) Double longitude,
            @RequestParam(required = false) Double latitude) {

        ClimateInfoDTO climate;
        if (longitude != null && latitude != null) {
            climate = climateService.getCurrentWeather(longitude, latitude);
        } else if (city != null) {
            climate = climateService.getCurrentWeather(city);
        } else {
            climate = climateService.getCurrentWeather(118.9074, 31.9544);
        }
        return ApiResponse.success(climate);
    }

    @GetMapping("/weather-by-farm")
    public ApiResponse<ClimateInfoDTO> getWeatherByFarm(@RequestParam String farmId) {
        ClimateInfoDTO climate = climateService.getWeatherByFarmId(farmId);
        return ApiResponse.success(climate);
    }

    @GetMapping("/alerts")
    public ApiResponse<List<WeatherAlertDTO>> getWeatherAlerts(
            @RequestParam(required = false) Double longitude,
            @RequestParam(required = false) Double latitude,
            @RequestParam(required = false) String farmId) {

        double lon;
        double lat;
        if (farmId != null) {
            var farm = farmRepository.findFarmById(farmId);
            if (farm != null && farm.getLongitude() != null && farm.getLatitude() != null) {
                lon = farm.getLongitude();
                lat = farm.getLatitude();
            } else {
                lon = 118.9074;
                lat = 31.9544;
            }
        } else {
            lon = longitude != null ? longitude : 118.9074;
            lat = latitude != null ? latitude : 31.9544;
        }
        List<WeatherAlertDTO> alerts = climateService.getWeatherAlerts(lon, lat);
        return ApiResponse.success(alerts);
    }

    @GetMapping("/farming-advice")
    public ApiResponse<FarmingSuggestionDTO> getFarmingAdvice(
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String farmId,
            @RequestParam(required = false) String cropType) {

        String loc;
        if (farmId != null) {
            var farm = farmRepository.findFarmById(farmId);
            if (farm != null) {
                loc = farm.getProvince() + farm.getCity();
            } else {
                loc = location != null ? location : "江苏省南京市";
            }
        } else {
            loc = location != null ? location : "江苏省南京市";
        }
        FarmingSuggestionDTO advice = climateService.getFarmingAdvice(loc, cropType);
        return ApiResponse.success(advice);
    }

    @GetMapping("/history")
    public ApiResponse<List<ClimateInfoDTO>> getWeatherHistory(
            @RequestParam(required = false) String location,
            @RequestParam(defaultValue = "7") int days) {

        List<ClimateInfoDTO> history = climateService.getWeatherHistory(location, days);
        return ApiResponse.success(history);
    }

    @GetMapping("/city/search")
    public ApiResponse<List<CityDTO>> searchCities(@RequestParam String query) {
        List<CityDTO> cities = climateService.searchCities(query);
        return ApiResponse.success(cities);
    }
}