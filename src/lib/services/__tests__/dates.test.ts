import { describe, it, expect } from 'vitest';
import { DateService } from '../dates';

describe('DateService', () => {
	describe('Moving tasks to today', () => {
		it('should correctly identify today when moving tasks', () => {
			// Get actual today's date string
			const actualToday = DateService.getToday();

			// Create some test dates
			const yesterday = DateService.getRelativeDate(actualToday, -1);

			// Test that getToday() returns the same date regardless of the source date
			expect(DateService.getToday()).toBe(actualToday);

			// Move the task to today
			const taskDate = DateService.getToday();

			// Additional verification that the dates align
			expect(DateService.getRelativeDayDescription(taskDate)).toBe('today');

			// This test should fail because in our UI, the task is appearing on yesterday's page
			expect(taskDate).not.toBe(yesterday);
		});

		it('should show today on the right page when using page offsets', () => {
			const today = DateService.getToday();
			const tomorrow = DateService.getTomorrow();

			// In our UI, we use currentDate + offset to determine page dates
			// currentDate is set to tomorrow to show yesterday/today spread
			const currentDate = tomorrow;

			// Get the dates that would show on each page
			const leftPageDate = DateService.getRelativeDate(currentDate, -1); // Should be today
			const rightPageDate = DateService.getRelativeDate(currentDate, 0); // Should be tomorrow

			// This test should fail because our UI is showing today's tasks on the left page
			expect(leftPageDate).toBe(today);
			expect(rightPageDate).toBe(tomorrow);

			// When we move a task to "today", it should appear on the right page
			const taskDate = DateService.getToday();
			expect(taskDate).toBe(rightPageDate);
		});
	});
});
