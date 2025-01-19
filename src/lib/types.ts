export interface Task {
  id: string;
  text: string;
  completed: boolean;
  date: string; // ISO date string YYYY-MM-DD
  createdAt: number; // timestamp
}

export type TaskDay = 'yesterday' | 'today' | 'tomorrow' | string;

export interface Spread {
  leftDate: string;
  rightDate: string;
}

export interface SpreadTasks {
  leftTasks: Task[];
  rightTasks: Task[];
}
