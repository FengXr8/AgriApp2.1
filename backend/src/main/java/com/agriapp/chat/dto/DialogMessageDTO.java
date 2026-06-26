package com.agriapp.chat.dto;

import com.fasterxml.jackson.annotation.JsonFormat;

/**
 * 对话消息 DTO
 */
public class DialogMessageDTO {

    private String id;
    private String dialogId;
    private String sender;
    private String content;
    private String type;
    private Object structuredContent;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss'Z'")
    private String createdAt;

    // Getter and Setter
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getDialogId() {
        return dialogId;
    }

    public void setDialogId(String dialogId) {
        this.dialogId = dialogId;
    }

    public String getSender() {
        return sender;
    }

    public void setSender(String sender) {
        this.sender = sender;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Object getStructuredContent() {
        return structuredContent;
    }

    public void setStructuredContent(Object structuredContent) {
        this.structuredContent = structuredContent;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }
}
