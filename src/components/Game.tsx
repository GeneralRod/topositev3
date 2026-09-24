import React, { useEffect, useMemo, useState } from 'react';
import styled from '@emotion/styled';
import type { City } from '../data/cities';
import { useGame } from '../game/useGame';
import { completionBonus, foundCount, hardestCities, isComplete } from '../game/rules';
import { Button, colors } from '../ui';
import GameHeader from './game/GameHeader';
import GameMap from './game/GameMap';
import CompletionDialog from './game/CompletionDialog';

const GameContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: ${colors.background};
  overflow: hidden;
`;

const MapWrapper = styled.div`
  flex: 1;
  position: relative;
  overflow: hidden;
  min-height: 0;
`;

const Feedback = styled.div<{ success: boolean }>`
  position: absolute;
  top: 1rem;
  left: 50%;
  transform: translateX(-50%);
  padding: 0.5rem 1rem;
  border-radius: 4px;
  color: ${(props) => (props.success ? colors.success : colors.danger)};
  font-weight: 600;
  font-size: 1.2rem;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  pointer-events: none;
  white-space: nowrap;
  animation: fadeInOut 1.5s ease-in-out forwards;

  @keyframes fadeInOut {
    0% {
      opacity: 0;
      transform: translate(-50%, -20px);
    }
    15%,
    85% {
      opacity: 1;
      transform: translate(-50%, 0);
    }
    100% {
      opacity: 0;
      transform: translate(-50%, -20px);
    }
  }
`;

const EmptyMessage = styled.div`
  margin: auto;
  padding: 2rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
`;

interface GameProps {
  packageId: string;
  title: string;
  cities: City[];
  onBack: () => void;
}

interface FeedbackState {
  id: number;
  text: string;
  success: boolean;
}

const Game: React.FC<GameProps> = ({ packageId, title, cities, onBack }) => {
  const cityNames = useMemo(() => cities.map((c) => c.name), [cities]);
  const { state, clickCity, showHint, restart } = useGame(packageId, cityNames);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);

  // Laat een melding na een tijdje weer verdwijnen.
  useEffect(() => {
    if (!feedback) return;
    const timer = window.setTimeout(() => setFeedback(null), 1500);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  const currentCity = cities.find((c) => c.name === state.currentCity) ?? null;

  const handleCityClick = (cityName: string) => {
    const result = clickCity(cityName);
    if (result.kind === 'ignored') return;
    setFeedback((prev) => ({
      id: (prev?.id ?? 0) + 1,
      success: result.kind === 'correct',
      text:
        result.kind === 'correct'
          ? `Goed! Je hebt ${result.city} gevonden!`
          : 'Dit is niet de juiste stad.',
    }));
  };

  if (cities.length === 0) {
    return (
      <GameContainer>
        <EmptyMessage>
          Geen steden gevonden voor dit pakket.
          <Button onClick={onBack}>Terug naar hoofdmenu</Button>
        </EmptyMessage>
      </GameContainer>
    );
  }

  return (
    <GameContainer>
      <GameHeader
        title={title}
        question={currentCity?.name ?? null}
        hint={state.hintUsed && currentCity ? currentCity.continent : null}
        coins={state.coinsThisGame}
        found={foundCount(state)}
        total={cities.length}
        onHint={showHint}
        onRestart={restart}
        onBack={onBack}
      />
      <MapWrapper>
        {feedback && (
          <Feedback key={feedback.id} success={feedback.success}>
            {feedback.text}
          </Feedback>
        )}
        <GameMap cities={cities} status={state.status} onCityClick={handleCityClick} />
      </MapWrapper>
      {isComplete(state) && (
        <CompletionDialog
          coins={state.coinsThisGame}
          bonus={completionBonus(state.coinsThisGame)}
          hardest={hardestCities(state)}
          onClose={() => {
            restart();
            onBack();
          }}
        />
      )}
    </GameContainer>
  );
};

export default Game;
