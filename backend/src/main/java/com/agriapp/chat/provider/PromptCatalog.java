package com.agriapp.chat.provider;

import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Component
public class PromptCatalog {

    private final String systemPrompt;
    private final String observationPrompt;
    private final String diagnosisPrompt;
    private final String repairPrompt;

    public PromptCatalog() {
        this.systemPrompt = read("prompts/agri_ai_system_prompt.txt");
        this.observationPrompt = read("prompts/observation_prompt.txt");
        this.diagnosisPrompt = read("prompts/diagnosis_prompt.txt");
        this.repairPrompt = read("prompts/repair_prompt.txt");
    }

    public String systemPrompt() {
        return systemPrompt;
    }

    public String observationPrompt() {
        return observationPrompt;
    }

    public String diagnosisPrompt() {
        return diagnosisPrompt;
    }

    public String repairPrompt() {
        return repairPrompt;
    }

    private String read(String path) {
        try {
            return new ClassPathResource(path).getContentAsString(StandardCharsets.UTF_8);
        } catch (IOException e) {
            throw new IllegalStateException("Prompt resource missing: " + path, e);
        }
    }
}
