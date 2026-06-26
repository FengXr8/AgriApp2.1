package com.agriapp.chat;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {
        "agri.ai.provider=doubao",
        "agri.ai.doubao.api-key=",
        "agri.ai.doubao.text-model=test-model"
})
@AutoConfigureMockMvc
@ActiveProfiles("mock")
class DoubaoProviderConfigTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void doubaoProviderWithoutApiKeyReturnsExplicitError() throws Exception {
        mockMvc.perform(post("/api/chat/messages")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "dialogId": "dialog_001",
                                  "clientRequestId": "doubao-no-key-001",
                                  "content": "番茄叶片有斑点"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code", is(503)))
                .andExpect(jsonPath("$.message", is("AI_PROVIDER_NOT_CONFIGURED")));
    }
}
