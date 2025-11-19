export interface TaskEventData {
  taskId: string;
  userId: string;
  eventType: string;
  status?: string;
  priority?: string;
  assignedTo?: string;
  metadata?: any;
}
