import type { Goal } from "@/types";

interface GoalStatus {
  percentage: number;
  isCompleted: boolean;
  daysLeft: number | null;
  isOverdue: boolean;
  isUrgent: boolean;
}

export const calculateGoalStatus = (goal: Goal): GoalStatus => {
  const current = Number(goal.currentAmount);
  const target = Number(goal.targetAmount);
  const percentage = (current / target) * 100;
  const isCompleted = percentage >= 100;

  let daysLeft: number | null = null;
  let isOverdue = false;

  if (goal.deadline) {
    const deadline = new Date(goal.deadline);
    const now = new Date();
    const diffTime = deadline.getTime() - now.getTime();
    daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    isOverdue = daysLeft < 0;
  }

  const isUrgent = daysLeft !== null && daysLeft > 0 && daysLeft < 30;

  return { percentage, isCompleted, daysLeft, isOverdue, isUrgent };
};
