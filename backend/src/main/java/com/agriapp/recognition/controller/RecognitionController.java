package com.agriapp.recognition.controller;

import com.agriapp.common.ApiResponse;
import com.agriapp.recognition.dto.ControlSuggestionDTO;
import com.agriapp.recognition.dto.RecognitionResultDTO;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

/**
 * 病虫害识别 Mock API 控制器
 */
@RestController
@RequestMapping("/api/recognitions")
public class RecognitionController {

    private final ConcurrentHashMap<String, RecognitionResultDTO> resultStore = new ConcurrentHashMap<>();
    private final AtomicLong idGenerator = new AtomicLong(6);

    public RecognitionController() {
        initMockData();
    }

    private void initMockData() {
        // Mock 数据 1: 稻瘟病
        RecognitionResultDTO result1 = new RecognitionResultDTO();
        result1.setId("rec_001");
        result1.setImageUrl("https://example.com/rice-blast.jpg");
        result1.setCropType("水稻");
        result1.setDiseaseName("后端测试-联调成功");
        result1.setConfidence(0.92);
        result1.setStatus("completed");
        result1.setDescription("水稻稻瘟病，主要危害叶片、茎节和穗部");
        result1.setSymptoms(Arrays.asList("叶片出现纺锤形病斑", "病斑中央灰白色，边缘褐色", "严重时叶片枯死"));
        result1.setSuggestion(createBlastSuggestion());
        result1.setCreatedAt("2026-06-15T14:30:00Z");
        resultStore.put(result1.getId(), result1);

        // Mock 数据 2: 番茄晚疫病
        RecognitionResultDTO result2 = new RecognitionResultDTO();
        result2.setId("rec_002");
        result2.setImageUrl("https://example.com/tomato-blight.jpg");
        result2.setCropType("番茄");
        result2.setDiseaseName("晚疫病");
        result2.setConfidence(0.88);
        result2.setStatus("completed");
        result2.setDescription("番茄晚疫病，是一种毁灭性的真菌病害");
        result2.setSymptoms(Arrays.asList("叶片出现水渍状病斑", "病斑迅速扩大变为褐色", "果实表面产生白色霉层"));
        result2.setSuggestion(createBlightSuggestion());
        result2.setCreatedAt("2026-06-14T10:20:00Z");
        resultStore.put(result2.getId(), result2);

        // Mock 数据 3: 玉米锈病
        RecognitionResultDTO result3 = new RecognitionResultDTO();
        result3.setId("rec_003");
        result3.setImageUrl("https://example.com/corn-rust.jpg");
        result3.setCropType("玉米");
        result3.setDiseaseName("玉米锈病");
        result3.setConfidence(0.85);
        result3.setStatus("completed");
        result3.setDescription("玉米锈病，主要危害叶片");
        result3.setSymptoms(Arrays.asList("叶片表面产生黄色粉末状夏孢子堆", "后期产生黑褐色冬孢子堆", "叶片提前枯死"));
        result3.setSuggestion(createRustSuggestion());
        result3.setCreatedAt("2026-06-13T16:45:00Z");
        resultStore.put(result3.getId(), result3);

        // Mock 数据 4: 白菜软腐病
        RecognitionResultDTO result4 = new RecognitionResultDTO();
        result4.setId("rec_004");
        result4.setImageUrl("https://example.com/cabbage-rot.jpg");
        result4.setCropType("白菜");
        result4.setDiseaseName("软腐病");
        result4.setConfidence(0.79);
        result4.setStatus("completed");
        result4.setDescription("白菜软腐病，细菌性病害");
        result4.setSymptoms(Arrays.asList("叶柄基部腐烂", "病部流出黄褐色粘稠液体", "有恶臭味"));
        result4.setSuggestion(createSoftRotSuggestion());
        result4.setCreatedAt("2026-06-12T09:15:00Z");
        resultStore.put(result4.getId(), result4);
    }

    private ControlSuggestionDTO createBlastSuggestion() {
        ControlSuggestionDTO suggestion = new ControlSuggestionDTO();
        suggestion.setSuggestionId("sug_001");
        suggestion.setDiseaseName("稻瘟病");
        suggestion.setPreventionMethods(Arrays.asList(
                "选用抗病品种",
                "合理施肥，避免偏施氮肥",
                "及时排水晒田",
                "种子消毒处理"
        ));
        suggestion.setChemicalControls(Arrays.asList(
                "75%肟菌·戊唑醇水分散粒剂 15-20g/亩",
                "40%稻瘟灵乳油 80-100ml/亩",
                "使用无人机喷雾防治"
        ));
        suggestion.setBiologicalControls(Arrays.asList(
                "枯草芽孢杆菌",
                "春雷霉素"
        ));
        suggestion.setPrecautions("收获后彻底清理病残体，减少病源；避免在阴雨天施药");
        return suggestion;
    }

    private ControlSuggestionDTO createBlightSuggestion() {
        ControlSuggestionDTO suggestion = new ControlSuggestionDTO();
        suggestion.setSuggestionId("sug_002");
        suggestion.setDiseaseName("番茄晚疫病");
        suggestion.setPreventionMethods(Arrays.asList(
                "选用抗病品种",
                "控制田间湿度，及时通风",
                "合理密植，避免过密",
                "与非茄科作物轮作3年以上"
        ));
        suggestion.setChemicalControls(Arrays.asList(
                "72%霜脲·锰锌可湿性粉剂 100-150g/亩",
                "68%精甲霜·锰锌水分散粒剂 80-100g/亩",
                "每隔7-10天喷施一次"
        ));
        suggestion.setBiologicalControls(Arrays.asList(
                "寡雄腐霉菌",
                "木霉制剂"
        ));
        suggestion.setPrecautions("发现病株立即拔除销毁，发病初期及时防治");
        return suggestion;
    }

    private ControlSuggestionDTO createRustSuggestion() {
        ControlSuggestionDTO suggestion = new ControlSuggestionDTO();
        suggestion.setSuggestionId("sug_003");
        suggestion.setDiseaseName("玉米锈病");
        suggestion.setPreventionMethods(Arrays.asList(
                "选用抗病品种",
                "适当早播，避开高温高湿期",
                "合理施肥，增强抗病力",
                "及时清除病残体"
        ));
        suggestion.setChemicalControls(Arrays.asList(
                "25%三唑酮可湿性粉剂 50-75g/亩",
                "12.5%烯唑醇可湿性粉剂 40-60g/亩",
                "发病初期开始防治，每隔10天一次"
        ));
        suggestion.setBiologicalControls(Arrays.asList(
                "井冈霉素A",
                "嘧啶核苷类抗菌素"
        ));
        suggestion.setPrecautions("避免偏施氮肥，增施磷钾肥；与大豆等作物轮作");
        return suggestion;
    }

    private ControlSuggestionDTO createSoftRotSuggestion() {
        ControlSuggestionDTO suggestion = new ControlSuggestionDTO();
        suggestion.setSuggestionId("sug_004");
        suggestion.setDiseaseName("白菜软腐病");
        suggestion.setPreventionMethods(Arrays.asList(
                "选用抗病品种",
                "高畦栽培，避免积水",
                "及时防治地下害虫",
                "避免机械损伤"
        ));
        suggestion.setChemicalControls(Arrays.asList(
                "72%农用硫酸链霉素可溶性粉剂 3000-4000倍液",
                "47%春雷·王铜可湿性粉剂 800-1000倍液",
                "灌根或喷雾"
        ));
        suggestion.setBiologicalControls(Arrays.asList(
                "枯草芽孢杆菌",
                "解淀粉芽孢杆菌"
        ));
        suggestion.setPrecautions("发现病株及时拔除并消毒病穴；避免大水漫灌");
        return suggestion;
    }

    /**
     * 获取识别历史
     */
    @GetMapping
    public ApiResponse<List<RecognitionResultDTO>> getHistory() {
        List<RecognitionResultDTO> results = new ArrayList<>(resultStore.values());
        return ApiResponse.success(results);
    }

    /**
     * 获取识别结果详情
     */
    @GetMapping("/{id}")
    public ApiResponse<RecognitionResultDTO> getResult(@PathVariable String id) {
        RecognitionResultDTO result = resultStore.get(id);
        if (result == null) {
            return ApiResponse.error(404, "Recognition result not found");
        }
        return ApiResponse.success(result);
    }

    /**
     * 模拟上传图片进行识别
     */
    @PostMapping("/mock")
    public ApiResponse<RecognitionResultDTO> mockUpload(@RequestBody(required = false) java.util.Map<String, String> body) {
        String newId = "rec_" + idGenerator.getAndIncrement();
        RecognitionResultDTO result = new RecognitionResultDTO();
        result.setId(newId);
        result.setImageUrl("https://example.com/mock-upload-" + newId + ".jpg");

        // 根据 source 参数返回不同的 Mock 数据
        String source = body != null ? body.getOrDefault("source", "camera") : "camera";
        String diseaseName;
        String cropType;
        String description;
        if ("album".equals(source)) {
            diseaseName = "验收测试-相册识别成功";
            cropType = "番茄";
            description = "这是后端 album mock 返回的测试识别结果";
        } else {
            diseaseName = "验收测试-拍照识别成功";
            cropType = "水稻";
            description = "这是后端 camera mock 返回的测试识别结果";
        }

        result.setCropType(cropType);
        result.setDiseaseName(diseaseName);
        result.setConfidence(0.92);
        result.setStatus("completed");
        result.setDescription(description);
        result.setSymptoms(Arrays.asList("后端测试症状1", "后端测试症状2"));

        // 创建临时测试用的 suggestion
        ControlSuggestionDTO testSuggestion = new ControlSuggestionDTO();
        testSuggestion.setSuggestionId("sug_test_" + newId);
        testSuggestion.setDiseaseName(diseaseName); // 与 result.diseaseName 保持一致
        testSuggestion.setPreventionMethods(Arrays.asList(
                "后端测试预防方法1",
                "后端测试预防方法2"
        ));
        testSuggestion.setChemicalControls(Arrays.asList(
                "后端测试化学防治1",
                "后端测试化学防治2"
        ));
        testSuggestion.setBiologicalControls(Arrays.asList(
                "后端测试生物防治"
        ));
        testSuggestion.setPrecautions("后端测试注意事项");
        result.setSuggestion(testSuggestion);

        resultStore.put(newId, result);
        return ApiResponse.success(result);
    }
}
