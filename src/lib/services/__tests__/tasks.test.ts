import { describe, it, expect } from 'vitest';
import { TaskService } from '../tasks';
import { DateService } from '../dates';

describe('TaskService', () => {
  describe('moveTask', () => {
    it('should move task to the correct today date', () => {
      // Create a task from 5 days ago
      const fiveDaysAgo = DateService.getRelativeDate(DateService.getToday(), -5);
      const actualToday = DateService.getToday();
      
      const tasks = [{
        id: '1',
        text: 'old task',
        completed: false,
        date: fiveDaysAgo,
        createdAt: Date.now()
      }];
      
      // Use a mock save function to avoid localStorage
      const taskService = new TaskService(tasks, () => {});
      
      // Move the task to today
      taskService.moveTask('1', actualToday);
      
      // Get the updated task
      const updatedTask = tasks[0];
      
      // This assertion should fail, showing our bug
      expect(updatedTask.date).toBe(actualToday);
      expect(DateService.getRelativeDayDescription(updatedTask.date)).toBe('today');
    });
  });
});
