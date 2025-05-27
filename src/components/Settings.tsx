import React, { useState } from 'react';
import styled from 'styled-components';
import { PomodoroSettings } from '../types/settings';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: #fff;
  padding: 2rem;
  border-radius: 8px;
  min-width: 320px;
  box-shadow: 0 2px 16px rgba(0,0,0,0.2);
`;

const Section = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.5rem;
  margin-bottom: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const Select = styled.select`
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const Button = styled.button`
  padding: 0.5rem 1.5rem;
  background: #1976d2;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 1rem;
`;

interface SettingsProps {
  settings: PomodoroSettings;
  onSave: (settings: PomodoroSettings) => void;
  onClose: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ settings, onSave, onClose }) => {
  const [localSettings, setLocalSettings] = useState(settings);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target;
    setLocalSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLocalSettings(prev => ({
      ...prev,
      [name]: Number(value),
    }));
  };

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  return (
    <ModalOverlay>
      <ModalContent>
        <h2>Ayarlar</h2>
        <Section>
          <Label>Çalışma Süresi (dakika)</Label>
          <Input type="number" name="workDuration" min={1} max={120} value={localSettings.workDuration / 60} onChange={handleNumberChange} />
          <Label>Kısa Mola Süresi (dakika)</Label>
          <Input type="number" name="shortBreakDuration" min={1} max={30} value={localSettings.shortBreakDuration / 60} onChange={handleNumberChange} />
          <Label>Uzun Mola Süresi (dakika)</Label>
          <Input type="number" name="longBreakDuration" min={1} max={60} value={localSettings.longBreakDuration / 60} onChange={handleNumberChange} />
        </Section>
        <Section>
          <Label>
            <Input type="checkbox" name="soundEnabled" checked={localSettings.soundEnabled} onChange={handleChange} style={{width:'auto'}} />
            Bildirim Sesi Açık
          </Label>
        </Section>
        <Section>
          <Label>Tema</Label>
          <Select name="theme" value={localSettings.theme} onChange={handleChange}>
            <option value="default">Varsayılan (Kırmızımsı)</option>
            <option value="blue">Mavi</option>
            <option value="red">Kırmızı</option>
            <option value="orange">Turuncu</option>
            <option value="black">Siyah</option>
          </Select>
        </Section>
        <Button onClick={handleSave}>Kaydet</Button>
        <Button onClick={onClose} style={{background:'#888'}}>İptal</Button>
      </ModalContent>
    </ModalOverlay>
  );
}; 