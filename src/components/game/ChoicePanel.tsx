import React, { useEffect } from 'react';
import styled from '@emotion/styled';
import { colors } from '../../ui';

const Panel = styled.aside`
  width: 300px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 14px;
  padding: 20px;
  background: #f8fafc;
  border-left: 1px solid #e2e8f0;
`;

const Question = styled.h3`
  color: #202124;
  font-size: 1.2rem;
  margin-bottom: 4px;
`;

const Choice = styled.button<{ state: 'open' | 'wrong' | 'removed' }>`
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  font-size: 1.15rem;
  font-weight: 600;
  text-align: left;
  color: ${(p) => (p.state === 'open' ? colors.text : '#9aa0a6')};
  background: ${(p) => (p.state === 'wrong' ? '#fde8e6' : 'white')};
  border: 2px solid ${(p) => (p.state === 'wrong' ? colors.danger : '#d6dde6')};
  border-radius: 12px;
  display: ${(p) => (p.state === 'removed' ? 'none' : 'flex')};
  transition:
    transform 0.12s,
    border-color 0.12s,
    background-color 0.12s;

  &:hover:not(:disabled) {
    border-color: ${colors.primary};
    background: #e8f0fe;
    transform: translateY(-2px);
  }

  &:disabled {
    cursor: default;
    text-decoration: ${(p) => (p.state === 'wrong' ? 'line-through' : 'none')};
  }
`;

const Key = styled.span`
  flex-shrink: 0;
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  background: #eef2f7;
  color: ${colors.muted};
  font-size: 0.85rem;
`;

interface ChoicePanelProps {
  choices: string[];
  /** Al fout gekozen: doorgestreept en niet meer te kiezen. */
  wrong: string[];
  /** Weggehaald door de hint. */
  removed: string[];
  onChoose: (name: string) => void;
}

/** Vier antwoordknoppen naast de kaart; ook te kiezen met toets 1 t/m 4. */
const ChoicePanel: React.FC<ChoicePanelProps> = ({ choices, wrong, removed, onChoose }) => {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const index = Number(event.key) - 1;
      const name = choices[index];
      if (name && !wrong.includes(name) && !removed.includes(name)) onChoose(name);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [choices, wrong, removed, onChoose]);

  return (
    <Panel aria-label="Antwoorden">
      <Question>Welke stad is dit?</Question>
      {choices.map((name, i) => {
        const state = removed.includes(name) ? 'removed' : wrong.includes(name) ? 'wrong' : 'open';
        return (
          <Choice
            key={name}
            state={state}
            disabled={state !== 'open'}
            onClick={() => onChoose(name)}
          >
            <Key>{i + 1}</Key>
            {name}
          </Choice>
        );
      })}
    </Panel>
  );
};

export default ChoicePanel;
