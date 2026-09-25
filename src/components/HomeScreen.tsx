import React, { useState } from 'react';
import styled from '@emotion/styled';
import { useNavigate } from 'react-router-dom';
import { DAILY_PACKAGE_ID, PRACTICE_PACKAGE_ID, type Category } from '../content/catalog';
import {
  getCityStats,
  getDaily,
  getPlayMode,
  getStars,
  setPlayMode,
  type PlayMode,
} from '../storage';
import { currentStreak, dailyBonus, dateKey, doneToday } from '../game/daily';
import { hardCities } from '../game/progress';
import { BackLink, Card, CardGrid, Page, PageTitle, SectionTitle, Stars } from '../ui';

interface HomeScreenProps {
  category: Category;
}

const TrophyButton = styled.button`
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

const TrophyIcon = styled.span`
  font-size: 1.5rem;
`;

const VersionTag = styled.div`
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

const ModeBar = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
  color: #5f6368;
  font-weight: 600;
`;

const ModeSwitch = styled.div`
  display: inline-flex;
  padding: 4px;
  background: white;
  border-radius: 999px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const ModeButton = styled.button<{ active: boolean }>`
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

const ModeHelp = styled.p`
  color: #5f6368;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
`;

function modeHelp(mode: PlayMode, one: string): string {
  return mode === 'map'
    ? `Klik op de kaart de ${one} aan die gevraagd wordt.`
    : 'Er knippert iets op de kaart: kies de goede naam uit vier. Makkelijker, dus halve munten en geen sterren.';
}

const HomeScreen: React.FC<HomeScreenProps> = ({ category }) => {
  const navigate = useNavigate();
  const { one, many } = category.words;
  const stars = getStars();
  const [mode, setMode] = useState<PlayMode>(getPlayMode);
  const modeQuery = mode === 'choice' ? '?modus=meerkeuze' : '';
  const today = dateKey(new Date());
  const daily = getDaily(category.id);
  const dailyDone = doneToday(daily, today);
  const streak = currentStreak(daily, today);
  const streakText = streak > 0 ? ` Reeks: ${streak} ${streak === 1 ? 'dag' : 'dagen'} 🔥` : '';
  const chooseMode = (next: PlayMode) => {
    setPlayMode(next);
    setMode(next);
  };
  const hardCount = hardCities(
    getCityStats(category.id),
    category.locations.map((l) => l.name),
  ).length;

  return (
    <Page>
      <BackLink onClick={() => navigate('/categories')}>← Terug naar categorieën</BackLink>
      <PageTitle>{category.heading}</PageTitle>

      <ModeBar>
        Speelmanier:
        <ModeSwitch role="group" aria-label="Speelmanier">
          <ModeButton
            active={mode === 'map'}
            aria-pressed={mode === 'map'}
            onClick={() => chooseMode('map')}
          >
            Aanwijzen
          </ModeButton>
          <ModeButton
            active={mode === 'choice'}
            aria-pressed={mode === 'choice'}
            onClick={() => chooseMode('choice')}
          >
            Meerkeuze
          </ModeButton>
        </ModeSwitch>
      </ModeBar>
      <ModeHelp>{modeHelp(mode, one)}</ModeHelp>

      <SectionTitle>Oefenen</SectionTitle>
      <CardGrid>
        <Card
          title="Uitdaging van vandaag"
          description={
            dailyDone
              ? `Klaar voor vandaag! Kom morgen terug.${streakText}`
              : `10 ${many}, elke dag nieuw. +${dailyBonus(streak + 1)} bonusmunten.${streakText}`
          }
          color="#8e44ad"
          disabled={dailyDone}
          onClick={() => navigate(`/game/${category.id}/${DAILY_PACKAGE_ID}${modeQuery}`)}
        />
        <Card
          title={`Mijn lastige ${many}`}
          description={
            hardCount > 0
              ? `Oefen de ${hardCount === 1 ? one : `${hardCount} ${many}`} die je vaak fout hebt.`
              : `Nog geen lastige ${many}. Speel eerst een pakket!`
          }
          color="#e67e22"
          disabled={hardCount === 0}
          onClick={() => navigate(`/game/${category.id}/${PRACTICE_PACKAGE_ID}${modeQuery}`)}
        />
      </CardGrid>

      {category.sections.map((section) => (
        <React.Fragment key={section.title}>
          <SectionTitle>{section.title}</SectionTitle>
          <CardGrid>
            {section.packages.map((pkg) => (
              <Card
                key={pkg.id}
                title={pkg.title}
                description={pkg.description}
                color={pkg.color}
                extra={section.kind === 'game' ? <Stars count={stars[pkg.id] ?? 0} /> : undefined}
                onClick={() =>
                  navigate(
                    section.kind === 'map'
                      ? `/interactive/${category.id}/${pkg.id}`
                      : `/game/${category.id}/${pkg.id}${modeQuery}`,
                  )
                }
              />
            ))}
          </CardGrid>
        </React.Fragment>
      ))}

      <TrophyButton onClick={() => navigate('/trophy-cabinet')}>
        <TrophyIcon>🏆</TrophyIcon>
        Prijzenkast
      </TrophyButton>
      <VersionTag>Versie: 9.0</VersionTag>
    </Page>
  );
};

export default HomeScreen;
