-- 创建种植记录表
-- 为作物、地块、任务、病虫害识别等模块扩展预留字段

CREATE TABLE agri_planting_log (
    id VARCHAR(64) NOT NULL COMMENT '主键ID',
    user_id VARCHAR(64) NOT NULL COMMENT '所属用户ID',
    crop_id VARCHAR(64) NOT NULL COMMENT '关联作物ID',
    plot_id VARCHAR(64) NULL COMMENT '关联地块ID',
    crop_name VARCHAR(100) NULL COMMENT '作物名称冗余字段',
    log_type VARCHAR(32) NOT NULL DEFAULT 'growth' COMMENT '记录类型：growth生长观察，farming农事操作，disease病虫害，weather天气记录，harvest采收记录',
    record_date DATE NOT NULL COMMENT '记录日期',
    content TEXT NOT NULL COMMENT '记录内容',
    images_json TEXT NULL COMMENT '图片URL数组JSON字符串',
    source_type VARCHAR(32) NOT NULL DEFAULT 'manual' COMMENT '来源：manual手动，task任务生成，recognition识别生成，system系统生成',
    remark TEXT NULL COMMENT '备注',
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
    deleted TINYINT(1) NOT NULL DEFAULT 0 COMMENT '软删除标记：0未删除，1已删除',
    PRIMARY KEY (id),
    INDEX idx_agri_planting_log_user_id (user_id),
    INDEX idx_agri_planting_log_crop_id (crop_id),
    INDEX idx_agri_planting_log_plot_id (plot_id),
    INDEX idx_agri_planting_log_type_date_deleted (log_type, record_date, deleted),
    INDEX idx_agri_planting_log_source_type_deleted (source_type, deleted),
    INDEX idx_agri_planting_log_crop_deleted_date (crop_id, deleted, record_date),
    CONSTRAINT fk_agri_planting_log_user_id FOREIGN KEY (user_id) REFERENCES agri_user(id) ON DELETE RESTRICT,
    CONSTRAINT fk_agri_planting_log_crop_id FOREIGN KEY (crop_id) REFERENCES agri_crop(id) ON DELETE RESTRICT,
    CONSTRAINT fk_agri_planting_log_plot_id FOREIGN KEY (plot_id) REFERENCES agri_field_plot(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='种植记录表';