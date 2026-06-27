import type {
  AiStructuredContent,
  ChatImageAsset,
  DialogMessage,
  DialogRole,
  IntelligentDialog,
  MessageType,
  SendMessageParams,
} from '../types';
import { API_BASE_URL } from './config';

export class ChatServiceError extends Error {
  errorCode: string;

  constructor(errorCode: string, message?: string) {
    super(message || errorCode);
    this.name = 'ChatServiceError';
    this.errorCode = errorCode;
  }
}

const convertMessage = (item: any): DialogMessage => ({
  id: item.id,
  dialogId: item.dialogId,
  sender: item.sender,
  content: item.content,
  type: (item.type || 'text') as MessageType,
  provider: item.provider,
  model: item.model,
  clientRequestId: item.clientRequestId,
  structuredContent: item.structuredContent as AiStructuredContent | undefined,
  createdAt: item.createdAt,
});

const convertDialog = (item: any): IntelligentDialog => ({
  id: item.id,
  userId: item.userId || 'user_001',
  roleType: (item.roleType || 'expert') as DialogRole,
  status: item.status || 'active',
  startTime: item.startTime || item.createdAt,
  createdAt: item.createdAt,
});

const readApiResponse = async (response: Response) => {
  let result: any;
  try {
    result = await response.json();
  } catch {
    throw new ChatServiceError('CHAT_INVALID_RESPONSE', '服务返回格式异常');
  }
  if (!response.ok) {
    throw new ChatServiceError(result?.message || 'CHAT_HTTP_ERROR', '服务请求失败');
  }
  if (result.code !== 200 || !result.data) {
    throw new ChatServiceError(result.message || 'CHAT_REQUEST_FAILED', 'AI 问答请求失败');
  }
  return result.data;
};

const toMultipartFile = (image: ChatImageAsset, index: number) => {
  const name = image.fileName || `diagnosis_${index + 1}.jpg`;
  const type = image.mimeType || 'image/jpeg';
  return {
    uri: image.uri,
    name,
    type,
  } as any;
};

const validateImages = (images: ChatImageAsset[] = []) => {
  if (images.length > 3) {
    throw new ChatServiceError('AI_IMAGE_TOO_MANY', '最多选择 3 张图片');
  }
  const allowed = new Set(['image/jpeg', 'image/png', 'image/webp']);
  const totalSize = images.reduce((sum, image) => sum + (image.fileSize || 0), 0);
  if (totalSize > 20 * 1024 * 1024) {
    throw new ChatServiceError('AI_IMAGE_TOO_LARGE', '图片总大小不能超过 20 MB');
  }
  images.forEach((image) => {
    if (image.fileSize && image.fileSize > 8 * 1024 * 1024) {
      throw new ChatServiceError('AI_IMAGE_TOO_LARGE', '单张图片不能超过 8 MB');
    }
    if (image.mimeType && !allowed.has(image.mimeType)) {
      throw new ChatServiceError('AI_IMAGE_INVALID_TYPE', '仅支持 JPG、PNG 或 WebP 图片');
    }
  });
};

export const chatService = {
  createDialog: async (roleType?: DialogRole): Promise<IntelligentDialog> => {
    const response = await fetch(`${API_BASE_URL}/api/chat/dialogs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roleType }),
    });
    return convertDialog(await readApiResponse(response));
  },

  sendMessage: async (dialogId: string, params: SendMessageParams): Promise<DialogMessage> => {
    validateImages(params.images);
    if (params.images?.length) {
      return chatService.sendMultimodalMessage(dialogId, params);
    }

    const response = await fetch(`${API_BASE_URL}/api/chat/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dialogId,
        content: params.content,
        type: params.type || 'text',
        clientRequestId: params.clientRequestId,
        context: params.context,
        recognitionSnapshot: params.recognitionSnapshot,
      }),
    });
    return convertMessage(await readApiResponse(response));
  },

  sendMultimodalMessage: async (dialogId: string, params: SendMessageParams): Promise<DialogMessage> => {
    const formData = new FormData();
    formData.append(
      'request',
      JSON.stringify({
        dialogId,
        content: params.content,
        type: params.type || 'text',
        clientRequestId: params.clientRequestId,
        context: params.context,
        recognitionSnapshot: params.recognitionSnapshot,
      }),
    );
    params.images?.forEach((image, index) => {
      formData.append('images', toMultipartFile(image, index));
    });

    const response = await fetch(`${API_BASE_URL}/api/chat/messages/multimodal`, {
      method: 'POST',
      body: formData,
    });
    return convertMessage(await readApiResponse(response));
  },

  getHistory: async (dialogId: string): Promise<DialogMessage[]> => {
    const response = await fetch(`${API_BASE_URL}/api/chat/dialogs/${dialogId}/messages`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await readApiResponse(response);
    if (!Array.isArray(data)) {
      throw new ChatServiceError('CHAT_INVALID_RESPONSE', '历史消息格式异常');
    }
    return data.map(convertMessage);
  },

  getDefaultMessages: async (): Promise<DialogMessage[]> => chatService.getHistory('dialog_001'),
};
