package com.agriapp.chat.controller;

import com.agriapp.chat.dto.ChatMessageRequest;
import com.agriapp.chat.dto.DialogMessageDTO;
import com.agriapp.chat.dto.IntelligentDialogDTO;
import com.agriapp.chat.exception.ChatException;
import com.agriapp.chat.service.DiagnosisOrchestrator;
import com.agriapp.common.ApiResponse;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final DiagnosisOrchestrator orchestrator;
    private final ObjectMapper objectMapper;

    public ChatController(DiagnosisOrchestrator orchestrator, ObjectMapper objectMapper) {
        this.orchestrator = orchestrator;
        this.objectMapper = objectMapper;
    }

    @PostMapping("/dialogs")
    public ApiResponse<IntelligentDialogDTO> createDialog(@RequestBody(required = false) Map<String, String> request) {
        String roleType = request == null ? null : request.get("roleType");
        return ApiResponse.success(orchestrator.createDialog(roleType));
    }

    @GetMapping("/dialogs/{dialogId}/messages")
    public ApiResponse<List<DialogMessageDTO>> getMessages(@PathVariable String dialogId) {
        try {
            return ApiResponse.success(orchestrator.getMessages(dialogId));
        } catch (ChatException e) {
            return ApiResponse.error(e.getHttpCode(), e.getErrorCode());
        }
    }

    @PostMapping("/messages")
    public ApiResponse<DialogMessageDTO> sendMessage(@RequestBody ChatMessageRequest request) {
        try {
            return ApiResponse.success(orchestrator.sendMessage(request));
        } catch (DiagnosisOrchestrator.DuplicateMessageException e) {
            return ApiResponse.success(e.getExisting());
        } catch (ChatException e) {
            return ApiResponse.error(e.getHttpCode(), e.getErrorCode());
        }
    }

    @PostMapping("/messages/multimodal")
    public ApiResponse<DialogMessageDTO> sendMultimodalMessage(
            @RequestPart("request") String requestJson,
            @RequestPart(value = "images", required = false) MultipartFile[] images
    ) {
        if (images != null && images.length > 0) {
            return ApiResponse.error(400, "AI_VISION_NOT_SUPPORTED");
        }
        try {
            ChatMessageRequest request = objectMapper.readValue(requestJson, ChatMessageRequest.class);
            return ApiResponse.success(orchestrator.sendMessage(request));
        } catch (JsonProcessingException e) {
            return ApiResponse.error(400, "CHAT_INVALID_REQUEST");
        } catch (DiagnosisOrchestrator.DuplicateMessageException e) {
            return ApiResponse.success(e.getExisting());
        } catch (ChatException e) {
            return ApiResponse.error(e.getHttpCode(), e.getErrorCode());
        }
    }
}
