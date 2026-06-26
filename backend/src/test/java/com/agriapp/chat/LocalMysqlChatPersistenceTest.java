package com.agriapp.chat;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = "agri.ai.provider=mock")
@AutoConfigureMockMvc
@ActiveProfiles("local")
@EnabledIfEnvironmentVariable(named = "AGRI_DB_TESTS", matches = "true")
class LocalMysqlChatPersistenceTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void localProfilePersistsDialogMessagesSnapshotsAndIdempotency() throws Exception {
        String dialogId = createDialog();
        String clientRequestId = "it-" + UUID.randomUUID();
        String requestBody = messageRequest(dialogId, clientRequestId);

        ResultActions firstActions = sendMessage(requestBody)
                .andExpect(jsonPath("$.data.sender", is("ai")))
                .andExpect(jsonPath("$.data.provider", is("mock")))
                .andExpect(jsonPath("$.data.model", is("mock-agri-diagnosis-v1")))
                .andExpect(jsonPath("$.data.promptVersion", is("agri-ai-v1")))
                .andExpect(jsonPath("$.data.structuredContent.answerKind", is("DIFFERENTIAL_DIAGNOSIS")))
                .andExpect(jsonPath("$.data.contextSnapshot.cropName", is("tomato")))
                .andExpect(jsonPath("$.data.recognitionSnapshot.recognitionId", is("rec-test-001")));
        JsonNode first = objectMapper.readTree(firstActions.andReturn().getResponse().getContentAsString());
        String aiMessageId = first.path("data").path("id").asText();

        JsonNode duplicate = objectMapper.readTree(sendMessage(requestBody).andReturn().getResponse().getContentAsString());
        assertThat(duplicate.path("data").path("id").asText()).isEqualTo(aiMessageId);

        Integer rowsForRequest = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM agri_ai_message WHERE dialog_id = ? AND client_request_id = ? AND deleted = 0",
                Integer.class,
                dialogId,
                clientRequestId);
        assertThat(rowsForRequest).isEqualTo(2);

        String lastMessageAt = jdbcTemplate.queryForObject(
                "SELECT last_message_at FROM agri_ai_dialog WHERE id = ? AND deleted = 0",
                String.class,
                dialogId);
        assertThat(lastMessageAt).isNotBlank();

        String snapshotCrop = jdbcTemplate.queryForObject(
                "SELECT JSON_UNQUOTE(JSON_EXTRACT(context_snapshot, '$.cropName')) FROM agri_ai_message WHERE id = ?",
                String.class,
                aiMessageId);
        assertThat(snapshotCrop).isEqualTo("tomato");

        mockMvc.perform(get("/api/chat/dialogs/{dialogId}/messages", dialogId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code", is(200)))
                .andExpect(jsonPath("$.data.length()", greaterThanOrEqualTo(2)))
                .andExpect(jsonPath("$.data[?(@.id == '%s')].sender".formatted(aiMessageId), is(List.of("ai"))));

        jdbcTemplate.update("UPDATE agri_ai_message SET deleted = 1 WHERE id = ?", aiMessageId);
        JsonNode historyAfterDelete = objectMapper.readTree(mockMvc.perform(get("/api/chat/dialogs/{dialogId}/messages", dialogId))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString());
        assertThat(historyAfterDelete.path("data").findValuesAsText("id")).doesNotContain(aiMessageId);
    }

    @Test
    void localProfileReturnsExplicitErrorForMissingDialog() throws Exception {
        mockMvc.perform(post("/api/chat/messages")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(messageRequest("missing-" + UUID.randomUUID(), "missing-" + UUID.randomUUID())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code", is(404)))
                .andExpect(jsonPath("$.message", is("CHAT_DIALOG_NOT_FOUND")));
    }

    private String createDialog() throws Exception {
        JsonNode response = objectMapper.readTree(mockMvc.perform(post("/api/chat/dialogs")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"roleType\":\"expert\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code", is(200)))
                .andExpect(jsonPath("$.data.scene", is("diagnosis")))
                .andReturn()
                .getResponse()
                .getContentAsString());
        return response.path("data").path("id").asText();
    }

    private ResultActions sendMessage(String requestBody) throws Exception {
        return mockMvc.perform(post("/api/chat/messages")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code", is(200)));
    }

    private String messageRequest(String dialogId, String clientRequestId) {
        return """
                {
                  "dialogId": "%s",
                  "clientRequestId": "%s",
                  "content": "tomato leaf has brown expanding spots after rain",
                  "type": "text",
                  "context": {
                    "cropName": "tomato",
                    "affectedPart": "leaf",
                    "symptomDescription": "brown expanding spots",
                    "recentWeather": "rainy"
                  },
                  "recognitionSnapshot": {
                    "recognitionId": "rec-test-001",
                    "cropName": "tomato",
                    "pestName": "leaf disease clue",
                    "confidence": "0.61",
                    "imageQuality": "usable",
                    "note": "only a clue"
                  }
                }
                """.formatted(dialogId, clientRequestId);
    }

}
