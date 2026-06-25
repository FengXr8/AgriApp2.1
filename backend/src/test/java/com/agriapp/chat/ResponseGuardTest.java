package com.agriapp.chat;

import com.agriapp.chat.dto.AiStructuredAnswerDTO;
import com.agriapp.chat.exception.ChatException;
import com.agriapp.chat.service.ResponseGuard;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class ResponseGuardTest {

    private final ResponseGuard guard = new ResponseGuard(new ObjectMapper());

    @Test
    void parsesAndNormalizesClarification() {
        AiStructuredAnswerDTO answer = guard.parseAndValidate("""
                {
                  "schemaVersion": "1.0",
                  "intent": "PEST_DIAGNOSIS",
                  "answerKind": "CLARIFICATION",
                  "summary": "目前信息不足。",
                  "evidenceSufficiency": "insufficient",
                  "followUpQuestions": ["作物是什么？"]
                }
                """);

        assertThat(answer.getCandidates()).isEmpty();
        assertThat(answer.getFollowUpQuestions()).containsExactly("作物是什么？");
        assertThat(answer.getImageQuality()).isNotNull();
    }

    @Test
    void rejectsInvalidJson() {
        assertThatThrownBy(() -> guard.parseAndValidate("not-json"))
                .isInstanceOf(ChatException.class)
                .extracting("errorCode")
                .isEqualTo("AI_RESPONSE_INVALID");
    }

    @Test
    void repairsJsonWrappedInTextAndIgnoresExtraFields() {
        AiStructuredAnswerDTO answer = guard.parseAndValidate("""
                下面是结果：
                ```json
                {
                  "schemaVersion": "1.0",
                  "answerKind": "CLARIFICATION",
                  "summary": "需要补充信息。",
                  "evidenceSufficiency": "insufficient",
                  "extraFieldFromModel": "ignored"
                }
                ```
                """);

        assertThat(answer.getAnswerKind()).isEqualTo("CLARIFICATION");
        assertThat(answer.getFollowUpQuestions()).contains("请补充作物名称、受害部位和症状持续时间。");
    }

    @Test
    void blocksUnsafeDoseLanguage() {
        assertThatThrownBy(() -> guard.parseAndValidate("""
                {
                  "schemaVersion": "1.0",
                  "answerKind": "GENERAL_ADVICE",
                  "summary": "每亩使用更多药剂。",
                  "evidenceSufficiency": "partial"
                }
                """))
                .isInstanceOf(ChatException.class)
                .extracting("errorCode")
                .isEqualTo("AI_RESPONSE_BLOCKED");
    }

    @Test
    void limitsCandidatesToThree() {
        AiStructuredAnswerDTO answer = guard.parseAndValidate("""
                {
                  "schemaVersion": "1.0",
                  "answerKind": "DIFFERENTIAL_DIAGNOSIS",
                  "summary": "初步辅助判断。",
                  "evidenceSufficiency": "partial",
                  "candidates": [
                    {"name": "a", "supportLevel": "weak"},
                    {"name": "b", "supportLevel": "weak"},
                    {"name": "c", "supportLevel": "weak"},
                    {"name": "d", "supportLevel": "weak"}
                  ]
                }
                """);

        assertThat(answer.getCandidates()).hasSize(3);
    }
}
