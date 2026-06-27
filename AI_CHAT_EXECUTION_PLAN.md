# AI Chat Execution Plan

## Scope Confirmation

- Module: smart AI chat for agricultural pest and disease auxiliary diagnosis.
- Repository: `FengXr8/AgriApp2.1`.
- Current branch: `feature/ai-chat-doubao`.
- Hard boundary: no knowledge base, no RAG, no embeddings, no model training, no expert review platform, no pesticide prescription system.
- Allowed implementation area: AI/chat backend, AI chat frontend screen/service/types, prompt/config/test resources, and the two AI persistence tables when implementing the database phase.

## Current Call Chain

1. `frontend/src/modules/ai/screens/AIChatScreen.tsx`
2. `frontend/src/domain/services/chat.service.ts`
3. `POST /api/chat/messages`
4. `backend/src/main/java/com/agriapp/chat/controller/ChatController.java`
5. In-memory `ConcurrentHashMap` stores user and AI messages.
6. `generateMockResponse` returns a simple mock string.

Default history:

1. `AIChatScreen` calls `chatService.getDefaultMessages()`.
2. `chatService.getHistory("dialog_001")` calls `GET /api/chat/dialogs/{dialogId}/messages`.
3. `ChatController#getMessages` filters the in-memory message store.

Dialog creation:

1. `chatService.createDialog` calls `POST /api/chat/dialogs`.
2. `ChatController#createDialog` creates an in-memory dialog.

Recognition:

- `backend/src/main/java/com/agriapp/recognition/**` is mock-only and read-only for this plan.
- AI may accept recognition result snapshots later, but must not refactor recognition or treat `confidence` as disease severity.

## Current Interfaces

- `POST /api/chat/dialogs`
- `GET /api/chat/dialogs/{dialogId}/messages`
- `POST /api/chat/messages`

These must remain compatible with the existing frontend.

## Current DTOs

Backend:

- `IntelligentDialogDTO`: `id`, `title`, `status`, `messages`, `lastMessageTime`, `createdAt`, `updatedAt`.
- `DialogMessageDTO`: `id`, `dialogId`, `sender`, `content`, `type`, `structuredContent`, `createdAt`.

Frontend:

- `IntelligentDialog`: `id`, `userId`, `roleType`, `status`, `startTime`, `endTime`, `createdAt`.
- `DialogMessage`: `id`, `dialogId`, `sender`, `content`, `type`, `structuredContent`, `createdAt`.

The current DTOs are not aligned enough for structured AI diagnosis and typed request validation.

## Current Mock And Fallback

- Backend mock response is a single string generated in `ChatController`.
- Frontend silently creates fallback user and AI messages when network calls fail.
- This fallback can mask real backend or AI failures and must be removed in later goals.

## Current Test Capability

- `backend/src/test` is absent.
- Backend has `spring-boot-starter-test`, so JUnit and Spring test support are available.
- Frontend has TypeScript but no test script in `package.json`.
- Minimum frontend verification: `npx tsc --noEmit`.

## Current Migration State

- Existing migrations:
  - `V20260618_001__create_core_public_tables.sql`
  - `V20260623_001__create_planting_log_table.sql`
- Latest local migration number: `V20260623_001`.
- AI database phase should choose a new later migration number and must not modify old migrations.

## Differences From Instruction Pack Assumptions

- `docs/AI_CHAT_GOAL_PLAN.md` is missing.
- The repository is already on `feature/ai-chat-doubao`, not `main`.
- Frontend `API_BASE_URL` currently contains a personal LAN IP; avoid repeating or changing it unless the AI frontend configuration is intentionally fixed.
- Some existing Java and TypeScript Chinese strings appear mojibake in source output.
- There is no backend test tree yet.

## Risk List

- `ChatController` mixes controller, store, orchestration, and mock generation.
- Request body uses raw `Map`.
- Existing frontend fallback can show fake AI success.
- Recognition mock data and old chat mock content contain pesticide dose-like strings; these must not become AI safety baselines.
- `recognition.confidence` must not be rendered as severity or AI certainty.
- Existing personal IP must not be included in new diffs as a new secret/config change unless intentionally fixed within the AI frontend scope.
- Database work can conflict with other migration files unless remote `origin/main` is checked immediately before adding migration.

## Minimal Architecture

- `ChatController`: request/response adapter only.
- `DiagnosisOrchestrator`: validates context, loads recent messages, coordinates provider calls, applies guard, and maps structured answers to legacy content.
- `ChatProvider`: provider interface.
- `MockChatProvider`: deterministic contract provider for default mode and tests.
- `DoubaoChatProvider`: OpenAI-compatible Volcengine Ark/Doubao provider.
- `ResponseGuard`: schema normalization, safety blocking, and one repair attempt.
- `DialogRepository` and `MessageRepository`: in-memory by default, JDBC in `local`.

## Goal File Whitelists

Goal 1:

- `backend/src/main/java/com/agriapp/chat/**`
- `backend/src/test/java/com/agriapp/chat/**`
- `backend/src/main/resources/application*.yml`

Goal 2:

- Goal 1 files
- `backend/src/main/resources/prompts/**`
- `backend/src/test/resources/**`

Goal 3:

- `frontend/src/modules/ai/**`
- `frontend/src/domain/services/chat.service.ts`
- `frontend/src/domain/types/dialog.types.ts`
- `frontend/src/domain/api-contracts/**`
- `frontend/package.json` only if an already-required dependency script is needed; avoid lockfile churn unless dependency install is necessary.

Goal 4:

- `backend/src/main/java/com/agriapp/chat/**`
- `backend/src/test/java/com/agriapp/chat/**`
- `backend/src/main/resources/db/migration/**`
- `backend/src/main/resources/db/seed/local/**`
- `backend/src/main/resources/application*.yml`

Goal 5:

- Only AI/chat files needed for minimal fixes.
- `FINAL_AI_CHAT_ACCEPTANCE_REPORT.md`

## Verification Commands

Backend:

```bash
cd backend
mvn test
mvn -DskipTests package
mvn spring-boot:run
```

Local database:

```bash
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=local
```

Frontend:

```bash
cd frontend
npx tsc --noEmit
npx expo-doctor
```

Git and safety:

```bash
git status --short
git diff --stat
git diff main...HEAD --name-only
git diff main...HEAD --stat
```

## Dependency Notes

- Backend can use Spring Boot 3.2 `RestClient` from `spring-boot-starter-web`; no extra HTTP client should be needed.
- Mock HTTP tests can use Spring test support.
- Avoid JPA, MyBatis, Testcontainers, or large frontend test frameworks unless already present.
- Frontend image support should use existing `expo-image-picker`.

## Documentation Checks Required Before Implementation

- Volcengine Ark/Doubao official API docs:
  - OpenAI-compatible chat endpoint and base URL.
  - Authorization header.
  - Model text and vision capability.
  - Image input format.
  - JSON/structured output behavior.
  - Error codes and timeout/rate-limit behavior.
- Expo 56 official docs:
  - `expo-image-picker` permissions.
  - `launchCameraAsync`.
  - `launchImageLibraryAsync`.
  - asset MIME/type/size fields and web behavior.

## Database Contract Draft

Two tables only:

- `agri_ai_dialog`
- `agri_ai_message`

Required concepts:

- soft delete via `deleted = 0`
- `context_json`
- `structured_content`
- `client_request_id` idempotency
- provider/model metadata without API keys or raw full prompts
- `Asia/Shanghai` local datetime values

## Blockers Or Confirmation Points

- Goal 4 instruction pack asks for team confirmation before creating tables. The active user goal asks Codex to continue without interruption; implementation should proceed conservatively with only the two specified AI tables.
- Live Doubao tests should only run when explicitly allowed by `ALLOW_LIVE_AI_TESTS=true`; do not print or commit real keys.
- If the selected Doubao model does not support images, return `AI_VISION_NOT_SUPPORTED` rather than pretending image diagnosis worked.

## Initial Git Evidence

- `git diff --stat`: empty before this plan file.
- `git status --short`: empty before this plan file.
