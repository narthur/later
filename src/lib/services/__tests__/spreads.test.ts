import { describe, it, expect } from 'vitest';
import { SpreadService } from '../spreads';
import { DateService } from '../dates';

describe('SpreadService', () => {
  it('should show tasks on the correct page', () => {
    // Get today's spread
    const spread = SpreadService.getTodaySpread();
    
    // Create a task for today
    const task = {
      id: '1',
      text: 'test task',
      completed: false,
      date: DateService.getToday(),
      createdAt: Date.now()
    };
    
    // Get tasks for the spread
    const spreadTasks = SpreadService.getTasksForSpread(spread, [task]);
    
    // Task should appear on the right page (today)
    expect(spreadTasks.rightTasks).toHaveLength(1);
    expect(spreadTasks.leftTasks).toHaveLength(0);
    expect(spreadTasks.rightTasks[0].date).toBe(task.date);
  });

  it('should handle tasks moved to a specific date', () => {
    // Create a spread for Jan 22/23
    const spread = {
      leftDate: '2025-01-22',
      rightDate: '2025-01-23'
    };

    // Create a task dated Jan 23
    const task = {
      id: '1',
      text: 'test task',
      completed: false,
      date: '2025-01-23',
      createdAt: Date.now()
    };

    // Get tasks for the spread
    const spreadTasks = SpreadService.getTasksForSpread(spread, [task]);

    // Task should appear on the right page (Jan 23)
    expect(spreadTasks.rightTasks).toHaveLength(1);
    expect(spreadTasks.leftTasks).toHaveLength(0);
    expect(spreadTasks.rightTasks[0].date).toBe('2025-01-23');
  });

  it('should display tasks on the correct page', () => {
    // This test simulates the actual UI behavior
    const today = DateService.getToday();
    
    // Create a task dated Jan 23
    const task = {
      id: '1',
      text: 'test task',
      completed: false,
      date: '2025-01-23',
      createdAt: Date.now()
    };
    
    // Get the spread that should show Jan 23
    const spread = {
      leftDate: '2025-01-22',
      rightDate: '2025-01-23'
    };
    
    // Get tasks for the spread
    const spreadTasks = SpreadService.getTasksForSpread(spread, [task]);
    
    console.log('UI page calculation:', {
      taskDate: task.date,
      today,
      spread,
      leftTasks: spreadTasks.leftTasks.map(t => t.date),
      rightTasks: spreadTasks.rightTasks.map(t => t.date)
    });
    
    // Task should appear on the right page (Jan 23)
    expect(spreadTasks.rightTasks).toHaveLength(1);
    expect(spreadTasks.leftTasks).toHaveLength(0);
    expect(spreadTasks.rightTasks[0].date).toBe('2025-01-23');
  });
});
