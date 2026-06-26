
## 1. 规范目的

本规范用于统一 AgriApp 团队在数据库设计、建表、字段命名、数据类型、主键生成、时间字段、时区、软删除、唯一约束、外键、索引、JSON 字段、Flyway 迁移、种子数据、前后端字段映射和安全存储方面的规则。

所有团队成员在新增表、修改表、编写 SQL、开发后端 DTO、编写前端 TypeScript 类型、设计接口字段时，都应遵守本规范。

本规范适用于项目任意阶段，包括：

```text
MVP 阶段
功能扩展阶段
多人协作阶段
测试阶段
上线前重构阶段
后续维护阶段
```

---

# 2. 数据库建设原则

## 2.1 分阶段建设

数据库不应一次性创建所有未来可能用到的表。

推荐原则：

```text
先建公共核心表
再建当前功能表
最后补充扩展表
```

每张新表都必须服务于明确的当前业务功能，不为了“未来可能用到”而提前创建复杂表。

## 2.2 先字段契约，后建表

任何新表创建前，必须先输出字段契约表。

字段契约表格式：

|数据库字段|后端 DTO|前端 TS|类型|必填|默认值|示例值|说明|
|---|---|---|---|---|---|---|---|

确认字段契约后，再生成 SQL。

## 2.3 禁止个人随意改库

团队成员不得直接在 Navicat、DataGrip、MySQL Workbench 中手动修改共享数据库结构。

所有结构变更必须通过 Flyway migration 提交到代码仓库。

---

# 3. 命名规范

## 3.1 表名规范

所有业务表统一使用项目业务前缀：

```text
agri_业务名
```

正确示例：

```text
agri_user
agri_farm
agri_field_plot
agri_task_reminder
agri_chat_message
```

错误示例：

```text
user
farm
task
message
```

## 3.2 表名大小写

表名统一使用小写字母和下划线。

正确示例：

```text
agri_task_reminder
agri_sensor_reading
```

错误示例：

```text
AgriTaskReminder
agriTaskReminder
AGRI_TASK_REMINDER
```

## 3.3 数据库字段命名

数据库字段统一使用 snake_case。

正确示例：

```text
user_id
farm_id
created_at
updated_at
record_date
task_status
```

错误示例：

```text
userId
farmId
createdAt
updatedAt
recordDate
taskStatus
```

## 3.4 后端字段命名

后端 Java DTO / Request / Response 字段统一使用 camelCase。

正确示例：

```text
userId
farmId
createdAt
updatedAt
recordDate
taskStatus
```

## 3.5 前端字段命名

前端 TypeScript 类型字段统一使用 camelCase。

正确示例：

```text
userId
farmId
createdAt
updatedAt
recordDate
taskStatus
```

## 3.6 字段映射规则

数据库、后端、前端字段必须一一对应。

|数据库字段|后端 DTO|前端 TS|
|---|---|---|
|`user_id`|`userId`|`userId`|
|`farm_id`|`farmId`|`farmId`|
|`record_date`|`recordDate`|`recordDate`|
|`created_at`|`createdAt`|`createdAt`|
|`updated_at`|`updatedAt`|`updatedAt`|

---

# 4. 主键与 ID 生成规范

## 4.1 主键字段

所有业务表主键统一命名为：

```text
id
```

推荐类型：

```sql
id VARCHAR(64) NOT NULL COMMENT '主键ID'
```

不建议使用：

```text
user_id 作为用户表主键
task_id 作为任务表主键
record_id 作为记录表主键
```

## 4.2 ID 生成位置

业务主键 ID 必须由后端统一生成。

前端不得在新增数据时传入 `id` 作为数据库主键。

错误示例：

```json
{
  "id": "task_001",
  "title": "浇水任务"
}
```

正确示例：

```json
{
  "title": "浇水任务"
}
```

后端收到新增请求后统一生成 ID。

## 4.3 ID 格式

推荐格式：

```text
业务前缀 + "_" + 全局唯一 ID
```

示例：

```text
user_xxxxx
farm_xxxxx
plot_xxxxx
crop_xxxxx
task_xxxxx
log_xxxxx
msg_xxxxx
```

## 4.4 推荐生成方式

第一阶段推荐使用以下任一种方式，并由后端统一封装：

```text
业务前缀 + "_" + NanoID
业务前缀 + "_" + UUID 简化版
业务前缀 + "_" + 雪花 ID
```

正式业务新增时，不允许继续使用手工递增固定编号。

禁止正式业务使用：

```text
user_001
user_002
user_003
```

## 4.5 种子数据例外

本地开发种子数据允许使用固定 ID：

```text
user_001
farm_001
plot_001
crop_001
task_001
```

这些固定 ID 仅用于本地联调和演示数据。

---

# 5. 通用字段规范

除特殊日志表、字典表、中间表外，核心业务表推荐包含：

```text
id
created_at
updated_at
deleted
```

MVP 阶段不强制包含：

```text
created_by
updated_by
deleted_at
version
```

## 5.1 创建时间 created_at

所有核心业务表必须包含：

```sql
created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间'
```

后端新增时不需要手动传 `created_at`。

## 5.2 更新时间 updated_at

所有核心业务表必须包含：

```sql
updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间'
```

后端更新时不需要手动维护 `updated_at`。

## 5.3 软删除 deleted

核心业务表统一使用软删除：

```sql
deleted TINYINT(1) NOT NULL DEFAULT 0 COMMENT '软删除标记：0未删除，1已删除'
```

所有业务查询默认必须过滤：

```sql
WHERE deleted = 0
```

## 5.4 删除时间 deleted_at

如果业务需要记录删除时间，可以增加：

```sql
deleted_at DATETIME(3) NULL COMMENT '删除时间'
```

MVP 阶段不强制。

## 5.5 审计人字段 created_by / updated_by

MVP 阶段不强制包含：

```text
created_by
updated_by
```

原因：

```text
用户认证体系可能尚未稳定
登录/JWT 可能尚未接入
提前加入会产生大量空值或占位值
```

建议在登录体系稳定后，再统一评估是否补充。

## 5.6 乐观锁 version

如果存在多人同时编辑、审批流、状态流转等场景，可以增加：

```sql
version BIGINT NOT NULL DEFAULT 0 COMMENT '乐观锁版本号'
```

MVP 阶段不强制。

---

# 6. 数据类型规范

## 6.1 字符串类型

短文本使用 `VARCHAR`。

推荐长度：

|场景|类型|
|---|---|
|主键 ID|`VARCHAR(64)`|
|手机号|`VARCHAR(32)`|
|名称|`VARCHAR(100)`|
|状态/类型/枚举|`VARCHAR(32)`|
|URL/图片地址|`VARCHAR(500)`|
|简短说明|`VARCHAR(500)`|

## 6.2 长文本类型

较长内容使用：

```sql
TEXT
```

适用场景：

```text
文章正文
AI 回复内容
详细描述
长备注
```

## 6.3 数值类型

金额、面积、经纬度、测量值等使用 `DECIMAL`，不建议使用 `FLOAT`。

推荐：

```sql
DECIMAL(10,2)
DECIMAL(10,6)
DECIMAL(12,4)
```

示例：

```text
面积：DECIMAL(10,2)
经纬度：DECIMAL(10,6)
传感器数值：DECIMAL(12,4)
```

## 6.4 布尔类型

MySQL 中统一使用：

```sql
TINYINT(1)
```

示例：

```sql
deleted TINYINT(1) NOT NULL DEFAULT 0
enabled TINYINT(1) NOT NULL DEFAULT 1
```

## 6.5 DATE 类型

只表示日期时使用：

```sql
DATE
```

示例：

```text
record_date
start_date
end_date
```

## 6.6 DATETIME 类型

表示具体时间点时使用：

```sql
DATETIME(3)
```

示例：

```text
created_at
updated_at
completed_at
reminder_time
published_at
```

## 6.7 JSON 类型

复杂原始数据可以使用：

```sql
JSON
```

适用场景：

```text
第三方接口原始返回
AI 模型原始结果
天气快照
多图片列表
扩展配置
```

不建议将核心查询字段放入 JSON。

---

# 7. NULL 与默认值规范

## 7.1 必填字段

业务创建时必须提供的字段应设置为：

```sql
NOT NULL
```

例如：

```text
id
name
status
created_at
updated_at
deleted
```

## 7.2 可选字段

非必填字段允许：

```sql
NULL
```

例如：

```text
avatar
description
remark
image_url
completed_at
```

## 7.3 常见默认值

推荐：

```sql
status VARCHAR(32) NOT NULL DEFAULT 'active'
deleted TINYINT(1) NOT NULL DEFAULT 0
created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
```

## 7.4 禁止无默认值的 NOT NULL 时间字段

禁止：

```sql
created_at DATETIME(3) NOT NULL
updated_at DATETIME(3) NOT NULL
```

必须写成：

```sql
created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
```

---

# 8. 日期、时间与时区规范

## 8.1 MVP 统一时区

MVP 阶段统一使用：

```text
Asia/Shanghai
```

即：

```text
数据库按北京时间保存
后端按 Asia/Shanghai 处理
前端展示北京时间
```

不允许同一项目中混用 UTC、北京时间、浏览器本地时间。

## 8.2 JDBC 时区配置

MySQL 连接必须显式配置：

```text
serverTimezone=Asia/Shanghai
```

示例：

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3307/agriapp?useUnicode=true&characterEncoding=utf8&serverTimezone=Asia/Shanghai
```

说明：

```text
serverTimezone=Asia/Shanghai 与项目统一时区保持一致。
如果未来全项目切换为 UTC，需要同步调整 JDBC URL、后端时间处理和接口返回格式。
```

## 8.3 数据库时间类型

数据库统一使用：

```sql
DATETIME(3)
```

说明：

```text
DATETIME 不携带时区信息。
因此项目规范必须明确它表示 Asia/Shanghai 时间。
```

## 8.4 后端时间类型

Java 后端统一使用：

```text
LocalDate
LocalDateTime
```

映射规则：

```text
DATE -> LocalDate
DATETIME(3) -> LocalDateTime
```

不建议在业务 DTO 中混用：

```text
Date
Timestamp
Instant
ZonedDateTime
```

除非有明确转换规则。

## 8.5 DATE 接口格式

数据库 DATE 字段，前端传给后端时统一使用：

```text
YYYY-MM-DD
```

正确示例：

```text
2026-06-18
```

禁止：

```text
2026/06/18
2026-06-18T00:00:00.000Z
6月18日
空字符串
undefined
```

## 8.6 DATETIME 接口格式

接口统一返回：

```text
yyyy-MM-dd'T'HH:mm:ss
```

示例：

```text
2026-06-18T20:30:00
```

DATE 字段返回：

```text
yyyy-MM-dd
```

示例：

```text
2026-06-18
```

## 8.7 禁止混用 Z 时间

如果项目统一按 Asia/Shanghai 保存和展示，则接口中不要随意返回：

```text
2026-06-18T12:30:00.000Z
```

除非接口文档明确说明该字段为 UTC。

---

# 9. 枚举字段规范

## 9.1 枚举保存语言

数据库和接口统一保存英文枚举值。

前端负责将英文枚举显示为中文。

禁止数据库保存中文枚举。

错误示例：

```text
正常
已完成
高优先级
病虫害风险
```

正确示例：

```text
normal
completed
high
pest_risk
```

## 9.2 枚举字段类型

第一阶段枚举字段统一使用：

```sql
VARCHAR(32)
```

不建议第一阶段使用 MySQL ENUM。

原因：

```text
后续扩展枚举值更方便
避免改表成本过高
便于前后端统一管理
```

## 9.3 枚举字典管理

每个枚举字段必须有字典说明。

字典说明格式：

|字段|英文值|中文显示|说明|
|---|---|---|---|
|`status`|`active`|启用|数据可正常使用|
|`status`|`disabled`|禁用|数据不可使用|

## 9.4 枚举值生命周期

枚举值可以新增，但一旦被业务数据引用，禁止直接删除。

如需停用，使用 disabled 状态代替。

前端新增和编辑时不展示 disabled 枚举值，但历史数据仍需能正常显示。

---

# 10. 软删除规范

## 10.1 默认删除方式

核心业务数据默认使用软删除。

删除时执行：

```sql
UPDATE table_name SET deleted = 1 WHERE id = ?
```

如果有 `deleted_at` 字段，则同时更新：

```sql
deleted_at = CURRENT_TIMESTAMP(3)
```

## 10.2 查询规则

所有业务查询默认必须加：

```sql
deleted = 0
```

## 10.3 软删除与唯一索引

软删除表中的唯一字段必须提前明确是否允许复用。

### A 类：身份类唯一字段

身份类字段即使数据软删除，也不允许复用。

示例：

```text
phone
email
username
external_open_id
```

MVP 阶段规定：

```text
phone 全局唯一，即使用户被软删除，也不允许重新注册同一手机号。
```

推荐索引：

```sql
UNIQUE KEY uk_agri_user_phone (phone)
```

说明：

```text
软删除用户后，手机号仍被历史数据占用。
如需重新使用，应恢复原用户，而不是创建新用户。
```

### B 类：业务编码类唯一字段

业务编码类字段是否允许复用，由模块决定。

示例：

```text
farm_code
plot_code
device_code
task_code
```

MVP 推荐：

```text
业务编码类字段优先使用业务层校验 active 数据唯一。
```

新增时由后端检查：

```sql
SELECT COUNT(*) FROM table_name
WHERE parent_id = ?
AND code = ?
AND deleted = 0;
```

如果存在，则不允许新增。

## 10.4 不推荐默认使用 UNIQUE(parent_id, code, deleted)

以下方案需要谨慎：

```sql
UNIQUE KEY uk_table_parent_code_deleted (parent_id, code, deleted)
```

原因：

```text
该方案通常只能保证一条 deleted = 0 和一条 deleted = 1 不冲突。
如果同一个 code 多次创建、删除，可能在第二次软删除时与历史 deleted = 1 数据冲突。
```

如果未来强烈要求“软删除后允许多次复用同一编码”，应单独设计。

---

# 11. 外键规范

## 11.1 外键使用原则

核心关系表可以使用外键，但不建议过度使用外键，尤其是功能尚未稳定的早期模块。

推荐：

```text
公共核心关系可以加外键
高频变化模块谨慎加外键
日志类、历史类、第三方结果类可以弱关联
```

## 11.2 删除规则

默认使用：

```sql
ON DELETE RESTRICT
```

不建议默认使用：

```sql
ON DELETE CASCADE
```

原因：

```text
避免误删主数据时级联删除大量业务数据
便于保留历史记录
便于排查问题
```

## 11.3 外键不能阻止软删除

数据库外键只能阻止物理删除，不能阻止如下操作：

```sql
UPDATE parent_table SET deleted = 1 WHERE id = ?
```

因此，软删除父级数据前，后端必须检查是否存在未删除的子级数据。

## 11.4 父级软删除前校验

软删除父级数据前，必须检查：

```sql
SELECT COUNT(*) FROM child_table
WHERE parent_id = ?
AND deleted = 0;
```

如果存在未删除子级数据，则禁止删除或要求先处理子级数据。

## 11.5 推荐后端处理流程

软删除必须由 Service 层处理。

推荐流程：

```text
Controller
  -> Service 检查子级数据
  -> Service 判断是否允许删除
  -> Repository 执行 UPDATE deleted = 1
```

Controller 不直接调用 Repository 删除。

---

# 12. 索引规范

## 12.1 主键索引

所有表必须有主键索引：

```sql
PRIMARY KEY (id)
```

## 12.2 不机械添加 deleted 单列索引

`deleted` 字段只有 0/1，区分度低。

除非有明确查询场景，不建议只机械添加：

```sql
INDEX idx_table_deleted (deleted)
```

## 12.3 推荐组合索引

应根据实际业务查询设计组合索引。

常见推荐：

```sql
INDEX idx_table_user_deleted_created_at (user_id, deleted, created_at)
INDEX idx_table_parent_deleted_created_at (parent_id, deleted, created_at)
INDEX idx_table_status_deleted_created_at (status, deleted, created_at)
INDEX idx_table_type_deleted_created_at (type, deleted, created_at)
```

## 12.4 外键字段索引

所有外键字段必须建立索引。

示例：

```sql
INDEX idx_table_user_id (user_id)
INDEX idx_table_farm_id (farm_id)
INDEX idx_table_crop_id (crop_id)
```

## 12.5 长字符串索引

对较长的 `VARCHAR` 字段建立索引时，应评估索引长度。

如必须对长字符串建立索引，可以使用前缀索引：

```sql
INDEX idx_table_name (name(100))
INDEX idx_table_url (url(150))
```

推荐前缀长度：

```text
VARCHAR(255)：可考虑 100 或 150
VARCHAR(500)：可考虑 150 或 200
```

具体长度根据业务查询场景确定。

## 12.6 不建议索引超长文本

不建议直接对以下字段建立普通索引：

```text
TEXT
JSON
VARCHAR(500) URL
长 description
长 content
```

如需全文检索，应单独评估全文索引或搜索服务。

---

# 13. 分页查询规范

## 13.1 分页请求参数

项目所有分页接口统一使用：

```text
page
pageSize
```

规则：

```text
page 从 1 开始
pageSize 表示每页条数
```

示例：

```http
GET /api/tasks?page=1&pageSize=20
```

不使用：

```text
offset / limit
current / size
pageNo / pageSize
```

## 13.2 默认值

后端默认：

```text
page = 1
pageSize = 20
```

建议限制：

```text
pageSize 最大不超过 100
```

## 13.3 分页响应格式

分页响应统一返回：

```json
{
  "page": 1,
  "pageSize": 20,
  "total": 100,
  "list": []
}
```

## 13.4 默认排序

分页查询必须明确排序字段，不允许依赖数据库自然顺序。

默认推荐：

```sql
ORDER BY created_at DESC
```

不建议默认使用：

```sql
ORDER BY id DESC
```

除非项目明确使用时间有序 ID，例如雪花 ID。

## 13.5 高频分页索引

高频分页查询应建立组合索引。

推荐：

```sql
INDEX idx_table_user_deleted_created_at (user_id, deleted, created_at)
INDEX idx_table_parent_deleted_created_at (parent_id, deleted, created_at)
INDEX idx_table_status_deleted_created_at (status, deleted, created_at)
```

---

# 14. 唯一约束规范

## 14.1 唯一字段

确实不能重复的字段，应加唯一索引。

示例：

```sql
UNIQUE KEY uk_table_phone (phone)
UNIQUE KEY uk_table_code (code)
```

## 14.2 可为空唯一字段

MySQL 允许唯一索引中存在多个 NULL。

因此手机号、邮箱等字段可以先允许 NULL，同时加唯一索引。

## 14.3 联合唯一约束

同一父级下不能重复的编码或名称，可以使用联合唯一索引。

示例：

```sql
UNIQUE KEY uk_table_parent_code (parent_id, code)
```

但如果表使用软删除，必须结合第 10 章规则判断是否允许复用。

---

# 15. JSON 字段规范

## 15.1 JSON 适用场景

JSON 字段适合保存：

```text
第三方接口原始返回
AI 模型原始结果
天气快照
多图片列表
扩展配置
非高频查询的附加信息
```

## 15.2 JSON 禁止保存的内容

JSON 字段中不应包含任何需要作为以下用途的数据：

```text
查询条件
排序字段
筛选字段
统计维度
外键关联字段
权限判断字段
状态流转字段
```

禁止把以下字段放入 JSON：

```text
user_id
farm_id
crop_id
status
type
created_at
record_date
priority
deleted
```

## 15.3 判断标准

如果一个字段需要用于：

```text
WHERE 查询
ORDER BY 排序
GROUP BY 统计
JOIN 关联
权限过滤
列表筛选
```

它就必须独立成列，不能放进 JSON。

---

# 16. 多表 JOIN 查询规范

## 16.1 JOIN 查询必须避免字段冲突

多表 JOIN 时，如果不同表存在相同字段名，例如：

```text
id
name
status
created_at
updated_at
deleted
```

SQL 查询必须使用别名。

错误示例：

```sql
SELECT
  u.id,
  f.id,
  u.status,
  f.status
FROM agri_user u
JOIN agri_farm f ON f.user_id = u.id;
```

正确示例：

```sql
SELECT
  u.id AS user_id,
  u.name AS user_name,
  u.status AS user_status,
  f.id AS farm_id,
  f.name AS farm_name,
  f.status AS farm_status
FROM agri_user u
JOIN agri_farm f ON f.user_id = u.id;
```

## 16.2 JOIN 查询使用专用 DTO

JOIN 查询不建议直接复用单表 DTO。

推荐建立专门 Response DTO，例如：

```text
FarmWithUserDTO
TaskWithCropDTO
LogWithCropDTO
```

避免前端收到含义不清的 `status`、`name`、`id` 字段。

---

# 17. 批量操作事务规范

## 17.1 默认事务策略

批量新增、批量更新、批量删除默认应在一个事务中执行。

默认规则：

```text
要么全部成功
要么全部失败并回滚
```

适用场景：

```text
批量新增任务
批量更新任务状态
批量软删除数据
批量导入农事记录
批量绑定设备
```

## 17.2 后端事务控制

后端 Service 层必须使用事务控制，例如 Spring：

```java
@Transactional
```

## 17.3 部分成功规则

如果某个接口允许部分成功，必须在接口文档中明确说明，并返回每条数据的处理结果。

响应示例：

```json
{
  "successCount": 8,
  "failCount": 2,
  "results": [
    {
      "id": "task_xxx",
      "success": true
    },
    {
      "id": "task_yyy",
      "success": false,
      "errorMessage": "任务不存在"
    }
  ]
}
```

如果接口文档没有特别说明，则默认采用全部成功或全部回滚。

---

# 18. 字符集、排序规则与注释规范

## 18.1 字符集

所有表统一使用：

```sql
DEFAULT CHARSET=utf8mb4
```

## 18.2 排序规则

所有表统一使用：

```sql
COLLATE=utf8mb4_unicode_ci
```

## 18.3 存储引擎

所有业务表统一使用：

```sql
ENGINE=InnoDB
```

## 18.4 表注释

所有业务表必须添加表注释。

示例：

```sql
CREATE TABLE agri_example (
  ...
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='示例业务表';
```

## 18.5 字段注释

所有字段必须添加 COMMENT。

示例：

```sql
name VARCHAR(100) NOT NULL COMMENT '名称',
status VARCHAR(32) NOT NULL DEFAULT 'active' COMMENT '状态：active启用，disabled禁用',
created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
deleted TINYINT(1) NOT NULL DEFAULT 0 COMMENT '软删除标记：0未删除，1已删除'
```

## 18.6 枚举字段注释

枚举字段注释必须写明可选值。

正确示例：

```sql
status VARCHAR(32) NOT NULL DEFAULT 'active'
  COMMENT '状态：active启用，disabled禁用'
```

错误示例：

```sql
status VARCHAR(32) NOT NULL COMMENT '状态'
```

---

# 19. Flyway 迁移规范

## 19.1 所有数据库变更必须走 Flyway

包括：

```text
建表
改表
加字段
删字段
加索引
改索引
插入基础数据
修改基础数据
```

## 19.2 文件命名格式

统一使用：

```text
V日期_序号__描述.sql
```

示例：

```text
V20260618_001__create_core_tables.sql
V20260618_002__add_task_table.sql
V20260618_003__alter_user_add_email.sql
```

## 19.3 禁止修改已执行 migration

已经被团队数据库执行过的 migration 不允许修改。

错误做法：

```text
修改 V20260618_001__create_core_tables.sql
```

正确做法：

```text
新增 V20260618_004__alter_xxx.sql
```

## 19.4 本地开发例外

个人本地数据库如果没有重要数据，可以删除重建。

但团队共享库、测试库、生产库禁止随意 drop。

---

# 20. Seed 数据环境规范

## 20.1 结构迁移和演示数据分离

生产结构迁移脚本应放在：

```text
db/migration
```

本地演示数据不得与生产 migration 放在同一执行路径。

禁止把本地演示 seed 直接放进生产默认执行目录：

```text
db/migration
```

## 20.2 推荐目录结构

推荐：

```text
src/main/resources/db/migration
src/main/resources/db/seed/local
src/main/resources/db/seed/test
```

说明：

```text
db/migration：结构迁移，所有环境执行
db/seed/local：本地开发演示数据，仅 local profile 执行
db/seed/test：测试环境数据，仅 test profile 执行
```

## 20.3 Flyway locations 按环境配置

生产环境只允许：

```yaml
spring:
  config:
    activate:
      on-profile: prod
  flyway:
    locations:
      - classpath:db/migration
```

本地环境可以额外配置：

```yaml
spring:
  config:
    activate:
      on-profile: local
  flyway:
    locations:
      - classpath:db/migration
      - classpath:db/seed/local
```

测试环境可以配置：

```yaml
spring:
  config:
    activate:
      on-profile: test
  flyway:
    locations:
      - classpath:db/migration
      - classpath:db/seed/test
```

## 20.4 生产环境禁止演示数据

生产环境 migration 禁止包含：

```text
演示账号
演示农场
演示地块
演示作物
测试手机号
测试密码
测试 token
本地调试数据
```

## 20.5 种子数据要求

种子数据必须满足：

```text
主键稳定
外键关系正确
不包含真实用户隐私
不包含密钥
不包含生产数据
```

---

# 21. 接口数据规范

## 21.1 请求字段

前端请求后端时，统一使用 camelCase。

示例：

```json
{
  "userId": "user_xxxxx",
  "recordDate": "2026-06-18",
  "status": "active"
}
```

不要在接口 JSON 中使用 snake_case。

## 21.2 响应字段

后端响应前端时，统一使用 camelCase。

示例：

```json
{
  "id": "xxx_xxxxx",
  "createdAt": "2026-06-18T10:30:00",
  "updatedAt": "2026-06-18T10:30:00"
}
```

## 21.3 数据库字段转换

后端 Repository / Mapper 负责数据库 snake_case 与 DTO camelCase 的转换。

---

# 22. 安全规范

## 22.1 密码字段

密码禁止明文存储。

统一字段：

```text
password_hash
```

密码必须由后端加密后保存。

## 22.2 敏感信息

数据库中禁止保存：

```text
明文密码
API 密钥
token
私钥
支付密钥
第三方平台密钥
```

如确需保存敏感配置，应使用加密存储或配置中心。

## 22.3 用户隐私

涉及手机号、邮箱、地址等字段时，应避免在日志中直接输出完整信息。

---

# 23. SQL 编写示例

推荐建表格式：

```sql
CREATE TABLE agri_example (
  id VARCHAR(64) NOT NULL COMMENT '主键ID',
  user_id VARCHAR(64) NOT NULL COMMENT '所属用户ID',
  name VARCHAR(100) NOT NULL COMMENT '名称',
  status VARCHAR(32) NOT NULL DEFAULT 'active' COMMENT '状态：active启用，disabled禁用',
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
  deleted TINYINT(1) NOT NULL DEFAULT 0 COMMENT '软删除标记：0未删除，1已删除',
  PRIMARY KEY (id),
  INDEX idx_agri_example_user_deleted_created_at (user_id, deleted, created_at)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='示例业务表';
```

---

# 24. 数据库评审清单

任何数据库变更提交前，必须检查：

```text
1. 表名是否以 agri_ 开头？
2. 表名是否使用小写和下划线？
3. 字段名是否使用 snake_case？
4. 是否有 id 主键？
5. ID 是否由后端生成？
6. 是否禁止前端新增时传入 id？
7. 是否有 created_at？
8. created_at 是否有默认值？
9. 是否有 updated_at？
10. updated_at 是否有默认值和自动更新时间？
11. 是否有 deleted？
12. deleted 是否默认 0？
13. 是否存在中文枚举入库？
14. 枚举字段 COMMENT 是否写明可选值？
15. 枚举值是否有生命周期管理规则？
16. 日期字段是否明确 DATE / DATETIME？
17. DATE 接口格式是否为 YYYY-MM-DD？
18. DATETIME 接口格式是否统一？
19. JDBC URL 是否指定 serverTimezone=Asia/Shanghai？
20. 外键是否必要？
21. 是否误用了 ON DELETE CASCADE？
22. 父级软删除前是否有子级数据校验？
23. 外键字段是否有索引？
24. 是否机械添加了低价值 deleted 单列索引？
25. 是否根据查询场景设计组合索引？
26. 分页接口是否统一使用 page 和 pageSize？
27. 分页响应是否包含 total 和 list？
28. 分页查询是否明确 ORDER BY created_at DESC？
29. JOIN 查询是否处理字段名冲突？
30. 批量操作是否明确事务边界？
31. 软删除表中的唯一索引是否明确复用规则？
32. phone 等身份字段是否规定软删除后不可复用？
33. JSON 字段中是否包含应独立成列的查询字段？
34. 是否有表 COMMENT？
35. 是否有字段 COMMENT？
36. 表字符集是否为 utf8mb4？
37. 排序规则是否为 utf8mb4_unicode_ci？
38. 是否通过 Flyway 管理？
39. 是否修改了已执行 migration？
40. 本地 demo seed 是否与生产 migration 分离？
41. 生产 Flyway locations 是否只包含 db/migration？
42. 是否包含敏感信息？
43. 是否影响其他成员模块？
44. 是否提供字段契约表？
```

---

# 25. 团队协作规则

1. 新增表前必须先提交字段契约。
    
2. 新增枚举前必须写明英文值和中文显示。
    
3. 新增外键前必须说明业务必要性。
    
4. 修改核心表前必须通知相关成员。
    
5. 已经多人使用的字段不能随意改名。
    
6. 已执行 migration 不能直接修改。
    
7. 共享数据库不能手动改结构。
    
8. 所有成员必须使用同一套数据库字段和接口字段。
    
9. 前端显示可以中文，数据库和接口必须英文。
    
10. 当前模块未稳定前，不提前创建过多未来表。
    
11. 批量操作默认事务内全部成功或全部回滚。
    
12. 本地演示数据不得进入生产 migration。
    
13. 生产环境不得插入演示账号和演示业务数据。
    

---

# 26. 最终原则

数据库设计优先保证：

```text
清晰
稳定
可维护
可扩展
前后端一致
团队协作成本低
```

不要追求一开始就“大而全”。

每次新增表或字段，都应回答：

```text
这个字段现在是否真的需要？
前端是否会用？
后端是否会处理？
数据库是否容易维护？
其他成员是否会受影响？
未来扩展是否清晰？
```