package com.agriapp.chat.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "agri.ai")
public class AiChatProperties {

    private String provider = "mock";
    private String diagnosisMode = "two-pass";
    private int maxHistory = 10;
    private int maxImages = 3;
    private Doubao doubao = new Doubao();

    public String getProvider() {
        return provider;
    }

    public void setProvider(String provider) {
        this.provider = provider;
    }

    public String getDiagnosisMode() {
        return diagnosisMode;
    }

    public void setDiagnosisMode(String diagnosisMode) {
        this.diagnosisMode = diagnosisMode;
    }

    public int getMaxHistory() {
        return maxHistory;
    }

    public void setMaxHistory(int maxHistory) {
        this.maxHistory = maxHistory;
    }

    public int getMaxImages() {
        return maxImages;
    }

    public void setMaxImages(int maxImages) {
        this.maxImages = maxImages;
    }

    public Doubao getDoubao() {
        return doubao;
    }

    public void setDoubao(Doubao doubao) {
        this.doubao = doubao;
    }

    public static class Doubao {
        private String apiKey = "";
        private String baseUrl = "https://ark.cn-beijing.volces.com/api/v3";
        private String textModel = "";
        private String visionModel = "";
        private int timeoutSeconds = 30;

        public String getApiKey() {
            return apiKey;
        }

        public void setApiKey(String apiKey) {
            this.apiKey = apiKey;
        }

        public String getBaseUrl() {
            return baseUrl;
        }

        public void setBaseUrl(String baseUrl) {
            this.baseUrl = baseUrl;
        }

        public String getTextModel() {
            return textModel;
        }

        public void setTextModel(String textModel) {
            this.textModel = textModel;
        }

        public String getVisionModel() {
            return visionModel;
        }

        public void setVisionModel(String visionModel) {
            this.visionModel = visionModel;
        }

        public int getTimeoutSeconds() {
            return timeoutSeconds;
        }

        public void setTimeoutSeconds(int timeoutSeconds) {
            this.timeoutSeconds = timeoutSeconds;
        }
    }
}
