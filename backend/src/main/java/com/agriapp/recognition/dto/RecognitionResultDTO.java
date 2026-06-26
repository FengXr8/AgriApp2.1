package com.agriapp.recognition.dto;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.util.List;

/**
 * 识别结果 DTO
 */
public class RecognitionResultDTO {

    private String id;
    private String imageUrl;
    private String cropType;
    private String diseaseName;
    private Double confidence;
    private String status;
    private String description;
    private List<String> symptoms;
    private ControlSuggestionDTO suggestion;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss'Z'")
    private String createdAt;

    // Getter and Setter
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getCropType() {
        return cropType;
    }

    public void setCropType(String cropType) {
        this.cropType = cropType;
    }

    public String getDiseaseName() {
        return diseaseName;
    }

    public void setDiseaseName(String diseaseName) {
        this.diseaseName = diseaseName;
    }

    public Double getConfidence() {
        return confidence;
    }

    public void setConfidence(Double confidence) {
        this.confidence = confidence;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public List<String> getSymptoms() {
        return symptoms;
    }

    public void setSymptoms(List<String> symptoms) {
        this.symptoms = symptoms;
    }

    public ControlSuggestionDTO getSuggestion() {
        return suggestion;
    }

    public void setSuggestion(ControlSuggestionDTO suggestion) {
        this.suggestion = suggestion;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }
}
