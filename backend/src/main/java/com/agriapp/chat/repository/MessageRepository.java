package com.agriapp.chat.repository;

import com.agriapp.chat.dto.DialogMessageDTO;

import java.util.List;
import java.util.Optional;

public interface MessageRepository {

    DialogMessageDTO save(DialogMessageDTO message);

    List<DialogMessageDTO> findByDialogId(String dialogId);

    List<DialogMessageDTO> findRecent(String dialogId, int limit);

    Optional<DialogMessageDTO> findAiByClientRequestId(String dialogId, String clientRequestId);
}
