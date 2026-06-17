package com.agriapp.task.controller;

import com.agriapp.common.ApiResponse;
import com.agriapp.task.dto.TaskReminderDTO;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 任务提醒 Mock API 控制器
 */
@RestController
@RequestMapping("/api/tasks")
public class TaskReminderController {

    private final ConcurrentHashMap<String, TaskReminderDTO> taskStore = new ConcurrentHashMap<>();

    public TaskReminderController() {
        initMockData();
    }

    private void initMockData() {
        TaskReminderDTO task1 = new TaskReminderDTO();
        task1.setId("task_001");
        task1.setUserId("1");
        task1.setTitle("水稻施肥");
        task1.setContent("水稻分蘖期，追施尿素每亩8-10公斤");
        task1.setTaskType("fertilizing");
        task1.setPriority("high");
        task1.setStatus("completed");
        task1.setRelatedCropId("crop_001");
        task1.setRelatedCropName("水稻");
        task1.setDueDate("2026-06-17T08:00:00Z");
        task1.setReminderTime("2026-06-17T07:00:00Z");
        task1.setCreatedAt("2026-06-15T10:00:00Z");
        task1.setUpdatedAt("2026-06-15T10:00:00Z");
        taskStore.put(task1.getId(), task1);

        TaskReminderDTO task2 = new TaskReminderDTO();
        task2.setId("task_002");
        task2.setUserId("1");
        task2.setTitle("番茄浇水");
        task2.setContent("检查土壤湿度，适量浇水");
        task2.setTaskType("watering");
        task2.setPriority("medium");
        task2.setStatus("pending");
        task2.setRelatedCropId("crop_002");
        task2.setRelatedCropName("番茄");
        task2.setDueDate("2026-06-16T18:00:00Z");
        task2.setReminderTime("2026-06-16T17:00:00Z");
        task2.setCreatedAt("2026-06-14T10:00:00Z");
        task2.setUpdatedAt("2026-06-16T10:00:00Z");
        taskStore.put(task2.getId(), task2);

        TaskReminderDTO task3 = new TaskReminderDTO();
        task3.setId("task_003");
        task3.setUserId("1");
        task3.setTitle("玉米病虫害检查");
        task3.setContent("巡查玉米田，发现病虫害及时防治");
        task3.setTaskType("inspection");
        task3.setPriority("high");
        task3.setStatus("pending");
        task3.setRelatedCropId("crop_004");
        task3.setRelatedCropName("玉米");
        task3.setDueDate("2026-06-18T09:00:00Z");
        task3.setReminderTime("2026-06-18T08:00:00Z");
        task3.setCreatedAt("2026-06-15T10:00:00Z");
        task3.setUpdatedAt("2026-06-15T10:00:00Z");
        taskStore.put(task3.getId(), task3);

        TaskReminderDTO task4 = new TaskReminderDTO();
        task4.setId("task_004");
        task4.setUserId("1");
        task4.setTitle("小麦收割准备");
        task4.setContent("检查收割机具，准备小麦收割");
        task4.setTaskType("harvest");
        task4.setPriority("low");
        task4.setStatus("pending");
        task4.setRelatedCropId("crop_003");
        task4.setRelatedCropName("小麦");
        task4.setDueDate("2026-06-10T06:00:00Z");
        task4.setReminderTime("2026-06-10T05:00:00Z");
        task4.setCreatedAt("2026-06-05T10:00:00Z");
        task4.setUpdatedAt("2026-06-10T10:00:00Z");
        taskStore.put(task4.getId(), task4);

        TaskReminderDTO task5 = new TaskReminderDTO();
        task5.setId("task_005");
        task5.setUserId("1");
        task5.setTitle("白菜喷药");
        task5.setContent("防治蚜虫，喷施生物农药");
        task5.setTaskType("pest_control");
        task5.setPriority("medium");
        task5.setStatus("pending");
        task5.setRelatedCropId("crop_005");
        task5.setRelatedCropName("白菜");
        task5.setDueDate("2026-06-14T16:00:00Z");
        task5.setReminderTime("2026-06-14T15:00:00Z");
        task5.setCreatedAt("2026-06-12T10:00:00Z");
        task5.setUpdatedAt("2026-06-12T10:00:00Z");
        taskStore.put(task5.getId(), task5);
    }

    /**
     * 获取任务列表
     */
    @GetMapping
    public ApiResponse<List<TaskReminderDTO>> getTasks(
            @RequestParam(required = false) String status) {
        List<TaskReminderDTO> tasks = new ArrayList<>(taskStore.values());
        if (status != null && !status.isEmpty()) {
            tasks = tasks.stream()
                    .filter(t -> status.equals(t.getStatus()))
                    .toList();
        }
        return ApiResponse.success(tasks);
    }

    /**
     * 获取任务详情
     */
    @GetMapping("/{id}")
    public ApiResponse<TaskReminderDTO> getTask(@PathVariable String id) {
        TaskReminderDTO task = taskStore.get(id);
        if (task == null) {
            return ApiResponse.error(404, "Task not found");
        }
        return ApiResponse.success(task);
    }

    /**
     * 更新任务状态
     */
    @PatchMapping("/{id}/status")
    public ApiResponse<TaskReminderDTO> updateTaskStatus(
            @PathVariable String id,
            @RequestBody TaskReminderDTO taskDTO) {
        TaskReminderDTO existing = taskStore.get(id);
        if (existing == null) {
            return ApiResponse.error(404, "Task not found");
        }
        existing.setStatus(taskDTO.getStatus());
        existing.setUpdatedAt("2026-06-16T10:00:00Z");
        return ApiResponse.success(existing);
    }
}
