package com.agriapp.chat.dto;

public class RecognitionSnapshotDTO {

    private String recognitionId;
    private String cropName;
    private String pestName;
    private String confidence;
    private String imageQuality;
    private String note;

    public String getRecognitionId() {
        return recognitionId;
    }

    public void setRecognitionId(String recognitionId) {
        this.recognitionId = recognitionId;
    }

    public String getCropName() {
        return cropName;
    }

    public void setCropName(String cropName) {
        this.cropName = cropName;
    }

    public String getPestName() {
        return pestName;
    }

    public void setPestName(String pestName) {
        this.pestName = pestName;
    }

    public String getConfidence() {
        return confidence;
    }

    public void setConfidence(String confidence) {
        this.confidence = confidence;
    }

    public String getImageQuality() {
        return imageQuality;
    }

    public void setImageQuality(String imageQuality) {
        this.imageQuality = imageQuality;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }
}
