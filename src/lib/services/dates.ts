import { getDateString } from '../storage';

export class DateService {
  // Add getDateString as a static method
  static getDateString(date: Date): string {
    // Use local timezone for date string
    const result = new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
      .toISOString()
      .split('T')[0];
    console.log('DateService.getDateString:', { 
      input: date.toISOString(),
      offset: date.getTimezoneOffset(),
      result 
    });
    return result;
  }

  // Get today's date string in local timezone
  static getToday(): string {
    const today = new Date();
    return this.getDateString(today);
  }

  // Get yesterday's date string
  static getYesterday(): string {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return this.getDateString(yesterday);
  }

  // Get tomorrow's date string
  static getTomorrow(): string {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return this.getDateString(tomorrow);
  }

  // Get a relative date string from a reference date
  static getRelativeDate(referenceDate: string | Date, offsetDays: number): string {
    const date = typeof referenceDate === 'string' ? new Date(referenceDate + 'T00:00:00') : new Date(referenceDate);
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + offsetDays);
    const result = this.getDateString(date);
    console.log('DateService.getRelativeDate:', { 
      referenceDate: typeof referenceDate === 'string' ? referenceDate : referenceDate.toISOString(),
      offsetDays,
      result 
    });
    return result;
  }

  // Compare two dates and return the difference in days
  static getDaysDifference(date1: string, date2: string): number {
    const d1 = new Date(date1 + 'T00:00:00');
    const d2 = new Date(date2 + 'T00:00:00');
    d1.setHours(0, 0, 0, 0);
    d2.setHours(0, 0, 0, 0);
    return Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
  }

  // Get a human-readable description of a date relative to today
  static getRelativeDayDescription(date: string): string {
    const diffDays = this.getDaysDifference(this.getToday(), date);
    
    if (diffDays === 0) return 'today';
    if (diffDays === -1) return 'yesterday';
    if (diffDays === 1) return 'tomorrow';
    if (diffDays < 0) return `${-diffDays} days ago`;
    return `in ${diffDays} days`;
  }
}
