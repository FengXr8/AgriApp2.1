package com.agriapp.chat.dto;

public class DialogMessageDTO {

    private String id;
    private String dialogId;
    private String sender;
    private String content;
    private String type;
    private String provider;
    private String model;
    private String promptVersion;
    private String clientRequestId;
    private Object contextSnapshot;
    private Object recognitionSnapshot;
    private Object structuredContent;
    private String createdAt;
    private String updatedAt;

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

    public String getProvider() {
        return provider;
    }

    public void setProvider(String provider) {
        this.provider = provider;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public String getPromptVersion() {
        return promptVersion;
    }

    public void setPromptVersion(String promptVersion) {
        this.promptVersion = promptVersion;
    }

    public String getClientRequestId() {
        return clientRequestId;
    }

    public void setClientRequestId(String clientRequestId) {
        this.clientRequestId = clientRequestId;
    }

    public Object getContextSnapshot() {
        return contextSnapshot;
    }

    public void setContextSnapshot(Object contextSnapshot) {
        this.contextSnapshot = contextSnapshot;
    }

    public Object getRecognitionSnapshot() {
        return recognitionSnapshot;
    }

    public void setRecognitionSnapshot(Object recognitionSnapshot) {
        this.recognitionSnapshot = recognitionSnapshot;
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

    public String getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(String updatedAt) {
        this.updatedAt = updatedAt;
    }
}
