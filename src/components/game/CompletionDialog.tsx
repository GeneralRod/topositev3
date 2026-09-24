import React from 'react';
import styled from '@emotion/styled';
import { Button, colors } from '../../ui';

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
`;

const Dialog = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 100%;
  max-height: 100%;
  overflow-y: auto;
  animation: fadeIn 0.3s ease-in-out;

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-10%);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const Message = styled.h2`
  color: ${colors.success};
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
`;

const CoinSummary = styled.div`
  font-weight: 600;
  color: ${colors.coin};
  margin-bottom: 12px;
`;

const Stats = styled.div`
  margin-bottom: 1.5rem;
  text-align: left;
`;

const Perfect = styled.div`
  color: ${colors.success};
  font-weight: 600;
`;

const StatsTitle = styled.div`
  font-weight: 600;
  margin-bottom: 8px;
  color: #111;
`;

const StatsList = styled.ol`
  padding-left: 0;
  margin: 0;
  list-style: none;
`;

const StatsItem = styled.li`
  margin-bottom: 4px;
  display: flex;
  justify-content: space-between;
  gap: 16px;
  width: min(280px, 100%);
  padding: 2px 0;
`;

const Mistakes = styled.span`
  color: ${colors.danger};
  font-weight: 500;
`;

interface CompletionDialogProps {
  coins: number;
  bonus: number;
  hardest: Array<{ city: string; mistakes: number }>;
  onClose: () => void;
}

const CompletionDialog: React.FC<CompletionDialogProps> = ({ coins, bonus, hardest, onClose }) => (
  <Overlay>
    <Dialog role="dialog" aria-modal="true">
      <Message>Super! Je hebt alle steden gevonden!</Message>
      <CoinSummary>
        Munten dit spel: {coins} <br />
        Bonus: +{bonus} <br />
        <b>Totaal: {coins + bonus}</b>
      </CoinSummary>
      <Stats>
        {hardest.length === 0 ? (
          <Perfect>Je hebt alle steden in één keer goed!</Perfect>
        ) : (
          <>
            <StatsTitle>Moeilijkste steden deze ronde:</StatsTitle>
            <StatsList>
              {hardest.map(({ city, mistakes }) => (
                <StatsItem key={city}>
                  <span>{city}</span>
                  <Mistakes>
                    {mistakes} fout{mistakes > 1 ? 'en' : ''}
                  </Mistakes>
                </StatsItem>
              ))}
            </StatsList>
          </>
        )}
      </Stats>
      <Button onClick={onClose}>Terug naar hoofdmenu</Button>
    </Dialog>
  </Overlay>
);

export default CompletionDialog;
