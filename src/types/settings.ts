export interface PomodoroSettings {
  workDuration: number; // seconds
  shortBreakDuration: number; // seconds
  longBreakDuration: number; // seconds
  soundEnabled: boolean;
  theme: 'default' | 'blue' | 'red' | 'orange' | 'black';
} 