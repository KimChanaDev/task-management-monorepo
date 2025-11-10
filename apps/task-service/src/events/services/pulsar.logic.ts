import { PULSAR_TOPICS } from '../constants/topics.constant';
import { TaskEventType } from '../types/task-events.type';

export class PulsarLogic {
  static detemineTopicByEvent(eventType: TaskEventType): string {
    let topic: string;

    switch (eventType) {
      case TaskEventType.TASK_CREATED:
        topic = PULSAR_TOPICS.TASK_CREATED;
        break;
      case TaskEventType.TASK_UPDATED:
        topic = PULSAR_TOPICS.TASK_UPDATED;
        break;
      case TaskEventType.TASK_DELETED:
        topic = PULSAR_TOPICS.TASK_DELETED;
        break;
      default:
        topic = PULSAR_TOPICS.TASK_EVENTS;
    }
    return topic;
  }
}
