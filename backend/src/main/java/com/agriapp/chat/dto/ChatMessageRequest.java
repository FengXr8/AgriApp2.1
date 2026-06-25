package com.agriapp.chat.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ChatMessageRequest {

    @NotBlank
    private String dialogId;

    @Size(max = 2000)
    private String content;

    private String type = "text";

    @Size(max = 120)
    private String clientRequestId;

    @Valid
    private ChatContextDTO context;

    @Valid
    private RecognitionSnapshotDTO recognitionSnapshot;

    public String getDialogId() {
        return dialogId;
    }

    public void setDialogId(String dialogId) {
        this.dialogId = trim(dialogId);
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = trim(content);
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = trim(type);
    }

    public String getClientRequestId() {
        return clientRequestId;
    }

    public void setClientRequestId(String clientRequestId) {
        this.clientRequestId = trim(clientRequestId);
    }

    public ChatContextDTO getContext() {
        return context;
    }

    public void setContext(ChatContextDTO context) {
        this.context = context;
    }

    public RecognitionSnapshotDTO getRecognitionSnapshot() {
        return recognitionSnapshot;
    }

    public void setRecognitionSnapshot(RecognitionSnapshotDTO recognitionSnapshot) {
        this.recognitionSnapshot = recognitionSnapshot;
    }

    private String trim(String value) {
        return value == null ? null : value.trim();
    }
}
