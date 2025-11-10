export const PULSAR_TOPICS = {
  TASK_EVENTS: 'persistent://public/default/task-events',
  TASK_CREATED: 'persistent://public/default/task-created',
  TASK_UPDATED: 'persistent://public/default/task-updated',
  TASK_DELETED: 'persistent://public/default/task-deleted',
} as const;

export type PulsarTopic = (typeof PULSAR_TOPICS)[keyof typeof PULSAR_TOPICS];
