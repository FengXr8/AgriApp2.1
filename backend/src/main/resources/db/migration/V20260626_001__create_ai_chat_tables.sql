CREATE TABLE agri_ai_dialog (
  id VARCHAR(64) NOT NULL COMMENT 'AI dialog primary key',
  user_id VARCHAR(64) NULL COMMENT 'User id snapshot',
  role_type VARCHAR(32) NOT NULL DEFAULT 'expert' COMMENT 'Dialog role type for legacy API compatibility',
  scene VARCHAR(32) NOT NULL DEFAULT 'diagnosis' COMMENT 'AI chat scene',
  title VARCHAR(100) NOT NULL COMMENT 'Dialog title',
  status VARCHAR(32) NOT NULL DEFAULT 'active' COMMENT 'Dialog status',
  context_json JSON NULL COMMENT 'Latest structured diagnosis context',
  last_message_at DATETIME(3) NULL COMMENT 'Last message time in Asia/Shanghai',
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'Created time in Asia/Shanghai',
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT 'Updated time in Asia/Shanghai',
  deleted TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Soft delete flag',
  PRIMARY KEY (id),
  INDEX idx_ai_dialog_user_deleted_last (user_id, deleted, last_message_at),
  INDEX idx_ai_dialog_id_deleted (id, deleted)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='AI chat dialog table';

CREATE TABLE agri_ai_message (
  id VARCHAR(64) NOT NULL COMMENT 'AI message primary key',
  dialog_id VARCHAR(64) NOT NULL COMMENT 'AI dialog id',
  sender VARCHAR(32) NOT NULL COMMENT 'user or ai',
  message_type VARCHAR(32) NOT NULL DEFAULT 'text' COMMENT 'Message type',
  content TEXT NOT NULL COMMENT 'Legacy display content',
  structured_content JSON NULL COMMENT 'Validated structured answer for AI messages',
  context_snapshot JSON NULL COMMENT 'User supplied structured context snapshot',
  recognition_snapshot JSON NULL COMMENT 'Recognition result snapshot used only as a clue',
  provider VARCHAR(32) NULL COMMENT 'mock or doubao',
  model VARCHAR(100) NULL COMMENT 'Model id or mock model name',
  prompt_version VARCHAR(32) NULL COMMENT 'Prompt version used by AI provider',
  client_request_id VARCHAR(64) NULL COMMENT 'Client idempotency key',
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'Created time in Asia/Shanghai',
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT 'Updated time in Asia/Shanghai',
  deleted TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Soft delete flag',
  PRIMARY KEY (id),
  UNIQUE KEY uk_ai_message_client_request (dialog_id, client_request_id, sender),
  INDEX idx_ai_message_dialog_deleted_created (dialog_id, deleted, created_at),
  INDEX idx_ai_message_provider_created (provider, created_at),
  CONSTRAINT fk_agri_ai_message_dialog_id FOREIGN KEY (dialog_id) REFERENCES agri_ai_dialog(id) ON DELETE RESTRICT
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='AI chat message table';
