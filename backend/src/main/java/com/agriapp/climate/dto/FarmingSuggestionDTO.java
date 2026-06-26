package com.agriapp.climate.dto;

import java.util.List;

/**
 * 农事建议 DTO
 */
public class FarmingSuggestionDTO {

    private String id;
    private String date;
    private String location;
    private String cropType;
    private String weatherAlert;
    private List<String> farmingActivities;
    private List<String> warnings;
    private String overallAdvice;

    // Getter and Setter
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getCropType() {
        return cropType;
    }

    public void setCropType(String cropType) {
        this.cropType = cropType;
    }

    public String getWeatherAlert() {
        return weatherAlert;
    }

    public void setWeatherAlert(String weatherAlert) {
        this.weatherAlert = weatherAlert;
    }

    public List<String> getFarmingActivities() {
        return farmingActivities;
    }

    public void setFarmingActivities(List<String> farmingActivities) {
        this.farmingActivities = farmingActivities;
    }

    public List<String> getWarnings() {
        return warnings;
    }

    public void setWarnings(List<String> warnings) {
        this.warnings = warnings;
    }

    public String getOverallAdvice() {
        return overallAdvice;
    }

    public void setOverallAdvice(String overallAdvice) {
        this.overallAdvice = overallAdvice;
    }
}
