export type RecognitionStatus = 'pending' | 'processing' | 'completed';

export type DangerLevel = 'high' | 'medium' | 'low';

export interface RecognitionResult {
  id: string;
  userId: string;
  imageUri: string;
  status: RecognitionStatus;
  pestName: string;
  confidence: string;
  dangerLevel: DangerLevel;
  createdAt: string;
}

export interface RecognitionHistoryItem extends RecognitionResult {
  cropName?: string;
}