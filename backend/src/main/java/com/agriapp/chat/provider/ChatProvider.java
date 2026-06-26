package com.agriapp.chat.provider;

public interface ChatProvider {

    ChatProviderResponse generate(ChatProviderRequest request);

    default ChatProviderResponse repair(ChatProviderRequest request, String invalidContent) {
        return new ChatProviderResponse("unknown", "none", invalidContent);
    }
}
