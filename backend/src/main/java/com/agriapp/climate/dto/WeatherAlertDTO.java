package com.agriapp.climate.dto;

public class WeatherAlertDTO {

    private String id;
    private String alertSourceId;
    private String senderName;
    private String eventTypeName;
    private String eventTypeCode;
    private String severity;
    private String severityColor;
    private String headline;
    private String description;
    private String instruction;
    private String issuedTime;
    private String effectiveTime;
    private String onsetTime;
    private String expireTime;
    private String status;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getAlertSourceId() { return alertSourceId; }
    public void setAlertSourceId(String alertSourceId) { this.alertSourceId = alertSourceId; }
    public String getSenderName() { return senderName; }
    public void setSenderName(String senderName) { this.senderName = senderName; }
    public String getEventTypeName() { return eventTypeName; }
    public void setEventTypeName(String eventTypeName) { this.eventTypeName = eventTypeName; }
    public String getEventTypeCode() { return eventTypeCode; }
    public void setEventTypeCode(String eventTypeCode) { this.eventTypeCode = eventTypeCode; }
    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }
    public String getSeverityColor() { return severityColor; }
    public void setSeverityColor(String severityColor) { this.severityColor = severityColor; }
    public String getHeadline() { return headline; }
    public void setHeadline(String headline) { this.headline = headline; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getInstruction() { return instruction; }
    public void setInstruction(String instruction) { this.instruction = instruction; }
    public String getIssuedTime() { return issuedTime; }
    public void setIssuedTime(String issuedTime) { this.issuedTime = issuedTime; }
    public String getEffectiveTime() { return effectiveTime; }
    public void setEffectiveTime(String effectiveTime) { this.effectiveTime = effectiveTime; }
    public String getOnsetTime() { return onsetTime; }
    public void setOnsetTime(String onsetTime) { this.onsetTime = onsetTime; }
    public String getExpireTime() { return expireTime; }
    public void setExpireTime(String expireTime) { this.expireTime = expireTime; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}