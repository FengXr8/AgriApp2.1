# API 契约草案

## 接口归属说明

### Spring Boot（业务服务）
- 用户管理
- 作物管理
- 种植日志管理
- 任务提醒管理
- 首页聚合数据

### FastAPI / AI Service（AI 服务）
- 病虫害识别
- AI 问答
- 语音识别
- 知识库匹配

---

## 一、用户管理（Spring Boot）

### 1.1 获取当前用户信息
- **方法**: GET
- **路径**: `/api/profile`
- **认证**: Bearer Token
- **响应**:
```json
{
  "id": "user_001",
  "phone": "138****8888",
  "role": "farmer",
  "status": "authenticated",
  "name": "农户",
  "avatar": "👨‍🌾",
  "plantingDays": 128,
  "level": "高级农户",
  "createdAt": "2025-01-15T10:00:00Z",
  "updatedAt": "2026-06-16T10:00:00Z"
}
```
- **错误**: 401 Unauthorized

### 1.2 用户登录
- **方法**: POST
- **路径**: `/api/users/login`
- **请求体**:
```json
{
  "phone": "13800138000",
  "password": "password123"
}
```
- **响应**:
```json
{
  "user": { /* User 对象 */ },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```
- **错误**: 400 Bad Request, 401 Unauthorized

### 1.3 用户登出
- **方法**: POST
- **路径**: `/api/users/logout`
- **认证**: Bearer Token
- **响应**: 204 No Content

### 1.4 获取用户统计数据
- **方法**: GET
- **路径**: `/api/profile/stats`
- **认证**: Bearer Token
- **响应**:
```json
{
  "cropCount": 3,
  "recognitionCount": 15,
  "checkInDays": 15,
  "likesCount": 28,
  "todayTasks": 3
}
```

---

## 二、作物管理（Spring Boot）

### 2.1 获取作物列表
- **方法**: GET
- **路径**: `/api/crops`
- **查询参数**: `userId` (可选)
- **认证**: Bearer Token
- **响应**:
```json
[
  {
    "id": "crop_001",
    "userId": "user_001",
    "name": "水稻",
    "variety": "籼稻",
    "plantingArea": 2.5,
    "plantDate": "2026-03-15",
    "harvestDate": "2026-07-20",
    "stage": "vegetative",
    "status": "planting",
    "icon": "🌾",
    "createdAt": "2026-03-15T08:00:00Z",
    "updatedAt": "2026-06-16T10:00:00Z"
  }
]
```

### 2.2 获取单个作物
- **方法**: GET
- **路径**: `/api/crops/{id}`
- **认证**: Bearer Token
- **响应**: Crop 对象
- **错误**: 404 Not Found

### 2.3 创建作物
- **方法**: POST
- **路径**: `/api/crops`
- **认证**: Bearer Token
- **请求体**:
```json
{
  "name": "小麦",
  "variety": "冬小麦",
  "plantingArea": 3.0,
  "plantDate": "2026-09-01",
  "harvestDate": "2027-06-01",
  "stage": "seedling",
  "icon": "🌾"
}
```
- **响应**: Crop 对象
- **错误**: 400 Bad Request

### 2.4 更新作物
- **方法**: PUT
- **路径**: `/api/crops/{id}`
- **认证**: Bearer Token
- **请求体**: 部分 Crop 字段
- **响应**: Crop 对象
- **错误**: 404 Not Found

### 2.5 删除作物
- **方法**: DELETE
- **路径**: `/api/crops/{id}`
- **认证**: Bearer Token
- **响应**: 204 No Content
- **错误**: 404 Not Found

---

## 三、种植日志管理（Spring Boot）

### 3.1 获取作物种植日志
- **方法**: GET
- **路径**: `/api/planting-logs/crop/{cropId}`
- **认证**: Bearer Token
- **响应**: PlantingLog 数组

### 3.2 创建种植日志
- **方法**: POST
- **路径**: `/api/planting-logs`
- **认证**: Bearer Token
- **请求体**:
```json
{
  "logType": "farming",
  "recordDate": "2026-06-16",
  "content": "今天给水稻施肥",
  "images": ["image-url-1", "image-url-2"]
}
```
- **响应**: PlantingLog 对象

---

## 四、任务提醒管理（Spring Boot）

### 4.1 获取任务列表
- **方法**: GET
- **路径**: `/api/tasks`
- **查询参数**: `userId` (可选), `status` (可选)
- **认证**: Bearer Token
- **响应**: TaskReminder 数组

### 4.2 更新任务状态
- **方法**: PATCH
- **路径**: `/api/tasks/{id}/status`
- **认证**: Bearer Token
- **请求体**:
```json
{
  "status": "completed"
}
```
- **响应**: TaskReminder 对象
- **错误**: 404 Not Found

---

## 五、病虫害识别（FastAPI / AI Service）

### 5.1 上传图片识别（Mock）
- **方法**: POST
- **路径**: `/api/recognitions/mock`
- **认证**: Bearer Token
- **Content-Type**: multipart/form-data
- **请求参数**:
  - `image`: 文件 (required)
  - `cropId`: string (optional)
- **响应**:
```json
{
  "id": "rec_001",
  "status": "processing"
}
```

### 5.2 获取识别结果
- **方法**: GET
- **路径**: `/api/recognitions/{id}`
- **认证**: Bearer Token
- **响应**:
```json
{
  "id": "rec_001",
  "userId": "user_001",
  "imageUri": "https://example.com/image.jpg",
  "status": "completed",
  "pestName": "番茄晚疫病",
  "confidence": "95%",
  "dangerLevel": "high",
  "createdAt": "2026-06-16T10:00:00Z"
}
```

### 5.3 获取防治建议
- **方法**: GET
- **路径**: `/api/recognitions/{id}/suggestion`
- **认证**: Bearer Token
- **响应**:
```json
{
  "id": "sug_001",
  "recognitionId": "rec_001",
  "pestName": "番茄晚疫病",
  "measures": ["及时清除病株", "喷洒药剂", "加强通风"],
  "medication": {
    "name": "甲基硫菌灵",
    "usage": "叶面喷洒",
    "dosage": "800倍液",
    "notes": "每隔7-10天喷一次"
  },
  "precautions": ["注意药剂轮换", "避免高温施药"],
  "createdAt": "2026-06-16T10:00:00Z"
}
```

### 5.4 获取识别历史
- **方法**: GET
- **路径**: `/api/recognitions`
- **查询参数**: `userId` (可选)
- **认证**: Bearer Token
- **响应**: RecognitionHistoryItem 数组

---

## 六、AI 问答（FastAPI / AI Service）

### 6.1 创建对话
- **方法**: POST
- **路径**: `/api/chat/dialogs`
- **认证**: Bearer Token
- **请求体**:
```json
{
  "roleType": "expert"
}
```
- **响应**: IntelligentDialog 对象

### 6.2 发送消息
- **方法**: POST
- **路径**: `/api/chat/dialogs/{dialogId}/messages`
- **认证**: Bearer Token
- **请求体**:
```json
{
  "content": "水稻叶子发黄怎么办？",
  "type": "text"
}
```
- **响应**:
```json
{
  "userMessage": { /* DialogMessage */ },
  "aiMessage": { /* DialogMessage */ }
}
```

### 6.3 获取对话历史
- **方法**: GET
- **路径**: `/api/chat/dialogs/{dialogId}/messages`
- **认证**: Bearer Token
- **响应**: DialogMessage 数组

---

## 七、语音识别（FastAPI / AI Service）

### 7.1 上传语音识别
- **方法**: POST
- **路径**: `/api/voice/upload`
- **认证**: Bearer Token
- **Content-Type**: multipart/form-data
- **请求参数**:
  - `voice`: 文件 (required)
  - `dialect`: string (optional)
- **响应**:
```json
{
  "id": "voice_001",
  "text": "今天适合施肥吗？",
  "dialect": "mandarin",
  "confidence": 0.95
}
```

### 7.2 语音转文本并匹配知识
- **方法**: POST
- **路径**: `/api/voice/recognize-and-match`
- **认证**: Bearer Token
- **请求体**: 同上
- **响应**:
```json
{
  "text": "今天适合施肥吗？",
  "matches": [
    {
      "knowledge": "施肥最佳时间",
      "relevance": 0.92,
      "content": "晴朗天气适合施肥..."
    }
  ]
}
```

---

## 八、气候信息（Spring Boot）

### 8.1 获取当前天气
- **方法**: GET
- **路径**: `/api/climate/current`
- **查询参数**: `city` (可选)
- **响应**:
```json
{
  "id": "climate_001",
  "province": "江苏省",
  "city": "南京市",
  "district": "江宁区",
  "longitude": 118.9074,
  "latitude": 31.9544,
  "address": "江苏省南京市江宁区",
  "date": "2026-06-17",
  "temperature": 26,
  "humidity": 65,
  "wind": "东南风 3级",
  "weatherType": "cloudy",
  "airQuality": "优",
  "solarTerm": "芒种",
  "createdAt": "2026-06-17T10:00:00Z"
}
```

### 8.2 获取农事建议
- **方法**: GET
- **路径**: `/api/climate/farming-advice`
- **查询参数**: `city` (可选), `cropType` (可选)
- **响应**: FarmingSuggestion 数组

---

## 九、首页聚合数据（Spring Boot）

### 9.1 获取首页数据
- **方法**: GET
- **路径**: `/api/home/dashboard`
- **认证**: Bearer Token
- **响应**:
```json
{
  "user": { /* User */ },
  "weather": { /* ClimateInfo */ },
  "recentCrops": [ /* Crop 列表 */ ],
  "recentLogs": [ /* PlantingLog 列表 */ ],
  "todayTasks": [ /* TaskReminder 列表 */ ],
  "farmingSuggestion": { /* FarmingSuggestion */ }
}
```

---

## 错误响应格式

```json
{
  "code": 404,
  "message": "资源未找到",
  "detail": "作物 crop_999 不存在",
  "timestamp": "2026-06-16T10:00:00Z"
}
```

## 状态码说明

| 状态码 | 含义 |
|--------|------|
| 200 | 请求成功 |
| 201 | 创建成功 |
| 204 | 删除/更新成功，无内容 |
| 400 | 请求参数错误 |
| 401 | 未认证 |
| 403 | 无权限 |
| 404 | 资源未找到 |
| 500 | 服务器内部错误 |