package com.agriapp.chat.provider;

public class ChatProviderResponse {

    private String provider;
    private String model;
    private String rawContent;

    public ChatProviderResponse(String provider, String model, String rawContent) {
        this.provider = provider;
        this.model = model;
        this.rawContent = rawContent;
    }

    public String getProvider() {
        return provider;
    }

    public String getModel() {
        return model;
    }

    public String getRawContent() {
        return rawContent;
    }
}
