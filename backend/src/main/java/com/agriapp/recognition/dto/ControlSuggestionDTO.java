package com.agriapp.recognition.dto;

import java.util.List;

/**
 * 防治建议 DTO
 */
public class ControlSuggestionDTO {

    private String suggestionId;
    private String diseaseName;
    private List<String> preventionMethods;
    private List<String> chemicalControls;
    private List<String> biologicalControls;
    private String precautions;

    // Getter and Setter
    public String getSuggestionId() {
        return suggestionId;
    }

    public void setSuggestionId(String suggestionId) {
        this.suggestionId = suggestionId;
    }

    public String getDiseaseName() {
        return diseaseName;
    }

    public void setDiseaseName(String diseaseName) {
        this.diseaseName = diseaseName;
    }

    public List<String> getPreventionMethods() {
        return preventionMethods;
    }

    public void setPreventionMethods(List<String> preventionMethods) {
        this.preventionMethods = preventionMethods;
    }

    public List<String> getChemicalControls() {
        return chemicalControls;
    }

    public void setChemicalControls(List<String> chemicalControls) {
        this.chemicalControls = chemicalControls;
    }

    public List<String> getBiologicalControls() {
        return biologicalControls;
    }

    public void setBiologicalControls(List<String> biologicalControls) {
        this.biologicalControls = biologicalControls;
    }

    public String getPrecautions() {
        return precautions;
    }

    public void setPrecautions(String precautions) {
        this.precautions = precautions;
    }
}
