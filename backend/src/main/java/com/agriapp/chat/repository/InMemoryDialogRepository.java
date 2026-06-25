package com.agriapp.chat.repository;

import com.agriapp.chat.dto.IntelligentDialogDTO;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Repository
@Profile("!local")
public class InMemoryDialogRepository implements DialogRepository {

    private final ConcurrentHashMap<String, IntelligentDialogDTO> dialogs = new ConcurrentHashMap<>();

    public InMemoryDialogRepository() {
        IntelligentDialogDTO dialog = new IntelligentDialogDTO();
        dialog.setId("dialog_001");
        dialog.setUserId("user_001");
        dialog.setRoleType("expert");
        dialog.setTitle("农业病虫害辅助问答");
        dialog.setStatus("active");
        String now = now();
        dialog.setStartTime(now);
        dialog.setCreatedAt(now);
        dialog.setUpdatedAt(now);
        dialog.setLastMessageTime(now.substring(11, 16));
        dialogs.put(dialog.getId(), dialog);
    }

    @Override
    public IntelligentDialogDTO save(IntelligentDialogDTO dialog) {
        dialogs.put(dialog.getId(), dialog);
        return dialog;
    }

    @Override
    public Optional<IntelligentDialogDTO> findById(String dialogId) {
        return Optional.ofNullable(dialogs.get(dialogId));
    }

    private String now() {
        return LocalDateTime.now(ZoneId.of("Asia/Shanghai")).format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);
    }
}
