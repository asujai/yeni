export type TimerMode = 'work' | 'shortBreak' | 'longBreak';

export interface TimerState {
  mode: TimerMode;
  timeLeft: number;
  isRunning: boolean;
  completedPomodoros: number;
}

export interface Theme {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
  };
} 