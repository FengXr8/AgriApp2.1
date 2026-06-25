CREATE TABLE agri_ai_dialog (
  id VARCHAR(64) NOT NULL COMMENT 'AI dialog primary key',
  user_id VARCHAR(64) NOT NULL COMMENT 'User id snapshot',
  role_type VARCHAR(32) NOT NULL DEFAULT 'expert' COMMENT 'Dialog role type',
  title VARCHAR(120) NOT NULL COMMENT 'Dialog title',
  status VARCHAR(32) NOT NULL DEFAULT 'active' COMMENT 'Dialog status',
  context_json JSON NULL COMMENT 'Latest structured diagnosis context',
  last_message_at DATETIME(3) NULL COMMENT 'Last message time in Asia/Shanghai',
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'Created time in Asia/Shanghai',
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT 'Updated time in Asia/Shanghai',
  deleted TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Soft delete flag',
  PRIMARY KEY (id),
  INDEX idx_agri_ai_dialog_user_status_deleted (user_id, status, deleted),
  INDEX idx_agri_ai_dialog_last_message_deleted (last_message_at, deleted)
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
  provider VARCHAR(32) NULL COMMENT 'mock or doubao',
  model VARCHAR(128) NULL COMMENT 'Model id or mock model name',
  client_request_id VARCHAR(120) NULL COMMENT 'Client idempotency key',
  context_json JSON NULL COMMENT 'User supplied structured context snapshot',
  recognition_snapshot_json JSON NULL COMMENT 'Recognition result snapshot used only as a clue',
  structured_content JSON NULL COMMENT 'Validated structured answer for AI messages',
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'Created time in Asia/Shanghai',
  deleted TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Soft delete flag',
  PRIMARY KEY (id),
  UNIQUE KEY uk_agri_ai_message_request_sender (dialog_id, client_request_id, sender),
  INDEX idx_agri_ai_message_dialog_deleted_created (dialog_id, deleted, created_at, id),
  INDEX idx_agri_ai_message_provider_created (provider, created_at),
  CONSTRAINT fk_agri_ai_message_dialog_id FOREIGN KEY (dialog_id) REFERENCES agri_ai_dialog(id) ON DELETE RESTRICT
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='AI chat message table';
