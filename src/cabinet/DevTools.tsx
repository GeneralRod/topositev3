import React from 'react';
import styled from '@emotion/styled';
import { Button } from '../ui';
import { getCoins, setCoins, setCollection } from '../storage';
import { allPrizes, stickers } from './catalog';

// Alleen zichtbaar met ?ontwikkelaar in de url, om de kast te testen.

const Panel = styled.div`
  position: fixed;
  right: 16px;
  bottom: 16px;
  display: flex;
  gap: 0.5rem;
  padding: 0.6rem;
  background: rgba(255, 255, 255, 0.95);
  border: 2px dashed #9aa0a6;
  border-radius: 10px;
  z-index: 1500;
`;

const DevTools: React.FC<{ onChange: () => void }> = ({ onChange }) => {
  const run = (action: () => void) => () => {
    action();
    onChange();
  };
  return (
    <Panel>
      <Button onClick={run(() => setCoins(getCoins() + 500))}>+500 munten</Button>
      <Button
        onClick={run(() =>
          setCollection(
            allPrizes.map((item) => item.id),
            stickers.map((item) => item.id),
          ),
        )}
      >
        Kast vol
      </Button>
      <Button variant="danger" onClick={run(() => setCollection([], []))}>
        Kast leeg
      </Button>
      <Button variant="danger" onClick={run(() => setCoins(0))}>
        Munten op 0
      </Button>
    </Panel>
  );
};

export default DevTools;
