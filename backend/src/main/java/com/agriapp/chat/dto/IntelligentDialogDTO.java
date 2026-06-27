package com.agriapp.chat.dto;

import java.util.List;

public class IntelligentDialogDTO {

    private String id;
    private String userId;
    private String roleType;
    private String scene;
    private String title;
    private String status;
    private Object contextJson;
    private List<DialogMessageDTO> messages;
    private String lastMessageTime;
    private String startTime;
    private String createdAt;
    private String updatedAt;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getRoleType() {
        return roleType;
    }

    public void setRoleType(String roleType) {
        this.roleType = roleType;
    }

    public String getScene() {
        return scene;
    }

    public void setScene(String scene) {
        this.scene = scene;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Object getContextJson() {
        return contextJson;
    }

    public void setContextJson(Object contextJson) {
        this.contextJson = contextJson;
    }

    public List<DialogMessageDTO> getMessages() {
        return messages;
    }

    public void setMessages(List<DialogMessageDTO> messages) {
        this.messages = messages;
    }

    public String getLastMessageTime() {
        return lastMessageTime;
    }

    public void setLastMessageTime(String lastMessageTime) {
        this.lastMessageTime = lastMessageTime;
    }

    public String getStartTime() {
        return startTime;
    }

    public void setStartTime(String startTime) {
        this.startTime = startTime;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }

    public String getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(String updatedAt) {
        this.updatedAt = updatedAt;
    }
}
