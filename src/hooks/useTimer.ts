import { useState, useEffect, useCallback } from 'react';
import { TimerState, TimerMode } from '../types';

const WORK_TIME = 25 * 60; // 25 minutes in seconds
const SHORT_BREAK_TIME = 5 * 60; // 5 minutes in seconds
const LONG_BREAK_TIME = 15 * 60; // 15 minutes in seconds
const POMODOROS_UNTIL_LONG_BREAK = 4;

export const useTimer = () => {
  const [timerState, setTimerState] = useState<TimerState>({
    mode: 'work',
    timeLeft: WORK_TIME,
    isRunning: false,
    completedPomodoros: 0,
  });

  const startTimer = useCallback(() => {
    setTimerState(prev => ({ ...prev, isRunning: true }));
  }, []);

  const pauseTimer = useCallback(() => {
    setTimerState(prev => ({ ...prev, isRunning: false }));
  }, []);

  const resetTimer = useCallback(() => {
    setTimerState({
      mode: 'work',
      timeLeft: WORK_TIME,
      isRunning: false,
      completedPomodoros: 0,
    });
  }, []);

  const switchMode = useCallback((mode: TimerMode) => {
    const timeMap = {
      work: WORK_TIME,
      shortBreak: SHORT_BREAK_TIME,
      longBreak: LONG_BREAK_TIME,
    };
    setTimerState(prev => ({
      ...prev,
      mode,
      timeLeft: timeMap[mode],
      isRunning: false,
    }));
  }, []);

  useEffect(() => {
    let interval: number | undefined;

    if (timerState.isRunning && timerState.timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimerState(prev => {
          if (prev.timeLeft <= 1) {
            // Timer completed
            if (prev.mode === 'work') {
              const newCompletedPomodoros = prev.completedPomodoros + 1;
              const shouldTakeLongBreak = newCompletedPomodoros % POMODOROS_UNTIL_LONG_BREAK === 0;
              
              return {
                mode: shouldTakeLongBreak ? 'longBreak' : 'shortBreak',
                timeLeft: shouldTakeLongBreak ? LONG_BREAK_TIME : SHORT_BREAK_TIME,
                isRunning: false,
                completedPomodoros: newCompletedPomodoros,
              };
            } else {
              // Break completed, switch back to work
              return {
                mode: 'work',
                timeLeft: WORK_TIME,
                isRunning: false,
                completedPomodoros: prev.completedPomodoros,
              };
            }
          }

          return {
            ...prev,
            timeLeft: prev.timeLeft - 1,
          };
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [timerState.isRunning]);

  return {
    timerState,
    startTimer,
    pauseTimer,
    resetTimer,
    switchMode,
  };
}; 