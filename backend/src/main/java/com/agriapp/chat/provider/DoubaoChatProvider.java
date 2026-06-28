package com.agriapp.chat.provider;

import com.agriapp.chat.config.AiChatProperties;
import com.agriapp.chat.dto.ChatContextDTO;
import com.agriapp.chat.dto.RecognitionSnapshotDTO;
import com.agriapp.chat.exception.ChatException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;

import java.time.Duration;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Component
@ConditionalOnProperty(name = "agri.ai.provider", havingValue = "doubao")
public class DoubaoChatProvider implements ChatProvider {

    private static final Logger log = LoggerFactory.getLogger(DoubaoChatProvider.class);

    private final AiChatProperties properties;
    private final RestClient.Builder restClientBuilder;
    private final PromptCatalog promptCatalog;

    public DoubaoChatProvider(AiChatProperties properties, RestClient.Builder restClientBuilder, PromptCatalog promptCatalog) {
        this.properties = properties;
        this.restClientBuilder = restClientBuilder;
        this.promptCatalog = promptCatalog;
    }

    @Override
    public ChatProviderResponse generate(ChatProviderRequest request) {
        AiChatProperties.Doubao doubao = properties.getDoubao();
        if (isBlank(doubao.getApiKey())) {
            throw new ChatException(503, "AI_PROVIDER_NOT_CONFIGURED", "ARK_API_KEY is required when AGRI_AI_PROVIDER=doubao");
        }
        if (isBlank(doubao.getTextModel())) {
            throw new ChatException(503, "AI_MODEL_NOT_CONFIGURED", "ARK_TEXT_MODEL is required when AGRI_AI_PROVIDER=doubao");
        }

        RestClient restClient = restClient(doubao);

        try {
            if ("two-pass".equalsIgnoreCase(properties.getDiagnosisMode())) {
                String observation = callChat(restClient, doubao.getTextModel(), buildObservationMessages(request));
                String diagnosis = callChat(restClient, doubao.getTextModel(), buildDiagnosisMessages(request, observation));
                return new ChatProviderResponse("doubao", doubao.getTextModel(), diagnosis);
            }
            String diagnosis = callChat(restClient, doubao.getTextModel(), buildDiagnosisMessages(request, "{}"));
            return new ChatProviderResponse("doubao", doubao.getTextModel(), diagnosis);
        } catch (ChatException e) {
            throw e;
        } catch (RestClientResponseException e) {
            throw mapHttpError(e);
        } catch (RestClientException e) {
            throw new ChatException(503, "AI_SERVICE_UNAVAILABLE", "Doubao service request failed");
        }
    }

    @Override
    public ChatProviderResponse repair(ChatProviderRequest request, String invalidContent) {
        AiChatProperties.Doubao doubao = properties.getDoubao();
        validateConfig(doubao);
        RestClient restClient = restClient(doubao);
        String repaired = callChat(restClient, doubao.getTextModel(), buildRepairMessages(request, invalidContent));
        return new ChatProviderResponse("doubao", doubao.getTextModel(), repaired);
    }

    private RestClient restClient(AiChatProperties.Doubao doubao) {
        return restClientBuilder
                .baseUrl(trimTrailingSlash(doubao.getBaseUrl()))
                .requestFactory(requestFactory(doubao.getTimeoutSeconds()))
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + doubao.getApiKey())
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    private void validateConfig(AiChatProperties.Doubao doubao) {
        if (isBlank(doubao.getApiKey())) {
            throw new ChatException(503, "AI_PROVIDER_NOT_CONFIGURED", "ARK_API_KEY is required when AGRI_AI_PROVIDER=doubao");
        }
        if (isBlank(doubao.getTextModel())) {
            throw new ChatException(503, "AI_MODEL_NOT_CONFIGURED", "ARK_TEXT_MODEL is required when AGRI_AI_PROVIDER=doubao");
        }
    }

    private SimpleClientHttpRequestFactory requestFactory(int timeoutSeconds) {
        int seconds = timeoutSeconds <= 0 ? 30 : timeoutSeconds;
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(Duration.ofSeconds(Math.min(seconds, 10)));
        factory.setReadTimeout(Duration.ofSeconds(seconds));
        return factory;
    }

    private ChatException mapHttpError(RestClientResponseException e) {
        int status = e.getStatusCode().value();
        String responseBody = e.getResponseBodyAsString();
        log.warn("Doubao HTTP error - status={}, body={}", status, truncate(responseBody, 2000));
        if (status == 401 || status == 403) {
            return new ChatException(502, "AI_SERVICE_UNAUTHORIZED", "Doubao authorization failed");
        }
        if (status == 408 || status == 504) {
            return new ChatException(504, "AI_SERVICE_TIMEOUT", "Doubao service timed out");
        }
        if (status == 429) {
            return new ChatException(429, "AI_SERVICE_RATE_LIMITED", "Doubao service is rate limited");
        }
        if (status >= 500) {
            return new ChatException(503, "AI_SERVICE_UNAVAILABLE", "Doubao service is unavailable");
        }
        return new ChatException(502, "AI_RESPONSE_INVALID", "Doubao request failed");
    }

    private String callChat(RestClient restClient, String model, List<Map<String, String>> messages) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("model", model);
        body.put("temperature", 0.2);
        body.put("messages", messages);
        body.put("response_format", Map.of("type", "json_object"));
        body.put("thinking", Map.of("type", "disabled"));

        @SuppressWarnings("unchecked")
        Map<String, Object> response = restClient.post()
                .uri("/chat/completions")
                .body(body)
                .retrieve()
                .body(Map.class);
        return extractContent(response);
    }

    private List<Map<String, String>> buildObservationMessages(ChatProviderRequest request) {
        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(Map.of("role", "system", "content", promptCatalog.systemPrompt()));
        messages.add(Map.of("role", "user", "content", promptCatalog.observationPrompt() + "\n\n" + userPrompt(request)));
        return messages;
    }

    private List<Map<String, String>> buildDiagnosisMessages(ChatProviderRequest request, String observationJson) {
        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(Map.of("role", "system", "content", promptCatalog.systemPrompt()));
        messages.add(Map.of("role", "user", "content", promptCatalog.diagnosisPrompt()
                + "\n\n阶段一观察 JSON：\n" + observationJson
                + "\n\n原始用户输入：\n" + userPrompt(request)));
        return messages;
    }

    private List<Map<String, String>> buildRepairMessages(ChatProviderRequest request, String invalidContent) {
        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(Map.of("role", "system", "content", promptCatalog.systemPrompt()));
        messages.add(Map.of("role", "user", "content", promptCatalog.repairPrompt()
                + "\n\n原始用户输入：\n" + userPrompt(request)
                + "\n\n需要修复的模型输出：\n" + nullToEmpty(invalidContent)));
        return messages;
    }

    private String userPrompt(ChatProviderRequest request) {
        StringBuilder sb = new StringBuilder();
        sb.append("用户问题：").append(nullToEmpty(request.getUserMessage())).append('\n');
        ChatContextDTO context = request.getContext();
        if (context != null) {
            sb.append("补充上下文：")
                    .append("作物=").append(nullToEmpty(context.getCropName())).append(", ")
                    .append("生长阶段=").append(nullToEmpty(context.getGrowthStage())).append(", ")
                    .append("受害部位=").append(nullToEmpty(context.getAffectedPart())).append(", ")
                    .append("症状=").append(nullToEmpty(context.getSymptomDescription())).append(", ")
                    .append("发生时间=").append(nullToEmpty(context.getOnset())).append(", ")
                    .append("扩散=").append(nullToEmpty(context.getSpread())).append(", ")
                    .append("近期情况=").append(nullToEmpty(context.getRecentWeather())).append('\n');
        }
        RecognitionSnapshotDTO recognition = request.getRecognitionSnapshot();
        if (recognition != null) {
            sb.append("识别结果线索：")
                    .append("作物=").append(nullToEmpty(recognition.getCropName())).append(", ")
                    .append("名称=").append(nullToEmpty(recognition.getPestName())).append(", ")
                    .append("confidence=").append(nullToEmpty(recognition.getConfidence())).append("。")
                    .append("注意：该结果只作为线索，不能当作绝对结论或严重程度。").append('\n');
        }
        sb.append("请按指定 JSON 输出。");
        return sb.toString();
    }

    private String extractContent(Map<String, Object> response) {
        if (response == null || !(response.get("choices") instanceof List<?> choices) || choices.isEmpty()) {
            log.warn("Doubao response has no choices - full response={}", truncate(response == null ? "null" : response.toString(), 2000));
            throw new ChatException(502, "AI_RESPONSE_INVALID", "Doubao response has no choices");
        }
        Object first = choices.get(0);
        if (!(first instanceof Map<?, ?> choice) || !(choice.get("message") instanceof Map<?, ?> message)) {
            log.warn("Doubao response message is invalid - full response={}", truncate(response.toString(), 2000));
            throw new ChatException(502, "AI_RESPONSE_INVALID", "Doubao response message is invalid");
        }
        Object content = message.get("content");
        if (!(content instanceof String text) || text.isBlank()) {
            log.warn("Doubao response content is empty - full response={}", truncate(response.toString(), 2000));
            throw new ChatException(502, "AI_RESPONSE_INVALID", "Doubao response content is empty");
        }
        return text;
    }

    private String trimTrailingSlash(String value) {
        if (isBlank(value)) {
            return "https://ark.cn-beijing.volces.com/api/v3";
        }
        return value.endsWith("/") ? value.substring(0, value.length() - 1) : value;
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private String nullToEmpty(String value) {
        return value == null ? "" : value;
    }

    private String truncate(String str, int maxLength) {
        if (str == null) {
            return null;
        }
        if (str.length() <= maxLength) {
            return str;
        }
        return str.substring(0, maxLength) + "...[truncated]";
    }
}
