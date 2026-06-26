package com.agriapp.chat.repository;

import com.agriapp.chat.dto.DialogMessageDTO;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Repository
@Profile("!local")
public class InMemoryMessageRepository implements MessageRepository {

    private final ConcurrentHashMap<String, DialogMessageDTO> messages = new ConcurrentHashMap<>();

    public InMemoryMessageRepository() {
        String now = now();
        DialogMessageDTO welcome = new DialogMessageDTO();
        welcome.setId("msg_001");
        welcome.setDialogId("dialog_001");
        welcome.setSender("ai");
        welcome.setType("text");
        welcome.setProvider("mock");
        welcome.setPromptVersion("agri-ai-v1");
        welcome.setContent("Hello, I am the agricultural diagnosis chat assistant. Please describe the crop, affected part, and symptom.");
        welcome.setCreatedAt(now);
        welcome.setUpdatedAt(now);
        messages.put(welcome.getId(), welcome);
    }

    @Override
    public DialogMessageDTO save(DialogMessageDTO message) {
        messages.put(message.getId(), message);
        return message;
    }

    @Override
    public List<DialogMessageDTO> findByDialogId(String dialogId) {
        return messages.values().stream()
                .filter(message -> dialogId.equals(message.getDialogId()))
                .sorted(Comparator.comparing(DialogMessageDTO::getCreatedAt).thenComparing(DialogMessageDTO::getId))
                .toList();
    }

    @Override
    public List<DialogMessageDTO> findRecent(String dialogId, int limit) {
        List<DialogMessageDTO> all = findByDialogId(dialogId);
        int from = Math.max(0, all.size() - limit);
        return all.subList(from, all.size());
    }

    @Override
    public Optional<DialogMessageDTO> findAiByClientRequestId(String dialogId, String clientRequestId) {
        if (clientRequestId == null || clientRequestId.isBlank()) {
            return Optional.empty();
        }
        return messages.values().stream()
                .filter(message -> dialogId.equals(message.getDialogId()))
                .filter(message -> "ai".equals(message.getSender()))
                .filter(message -> clientRequestId.equals(message.getClientRequestId()))
                .findFirst();
    }

    private String now() {
        return LocalDateTime.now(ZoneId.of("Asia/Shanghai")).format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);
    }
}
