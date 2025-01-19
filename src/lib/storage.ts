import type { Task } from './types';

const STORAGE_KEY = 'notebook-tasks';

export function loadTasks(): Task[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function saveTasks(tasks: Task[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

export function getDateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function getYesterdayDate(): string {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return getDateString(date);
}

export function getTodayDate(): string {
  return getDateString(new Date());
}

export function getTomorrowDate(): string {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return getDateString(date);
}
