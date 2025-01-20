import { DateService } from './dates';
import type { Spread, SpreadTasks, Task } from '../types';

export class SpreadService {
  /**
   * Get the spread that shows yesterday/today
   */
  static getTodaySpread(): Spread {
    const today = DateService.getToday();
    const yesterday = DateService.getYesterday();
    console.log('Creating today spread:', { today, yesterday });
    return {
      leftDate: yesterday,
      rightDate: today
    };
  }

  /**
   * Get the next spread after the given spread
   */
  static getNextSpread(spread: Spread): Spread {
    const nextLeft = DateService.getRelativeDate(spread.leftDate, 2);
    const nextRight = DateService.getRelativeDate(spread.rightDate, 2);
    console.log('Getting next spread:', { 
      current: spread,
      next: { leftDate: nextLeft, rightDate: nextRight }
    });
    return {
      leftDate: nextLeft,
      rightDate: nextRight
    };
  }

  /**
   * Get the previous spread before the given spread
   */
  static getPreviousSpread(spread: Spread): Spread {
    const prevLeft = DateService.getRelativeDate(spread.leftDate, -2);
    const prevRight = DateService.getRelativeDate(spread.rightDate, -2);
    console.log('Getting previous spread:', { 
      current: spread,
      previous: { leftDate: prevLeft, rightDate: prevRight }
    });
    return {
      leftDate: prevLeft,
      rightDate: prevRight
    };
  }

  /**
   * Get tasks for a given spread
   */
  static getTasksForSpread(spread: Spread, tasks: Task[]): SpreadTasks {
    const leftTasks = tasks.filter(t => t.date === spread.leftDate && !t.deleted);
    const rightTasks = tasks.filter(t => t.date === spread.rightDate && !t.deleted);
    console.log('Getting tasks for spread:', {
      spread,
      leftTaskDates: leftTasks.map(t => t.date),
      rightTaskDates: rightTasks.map(t => t.date)
    });
    return { leftTasks, rightTasks };
  }

  /**
   * Debug function to validate a spread
   */
  static validateSpread(spread: Spread): void {
    const today = DateService.getToday();
    console.log('Spread validation:', {
      spread,
      today,
      leftIsBeforeRight: spread.leftDate < spread.rightDate,
      daysApart: DateService.getDaysDifference(spread.leftDate, spread.rightDate),
      leftDaysFromToday: DateService.getDaysDifference(today, spread.leftDate),
      rightDaysFromToday: DateService.getDaysDifference(today, spread.rightDate)
    });
  }
}
