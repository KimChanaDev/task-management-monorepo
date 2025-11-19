export class MetricsLogic {
  public static calculateProductivityScore(
    tasksCreated: number,
    tasksCompleted: number,
    tasksInProgress: number,
  ): number {
    if (tasksCreated === 0) return 0;

    const completionRate = (tasksCompleted / tasksCreated) * 100;
    const activityBonus = Math.min(tasksInProgress * 5, 20);

    return Math.min(completionRate + activityBonus, 100);
  }

  public static calculateCompletionRate(
    tasksCreated: number,
    tasksCompleted: number,
  ): number {
    return tasksCreated > 0 ? (tasksCompleted / tasksCreated) * 100 : 0;
  }
}
