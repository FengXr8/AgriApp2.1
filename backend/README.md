# AgriApp Backend - Mock API Server

农业智能辅助系统后端 Mock API Server，用于前端开发阶段的数据模拟。

## 技术栈

- **Java**: 17
- **Spring Boot**: 3.2.0
- **构建工具**: Maven

## 当前阶段

> **MVP-0 阶段**：仅包含 Mock API，不接数据库、不接 AI、不做登录认证。

## 快速启动

### 前置条件

- JDK 17+
- Maven 3.6+

### 启动命令

```bash
cd backend

# 编译项目
mvn clean compile

# 运行项目
mvn spring-boot:run

# 或者打包后运行
mvn clean package -DskipTests
java -jar target/agriapp-backend-1.0.0-SNAPSHOT.jar
```

### 访问地址

- 后端服务地址: http://localhost:8080
- 健康检查: http://localhost:8080/api/health

## 已实现的 Mock API

### 1. 健康检查

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/health` | 健康检查 |

### 2. 用户/个人中心

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/profile` | 获取当前用户信息 |
| GET | `/api/profile/stats` | 获取用户统计数据 |

### 3. 作物管理

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/crops` | 获取作物列表 |
| GET | `/api/crops/{id}` | 获取作物详情 |
| POST | `/api/crops` | 创建新作物 |
| PUT | `/api/crops/{id}` | 更新作物信息 |
| DELETE | `/api/crops/{id}` | 删除作物 |

### 4. 种植日志

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/planting-logs` | 获取所有种植日志 |
| GET | `/api/planting-logs/crop/{cropId}` | 获取指定作物的种植日志 |
| POST | `/api/planting-logs` | 创建种植日志 |

### 5. 病虫害识别

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/recognitions` | 获取识别历史 |
| GET | `/api/recognitions/{id}` | 获取识别结果详情 |
| POST | `/api/recognitions/mock` | 模拟上传图片进行识别 |

### 6. 智能对话

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/chat/dialogs` | 创建新对话 |
| GET | `/api/chat/dialogs/{dialogId}/messages` | 获取对话消息历史 |
| POST | `/api/chat/messages` | 发送消息并获取 AI 回复 |

### 7. 气候信息

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/climate/current` | 获取当前天气信息 |
| GET | `/api/climate/farming-advice` | 获取农事建议 |

### 8. 任务提醒

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/tasks` | 获取任务列表 |
| GET | `/api/tasks/{id}` | 获取任务详情 |
| PATCH | `/api/tasks/{id}/status` | 更新任务状态 |

## API 响应格式

所有 API 统一使用以下响应格式：

```json
{
  "code": 200,
  "message": "success",
  "data": { ... },
  "timestamp": 1718515200000
}
```

## 项目结构

```
backend/
├── pom.xml                          # Maven 配置
├── src/main/java/com/agriapp/
│   ├── AgriAppApplication.java      # 应用入口
│   ├── common/                       # 公共模块
│   │   ├── ApiResponse.java         # 统一响应封装
│   │   └── HealthController.java    # 健康检查
│   ├── user/                         # 用户模块
│   │   ├── dto/
│   │   │   ├── UserDTO.java
│   │   │   └── UserStatsDTO.java
│   │   └── controller/
│   │       └── ProfileController.java
│   ├── crop/                         # 作物模块
│   │   ├── dto/
│   │   │   └── CropDTO.java
│   │   └── controller/
│   │       └── CropController.java
│   ├── plantinglog/                  # 种植日志模块
│   │   ├── dto/
│   │   │   └── PlantingLogDTO.java
│   │   └── controller/
│   │       └── PlantingLogController.java
│   ├── recognition/                  # 病虫害识别模块
│   │   ├── dto/
│   │   │   ├── RecognitionResultDTO.java
│   │   │   └── ControlSuggestionDTO.java
│   │   └── controller/
│   │       └── RecognitionController.java
│   ├── chat/                         # 智能对话模块
│   │   ├── dto/
│   │   │   ├── DialogMessageDTO.java
│   │   │   └── IntelligentDialogDTO.java
│   │   └── controller/
│   │       └── ChatController.java
│   ├── climate/                      # 气候信息模块
│   │   ├── dto/
│   │   │   ├── ClimateInfoDTO.java
│   │   │   └── FarmingSuggestionDTO.java
│   │   └── controller/
│   │       └── ClimateController.java
│   └── task/                         # 任务提醒模块
│       ├── dto/
│       │   └── TaskReminderDTO.java
│       └── controller/
│           └── TaskReminderController.java
└── src/main/resources/
    └── application.yml               # 应用配置
```

## 注意事项

1. **当前阶段限制**：
   - ❌ 不接数据库（数据存储在内存中，服务重启后数据丢失）
   - ❌ 不做登录认证
   - ❌ 不接真实 AI 服务（对话使用简单规则 Mock 回复）
   - ❌ 不做图片真实上传（识别接口为 Mock）

2. **数据持久化**：
   - 所有数据存储在内存中
   - 服务重启后 Mock 数据会重置为初始状态

3. **前端对接**：
   - 前端可配置 API Base URL 为 `http://localhost:8080`
   - 详细 API 契约请参考 `frontend/src/domain/api-contracts/API_CONTRACT.md`

## 下一步计划

- [ ] 接入 MySQL 数据库
- [ ] 实现用户认证与授权
- [ ] 接入真实 AI 服务
- [ ] 实现图片上传功能
- [ ] 考虑微服务架构拆分
