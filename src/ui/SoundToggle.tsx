import React, { useState } from 'react';
import styled from '@emotion/styled';
import { FaVolumeMute, FaVolumeUp } from 'react-icons/fa';
import { getSoundOn, setSoundOn } from '../storage';
import { colors } from './theme';

// 'on' alleen voor de opmaak, niet als attribuut op de knop zelf.
const Toggle = styled('button', { shouldForwardProp: (prop) => prop !== 'on' })<{ on: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  border-radius: 50%;
  border: 2px solid ${(p) => (p.on ? colors.primary : '#c4cbd4')};
  background: white;
  color: ${(p) => (p.on ? colors.primary : colors.muted)};
  font-size: 1.15rem;
  cursor: pointer;

  &:hover {
    background: #e8f0fe;
  }
`;

/** Luidspreker: met één klik de geluidjes aan of uit. De keuze wordt onthouden. */
const SoundToggle: React.FC = () => {
  const [on, setOn] = useState(getSoundOn);
  const label = on ? 'Geluid uitzetten' : 'Geluid aanzetten';
  return (
    <Toggle
      type="button"
      on={on}
      aria-pressed={on}
      aria-label={label}
      title={label}
      onClick={() => {
        setSoundOn(!on);
        setOn(!on);
      }}
    >
      {on ? <FaVolumeUp /> : <FaVolumeMute />}
    </Toggle>
  );
};

export default SoundToggle;
