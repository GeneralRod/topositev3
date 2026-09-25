import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styled from '@emotion/styled';
import type { City } from '../data/cities';
import { countsStars, totalMistakes, useGame } from '../game/useGame';
import { findAchievement, type Achievement } from '../game/achievements';
import { starsFor } from '../game/progress';
import { choicePool, hintRemovals, pickChoices, seededRandom } from '../game/choices';
import type { PlayMode } from '../storage';
import ChoicePanel from './game/ChoicePanel';
import {
  completionBonus,
  foundCount,
  hardestCities,
  hintsLeft,
  isComplete,
  MAX_HINTS,
  type GameKind,
} from '../game/rules';
import { Button, colors } from '../ui';
import { findCategory } from '../content/catalog';
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

/** Kaart met (bij meerkeuze) de antwoorden ernaast, zodat niets de kaart bedekt. */
const PlayArea = styled.div`
  flex: 1;
  display: flex;
  min-height: 0;
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
  categoryId: string;
  kind: GameKind;
  /** Aanwijzen op de kaart of meerkeuze. */
  mode: PlayMode;
  /**
   * Extra actie als het spel af is (bijv. dagelijkse uitdaging); geeft een
   * extra regel terug voor het eindscherm.
   */
  onComplete?: () => string | null;
  title: string;
  cities: City[];
  onBack: () => void;
}

interface FeedbackState {
  id: number;
  text: string;
  success: boolean;
}

const Game: React.FC<GameProps> = ({
  packageId,
  categoryId,
  kind,
  mode,
  onComplete,
  title,
  cities,
  onBack,
}) => {
  const cityNames = useMemo(() => cities.map((c) => c.name), [cities]);
  const category = findCategory(categoryId);
  const words = category?.words ?? { one: 'stad', many: 'steden' };
  const isChoice = mode === 'choice';
  const [extraMessage, setExtraMessage] = useState<string | null>(null);
  const handleComplete = useCallback(() => {
    if (onComplete) setExtraMessage(onComplete());
  }, [onComplete]);
  const { state, earned, clickCity, showHint, restart } = useGame(packageId, cityNames, {
    categoryId,
    kind,
    mode,
    onComplete: handleComplete,
  });
  const [wrongPicks, setWrongPicks] = useState<{ city: string | null; names: string[] }>({
    city: null,
    names: [],
  });
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);

  // Laat een melding na een tijdje weer verdwijnen.
  useEffect(() => {
    if (!feedback) return;
    const timer = window.setTimeout(() => setFeedback(null), 1500);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  const currentCity = cities.find((c) => c.name === state.currentCity) ?? null;

  const handleCityClick = useCallback(
    (cityName: string) => {
      const asked = state.currentCity;
      const result = clickCity(cityName);
      if (result.kind === 'ignored') return;
      if (result.kind === 'wrong') {
        setWrongPicks((prev) => ({
          city: asked,
          names: prev.city === asked ? [...prev.names, cityName] : [cityName],
        }));
      }
      setFeedback((prev) => ({
        id: (prev?.id ?? 0) + 1,
        success: result.kind === 'correct',
        text:
          result.kind === 'correct'
            ? isChoice
              ? `Goed! Dat is ${result.city}!`
              : `Goed! Je hebt ${result.city} gevonden!`
            : isChoice
              ? 'Helaas, probeer het nog eens.'
              : `Dit is niet de juiste ${words.one}.`,
      }));
    },
    [clickCity, isChoice, state.currentCity, words.one],
  );

  // Meerkeuze: vier antwoorden per vraag, vast zolang dezelfde vraag openstaat.
  const answeredCount = Object.values(state.status).filter((s) => s !== 'unanswered').length;
  const choices = useMemo(
    () =>
      isChoice && state.currentCity
        ? pickChoices(
            state.currentCity,
            choicePool(state.currentCity, cities),
            seededRandom(`${state.currentCity}#${answeredCount}`),
          )
        : [],
    [isChoice, state.currentCity, cities, answeredCount],
  );
  const wrong = wrongPicks.city === state.currentCity ? wrongPicks.names : [];
  const removed =
    isChoice && state.hintUsed && state.currentCity ? hintRemovals(choices, state.currentCity) : [];

  if (cities.length === 0) {
    return (
      <GameContainer>
        <EmptyMessage>
          Geen {words.many} gevonden voor dit pakket.
          <Button onClick={onBack}>Terug naar hoofdmenu</Button>
        </EmptyMessage>
      </GameContainer>
    );
  }

  return (
    <GameContainer>
      <GameHeader
        title={title}
        question={
          currentCity
            ? isChoice
              ? `Welke ${words.one} knippert?`
              : `Vind: ${currentCity.name}`
            : null
        }
        hint={
          state.hintUsed && currentCity
            ? isChoice
              ? 'Twee foute antwoorden zijn weg'
              : `Tip: ${currentCity.continent}`
            : null
        }
        coins={state.coinsThisGame}
        found={foundCount(state)}
        total={cities.length}
        onHint={showHint}
        hintsLeft={hintsLeft(state, MAX_HINTS[mode])}
        onRestart={restart}
        onBack={onBack}
      />
      <PlayArea>
        <MapWrapper>
          {feedback && (
            <Feedback key={feedback.id} success={feedback.success}>
              {feedback.text}
            </Feedback>
          )}
          <GameMap
            cities={cities}
            status={state.status}
            onCityClick={handleCityClick}
            highlight={isChoice ? state.currentCity : undefined}
            loadShapes={category?.loadShapes}
            maxZoom={category?.maxZoom}
          />
        </MapWrapper>
        {isChoice && state.currentCity && (
          <ChoicePanel
            choices={choices}
            wrong={wrong}
            removed={removed}
            onChoose={handleCityClick}
            question={`Welke ${words.one} is dit?`}
          />
        )}
      </PlayArea>
      {isComplete(state) && (
        <CompletionDialog
          coins={state.coinsThisGame}
          bonus={completionBonus(state.coinsThisGame)}
          hardest={hardestCities(state)}
          extraMessage={extraMessage}
          words={words}
          stars={countsStars(kind, mode) ? starsFor(totalMistakes(state), cities.length) : null}
          achievements={earned
            .map(findAchievement)
            .filter((a): a is Achievement => a !== undefined)}
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
