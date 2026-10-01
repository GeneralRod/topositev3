import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DAILY_PACKAGE_ID,
  PRACTICE_PACKAGE_ID,
  toetsPackages,
  type Category,
} from '../content/catalog';
import {
  getCityStats,
  getDaily,
  getPlayMode,
  getStars,
  getToetsGrades,
  setPlayMode,
  type PlayMode,
} from '../storage';
import { useSaveData } from '../storage/useSaveData';
import { currentStreak, dailyBonus, dateKey, doneToday } from '../game/daily';
import { hardCities } from '../game/progress';
import { aanwijstoetsKey } from '../game/aanwijstoets';
import { formatGrade, TOETS_LENGTHS, toetsKey, toetsTitle, type ToetsLength } from '../game/toets';
import { BackLink, Card, CardGrid, Page, PageTitle, SectionTitle, Stars } from '../ui';
import {
  ModeBar,
  ModeButton,
  ModeHelp,
  ModeSwitch,
  TrophyButton,
  TrophyIcon,
  VersionTag,
} from './home/styles';

interface HomeScreenProps {
  category: Category;
}

function modeHelp(mode: PlayMode, one: string, many: string): string {
  if (mode === 'map') return `Klik op de kaart de ${one} aan die gevraagd wordt.`;
  if (mode === 'choice')
    return 'Er knippert iets op de kaart: kies de goede naam uit vier. Makkelijker, dus halve munten en geen sterren.';
  return `Elke ${one} één keer, en je mag maar één keer klikken. Pas aan het eind zie je wat goed was, met een cijfer. De uitdaging van vandaag en je lastige ${many} speel je gewoon met aanwijzen.`;
}

/** Wat er achter de link van een pakket komt bij deze speelmanier. */
const MODE_QUERY: Record<PlayMode, string> = {
  map: '',
  choice: '?modus=meerkeuze',
  test: '?modus=toets',
};

const HomeScreen: React.FC<HomeScreenProps> = ({ category }) => {
  const navigate = useNavigate();
  // Opnieuw tekenen als de voortgang bij het account is opgehaald.
  useSaveData();
  const { one, many } = category.words;
  const stars = getStars();
  const [mode, setMode] = useState<PlayMode>(getPlayMode);
  const modeQuery = MODE_QUERY[mode];
  // De uitdaging en de lastige plekken hebben geen aanwijstoets.
  const practiceQuery = mode === 'test' ? '' : modeQuery;
  const today = dateKey(new Date());
  const daily = getDaily(category.id);
  const dailyDone = doneToday(daily, today);
  const streak = currentStreak(daily, today);
  const streakText = streak > 0 ? ` Reeks: ${streak} ${streak === 1 ? 'dag' : 'dagen'} 🔥` : '';
  const chooseMode = (next: PlayMode) => {
    setPlayMode(next);
    setMode(next);
  };
  const toetsen = toetsPackages(category);
  const grades = getToetsGrades();
  /** Beste cijfer van een toets, over alle lengtes: "Beste cijfer: 8,5 (Normaal)". */
  const bestGrade = (upto: number): string => {
    const results = (Object.keys(TOETS_LENGTHS) as ToetsLength[])
      .map((length) => ({ length, grade: grades[toetsKey(category.id, upto, length)] }))
      .filter((r) => r.grade !== undefined);
    if (results.length === 0) return '';
    const best = results.reduce((a, b) => (b.grade > a.grade ? b : a));
    return ` Beste cijfer: ${formatGrade(best.grade)} (${TOETS_LENGTHS[best.length].label}).`;
  };
  /** Bij de aanwijstoets: het beste cijfer van een pakket. */
  const testGrade = (kind: string, packageId: string): string => {
    const grade = grades[aanwijstoetsKey(packageId)];
    return mode === 'test' && kind === 'game' && grade !== undefined
      ? ` Beste cijfer: ${formatGrade(grade)}.`
      : '';
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
          <ModeButton
            active={mode === 'test'}
            aria-pressed={mode === 'test'}
            onClick={() => chooseMode('test')}
          >
            Aanwijstoets
          </ModeButton>
        </ModeSwitch>
      </ModeBar>
      <ModeHelp>{modeHelp(mode, one, many)}</ModeHelp>

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
          onClick={() => navigate(`/game/${category.id}/${DAILY_PACKAGE_ID}${practiceQuery}`)}
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
          onClick={() => navigate(`/game/${category.id}/${PRACTICE_PACKAGE_ID}${practiceQuery}`)}
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
                description={pkg.description + testGrade(section.kind, pkg.id)}
                color={pkg.color}
                extra={
                  section.kind === 'game' && mode !== 'test' ? (
                    <Stars count={stars[pkg.id] ?? 0} />
                  ) : undefined
                }
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

      {/* Oefentoets onderaan (wens eigenaar): eerst oefenen, dan de toets. */}
      <SectionTitle>Oefentoets</SectionTitle>
      <CardGrid>
        {toetsen.map((pkg, i) => (
          <Card
            key={pkg.id}
            title={toetsTitle(i + 1)}
            description={
              (i === 0
                ? `Schrijf de namen op, net als op de toets.`
                : `In ${i + 1} delen: eerst pakket 1, dan ${toetsen
                    .slice(1, i + 1)
                    .map((p) => p.title.toLowerCase())
                    .join(', dan ')}.`) + bestGrade(i + 1)
            }
            color="#c0392b"
            onClick={() => navigate(`/toets/${category.id}/${i + 1}`)}
          />
        ))}
      </CardGrid>

      <TrophyButton onClick={() => navigate('/trophy-cabinet')}>
        <TrophyIcon>🏆</TrophyIcon>
        Prijzenkast
      </TrophyButton>
      <VersionTag>Versie: 9.0</VersionTag>
    </Page>
  );
};

export default HomeScreen;
