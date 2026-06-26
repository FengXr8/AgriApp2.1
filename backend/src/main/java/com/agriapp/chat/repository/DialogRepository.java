package com.agriapp.chat.repository;

import com.agriapp.chat.dto.IntelligentDialogDTO;

import java.util.Optional;

public interface DialogRepository {

    IntelligentDialogDTO save(IntelligentDialogDTO dialog);

    Optional<IntelligentDialogDTO> findById(String dialogId);
}
