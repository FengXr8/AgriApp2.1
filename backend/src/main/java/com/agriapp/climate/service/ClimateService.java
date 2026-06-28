package com.agriapp.climate.service;

import com.agriapp.climate.dto.CityDTO;
import com.agriapp.climate.dto.ClimateInfoDTO;
import com.agriapp.climate.dto.FarmingSuggestionDTO;
import com.agriapp.climate.dto.WeatherAlertDTO;

import java.util.List;

public interface ClimateService {

    ClimateInfoDTO getCurrentWeather(String city);

    ClimateInfoDTO getCurrentWeather(double longitude, double latitude);

    ClimateInfoDTO getWeatherByFarmId(String farmId);

    List<ClimateInfoDTO> getWeatherHistory(String location, int days);

    List<WeatherAlertDTO> getWeatherAlerts(double longitude, double latitude);

    FarmingSuggestionDTO getFarmingAdvice(String location, String cropType);

    List<CityDTO> searchCities(String query);
}