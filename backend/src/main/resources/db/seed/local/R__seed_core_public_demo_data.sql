-- 本地演示数据（Repeatable Migration）
-- 使用 INSERT IGNORE 实现幂等，重复执行不会报错

INSERT IGNORE INTO agri_user (id, phone, password_hash, name, avatar, role, status) VALUES
('user_001', '13800138000', NULL, '张三', '🌱', 'farmer', 'active');

INSERT IGNORE INTO agri_farm (id, user_id, name, province, city, district, address, longitude, latitude, area, area_unit, status) VALUES
('farm_001', 'user_001', '阳光农场', '广东省', '广州市', '白云区', 'XX街道XX号', 113.2644, 23.1291, 100.00, 'mu', 'active');

INSERT IGNORE INTO agri_field_plot (id, user_id, farm_id, name, area, area_unit, soil_type, status) VALUES
('plot_001', 'user_001', 'farm_001', '一号田', 50.00, 'mu', 'loam', 'active');

INSERT IGNORE INTO agri_crop (id, user_id, farm_id, plot_id, name, variety, planting_area, plant_date, expected_harvest_date, stage, status, icon, remark) VALUES
('crop_001', 'user_001', 'farm_001', 'plot_001', '水稻', '杂交水稻', 5.00, '2026-03-15', '2026-09-15', 'fruiting', 'normal', '🌾', '第一批水稻'),
('crop_002', 'user_001', 'farm_001', 'plot_001', '西红柿', '樱桃番茄', 2.00, '2026-05-01', '2026-08-15', 'vegetative', 'need_water', '🍅', '大棚西红柿');
