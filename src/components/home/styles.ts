// Opmaak van de beginschermen van een onderwerp (gewoon en vlaggen).

import styled from '@emotion/styled';

export const TrophyButton = styled.button`
  background: #f1c40f;
  color: #2c3e50;
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1.2rem;
  transition:
    transform 0.2s,
    background 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 2rem;

  &:hover {
    transform: translateY(-2px);
    background: #f39c12;
  }
`;

export const TrophyIcon = styled.span`
  font-size: 1.5rem;
`;

export const VersionTag = styled.div`
  position: fixed;
  left: 16px;
  bottom: 12px;
  font-size: 0.95rem;
  color: #888;
  background: rgba(255, 255, 255, 0.85);
  padding: 2px 10px;
  border-radius: 6px;
  z-index: 2000;
  pointer-events: none;
`;

export const ModeBar = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
  color: #5f6368;
  font-weight: 600;
`;

export const ModeSwitch = styled.div`
  display: inline-flex;
  padding: 4px;
  background: white;
  border-radius: 999px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

export const ModeButton = styled.button<{ active: boolean }>`
  padding: 0.5rem 1.2rem;
  border: none;
  border-radius: 999px;
  font-size: 1rem;
  font-weight: 600;
  background: ${(p) => (p.active ? '#1a73e8' : 'transparent')};
  color: ${(p) => (p.active ? 'white' : '#1a73e8')};
  transition: background-color 0.15s;

  &:hover {
    background: ${(p) => (p.active ? '#1a73e8' : '#e8f0fe')};
  }
`;

export const ModeHelp = styled.p`
  color: #5f6368;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
`;
