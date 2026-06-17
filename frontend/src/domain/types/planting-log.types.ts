export type LogType = 'growth' | 'farming' | 'disease' | 'weather';

export interface PlantingLog {
  id: string;
  userId: string;
  cropId: string;
  cropName: string;
  logType: LogType;
  recordDate: string;
  content: string;
  images?: string[];
  createdAt: string;
}