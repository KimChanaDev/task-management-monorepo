import { TaskEventType, TaskEventTopic } from '@repo/pulsar/types';

export class PulsarLogic {
  static detemineTopicByEvent(eventType: TaskEventType): string {
    let topic: string;

    switch (eventType) {
      case TaskEventType.TASK_CREATED:
        topic = TaskEventTopic.TASK_CREATED;
        break;
      case TaskEventType.TASK_UPDATED:
        topic = TaskEventTopic.TASK_UPDATED;
        break;
      case TaskEventType.TASK_DELETED:
        topic = TaskEventTopic.TASK_DELETED;
        break;
      default:
        topic = TaskEventTopic.TASK_EVENTS;
    }
    return topic;
  }
}
