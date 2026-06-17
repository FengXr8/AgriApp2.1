export type TaskStatus = 'pending' | 'completed' | 'overdue';

export interface TaskReminder {
  id: string;
  userId: string;
  cropId: string;
  cropName: string;
  title: string;
  description: string;
  reminderTime: string;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
}