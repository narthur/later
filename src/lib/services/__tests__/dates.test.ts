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

		it('should show today on the left page when using page offsets', () => {
			const today = DateService.getToday();
			const tomorrow = DateService.getTomorrow();
			
			// In our UI, we use currentDate + offset to determine page dates
			// currentDate is set to tomorrow to show yesterday/today spread
			const currentDate = tomorrow;
			
			// Get the dates that would show on each page
			const leftPageDate = DateService.getRelativeDate(currentDate, -1);  // Should be today
			const rightPageDate = DateService.getRelativeDate(currentDate, 0);  // Should be tomorrow
			
			console.log('Date calculations:', {
				today,
				tomorrow,
				currentDate,
				leftPageDate,
				rightPageDate
			});

			// When currentDate is set to tomorrow:
			// leftPageDate (-1 offset) should be today
			// rightPageDate (0 offset) should be tomorrow
			expect(leftPageDate).toBe(today);
			expect(rightPageDate).toBe(tomorrow);

			// When we move a task to "today", it should appear on the left page
			const taskDate = DateService.getToday();
			expect(taskDate).toBe(leftPageDate);
		});

		it('should display tasks on the correct page', () => {
			// This test simulates the actual UI behavior
			const today = DateService.getToday();
			const tomorrow = DateService.getTomorrow();
			
			// Set up our current view (showing yesterday/today spread)
			const currentDate = tomorrow; // This makes today show up on the left page
			
			// Create a task that's stored with today's date
			const task = {
				id: '1',
				text: 'test task',
				completed: false,
				date: today,
				createdAt: Date.now()
			};
			
			// Calculate which page dates would be shown
			const leftPageDate = DateService.getRelativeDate(currentDate, -1);
			const rightPageDate = DateService.getRelativeDate(currentDate, 0);
			
			console.log('UI page calculation:', {
				taskDate: task.date,
				today,
				leftPageDate,
				rightPageDate,
				shouldShowOnLeftPage: task.date === leftPageDate,
				shouldShowOnRightPage: task.date === rightPageDate
			});
			
			// The task should appear on the left page (today)
			expect(task.date).toBe(leftPageDate);
		});
	});
});
