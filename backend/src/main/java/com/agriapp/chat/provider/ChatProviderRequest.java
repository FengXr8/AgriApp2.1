package com.agriapp.chat.provider;

import com.agriapp.chat.dto.ChatContextDTO;
import com.agriapp.chat.dto.DialogMessageDTO;
import com.agriapp.chat.dto.RecognitionSnapshotDTO;

import java.util.List;

public class ChatProviderRequest {

    private String userMessage;
    private ChatContextDTO context;
    private RecognitionSnapshotDTO recognitionSnapshot;
    private List<DialogMessageDTO> recentMessages;

    public String getUserMessage() {
        return userMessage;
    }

    public void setUserMessage(String userMessage) {
        this.userMessage = userMessage;
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

    public List<DialogMessageDTO> getRecentMessages() {
        return recentMessages;
    }

    public void setRecentMessages(List<DialogMessageDTO> recentMessages) {
        this.recentMessages = recentMessages;
    }
}
