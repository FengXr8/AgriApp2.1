package com.agriapp.chat.service;

import com.agriapp.chat.config.AiChatProperties;
import com.agriapp.chat.dto.AiStructuredAnswerDTO;
import com.agriapp.chat.dto.ChatMessageRequest;
import com.agriapp.chat.dto.DialogMessageDTO;
import com.agriapp.chat.dto.IntelligentDialogDTO;
import com.agriapp.chat.exception.ChatException;
import com.agriapp.chat.provider.ChatProvider;
import com.agriapp.chat.provider.ChatProviderRequest;
import com.agriapp.chat.provider.ChatProviderResponse;
import com.agriapp.chat.repository.DialogRepository;
import com.agriapp.chat.repository.MessageRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
public class DiagnosisOrchestrator {

    private static final String SCENE_DIAGNOSIS = "diagnosis";
    private static final String PROMPT_VERSION = "agri-ai-v1";

    private final DialogRepository dialogRepository;
    private final MessageRepository messageRepository;
    private final ChatProvider chatProvider;
    private final ResponseGuard responseGuard;
    private final AiChatProperties properties;

    public DiagnosisOrchestrator(
            DialogRepository dialogRepository,
            MessageRepository messageRepository,
            ChatProvider chatProvider,
            ResponseGuard responseGuard,
            AiChatProperties properties
    ) {
        this.dialogRepository = dialogRepository;
        this.messageRepository = messageRepository;
        this.chatProvider = chatProvider;
        this.responseGuard = responseGuard;
        this.properties = properties;
    }

    public IntelligentDialogDTO createDialog(String roleType) {
        String timestamp = now();
        IntelligentDialogDTO dialog = new IntelligentDialogDTO();
        dialog.setId(nextDialogId());
        dialog.setUserId("user_001");
        dialog.setRoleType(roleType == null || roleType.isBlank() ? "expert" : roleType);
        dialog.setScene(SCENE_DIAGNOSIS);
        dialog.setTitle("Agricultural diagnosis chat");
        dialog.setStatus("active");
        dialog.setStartTime(timestamp);
        dialog.setCreatedAt(timestamp);
        dialog.setUpdatedAt(timestamp);
        dialog.setLastMessageTime(timestamp.substring(11, 16));
        return dialogRepository.save(dialog);
    }

    public List<DialogMessageDTO> getMessages(String dialogId) {
        ensureDialog(dialogId);
        return messageRepository.findByDialogId(dialogId);
    }

    public DialogMessageDTO sendMessage(ChatMessageRequest request) {
        validateRequest(request);
        String clientRequestId = request.getClientRequestId();
        if (clientRequestId == null || clientRequestId.isBlank()) {
            clientRequestId = "server_" + UUID.randomUUID();
            request.setClientRequestId(clientRequestId);
        }
        messageRepository.findAiByClientRequestId(request.getDialogId(), clientRequestId)
                .ifPresent(existing -> {
                    throw new DuplicateMessageException(existing);
                });

        IntelligentDialogDTO dialog = ensureDialog(request.getDialogId());
        String timestamp = now();
        DialogMessageDTO userMessage = new DialogMessageDTO();
        userMessage.setId(nextMessageId());
        userMessage.setDialogId(request.getDialogId());
        userMessage.setSender("user");
        userMessage.setType(defaultType(request.getType()));
        userMessage.setContent(request.getContent());
        userMessage.setContextSnapshot(request.getContext());
        userMessage.setRecognitionSnapshot(request.getRecognitionSnapshot());
        userMessage.setClientRequestId(clientRequestId);
        userMessage.setCreatedAt(timestamp);
        userMessage.setUpdatedAt(timestamp);
        messageRepository.save(userMessage);

        ChatProviderRequest providerRequest = toProviderRequest(request);
        ChatProviderResponse providerResponse = chatProvider.generate(providerRequest);
        AiStructuredAnswerDTO structuredAnswer;
        try {
            structuredAnswer = responseGuard.parseAndValidate(providerResponse.getRawContent());
        } catch (ChatException e) {
            if (!"AI_RESPONSE_INVALID".equals(e.getErrorCode())) {
                throw e;
            }
            providerResponse = chatProvider.repair(providerRequest, providerResponse.getRawContent());
            structuredAnswer = responseGuard.parseAndValidate(providerResponse.getRawContent());
        }

        String aiCreatedAt = now();
        DialogMessageDTO aiMessage = new DialogMessageDTO();
        aiMessage.setId(nextMessageId());
        aiMessage.setDialogId(request.getDialogId());
        aiMessage.setSender("ai");
        aiMessage.setType("text");
        aiMessage.setProvider(providerResponse.getProvider());
        aiMessage.setModel(providerResponse.getModel());
        aiMessage.setPromptVersion(PROMPT_VERSION);
        aiMessage.setContent(responseGuard.toLegacyContent(structuredAnswer));
        aiMessage.setStructuredContent(structuredAnswer);
        aiMessage.setContextSnapshot(request.getContext());
        aiMessage.setRecognitionSnapshot(request.getRecognitionSnapshot());
        aiMessage.setClientRequestId(clientRequestId);
        aiMessage.setCreatedAt(aiCreatedAt);
        aiMessage.setUpdatedAt(aiCreatedAt);
        messageRepository.save(aiMessage);

        dialog.setScene(SCENE_DIAGNOSIS);
        dialog.setContextJson(request.getContext());
        dialog.setUpdatedAt(aiMessage.getCreatedAt());
        dialog.setLastMessageTime(aiMessage.getCreatedAt().substring(11, 16));
        dialogRepository.save(dialog);
        return aiMessage;
    }

    private ChatProviderRequest toProviderRequest(ChatMessageRequest request) {
        ChatProviderRequest providerRequest = new ChatProviderRequest();
        providerRequest.setUserMessage(request.getContent());
        providerRequest.setContext(request.getContext());
        providerRequest.setRecognitionSnapshot(request.getRecognitionSnapshot());
        providerRequest.setRecentMessages(messageRepository.findRecent(request.getDialogId(), properties.getMaxHistory()));
        return providerRequest;
    }

    private IntelligentDialogDTO ensureDialog(String dialogId) {
        return dialogRepository.findById(dialogId)
                .orElseThrow(() -> new ChatException(404, "CHAT_DIALOG_NOT_FOUND", "Dialog not found"));
    }

    private void validateRequest(ChatMessageRequest request) {
        if (request.getDialogId() == null || request.getDialogId().isBlank()) {
            throw new ChatException(400, "CHAT_INVALID_REQUEST", "dialogId is required");
        }
        if (request.getContent() == null || request.getContent().isBlank()) {
            throw new ChatException(400, "CHAT_INVALID_REQUEST", "content is required for text chat");
        }
        if (request.getContent().length() > 2000) {
            throw new ChatException(400, "CHAT_MESSAGE_TOO_LONG", "content is too long");
        }
    }

    private String defaultType(String type) {
        return type == null || type.isBlank() ? "text" : type;
    }

    private String nextMessageId() {
        return "msg_" + UUID.randomUUID().toString().replace("-", "");
    }

    private String nextDialogId() {
        return "dialog_" + UUID.randomUUID().toString().replace("-", "");
    }

    private String now() {
        return LocalDateTime.now(ZoneId.of("Asia/Shanghai")).format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);
    }

    public static class DuplicateMessageException extends RuntimeException {
        private final DialogMessageDTO existing;

        public DuplicateMessageException(DialogMessageDTO existing) {
            this.existing = existing;
        }

        public DialogMessageDTO getExisting() {
            return existing;
        }
    }
}
