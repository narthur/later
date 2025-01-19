export interface Task {
  id: string;
  text: string;
  completed: boolean;
  date: string; // ISO date string YYYY-MM-DD
  createdAt: number; // timestamp
}

export type TaskDay = 'yesterday' | 'today' | 'tomorrow' | string;
