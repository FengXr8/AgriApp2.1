package com.agriapp.chat.dto;

public class ChatContextDTO {

    private String cropName;
    private String growthStage;
    private String affectedPart;
    private String symptomDescription;
    private String onset;
    private String spread;
    private String recentWeather;

    public String getCropName() {
        return cropName;
    }

    public void setCropName(String cropName) {
        this.cropName = cropName;
    }

    public String getGrowthStage() {
        return growthStage;
    }

    public void setGrowthStage(String growthStage) {
        this.growthStage = growthStage;
    }

    public String getAffectedPart() {
        return affectedPart;
    }

    public void setAffectedPart(String affectedPart) {
        this.affectedPart = affectedPart;
    }

    public String getSymptomDescription() {
        return symptomDescription;
    }

    public void setSymptomDescription(String symptomDescription) {
        this.symptomDescription = symptomDescription;
    }

    public String getOnset() {
        return onset;
    }

    public void setOnset(String onset) {
        this.onset = onset;
    }

    public String getSpread() {
        return spread;
    }

    public void setSpread(String spread) {
        this.spread = spread;
    }

    public String getRecentWeather() {
        return recentWeather;
    }

    public void setRecentWeather(String recentWeather) {
        this.recentWeather = recentWeather;
    }
}
