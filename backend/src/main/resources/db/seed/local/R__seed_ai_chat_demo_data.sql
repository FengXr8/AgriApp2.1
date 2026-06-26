INSERT IGNORE INTO agri_ai_dialog
  (id, user_id, role_type, scene, title, status, context_json, last_message_at, created_at, updated_at, deleted)
VALUES
  ('dialog_001', 'user_001', 'expert', 'diagnosis', '农业病虫害辅助问答', 'active', NULL, '2026-06-26 09:00:00.000', '2026-06-26 09:00:00.000', '2026-06-26 09:00:00.000', 0);

INSERT IGNORE INTO agri_ai_message
  (id, dialog_id, sender, message_type, content, provider, model, prompt_version, client_request_id, context_snapshot, recognition_snapshot, structured_content, created_at, updated_at, deleted)
VALUES
  ('msg_ai_seed_001', 'dialog_001', 'ai', 'text',
   '你好，我是农业病虫害辅助问答助手。请描述作物、受害部位和症状，我会先帮你做初步排查。',
   'mock', 'mock-agri-diagnosis-v1', 'mock-v1', 'seed_welcome', NULL, NULL, NULL, '2026-06-26 09:00:00.000', '2026-06-26 09:00:00.000', 0),
  ('msg_user_seed_002', 'dialog_001', 'user', 'text',
   '番茄叶片出现褐色斑点，最近连续阴雨。',
   NULL, NULL, NULL, 'seed_user_002',
   JSON_OBJECT('cropName', '番茄', 'affectedPart', 'leaf', 'symptomDescription', '叶片出现褐色斑点', 'recentWeather', '连续阴雨'),
   NULL, NULL, '2026-06-26 09:01:00.000', '2026-06-26 09:01:00.000', 0),
  ('msg_ai_seed_003', 'dialog_001', 'ai', 'text',
   '当前只能做初步辅助判断。请补充叶片正反面照片、扩散速度和受害范围。',
   'mock', 'mock-agri-diagnosis-v1', 'mock-v1', 'seed_user_002',
   JSON_OBJECT('cropName', '番茄', 'affectedPart', 'leaf', 'symptomDescription', '叶片出现褐色斑点', 'recentWeather', '连续阴雨'),
   NULL,
   JSON_OBJECT(
     'schemaVersion', '1.0',
     'intent', 'PEST_DIAGNOSIS',
     'answerKind', 'CLARIFICATION',
     'summary', '目前证据不足，需要补充叶片正反面和扩散速度。',
     'evidenceSufficiency', 'insufficient',
     'imageQuality', JSON_OBJECT('level', 'not_applicable', 'issues', JSON_ARRAY(), 'retakeSuggestions', JSON_ARRAY()),
     'observations', JSON_ARRAY('番茄叶片褐色斑点', '近期连续阴雨'),
     'candidates', JSON_ARRAY(),
     'followUpQuestions', JSON_ARRAY('病斑是在老叶还是新叶先出现？', '叶背是否有霉层？', '扩散速度快吗？'),
     'actionsNow', JSON_ARRAY('先减少叶面长时间潮湿。'),
     'avoidActions', JSON_ARRAY('不要在病因未明时反复混用多种药剂。'),
     'monitoring', JSON_ARRAY('记录未来24小时病斑是否继续扩大。'),
     'seekExpert', JSON_OBJECT('required', false, 'reason', NULL),
     'safetyNotice', '本建议用于初步排查，不能替代现场农技诊断。'
   ),
   '2026-06-26 09:02:00.000', '2026-06-26 09:02:00.000', 0);
