package com.agriapp.chat;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = "agri.ai.provider=mock")
@AutoConfigureMockMvc
@ActiveProfiles("mock")
class ChatControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void defaultMockProfileReturnsHistoryWithoutDatabase() throws Exception {
        mockMvc.perform(get("/api/chat/dialogs/dialog_001/messages"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code", is(200)))
                .andExpect(jsonPath("$.data.length()", greaterThanOrEqualTo(1)));
    }

    @Test
    void sendMessageReturnsStructuredAnswer() throws Exception {
        mockMvc.perform(post("/api/chat/messages")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "dialogId": "dialog_001",
                                  "clientRequestId": "test-structured-001",
                                  "content": "番茄叶片出现褐色斑点怎么办",
                                  "type": "text",
                                  "context": {
                                    "cropName": "番茄",
                                    "affectedPart": "leaf",
                                    "symptomDescription": "叶片出现褐色斑点"
                                  }
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code", is(200)))
                .andExpect(jsonPath("$.data.sender", is("ai")))
                .andExpect(jsonPath("$.data.provider", is("mock")))
                .andExpect(jsonPath("$.data.structuredContent.answerKind", is("DIFFERENTIAL_DIAGNOSIS")))
                .andExpect(jsonPath("$.data.structuredContent.candidates", hasSize(1)));
    }

    @Test
    void retryWithSameClientRequestIdReturnsExistingAiMessage() throws Exception {
        String body = """
                {
                  "dialogId": "dialog_001",
                  "clientRequestId": "test-idempotent-001",
                  "content": "水稻叶片发黄",
                  "type": "text"
                }
                """;

        String first = mockMvc.perform(post("/api/chat/messages")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        String second = mockMvc.perform(post("/api/chat/messages")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        org.assertj.core.api.Assertions.assertThat(second).contains(extractId(first));
    }

    @Test
    void missingDialogReturnsExplicitError() throws Exception {
        mockMvc.perform(post("/api/chat/messages")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "dialogId": "missing",
                                  "clientRequestId": "test-missing-dialog",
                                  "content": "番茄叶片有斑点"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code", is(404)))
                .andExpect(jsonPath("$.message", is("CHAT_DIALOG_NOT_FOUND")));
    }

    private String extractId(String json) throws Exception {
        com.fasterxml.jackson.databind.JsonNode root = new com.fasterxml.jackson.databind.ObjectMapper().readTree(json);
        return root.path("data").path("id").asText();
    }
}
