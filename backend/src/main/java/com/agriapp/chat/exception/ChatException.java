package com.agriapp.chat.exception;

public class ChatException extends RuntimeException {

    private final int httpCode;
    private final String errorCode;

    public ChatException(int httpCode, String errorCode, String message) {
        super(message);
        this.httpCode = httpCode;
        this.errorCode = errorCode;
    }

    public int getHttpCode() {
        return httpCode;
    }

    public String getErrorCode() {
        return errorCode;
    }
}
