import React from 'react';
import styled from 'styled-components';
import { useTimer } from '../hooks/useTimer';
import { defaultTheme, blueTheme, redTheme, orangeTheme, blackTheme } from '../themes';
import { Settings } from './Settings';
import { PomodoroSettings } from '../types/settings';

const TimerContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: ${props => props.style?.backgroundColor};
  color: ${props => props.style?.color};
  padding: 2rem;
`;

const TimerDisplay = styled.div`
  font-size: 6rem;
  font-weight: bold;
  margin: 2rem 0;
  color: ${props => props.style?.color};
`;

const ModeLabel = styled.div`
  font-size: 1.5rem;
  margin-bottom: 1rem;
  text-transform: capitalize;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary'; themeColors: any }>`
  padding: 0.75rem 1.5rem;
  font-size: 1.1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background-color: ${props =>
    props.variant === 'primary'
      ? props.themeColors.primary
      : props.themeColors.secondary};
  color: ${props =>
    // Eğer arka plan rengi çok koyuysa beyaz, çok açıksa siyah yap
    getContrastColor(props.variant === 'primary' ? props.themeColors.primary : props.themeColors.secondary)
  };
  transition: opacity 0.2s;
  &:hover {
    opacity: 0.9;
  }
`;

// Kontrast rengi hesaplama fonksiyonu
function getContrastColor(bgColor: string) {
  // bgColor: #rrggbb
  if (!bgColor.startsWith('#') || bgColor.length !== 7) return '#fff';
  const r = parseInt(bgColor.substr(1,2),16);
  const g = parseInt(bgColor.substr(3,2),16);
  const b = parseInt(bgColor.substr(5,2),16);
  // YIQ formülü
  const yiq = (r*299 + g*587 + b*114) / 1000;
  return yiq >= 128 ? '#222' : '#fff';
}

const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const getModeLabel = (mode: string): string => {
  switch (mode) {
    case 'work':
      return 'Çalışma Zamanı';
    case 'shortBreak':
      return 'Kısa Mola';
    case 'longBreak':
      return 'Uzun Mola';
    default:
      return mode;
  }
};

const getTheme = (theme: string) => {
  switch (theme) {
    case 'blue': return blueTheme;
    case 'red': return redTheme;
    case 'orange': return orangeTheme;
    case 'black': return blackTheme;
    default: return defaultTheme;
  }
};

const defaultSettings: PomodoroSettings = {
  workDuration: 25 * 60,
  shortBreakDuration: 5 * 60,
  longBreakDuration: 15 * 60,
  soundEnabled: true,
  theme: 'default',
};

export const Timer: React.FC = () => {
  const { timerState, startTimer, pauseTimer, resetTimer } = useTimer();
  const [showSettings, setShowSettings] = React.useState(false);
  const [settings, setSettings] = React.useState<PomodoroSettings>(defaultSettings);
  const theme = getTheme(settings.theme);

  return (
    <TimerContainer style={{backgroundColor: theme.colors.background, color: theme.colors.text}}>
      <ModeLabel>{getModeLabel(timerState.mode)}</ModeLabel>
      <TimerDisplay style={{color: theme.colors.primary}}>{formatTime(timerState.timeLeft)}</TimerDisplay>
      <ButtonContainer>
        {!timerState.isRunning ? (
          <Button variant="primary" themeColors={theme.colors} onClick={startTimer}>
            Başlat
          </Button>
        ) : (
          <Button variant="secondary" themeColors={theme.colors} onClick={pauseTimer}>
            Duraklat
          </Button>
        )}
        <Button themeColors={theme.colors} onClick={resetTimer}>Sıfırla</Button>
        <Button themeColors={theme.colors} onClick={() => setShowSettings(true)}>Ayarlar</Button>
      </ButtonContainer>
      {showSettings && (
        <Settings
          settings={settings}
          onSave={setSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
    </TimerContainer>
  );
}; 