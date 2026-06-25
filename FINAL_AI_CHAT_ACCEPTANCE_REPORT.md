# Final AI Chat Acceptance Report

## Final Architecture

- `ChatController` is a thin HTTP adapter for existing chat endpoints plus `/api/chat/messages/multimodal`.
- `DiagnosisOrchestrator` owns validation, idempotency, provider calls, guard validation, message saving, and legacy text mapping.
- `ChatProvider` supports `mock` and `doubao`.
- `MockChatProvider` is deterministic and does not call external AI.
- `DoubaoChatProvider` uses Volcengine Ark/OpenAI-compatible chat completions and supports `two-pass` mode:
  1. observation extraction;
  2. differential diagnosis.
- `ResponseGuard` parses JSON, normalizes schema, limits candidates/questions, blocks unsafe language, and prevents fake success.
- Repositories are profile-based:
  - non-`local`: in-memory;
  - `local`: JdbcTemplate.

## Modified Files

- `AI_CHAT_EXECUTION_PLAN.md`
- `backend/src/main/java/com/agriapp/chat/**`
- `backend/src/main/resources/application.yml`
- `backend/src/main/resources/prompts/**`
- `backend/src/main/resources/db/migration/V20260626_001__create_ai_chat_tables.sql`
- `backend/src/main/resources/db/seed/local/R__seed_ai_chat_demo_data.sql`
- `backend/src/test/java/com/agriapp/chat/**`
- `frontend/src/modules/ai/screens/AIChatScreen.tsx`
- `frontend/src/domain/services/chat.service.ts`
- `frontend/src/domain/types/dialog.types.ts`
- `frontend/src/domain/types/index.ts`

## Unmodified Scope

- No crop, planting log, task, user, climate, recognition controller, navigation, public core table, or old migration files were modified.
- No knowledge base, RAG, embedding, model training, expert review platform, or pesticide prescription system was added.

## Configuration

- Default:
  - `AGRI_AI_PROVIDER=mock`
  - `AGRI_AI_DIAGNOSIS_MODE=two-pass`
- Doubao:
  - `AGRI_AI_PROVIDER=doubao`
  - `ARK_API_KEY`
  - `ARK_TEXT_MODEL` or `DOUBAO_MODEL`
  - `ARK_BASE_URL`, defaulting to `https://ark.cn-beijing.volces.com/api/v3`
- No real API key is committed.

## API

- Existing endpoints preserved:
  - `POST /api/chat/dialogs`
  - `GET /api/chat/dialogs/{dialogId}/messages`
  - `POST /api/chat/messages`
- Added:
  - `POST /api/chat/messages/multimodal`
- If images are sent before a controlled vision model is configured, the backend returns `AI_VISION_NOT_SUPPORTED`.

## Database

- Added only:
  - `agri_ai_dialog`
  - `agri_ai_message`
- Flyway migration is separate from local seed.
- Tables include soft delete, JSON structured content, client request idempotency, provider/model metadata, and Asia/Shanghai datetime fields.
- No API keys, Base64 images, or raw full model prompts are stored.

## Tests And Verification

- Backend:
  - `mvn test` passed.
  - `mvn -DskipTests package` passed.
  - Default mock jar startup smoke passed.
  - `mock` profile with `doubao` provider live smoke passed using environment variables only.
- Frontend:
  - `npx tsc --noEmit` passed.
  - `npx expo-doctor` passed, 21/21 checks.
- Safety scan:
  - No real API key, personal IP, or Base64 image data found in the AI-chat diff scope.
- Local profile:
  - Verified with a temporary MySQL 8.0.46 container on `localhost:3307`.
  - Flyway applied `V20260626_001__create_ai_chat_tables.sql`.
  - `agri_ai_dialog` and `agri_ai_message` exist.
  - Local seed inserted 1 dialog and 3 messages.
  - `GET /api/chat/dialogs/dialog_001/messages` returned 3 JDBC-backed messages.

## Behavior Evaluation

Covered by automated tests:

- information insufficient -> clarification questions;
- structured differential diagnosis -> max candidate shape with evidence;
- pesticide dose induction -> safety escalation, no fake dosage;
- invalid JSON -> explicit `AI_RESPONSE_INVALID`;
- unsafe wording -> explicit `AI_RESPONSE_BLOCKED`;
- duplicate `clientRequestId` -> existing AI message returned;
- missing dialog -> explicit `CHAT_DIALOG_NOT_FOUND`;
- `doubao` provider without key -> explicit `AI_PROVIDER_NOT_CONFIGURED`.
- live Doubao two-pass call -> structured `DIFFERENTIAL_DIAGNOSIS` with 3 candidates.

## Known Limitations

- Image upload UI and multipart transport are implemented, but backend vision diagnosis returns `AI_VISION_NOT_SUPPORTED` until a confirmed vision-capable model is configured.
- No expert-labeled disease dataset is included, so the module does not claim a real-world diagnostic accuracy percentage.

## Accuracy Statement

本模块通过输入质量控制、结构化问诊、两阶段分析和安全校验
提高病虫害辅助判断的可靠性，但没有专家标注测试集，
因此不对真实疾病识别准确率作百分比承诺。

## Demo Script

1. Start backend in default mock mode.
2. Open AI chat page.
3. Send a short vague question and confirm the AI asks follow-up questions.
4. Expand symptom context, enter crop and symptom details, then send again.
5. Confirm differential diagnosis cards show support evidence, conflict or pending evidence, and next checks.
6. Select an image and send; confirm the UI shows a real `AI_VISION_NOT_SUPPORTED` failure instead of fake image diagnosis.
7. Retry after removing the image.
8. Ask for pesticide dosage; confirm safety escalation and no dosage output.

## PR Description

## 目标

本 PR 完成智慧 AI 问答模块的 AI 基础架构、Doubao provider、结构化诊断、前端专业交互和最小持久化准备。

## 完成内容

- [x] 保持默认 Mock 模式
- [x] 未依赖 MySQL 才能启动
- [x] 未依赖豆包密钥才启动
- [x] 结构化农业回答
- [x] 信息不足追问
- [x] 差异诊断
- [x] 图片质量/视觉能力不足明确处理
- [x] 安全校验
- [x] 前端失败重试
- [x] 两张 AI 表

## 未修改

- [x] 未修改公共核心表
- [x] 未修改旧 migration
- [x] 未修改其他成员模块
- [x] 未修改全局导航
- [x] 未提交个人 IP
- [x] 未提交 API Key
- [x] 未建设知识库/RAG
- [x] 未训练模型

## 回滚方式

- Revert this AI-chat change set.
- Remove `V20260626_001__create_ai_chat_tables.sql` only if it has not been applied to a shared database.
