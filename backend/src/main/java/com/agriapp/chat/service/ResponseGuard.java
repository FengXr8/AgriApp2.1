package com.agriapp.chat.service;

import com.agriapp.chat.dto.AiStructuredAnswerDTO;
import com.agriapp.chat.exception.ChatException;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Component
public class ResponseGuard {

    private static final Set<String> ANSWER_KINDS = Set.of(
            "CLARIFICATION", "IMAGE_RETAKE", "DIFFERENTIAL_DIAGNOSIS", "GENERAL_ADVICE", "SAFETY_ESCALATION", "OUT_OF_SCOPE");
    private static final Set<String> EVIDENCE_LEVELS = Set.of("insufficient", "partial", "sufficient");
    private static final List<String> RISK_PATTERNS = List.of("百分之百", "已经确诊", "保证有效", "绝对安全", "越浓越好", "每亩", "倍液", "g/亩", "ml/亩");

    private final ObjectMapper objectMapper;

    public ResponseGuard(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper.copy()
                .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
    }

    public AiStructuredAnswerDTO parseAndValidate(String rawContent) {
        AiStructuredAnswerDTO answer = parse(rawContent);
        normalize(answer);
        validateSafety(answer);
        return answer;
    }

    public String toLegacyContent(AiStructuredAnswerDTO answer) {
        StringBuilder sb = new StringBuilder(answer.getSummary());
        if (!answer.getFollowUpQuestions().isEmpty()) {
            sb.append("\n\n还需要补充：");
            for (String question : answer.getFollowUpQuestions()) {
                sb.append("\n- ").append(question);
            }
        }
        if (!answer.getCandidates().isEmpty()) {
            sb.append("\n\n可能原因：");
            for (AiStructuredAnswerDTO.Candidate candidate : answer.getCandidates()) {
                sb.append("\n- ").append(candidate.getName()).append("（支持程度：")
                        .append(toSupportLabel(candidate.getSupportLevel())).append("）");
            }
        }
        if (!answer.getActionsNow().isEmpty()) {
            sb.append("\n\n可以先做：");
            for (String action : answer.getActionsNow()) {
                sb.append("\n- ").append(action);
            }
        }
        if (!answer.getAvoidActions().isEmpty()) {
            sb.append("\n\n避免操作：");
            for (String action : answer.getAvoidActions()) {
                sb.append("\n- ").append(action);
            }
        }
        sb.append("\n\n").append(answer.getSafetyNotice());
        return sb.toString();
    }

    private AiStructuredAnswerDTO parse(String rawContent) {
        if (rawContent == null || rawContent.isBlank()) {
            throw new ChatException(502, "AI_RESPONSE_INVALID", "AI response is empty");
        }
        String json = stripCodeFence(rawContent);
        try {
            JsonNode root = selectAnswerNode(objectMapper.readTree(json));
            return fromJsonNode(root);
        } catch (JsonProcessingException e) {
            throw new ChatException(502, "AI_RESPONSE_INVALID", "AI response is not valid JSON");
        }
    }

    private JsonNode selectAnswerNode(JsonNode root) {
        if (root.has("schemaVersion") || root.has("answerKind") || root.has("summary")) {
            return root;
        }
        for (String field : List.of("answer", "result", "structuredContent", "data")) {
            JsonNode nested = root.get(field);
            if (nested != null && nested.isObject()) {
                return nested;
            }
        }
        return root;
    }

    private AiStructuredAnswerDTO fromJsonNode(JsonNode root) {
        AiStructuredAnswerDTO answer = new AiStructuredAnswerDTO();
        answer.setSchemaVersion(text(root, "schemaVersion", "1.0"));
        answer.setIntent(text(root, "intent", "PEST_DIAGNOSIS"));
        answer.setAnswerKind(text(root, "answerKind", "GENERAL_ADVICE"));
        answer.setSummary(text(root, "summary", ""));
        answer.setEvidenceSufficiency(text(root, "evidenceSufficiency", "insufficient"));
        answer.setObservations(strings(root.get("observations")));
        answer.setFollowUpQuestions(strings(root.get("followUpQuestions")));
        answer.setActionsNow(strings(root.get("actionsNow")));
        answer.setAvoidActions(strings(root.get("avoidActions")));
        answer.setMonitoring(strings(root.get("monitoring")));
        answer.setCandidates(candidates(root.get("candidates")));
        answer.setImageQuality(imageQuality(root.get("imageQuality")));
        answer.setSeekExpert(seekExpert(root.get("seekExpert")));
        answer.setSafetyNotice(text(root, "safetyNotice", answer.getSafetyNotice()));
        return answer;
    }

    private AiStructuredAnswerDTO.ImageQuality imageQuality(JsonNode node) {
        AiStructuredAnswerDTO.ImageQuality imageQuality = new AiStructuredAnswerDTO.ImageQuality();
        if (node == null || node.isNull()) {
            return imageQuality;
        }
        if (node.isTextual()) {
            imageQuality.setLevel(node.asText());
            return imageQuality;
        }
        imageQuality.setLevel(text(node, "level", imageQuality.getLevel()));
        imageQuality.setIssues(strings(node.get("issues")));
        imageQuality.setRetakeSuggestions(strings(node.get("retakeSuggestions")));
        return imageQuality;
    }

    private AiStructuredAnswerDTO.SeekExpert seekExpert(JsonNode node) {
        AiStructuredAnswerDTO.SeekExpert seekExpert = new AiStructuredAnswerDTO.SeekExpert();
        if (node == null || node.isNull()) {
            return seekExpert;
        }
        if (node.isBoolean()) {
            seekExpert.setRequired(node.asBoolean());
            return seekExpert;
        }
        seekExpert.setRequired(node.path("required").asBoolean(false));
        seekExpert.setReason(text(node, "reason", null));
        return seekExpert;
    }

    private List<AiStructuredAnswerDTO.Candidate> candidates(JsonNode node) {
        List<AiStructuredAnswerDTO.Candidate> result = new ArrayList<>();
        if (node == null || !node.isArray()) {
            return result;
        }
        for (JsonNode item : node) {
            AiStructuredAnswerDTO.Candidate candidate = new AiStructuredAnswerDTO.Candidate();
            candidate.setName(text(item, "name", "候选原因"));
            candidate.setSupportLevel(text(item, "supportLevel", "weak"));
            candidate.setSupportingEvidence(strings(item.get("supportingEvidence")));
            candidate.setContradictingEvidence(strings(item.get("contradictingEvidence")));
            candidate.setConfirmNext(strings(item.get("confirmNext")));
            result.add(candidate);
        }
        return result;
    }

    private List<String> strings(JsonNode node) {
        List<String> result = new ArrayList<>();
        if (node == null || node.isNull()) {
            return result;
        }
        if (node.isTextual()) {
            result.add(node.asText());
            return result;
        }
        if (!node.isArray()) {
            return result;
        }
        for (JsonNode item : node) {
            if (item.isTextual() || item.isNumber() || item.isBoolean()) {
                result.add(item.asText());
            } else if (item.isObject()) {
                result.add(item.toString());
            }
        }
        return result;
    }

    private String text(JsonNode node, String field, String fallback) {
        JsonNode value = node == null ? null : node.get(field);
        if (value == null || value.isNull()) {
            return fallback;
        }
        if (value.isTextual() || value.isNumber() || value.isBoolean()) {
            return value.asText();
        }
        return fallback;
    }

    private void normalize(AiStructuredAnswerDTO answer) {
        if (answer.getSchemaVersion() == null || answer.getSchemaVersion().isBlank()) {
            answer.setSchemaVersion("1.0");
        }
        if (!ANSWER_KINDS.contains(nullToEmpty(answer.getAnswerKind()))) {
            answer.setAnswerKind("GENERAL_ADVICE");
        }
        if (!EVIDENCE_LEVELS.contains(nullToEmpty(answer.getEvidenceSufficiency()))) {
            answer.setEvidenceSufficiency("insufficient");
        }
        if (answer.getSummary() == null || answer.getSummary().isBlank()) {
            answer.setSummary("目前证据不足，需要进一步补充信息。");
        }
        answer.setObservations(safeList(answer.getObservations()));
        answer.setCandidates(limitCandidates(answer.getCandidates()));
        answer.setFollowUpQuestions(limitStrings(answer.getFollowUpQuestions(), 3));
        answer.setActionsNow(safeList(answer.getActionsNow()));
        answer.setAvoidActions(safeList(answer.getAvoidActions()));
        answer.setMonitoring(safeList(answer.getMonitoring()));
        if (answer.getImageQuality() == null) {
            answer.setImageQuality(new AiStructuredAnswerDTO.ImageQuality());
        }
        if (answer.getSeekExpert() == null) {
            answer.setSeekExpert(new AiStructuredAnswerDTO.SeekExpert());
        }
        if (answer.getSafetyNotice() == null || answer.getSafetyNotice().isBlank()) {
            answer.setSafetyNotice("本建议用于初步排查，不能替代现场农技诊断。涉及农药时，请以登记产品标签和当地农技人员指导为准。");
        }
        if ("insufficient".equals(answer.getEvidenceSufficiency()) && answer.getFollowUpQuestions().isEmpty()
                && !"OUT_OF_SCOPE".equals(answer.getAnswerKind())) {
            answer.getFollowUpQuestions().add("请补充作物名称、受害部位和症状持续时间。");
        }
        if ("poor".equals(answer.getImageQuality().getLevel())) {
            answer.setAnswerKind("IMAGE_RETAKE");
            answer.getCandidates().removeIf(candidate -> "strong".equals(candidate.getSupportLevel()));
        }
        if ("SAFETY_ESCALATION".equals(answer.getAnswerKind())) {
            answer.getSeekExpert().setRequired(true);
        }
    }

    private void validateSafety(AiStructuredAnswerDTO answer) {
        String text;
        try {
            text = objectMapper.writeValueAsString(answer);
        } catch (JsonProcessingException e) {
            throw new ChatException(502, "AI_RESPONSE_INVALID", "AI response cannot be serialized");
        }
        for (String pattern : RISK_PATTERNS) {
            if (text.contains(pattern)) {
                throw new ChatException(502, "AI_RESPONSE_BLOCKED", "AI response contains unsafe wording");
            }
        }
    }

    private String stripCodeFence(String rawContent) {
        String text = rawContent.trim();
        if (text.startsWith("```")) {
            int firstLine = text.indexOf('\n');
            int lastFence = text.lastIndexOf("```");
            if (firstLine >= 0 && lastFence > firstLine) {
                text = text.substring(firstLine + 1, lastFence).trim();
            }
        }
        int firstBrace = text.indexOf('{');
        int lastBrace = text.lastIndexOf('}');
        if (firstBrace >= 0 && lastBrace > firstBrace) {
            return text.substring(firstBrace, lastBrace + 1).trim();
        }
        return text;
    }

    private List<String> safeList(List<String> value) {
        return value == null ? new ArrayList<>() : new ArrayList<>(value);
    }

    private List<String> limitStrings(List<String> value, int limit) {
        List<String> safe = safeList(value);
        return safe.size() > limit ? new ArrayList<>(safe.subList(0, limit)) : safe;
    }

    private List<AiStructuredAnswerDTO.Candidate> limitCandidates(List<AiStructuredAnswerDTO.Candidate> candidates) {
        if (candidates == null) {
            return new ArrayList<>();
        }
        List<AiStructuredAnswerDTO.Candidate> safe = new ArrayList<>(candidates);
        if (safe.size() > 3) {
            safe = new ArrayList<>(safe.subList(0, 3));
        }
        for (AiStructuredAnswerDTO.Candidate candidate : safe) {
            if (candidate.getSupportLevel() == null || candidate.getSupportLevel().isBlank()) {
                candidate.setSupportLevel("weak");
            }
            candidate.setSupportingEvidence(safeList(candidate.getSupportingEvidence()));
            candidate.setContradictingEvidence(safeList(candidate.getContradictingEvidence()));
            candidate.setConfirmNext(safeList(candidate.getConfirmNext()));
        }
        return safe;
    }

    private String toSupportLabel(String supportLevel) {
        return switch (nullToEmpty(supportLevel)) {
            case "strong" -> "较强";
            case "moderate" -> "中等";
            default -> "较弱";
        };
    }

    private String nullToEmpty(String value) {
        return value == null ? "" : value;
    }
}
