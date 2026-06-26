# MVP-0 Mock API 联调验收报告

## 1. 阶段结论

MVP-0 前后端 Mock API 联调验收通过。当前验收重点为核心页面的数据展示链路，即前端页面通过 domain service 请求 Spring Boot Mock API，并完成页面展示。部分写入类能力，如作物新增、编辑、删除，后端接口和 service 已具备，但页面级真实 API 联调留到下一阶段继续完善。

## 2. 已完成模块

* user.service.ts
* crop.service.ts
* climate.service.ts
* recognition.service.ts
* chat.service.ts
* task-reminder.service.ts

## 3. 每个模块对应接口

### user.service.ts

* GET /api/profile
* GET /api/profile/stats

### crop.service.ts

* GET /api/crops - 已完成页面验收
* GET /api/crops/{id} - 后端接口与 service 方法已具备，页面级详情联调留到下一阶段
* POST /api/crops - 后端接口与 service 方法已具备，页面新增联调留到下一阶段
* PUT /api/crops/{id} - 后端接口与 service 方法已具备，页面编辑联调留到下一阶段
* DELETE /api/crops/{id} - 后端接口与 service 方法已具备，页面删除联调留到下一阶段

### climate.service.ts

* GET /api/climate/current
* GET /api/climate/farming-advice

### recognition.service.ts

* GET /api/recognitions
* GET /api/recognitions/{id}
* POST /api/recognitions/mock

### chat.service.ts

* POST /api/chat/dialogs
* GET /api/chat/dialogs/{dialogId}/messages
* POST /api/chat/messages

### task-reminder.service.ts

* GET /api/tasks - 已完成页面验收，用于"我的页面"今日任务数量
* GET /api/tasks/{id} - 后端接口与 service 方法已具备，页面详情联调留到下一阶段
* PATCH /api/tasks/{id}/status - 后端接口与 service 方法已具备，页面状态更新联调留到下一阶段

## 4. 页面数据来源说明

### 首页

* climate.service.ts - 获取天气和农事建议
* crop.service.ts - 获取作物数量

### 作物管理

* crop.service.ts - 已完成作物列表获取联调（新增、编辑、删除的页面级真实 API 联调留到下一阶段）

### 病虫害识别

* recognition.service.ts - 识别上传和结果查询

### AI 问答

* chat.service.ts - 对话消息发送和历史获取

### 我的页面

* user.service.ts - 用户信息和统计数据
* taskReminderService.ts - 今日任务数量

## 5. 当前仍是 Mock 阶段，暂未实现

* 数据库持久化
* 真实登录认证
* JWT
* 真实 AI
* 真实图片上传
* 真实相机 / 相册 imageUri 获取
* 推送通知
* 完整任务列表页
* 完整农事记录页
* 作物详情 / 新增 / 编辑 / 删除的页面级真实 API 联调
* 任务详情 / 任务状态更新的页面级真实 API 联调

## 6. 下一阶段建议

### 第一优先级

* 真实相机 / 相册 imageUri 获取

### 第二优先级

* 真实图片上传 multipart/form-data

### 第三优先级

* 数据库持久化

### 第四优先级

* 登录认证 / 用户体系

### 第五优先级

* 真实 AI 识别 / AI 问答能力

## 7. 本次代码清理说明

### 删除的临时 console.log

* `[taskReminderService] API_BASE_URL`
* `[taskReminderService] fetching tasks...`
* `[taskReminderService] requesting...`
* `[taskReminderService] raw response...`
* `[taskReminderService] tasks data...`
* `[taskReminderService] converted task statuses...`
* `[taskReminderService] pending count in service...`
* `[taskReminderService] fetching task by id...`
* `[taskReminderService] updating task status...`

* `[cropService] API_BASE_URL`
* `[cropService] fetching crops...`
* `[cropService] requesting...`
* `[cropService] raw response...`
* `[cropService] result.data...`
* `[cropService] crops fetched successfully...`
* `[cropService] first crop...`
* `[cropService] first crop name...`
* `[cropService] fetching crop by id...`
* `[cropService] crop fetched...`
* `[cropService] adding crop...`
* `[cropService] crop added...`
* `[cropService] updating crop...`
* `[cropService] crop updated...`
* `[cropService] deleting crop...`
* `[cropService] crop deleted successfully...`

* `[chatService] API_BASE_URL`
* `[chatService] creating dialog...`
* `[chatService] requesting...`
* `[chatService] raw response...`
* `[chatService] response data...`
* `[chatService] sending message...`
* `[chatService] fetching messages...`
* `[chatService] fetching default messages...`

* `[recognitionService] API_BASE_URL`
* `[recognitionService] uploading image...`
* `[recognitionService] source...`
* `[recognitionService] requesting...`
* `[recognitionService] raw response...`
* `[recognitionService] mock upload successful...`
* `[recognitionService] fetching recognition result...`
* `[recognitionService] result data...`
* `[recognitionService] fetching suggestion for...`
* `[recognitionService] fetching recognition history...`
* `[recognitionService] recognition data...`
* `[recognitionService] history fetched successfully...`

* `[climateService] API_BASE_URL`
* `[climateService] fetching current climate...`
* `[climateService] requesting...`
* `[climateService] raw current response...`
* `[climateService] current climate data...`
* `[climateService] transformed climateInfo...`
* `[climateService] fetching farming advice...`
* `[climateService] raw advice response...`
* `[climateService] farming advice data...`

* `[userService] API_BASE_URL`
* `[userService] fetching profile...`
* `[userService] profile fetched successfully...`
* `[userService] fetching stats...`
* `[userService] stats fetched successfully...`

* `[CropScreen] before calling cropService.getCrops()`
* `[CropScreen] domainCrops names...`
* `[CropScreen] converted crops names...`

* `[DiseaseScreen] recognition source...`

* `[ProfileScreen] tasks from /api/tasks...`
* `[ProfileScreen] pending task count...`
* `[ProfileScreen render] pendingTaskCount...`

### 保留的 console.warn

* `[taskReminderService] unexpected response, using fallback`
* `[taskReminderService] request failed, using fallback`
* `[taskReminderService] task not found, using fallback`
* `[taskReminderService] update failed, using fallback`

* `[cropService] unexpected response, using fallback`
* `[cropService] request failed, using fallback`
* `[cropService] unexpected response, using mock`
* `[cropService] request failed, using mock`

* `[chatService] unexpected response, using fallback`
* `[chatService] request failed, using fallback`

* `[recognitionService] unexpected response, using fallback`
* `[recognitionService] request failed, using fallback`
* `[recognitionService] no suggestion found, using fallback`

* `[climateService] unexpected response, using fallback`
* `[climateService] request failed, using fallback`

* `[userService] unexpected response code, using fallback`
* `[userService] request failed, using fallback`

### 保留的 console.error

* `[HomeScreen] Failed to fetch data...`
* `[CropScreen] Failed to fetch crops...`
* `[DiseaseScreen] Failed to fetch crops...`
* `[DiseaseScreen] Recognition failed...`
* `[AIChatScreen] Send message failed...`
* `[ProfileScreen] Failed to fetch profile data...`
* `[ProfileScreen] Logout failed...`

## 8. 代码层检查结果

### 首页 HomeScreen.tsx ✓

* 使用 climate.service.ts 获取天气和农事建议 ✓
* 使用 crop.service.ts 获取作物数量 ✓
* 没有重新引入本地 mockCrops ✓
* 没有写死天气数据 ✓

### 作物管理 CropScreen.tsx ✓

* 使用 cropService.getCrops() ✓
* 没有使用 mockCrops ✓
* filteredCrops 已定义 ✓
* 作物列表渲染来自 crops state ✓
* crops state 来自 cropService.getCrops() 的结果 ✓
* 按 id 排序 ✓

### 病虫害识别 DiseaseScreen.tsx ✓

* 点击识别入口会调用 recognitionService ✓
* 当前仍然走 /api/recognitions/mock ✓
* 不接真实 AI ✓
* 不接真实图片上传 ✓
* 不新增 expo-image-picker ✓

### AIChatScreen.tsx ✓

* 默认消息来自 chat.service.ts ✓
* 发送消息调用 chat.service.ts ✓
* 没有 duplicate key 的固定 id 问题 ✓
* 没有 result.data.messages 错误解析 ✓
* 不接真实大模型 ✓

### ProfileScreen.tsx ✓

* 用户信息来自 userService.getCurrentUser() ✓
* 统计数据来自 userService.getUserStats() ✓
* 今日任务数量来自 taskReminderService.getTasks() ✓
* 今日任务卡片不再使用 stats.todayTasks ✓
* 不给 taskReminderService.getTasks() 传 userId ✓
* 当前阶段不处理 userId 不一致问题 ✓

## 9. 验收时间

* 验收日期：2026-06-17