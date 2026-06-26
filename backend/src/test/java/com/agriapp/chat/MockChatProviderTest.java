package com.agriapp.chat;

import com.agriapp.chat.dto.ChatContextDTO;
import com.agriapp.chat.dto.AiStructuredAnswerDTO;
import com.agriapp.chat.provider.ChatProviderRequest;
import com.agriapp.chat.provider.MockChatProvider;
import com.agriapp.chat.service.ResponseGuard;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class MockChatProviderTest {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final MockChatProvider provider = new MockChatProvider(objectMapper);
    private final ResponseGuard guard = new ResponseGuard(objectMapper);

    @Test
    void asksQuestionsWhenInformationIsInsufficient() {
        ChatProviderRequest request = new ChatProviderRequest();
        request.setUserMessage("叶子黄");

        AiStructuredAnswerDTO answer = guard.parseAndValidate(provider.generate(request).getRawContent());

        assertThat(answer.getAnswerKind()).isEqualTo("CLARIFICATION");
        assertThat(answer.getFollowUpQuestions()).hasSizeBetween(1, 3);
        assertThat(answer.getCandidates()).isEmpty();
    }

    @Test
    void escalatesUnsafePesticideDoseRequest() {
        ChatProviderRequest request = new ChatProviderRequest();
        request.setUserMessage("番茄叶片有斑点，请给我每亩具体剂量，越浓越好吗");

        AiStructuredAnswerDTO answer = guard.parseAndValidate(provider.generate(request).getRawContent());

        assertThat(answer.getAnswerKind()).isEqualTo("SAFETY_ESCALATION");
        assertThat(answer.getSeekExpert().isRequired()).isTrue();
        assertThat(answer.getAvoidActions()).anyMatch(action -> action.contains("不要"));
    }

    @Test
    void returnsDifferentialDiagnosisWithContext() {
        ChatContextDTO context = new ChatContextDTO();
        context.setCropName("番茄");
        context.setAffectedPart("leaf");
        context.setSymptomDescription("叶片出现褐色斑点，扩散较快");
        ChatProviderRequest request = new ChatProviderRequest();
        request.setUserMessage("番茄叶片出现褐色斑点怎么办");
        request.setContext(context);

        AiStructuredAnswerDTO answer = guard.parseAndValidate(provider.generate(request).getRawContent());

        assertThat(answer.getAnswerKind()).isEqualTo("DIFFERENTIAL_DIAGNOSIS");
        assertThat(answer.getCandidates()).hasSize(1);
        assertThat(answer.getCandidates().get(0).getSupportingEvidence()).isNotEmpty();
        assertThat(answer.getCandidates().get(0).getContradictingEvidence()).isNotEmpty();
    }
}
