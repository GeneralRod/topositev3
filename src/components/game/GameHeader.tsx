import React from 'react';
import styled from '@emotion/styled';
import { FaCoins } from 'react-icons/fa';
import { Button, colors } from '../../ui';

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
  z-index: 1000;

  @media (max-width: 768px) {
    padding: 0.75rem 1rem;
    flex-direction: column;
    gap: 0.5rem;
  }
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;

  @media (max-width: 768px) {
    gap: 1rem;
  }
`;

const Title = styled.h1`
  font-size: 1.5rem;
  color: ${colors.primary};
  margin: 0;

  @media (max-width: 768px) {
    font-size: 1.2rem;
  }
`;

const Question = styled.h2`
  display: flex;
  align-items: center;
  font-size: 1.2rem;
  color: ${colors.text};
  margin: 0;
  font-weight: 500;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const Coins = styled.span`
  display: flex;
  align-items: center;
  font-size: 1.1rem;
  font-weight: 600;
  color: ${colors.coin};
  margin-left: 1.2rem;
  gap: 0.3rem;
`;

const Controls = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;

  @media (max-width: 768px) {
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.75rem;
  }
`;

const Stat = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
`;

const StatLabel = styled.span`
  font-size: 0.8rem;
  color: ${colors.muted};
`;

const StatValue = styled.span`
  font-size: 1.1rem;
  font-weight: 600;
  color: ${colors.primary};
`;

const Hint = styled.span`
  color: ${colors.primary};
  font-weight: 600;
`;

interface GameHeaderProps {
  title: string;
  question: string | null;
  hint: string | null;
  coins: number;
  found: number;
  total: number;
  onHint: () => void;
  onRestart: () => void;
  onBack: () => void;
}

const GameHeader: React.FC<GameHeaderProps> = ({
  title,
  question,
  hint,
  coins,
  found,
  total,
  onHint,
  onRestart,
  onBack,
}) => (
  <Header>
    <HeaderLeft>
      <Title>{title}</Title>
      {question && (
        <Question>
          Vind: {question}
          <Coins>
            <FaCoins />
            {coins}
          </Coins>
        </Question>
      )}
    </HeaderLeft>
    <Controls>
      {hint && <Hint>Tip: {hint}</Hint>}
      <Button onClick={onHint} disabled={hint !== null || !question}>
        Hint
      </Button>
      <Stat>
        <StatLabel>Score</StatLabel>
        <StatValue>
          {found}/{total}
        </StatValue>
      </Stat>
      <Stat>
        <StatLabel>Nog te vinden</StatLabel>
        <StatValue>{total - found}</StatValue>
      </Stat>
      <Button variant="danger" onClick={onRestart}>
        Herstart
      </Button>
      <Button onClick={onBack}>Terug</Button>
    </Controls>
  </Header>
);

export default GameHeader;
