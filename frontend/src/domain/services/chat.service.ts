import type { IntelligentDialog, DialogMessage, DialogRole, MessageType } from '../types';
import { API_BASE_URL } from './config';

const mockDialog: IntelligentDialog = {
  id: 'dialog_001',
  userId: 'user_001',
  roleType: 'expert',
  status: 'active',
  startTime: '2026-06-16T08:00:00Z',
  createdAt: '2026-06-16T08:00:00Z',
};

const mockDefaultMessages: DialogMessage[] = [
  {
    id: 'msg_001',
    dialogId: 'dialog_001',
    sender: 'ai',
    content: '你好，我是农业助手，有什么可以帮你的？',
    type: 'text',
    createdAt: '2026-06-16T08:00:00Z',
  },
];

// 字段适配：将后端 DTO 转为前端类型
const convertMessage = (item: any): DialogMessage => {
  // 适配后端 structuredContent 可能是 null
  const structuredContent = item.structuredContent
    ? {
        title: item.structuredContent.title || '',
        points: item.structuredContent.points ?? item.structuredContent.suggestions ?? [],
        details: item.structuredContent.details || '',
      }
    : undefined;

  return {
    id: item.id,
    dialogId: item.dialogId,
    sender: item.sender,
    content: item.content,
    type: (item.type || 'text') as MessageType,
    structuredContent,
    createdAt: item.createdAt,
  };
};

const convertDialog = (item: any): IntelligentDialog => {
  return {
    id: item.id,
    userId: item.userId || 'user_001',
    roleType: (item.roleType || 'expert') as DialogRole,
    status: (item.status || 'active') as any,
    startTime: item.startTime || item.createdAt,
    createdAt: item.createdAt,
  };
};

// Fallback 消息
const fallbackUserMessage = (dialogId: string, content: string): DialogMessage => ({
  id: `fallback_user_${Date.now()}`,
  dialogId,
  sender: 'user',
  content,
  type: 'text',
  createdAt: new Date().toISOString(),
});

const fallbackAiMessage = (dialogId: string, content: string): DialogMessage => ({
  id: `fallback_ai_${Date.now()}`,
  dialogId,
  sender: 'ai',
  content: 'Fallback-本地AI回复（请求失败时使用）',
  type: 'text',
  createdAt: new Date().toISOString(),
});

export interface SendMessageParams {
  content: string;
  type?: MessageType;
}

export const chatService = {
  createDialog: async (roleType?: DialogRole): Promise<IntelligentDialog> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/dialogs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roleType }),
      });
      const result = await response.json();
      if (result.code === 200 && result.data) {
        return convertDialog(result.data);
      }
      console.warn('[chatService] unexpected response, using fallback');
      return {
        ...mockDialog,
        id: `dialog_${Date.now()}`,
        roleType: roleType || 'expert',
        startTime: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };
    } catch (error) {
      console.warn('[chatService] request failed, using fallback:', error);
      return {
        ...mockDialog,
        id: `dialog_${Date.now()}`,
        roleType: roleType || 'expert',
        startTime: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };
    }
  },

  sendMessage: async (dialogId: string, params: SendMessageParams): Promise<DialogMessage[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dialogId,
          content: params.content,
          sender: 'user',
          type: params.type || 'text',
        }),
      });
      const result = await response.json();
      if (result.code === 200 && result.data) {
        const userMessage: DialogMessage = {
          id: `msg_user_${Date.now()}`,
          dialogId,
          sender: 'user',
          content: params.content,
          type: params.type || 'text',
          createdAt: new Date().toISOString(),
        };
        const aiMessage = convertMessage(result.data);
        return [userMessage, aiMessage];
      }
      console.warn('[chatService] unexpected response, using fallback');
      return [fallbackUserMessage(dialogId, params.content), fallbackAiMessage(dialogId, params.content)];
    } catch (error) {
      console.warn('[chatService] request failed, using fallback:', error);
      return [fallbackUserMessage(dialogId, params.content), fallbackAiMessage(dialogId, params.content)];
    }
  },

  getHistory: async (dialogId: string): Promise<DialogMessage[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/dialogs/${dialogId}/messages`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const result = await response.json();
      if (result.code === 200 && Array.isArray(result.data)) {
        return result.data.map(convertMessage);
      }
      console.warn('[chatService] unexpected response, using fallback');
      return mockDefaultMessages;
    } catch (error) {
      console.warn('[chatService] request failed, using fallback:', error);
      return mockDefaultMessages;
    }
  },

  getDefaultMessages: async (): Promise<DialogMessage[]> => {
    return chatService.getHistory('dialog_001');
  },
};