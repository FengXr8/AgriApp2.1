package com.agriapp.chat.controller;

import com.agriapp.chat.dto.DialogMessageDTO;
import com.agriapp.chat.dto.IntelligentDialogDTO;
import com.agriapp.common.ApiResponse;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

/**
 * 智能对话 Mock API 控制器
 */
@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final ConcurrentHashMap<String, IntelligentDialogDTO> dialogStore = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, DialogMessageDTO> messageStore = new ConcurrentHashMap<>();
    private final AtomicLong dialogIdGenerator = new AtomicLong(6);
    private final AtomicLong messageIdGenerator = new AtomicLong(100);

    public ChatController() {
        initMockData();
    }

    private void initMockData() {
        // 创建默认对话
        IntelligentDialogDTO dialog = new IntelligentDialogDTO();
        dialog.setId("dialog_001");
        dialog.setTitle("水稻种植咨询");
        dialog.setStatus("active");
        dialog.setCreatedAt("2026-06-16T08:00:00Z");
        dialog.setUpdatedAt("2026-06-16T10:30:00Z");
        dialog.setLastMessageTime("10:30");
        dialogStore.put(dialog.getId(), dialog);

        // 对话消息
        DialogMessageDTO msg1 = new DialogMessageDTO();
        msg1.setId("msg_001");
        msg1.setDialogId("dialog_001");
        msg1.setSender("ai");
        msg1.setContent("你好，我是农业助手，有什么可以帮你的？");
        msg1.setType("text");
        msg1.setCreatedAt("2026-06-16T08:00:00Z");
        messageStore.put(msg1.getId(), msg1);

        DialogMessageDTO msg2 = new DialogMessageDTO();
        msg2.setId("msg_002");
        msg2.setDialogId("dialog_001");
        msg2.setSender("user");
        msg2.setContent("水稻叶子发黄怎么办？");
        msg2.setType("text");
        msg2.setCreatedAt("2026-06-16T08:05:00Z");
        messageStore.put(msg2.getId(), msg2);

        DialogMessageDTO msg3 = new DialogMessageDTO();
        msg3.setId("msg_003");
        msg3.setDialogId("dialog_001");
        msg3.setSender("ai");
        msg3.setContent("水稻叶子发黄可能有以下原因：\n\n1. **缺氮肥**：表现为老叶先黄，可追施尿素每亩5-8公斤\n2. **缺水**：土壤干旱导致叶片卷曲发黄，及时灌溉\n3. **病害**：如稻瘟病、叶枯病等，可用三环唑防治\n4. **缺钾**：叶尖发黄，可喷施磷酸二氢钾\n\n建议先观察叶片发黄的具体位置和症状，再针对性处理。");
        msg3.setType("text");
        Map<String, Object> structured = new HashMap<>();
        structured.put("suggestions", Arrays.asList("查看水稻缺素症图谱", "预约专家诊断"));
        msg3.setStructuredContent(structured);
        msg3.setCreatedAt("2026-06-16T08:06:00Z");
        messageStore.put(msg3.getId(), msg3);

        dialog.setMessages(Arrays.asList(msg1, msg2, msg3));
    }

    /**
     * 创建新对话
     */
    @PostMapping("/dialogs")
    public ApiResponse<IntelligentDialogDTO> createDialog() {
        String newId = "dialog_" + dialogIdGenerator.getAndIncrement();
        IntelligentDialogDTO dialog = new IntelligentDialogDTO();
        dialog.setId(newId);
        dialog.setTitle("新对话");
        dialog.setStatus("active");
        dialog.setCreatedAt("2026-06-16T10:00:00Z");
        dialog.setUpdatedAt("2026-06-16T10:00:00Z");
        dialog.setLastMessageTime("10:00");
        dialogStore.put(newId, dialog);
        return ApiResponse.success(dialog);
    }

    /**
     * 获取对话历史消息
     */
    @GetMapping("/dialogs/{dialogId}/messages")
    public ApiResponse<List<DialogMessageDTO>> getMessages(@PathVariable String dialogId) {
        List<DialogMessageDTO> messages = messageStore.values().stream()
                .filter(msg -> dialogId.equals(msg.getDialogId()))
                .sorted(Comparator.comparing(DialogMessageDTO::getCreatedAt))
                .collect(Collectors.toList());
        return ApiResponse.success(messages);
    }

    /**
     * 发送消息
     */
    @PostMapping("/messages")
    public ApiResponse<DialogMessageDTO> sendMessage(@RequestBody Map<String, String> request) {
        String dialogId = request.get("dialogId");
        String content = request.get("content");
        String type = request.getOrDefault("type", "text");

        // 使用当前时间戳确保唯一性
        String timestamp = java.time.Instant.now().toString();

        // 保存用户消息
        String msgId = "msg_" + messageIdGenerator.getAndIncrement();
        DialogMessageDTO userMsg = new DialogMessageDTO();
        userMsg.setId(msgId);
        userMsg.setDialogId(dialogId);
        userMsg.setSender("user");
        userMsg.setContent(content);
        userMsg.setType(type);
        userMsg.setCreatedAt(timestamp);
        messageStore.put(msgId, userMsg);

        // 更新对话
        IntelligentDialogDTO dialog = dialogStore.get(dialogId);
        if (dialog != null) {
            dialog.setLastMessageTime(java.time.LocalTime.now().toString().substring(0, 5));
            dialog.setUpdatedAt(timestamp);
        }

        // 生成 AI 回复
        String aiMsgId = "msg_" + messageIdGenerator.getAndIncrement();
        DialogMessageDTO aiMsg = new DialogMessageDTO();
        aiMsg.setId(aiMsgId);
        aiMsg.setDialogId(dialogId);
        aiMsg.setSender("ai");
        aiMsg.setType("text");

        // 简单的 Mock 回复
        String aiResponse = generateMockResponse(content);
        aiMsg.setContent(aiResponse);

        if (content.contains("施肥")) {
            Map<String, Object> structured = new HashMap<>();
            structured.put("suggestions", Arrays.asList("查看施肥日历", "了解更多肥料知识"));
            aiMsg.setStructuredContent(structured);
        }

        aiMsg.setCreatedAt(timestamp);
        messageStore.put(aiMsgId, aiMsg);

        return ApiResponse.success(aiMsg);
    }

    private String generateMockResponse(String userMessage) {
    return "验收测试-AI问答成功\n\n您的问题是：" + userMessage;
}
}
