import type { Task } from '../types';
import { saveTasks } from '../storage';

export class TaskService {
  constructor(private tasks: Task[]) {}

  getTasksForDate(date: string): Task[] {
    return this.tasks.filter(t => t.date === date);
  }

  updateTask(task: Task): void {
    const index = this.tasks.findIndex(t => t.id === task.id);
    if (index >= 0) {
      this.tasks[index] = task;
    } else {
      this.tasks.push(task);
    }
    saveTasks(this.tasks);
  }

  moveTask(taskId: string, targetDate: string): void {
    const task = this.tasks.find(t => t.id === taskId);
    if (!task) return;

    this.updateTask({
      ...task,
      date: targetDate
    });
  }

  createTask(text: string, date: string): Task {
    const task: Task = {
      id: crypto.randomUUID(),
      text: text.trim(),
      completed: false,
      date,
      createdAt: Date.now()
    };
    this.updateTask(task);
    return task;
  }
}
