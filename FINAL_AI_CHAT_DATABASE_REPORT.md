# AgriApp2.1 智慧 AI 问答模块 MySQL 数据库交付报告

生成时间：2026-06-26 15:12（Asia/Shanghai）

## 1. 交付结论

已完成智慧 AI 问答模块的 MySQL 数据库交付核实与补全。当前实现通过 `local` profile 使用 MySQL/JdbcTemplate/Flyway 持久化，通过非 `local` profile 使用内存仓储，未扩展 AI prompt、前端页面或知识库能力。

最终验证结果：

- `mvn test`：15 tests, 0 failures, 0 errors, 0 skipped。
- Docker MySQL：`agriapp-mysql-local`，镜像 `mysql:8.0`，端口 `3307:3306`，命名卷 `agriapp_mysql_data`。
- Flyway：5 条迁移成功，当前版本 `20260626.001`。
- 重启持久化：停止并重启同一 MySQL 容器后，local profile 启动成功，Flyway 显示 schema up-to-date，数据保留。
- 收尾状态：MySQL 容器已停止，命名卷未删除。

## 2. 分支与远端检查

- 当前分支：`feature/ai-chat-doubao`，不是 `main`。
- 已执行 `git fetch origin`。
- `origin/main` 仅包含：
  - `V20260618_001__create_core_public_tables.sql`
  - `V20260623_001__create_planting_log_table.sql`
  - `R__seed_core_public_demo_data.sql`
- AI 数据库迁移与 seed 在 `origin/main` 上不存在同名冲突：
  - `V20260626_001__create_ai_chat_tables.sql`
  - `R__seed_ai_chat_demo_data.sql`

## 3. 数据库文件

已补齐/核实：

- `backend/src/main/resources/db/migration/V20260626_001__create_ai_chat_tables.sql`
- `backend/src/main/resources/db/seed/local/R__seed_ai_chat_demo_data.sql`
- `backend/src/main/resources/application-local.yml`

`application-local.yml` 使用环境变量，不写死本地密码：

```yaml
spring:
  datasource:
    url: ${AGRI_DB_URL:jdbc:mysql://localhost:3307/agri_app?useUnicode=true&characterEncoding=utf8&serverTimezone=Asia/Shanghai}
    username: ${AGRI_DB_USERNAME:agriapp}
    password: ${AGRI_DB_PASSWORD:}
```

## 4. 表结构验收

只新增/维护 AI 问答相关两张表：

- `agri_ai_dialog`
- `agri_ai_message`

最终字段核实：

- `agri_ai_dialog`：`id`、`user_id` nullable、`role_type`、`scene`、`title varchar(100)`、`status`、`context_json`、`last_message_at`、`created_at`、`updated_at`、`deleted`。
- `agri_ai_message`：`id`、`dialog_id`、`sender`、`message_type`、`content`、`structured_content`、`context_snapshot`、`recognition_snapshot`、`provider`、`model varchar(100)`、`prompt_version`、`client_request_id varchar(64)`、`created_at`、`updated_at`、`deleted`。

说明：`agri_ai_message` 的幂等唯一键采用 `(dialog_id, client_request_id, sender)`，用于允许同一个 clientRequestId 下同时保存 user 消息和 ai 回复，同时避免同一 dialog/sender 重复写入。

## 5. Repository/Profile 装配

已核实 profile 装配：

- `@Profile("local")`
  - `JdbcDialogRepository`
  - `JdbcMessageRepository`
- `@Profile("!local")`
  - `InMemoryDialogRepository`
  - `InMemoryMessageRepository`

四种组合结果：

- mock + mock：不启用 `local` profile，不依赖 DB，测试通过。
- mock + doubao：不启用 `local` profile，不依赖 DB，配置测试通过。
- local + mock：启用 MySQL 持久化，真实 DB 集成测试与 HTTP API 验证通过。
- local + doubao：启用 MySQL 持久化，数据库层同 local profile；未调用真实外部模型做扩展验证。

## 6. 持久化行为补全

已补齐：

- dialog 保存 `scene`、`context_json`。
- user message 保存 `context_snapshot`、`recognition_snapshot`、`updated_at`。
- ai message 保存 `structured_content`、`context_snapshot`、`recognition_snapshot`、`provider`、`model`、`prompt_version`、`updated_at`。
- message 查询映射返回 JSON 字段，API 可读。
- dialog/message ID 改为 UUID 风格，避免应用重启后从固定计数器开始造成持久化数据覆盖。
- 未在 AI 调用外包裹长事务；当前 orchestration 方法没有 `@Transactional`。

## 7. Docker MySQL 验证

创建/使用的本地数据库：

```powershell
docker run --name agriapp-mysql-local `
  -e MYSQL_ROOT_PASSWORD=<root-password> `
  -e MYSQL_DATABASE=agri_app `
  -e MYSQL_USER=agriapp `
  -e MYSQL_PASSWORD=<app-password> `
  -p 3307:3306 `
  -v agriapp_mysql_data:/var/lib/mysql `
  -d mysql:8.0
```

复用当前容器时可设置环境变量：

```powershell
$passwordKey = 'MYSQL_' + 'PASSWORD='
$passwordLine = docker inspect -f '{{range .Config.Env}}{{println .}}{{end}}' agriapp-mysql-local | Where-Object { $_.StartsWith($passwordKey) } | Select-Object -First 1
$env:AGRI_DB_PASSWORD = $passwordLine.Substring($passwordKey.Length)
$env:AGRI_DB_URL = 'jdbc:mysql://localhost:3307/agri_app?useUnicode=true&characterEncoding=utf8&serverTimezone=Asia/Shanghai'
$env:AGRI_DB_USERNAME = 'agriapp'
```

收尾已执行：

```powershell
docker stop agriapp-mysql-local
```

未执行删除容器/卷操作；`agriapp_mysql_data` 已保留。

## 8. Flyway 验证

首次 local profile 启动时验证：

- 创建 `flyway_schema_history`。
- 成功应用 5 条迁移。
- 当前版本达到 `20260626.001`。
- AI repeatable seed 成功执行。

重启后再次 local profile 启动：

- Flyway validate 成功。
- 显示 `Schema agri_app is up to date. No migration necessary.`
- seed 未失控重复。

## 9. 直接 DB 查询证据

首次 DB 验证后：

- `flyway_success_count = 5`
- `dialog_count = 2`
- `message_count = 5`
- `seed_dialog_001_count = 1`
- `seed_message_count = 3`

最终验证后：

- `flyway_success_count = 5`
- `dialog_count = 5`
- `message_count = 11`
- `seed_dialog_001_count = 1`
- `seed_message_count = 3`
- `api_dialog_count = 4`
- `soft_deleted_message_count = 3`

## 10. API CRUD/幂等验收

真实 HTTP 本地服务验证端口：`18080`。

验证结果：

- 创建 dialog：`code=200`，`scene=diagnosis`。
- 发送消息：`code=200`，返回 `sender=ai`。
- provider：`mock`。
- promptVersion：`agri-ai-v1`。
- 重复相同 `clientRequestId`：返回同一个 AI message id，未重复插入。
- 查询历史：返回 2 条当前对话消息。
- 缺失 dialog：`code=404`，`message=CHAT_DIALOG_NOT_FOUND`。

## 11. 自动化测试

新增：

- `backend/src/test/java/com/agriapp/chat/LocalMysqlChatPersistenceTest.java`

覆盖：

- local profile + mock provider 的数据库写入。
- dialog/message API 写入。
- history 顺序和软删过滤。
- `clientRequestId` 幂等。
- `contextSnapshot`、`recognitionSnapshot`、`structuredContent` JSON 映射。
- 缺失 dialog 显式错误。
- `last_message_at` 更新。

测试命令：

```powershell
mvn test
```

DB 集成测试命令：

```powershell
$env:AGRI_DB_TESTS = 'true'
$env:AGRI_DB_URL = 'jdbc:mysql://localhost:3307/agri_app?useUnicode=true&characterEncoding=utf8&serverTimezone=Asia/Shanghai'
$env:AGRI_DB_USERNAME = 'agriapp'
$env:AGRI_DB_PASSWORD = '<app-password>'
mvn -Dtest=LocalMysqlChatPersistenceTest test
```

最终全量测试：

```powershell
$env:AGRI_DB_TESTS = 'true'
mvn test
```

结果：15 tests, 0 failures, 0 errors, 0 skipped。

## 12. 安全与范围控制

- 未提交用户的豆包 API key。
- 未提交数据库真实密码。
- 报告和命令中只使用 `<app-password>`、`<root-password>` 占位符或本地安全提取方式。
- 未修改前端、AI prompt、知识库、外部模型能力。
- 安全扫描未发现 API key 或真实数据库密码进入仓库；命中的 `checkmark` 字符串为前端图标名假阳性。

## 13. 同事复现步骤

1. 准备 Java 17 与 Maven。
2. 启动 MySQL：

```powershell
docker start agriapp-mysql-local
```

如需新建：

```powershell
docker volume create agriapp_mysql_data
docker run --name agriapp-mysql-local `
  -e MYSQL_ROOT_PASSWORD=<root-password> `
  -e MYSQL_DATABASE=agri_app `
  -e MYSQL_USER=agriapp `
  -e MYSQL_PASSWORD=<app-password> `
  -p 3307:3306 `
  -v agriapp_mysql_data:/var/lib/mysql `
  -d mysql:8.0
```

3. 设置环境变量：

```powershell
$env:AGRI_DB_URL = 'jdbc:mysql://localhost:3307/agri_app?useUnicode=true&characterEncoding=utf8&serverTimezone=Asia/Shanghai'
$env:AGRI_DB_USERNAME = 'agriapp'
$env:AGRI_DB_PASSWORD = '<app-password>'
```

4. 启动本地服务：

```powershell
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=local -Dspring-boot.run.arguments="--agri.ai.provider=mock"
```

5. 运行测试：

```powershell
$env:AGRI_DB_TESTS = 'true'
mvn test
```

6. 验证后停止容器但保留数据：

```powershell
docker stop agriapp-mysql-local
```
