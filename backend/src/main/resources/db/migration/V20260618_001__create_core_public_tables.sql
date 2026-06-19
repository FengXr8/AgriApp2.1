CREATE TABLE agri_user (
  id VARCHAR(64) NOT NULL COMMENT '主键ID',
  phone VARCHAR(32) NULL COMMENT '手机号，唯一索引',
  password_hash VARCHAR(255) NULL COMMENT '密码哈希',
  name VARCHAR(64) NOT NULL COMMENT '用户昵称',
  avatar VARCHAR(500) NULL COMMENT '头像URL或emoji',
  role VARCHAR(32) NOT NULL DEFAULT 'farmer' COMMENT '角色：farmer农户，admin管理员，expert专家',
  status VARCHAR(32) NOT NULL DEFAULT 'active' COMMENT '状态：active启用，disabled禁用',
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
  deleted TINYINT(1) NOT NULL DEFAULT 0 COMMENT '软删除标记：0未删除，1已删除',
  PRIMARY KEY (id),
  UNIQUE KEY uk_agri_user_phone (phone),
  INDEX idx_agri_user_role_status_deleted (role, status, deleted)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='用户表';

CREATE TABLE agri_farm (
  id VARCHAR(64) NOT NULL COMMENT '主键ID',
  user_id VARCHAR(64) NOT NULL COMMENT '所属用户ID',
  name VARCHAR(100) NOT NULL COMMENT '农场名称',
  province VARCHAR(64) NULL COMMENT '省份',
  city VARCHAR(64) NULL COMMENT '城市',
  district VARCHAR(64) NULL COMMENT '区县',
  address VARCHAR(255) NULL COMMENT '详细地址',
  longitude DECIMAL(10,7) NULL COMMENT '经度',
  latitude DECIMAL(10,7) NULL COMMENT '纬度',
  area DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT '农场面积',
  area_unit VARCHAR(32) NOT NULL DEFAULT 'mu' COMMENT '面积单位：mu亩，hectare公顷，square_meter平方米',
  status VARCHAR(32) NOT NULL DEFAULT 'active' COMMENT '状态：active启用，inactive停用',
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
  deleted TINYINT(1) NOT NULL DEFAULT 0 COMMENT '软删除标记：0未删除，1已删除',
  PRIMARY KEY (id),
  INDEX idx_agri_farm_user_id (user_id),
  INDEX idx_agri_farm_status_deleted_created_at (status, deleted, created_at),
  CONSTRAINT fk_agri_farm_user_id FOREIGN KEY (user_id) REFERENCES agri_user(id) ON DELETE RESTRICT
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='农场表';

CREATE TABLE agri_field_plot (
  id VARCHAR(64) NOT NULL COMMENT '主键ID',
  user_id VARCHAR(64) NOT NULL COMMENT '所属用户ID',
  farm_id VARCHAR(64) NOT NULL COMMENT '所属农场ID',
  name VARCHAR(100) NOT NULL COMMENT '地块名称',
  area DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT '地块面积',
  area_unit VARCHAR(32) NOT NULL DEFAULT 'mu' COMMENT '面积单位：mu亩，hectare公顷，square_meter平方米',
  soil_type VARCHAR(32) NOT NULL DEFAULT 'unknown' COMMENT '土壤类型：loam壤土，clay粘土，sandy沙土，unknown未知',
  status VARCHAR(32) NOT NULL DEFAULT 'active' COMMENT '状态：active启用，inactive停用',
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
  deleted TINYINT(1) NOT NULL DEFAULT 0 COMMENT '软删除标记：0未删除，1已删除',
  PRIMARY KEY (id),
  INDEX idx_agri_field_plot_user_id (user_id),
  INDEX idx_agri_field_plot_farm_id (farm_id),
  INDEX idx_agri_field_plot_status_deleted_created_at (status, deleted, created_at),
  CONSTRAINT fk_agri_field_plot_user_id FOREIGN KEY (user_id) REFERENCES agri_user(id) ON DELETE RESTRICT,
  CONSTRAINT fk_agri_field_plot_farm_id FOREIGN KEY (farm_id) REFERENCES agri_farm(id) ON DELETE RESTRICT
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='地块表';

CREATE TABLE agri_crop (
  id VARCHAR(64) NOT NULL COMMENT '主键ID',
  user_id VARCHAR(64) NOT NULL COMMENT '所属用户ID',
  farm_id VARCHAR(64) NOT NULL COMMENT '所属农场ID',
  plot_id VARCHAR(64) NOT NULL COMMENT '所属地块ID',
  name VARCHAR(100) NOT NULL COMMENT '作物名称',
  variety VARCHAR(100) NULL COMMENT '品种',
  planting_area DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT '种植面积',
  plant_date DATE NOT NULL COMMENT '种植日期',
  expected_harvest_date DATE NULL COMMENT '预计收获日期',
  stage VARCHAR(32) NOT NULL DEFAULT 'seedling' COMMENT '生长阶段：seedling幼苗，vegetative营养生长，flowering开花，fruiting结果，mature成熟',
  status VARCHAR(32) NOT NULL DEFAULT 'normal' COMMENT '状态：normal正常，need_water需要浇水，need_fertilize需要施肥，pest_risk病虫害风险，ended已结束',
  icon VARCHAR(32) NULL COMMENT '图标emoji',
  remark TEXT NULL COMMENT '备注',
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
  deleted TINYINT(1) NOT NULL DEFAULT 0 COMMENT '软删除标记：0未删除，1已删除',
  PRIMARY KEY (id),
  INDEX idx_agri_crop_user_id (user_id),
  INDEX idx_agri_crop_farm_id (farm_id),
  INDEX idx_agri_crop_plot_id (plot_id),
  INDEX idx_agri_crop_stage_status_deleted_created_at (stage, status, deleted, created_at),
  CONSTRAINT fk_agri_crop_user_id FOREIGN KEY (user_id) REFERENCES agri_user(id) ON DELETE RESTRICT,
  CONSTRAINT fk_agri_crop_farm_id FOREIGN KEY (farm_id) REFERENCES agri_farm(id) ON DELETE RESTRICT,
  CONSTRAINT fk_agri_crop_plot_id FOREIGN KEY (plot_id) REFERENCES agri_field_plot(id) ON DELETE RESTRICT
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='作物表';