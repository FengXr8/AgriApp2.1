export type DialogStatus = 'active' | 'ended';

export type DialogRole = 'user' | 'ai' | 'expert' | 'system';

export type MessageType = 'text' | 'voice' | 'image';

export interface IntelligentDialog {
  id: string;
  userId: string;
  roleType: DialogRole;
  status: DialogStatus;
  startTime: string;
  endTime?: string;
  createdAt: string;
}

export interface DialogMessage {
  id: string;
  dialogId: string;
  sender: DialogRole;
  content: string;
  type: MessageType;
  structuredContent?: {
    title: string;
    points: string[];
    details?: string;
  };
  createdAt: string;
}