export type DialogStatus = 'active' | 'ended';

export type DialogRole = 'user' | 'ai' | 'expert' | 'system';

export type MessageType = 'text' | 'voice' | 'image';

export type AiAnswerKind =
  | 'CLARIFICATION'
  | 'IMAGE_RETAKE'
  | 'DIFFERENTIAL_DIAGNOSIS'
  | 'GENERAL_ADVICE'
  | 'SAFETY_ESCALATION'
  | 'OUT_OF_SCOPE';

export type EvidenceSufficiency = 'insufficient' | 'partial' | 'sufficient';

export type SupportLevel = 'weak' | 'moderate' | 'strong';

export interface AiImageQuality {
  level: 'not_applicable' | 'poor' | 'usable' | 'good';
  issues: string[];
  retakeSuggestions: string[];
}

export interface AiCandidate {
  name: string;
  supportLevel: SupportLevel;
  supportingEvidence: string[];
  contradictingEvidence: string[];
  confirmNext: string[];
}

export interface AiStructuredContent {
  schemaVersion: string;
  intent?: string;
  answerKind: AiAnswerKind;
  summary: string;
  evidenceSufficiency: EvidenceSufficiency;
  imageQuality: AiImageQuality;
  observations: string[];
  candidates: AiCandidate[];
  followUpQuestions: string[];
  actionsNow: string[];
  avoidActions: string[];
  monitoring: string[];
  seekExpert: {
    required: boolean;
    reason?: string | null;
  };
  safetyNotice: string;
}

export interface ChatContext {
  cropName?: string;
  growthStage?: string;
  affectedPart?: 'leaf' | 'stem' | 'root' | 'fruit' | 'flower' | 'whole' | '';
  symptomDescription?: string;
  onset?: string;
  spread?: 'unknown' | 'stable' | 'slow' | 'fast' | '';
  recentWeather?: string;
}

export interface RecognitionSnapshot {
  recognitionId?: string;
  cropName?: string;
  pestName?: string;
  confidence?: string;
  imageQuality?: string;
  note?: string;
}

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
  provider?: string;
  model?: string;
  clientRequestId?: string;
  structuredContent?: AiStructuredContent;
  createdAt: string;
}

export interface ChatImageAsset {
  uri: string;
  fileName?: string | null;
  mimeType?: string | null;
  fileSize?: number;
  width?: number;
  height?: number;
}

export interface SendMessageParams {
  content: string;
  type?: MessageType;
  clientRequestId: string;
  context?: ChatContext;
  recognitionSnapshot?: RecognitionSnapshot | null;
  images?: ChatImageAsset[];
}
