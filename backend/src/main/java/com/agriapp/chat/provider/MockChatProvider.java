package com.agriapp.chat.provider;

import com.agriapp.chat.dto.ChatContextDTO;
import com.agriapp.chat.dto.RecognitionSnapshotDTO;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
@ConditionalOnProperty(name = "agri.ai.provider", havingValue = "mock", matchIfMissing = true)
public class MockChatProvider implements ChatProvider {

    private final ObjectMapper objectMapper;

    public MockChatProvider(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    public ChatProviderResponse generate(ChatProviderRequest request) {
        Map<String, Object> answer = buildAnswer(request);
        try {
            return new ChatProviderResponse("mock", "mock-agri-diagnosis-v1", objectMapper.writeValueAsString(answer));
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Failed to serialize mock AI response", e);
        }
    }

    private Map<String, Object> buildAnswer(ChatProviderRequest request) {
        String message = nullToEmpty(request.getUserMessage());
        ChatContextDTO context = request.getContext();
        RecognitionSnapshotDTO recognition = request.getRecognitionSnapshot();

        if (isOutOfScope(message)) {
            return base("OUT_OF_SCOPE", "这个问题不属于农业病虫害辅助诊断范围。", "insufficient",
                    List.of(), List.of(), List.of("请补充与作物、症状或田间管理有关的问题。"));
        }

        if (containsUnsafeDoseRequest(message)) {
            Map<String, Object> answer = base("SAFETY_ESCALATION",
                    "涉及具体农药剂量或混配方案时，不能仅凭线上描述给出用量。",
                    "insufficient",
                    List.of("用户询问涉及具体用药方案，需要线下核对标签和现场情况。"),
                    List.of(),
                    List.of("请说明作物、受害部位、发生面积和当地已使用的处理方式。"));
            answer.put("actionsNow", List.of("先隔离观察明显受害植株，避免盲目加大药量。"));
            answer.put("avoidActions", List.of("不要自行提高浓度、混配多种药剂或重复施药。"));
            answer.put("seekExpert", Map.of("required", true, "reason", "农药使用需要结合登记标签、当地病虫害情况和现场诊断。"));
            return answer;
        }

        if (isInsufficient(context, message)) {
            return base("CLARIFICATION",
                    "目前信息不足，需要先补充作物和症状细节。",
                    "insufficient",
                    observations(context, message),
                    List.of(),
                    List.of("这是哪一种作物？", "受害部位是叶片、茎秆、根部还是果实？", "症状出现多久了，扩散快吗？"));
        }

        Map<String, Object> candidate = Map.of(
                "name", "叶部病害或生理性胁迫",
                "supportLevel", recognition == null ? "moderate" : "weak",
                "supportingEvidence", List.of("用户描述包含作物或受害部位信息。", "症状需要结合叶面、叶背和扩散速度继续观察。"),
                "contradictingEvidence", recognition == null
                        ? List.of("缺少图片或现场细节，不能确认具体病名。")
                        : List.of("识别结果只能作为线索，不能替代症状问诊。"),
                "confirmNext", List.of("补充叶片正反面近照。", "记录未来24小时病斑是否扩大。")
        );

        Map<String, Object> answer = base("DIFFERENTIAL_DIAGNOSIS",
                "根据现有信息，可做初步辅助判断，但仍需进一步观察确认。",
                "partial",
                observations(context, message),
                List.of(candidate),
                List.of());
        answer.put("actionsNow", List.of("保持田间通风，减少叶面长时间潮湿。", "将明显受害植株做标记并持续观察。"));
        answer.put("avoidActions", List.of("不要在病因未明时反复混用多种药剂。"));
        answer.put("monitoring", List.of("观察新叶和老叶哪个先出现症状。", "记录扩散速度和天气变化。"));
        return answer;
    }

    private Map<String, Object> base(
            String answerKind,
            String summary,
            String evidenceSufficiency,
            List<String> observations,
            List<Object> candidates,
            List<String> followUpQuestions
    ) {
        return new java.util.LinkedHashMap<>(Map.ofEntries(
                Map.entry("schemaVersion", "1.0"),
                Map.entry("intent", "PEST_DIAGNOSIS"),
                Map.entry("answerKind", answerKind),
                Map.entry("summary", summary),
                Map.entry("evidenceSufficiency", evidenceSufficiency),
                Map.entry("imageQuality", Map.of("level", "not_applicable", "issues", List.of(), "retakeSuggestions", List.of())),
                Map.entry("observations", observations),
                Map.entry("candidates", candidates),
                Map.entry("followUpQuestions", followUpQuestions),
                Map.entry("actionsNow", List.of()),
                Map.entry("avoidActions", List.of("不要在证据不足时直接下确诊结论。")),
                Map.entry("monitoring", List.of()),
                Map.entry("seekExpert", Map.of("required", false, "reason", "")),
                Map.entry("safetyNotice", "本建议用于初步排查，不能替代现场农技诊断。涉及农药时，请以登记产品标签和当地农技人员指导为准。")
        ));
    }

    private List<String> observations(ChatContextDTO context, String message) {
        java.util.ArrayList<String> result = new java.util.ArrayList<>();
        if (context != null && context.getCropName() != null && !context.getCropName().isBlank()) {
            result.add("作物：" + context.getCropName());
        }
        if (context != null && context.getAffectedPart() != null && !context.getAffectedPart().isBlank()) {
            result.add("受害部位：" + context.getAffectedPart());
        }
        if (context != null && context.getSymptomDescription() != null && !context.getSymptomDescription().isBlank()) {
            result.add("症状：" + context.getSymptomDescription());
        } else if (!message.isBlank()) {
            result.add("用户描述：" + message);
        }
        return result;
    }

    private boolean isInsufficient(ChatContextDTO context, String message) {
        boolean hasCrop = context != null && context.getCropName() != null && !context.getCropName().isBlank();
        boolean hasSymptom = context != null && context.getSymptomDescription() != null && !context.getSymptomDescription().isBlank();
        return message.length() < 8 || (!hasCrop && !hasSymptom && message.length() < 20);
    }

    private boolean isOutOfScope(String message) {
        return message.contains("股票") || message.contains("写诗") || message.contains("旅游") || message.contains("数学题");
    }

    private boolean containsUnsafeDoseRequest(String message) {
        return message.contains("剂量") || message.contains("每亩") || message.contains("越浓越好") || message.contains("混配");
    }

    private String nullToEmpty(String value) {
        return value == null ? "" : value;
    }
}
