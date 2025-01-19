import { DateService } from './dates';
import type { Spread, SpreadTasks, Task } from '../types';

export class SpreadService {
  /**
   * Get the spread that shows yesterday/today
   */
  static getTodaySpread(): Spread {
    return {
      leftDate: DateService.getYesterday(),
      rightDate: DateService.getToday()
    };
  }

  /**
   * Get the next spread after the given spread
   */
  static getNextSpread(spread: Spread): Spread {
    return {
      leftDate: DateService.getRelativeDate(spread.leftDate, 2),
      rightDate: DateService.getRelativeDate(spread.rightDate, 2)
    };
  }

  /**
   * Get the previous spread before the given spread
   */
  static getPreviousSpread(spread: Spread): Spread {
    return {
      leftDate: DateService.getRelativeDate(spread.leftDate, -2),
      rightDate: DateService.getRelativeDate(spread.rightDate, -2)
    };
  }

  /**
   * Get tasks for a given spread
   */
  static getTasksForSpread(spread: Spread, tasks: Task[]): SpreadTasks {
    return {
      leftTasks: tasks.filter(t => t.date === spread.leftDate && !t.deleted),
      rightTasks: tasks.filter(t => t.date === spread.rightDate && !t.deleted)
    };
  }

  /**
   * Debug function to validate a spread
   */
  static validateSpread(spread: Spread): void {
    console.log('Spread validation:', {
      spread,
      today: DateService.getToday(),
      leftIsBeforeRight: spread.leftDate < spread.rightDate,
      daysApart: DateService.getDaysDifference(spread.leftDate, spread.rightDate)
    });
  }
}
