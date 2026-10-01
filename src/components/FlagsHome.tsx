import React, { useState } from 'react';
import styled from '@emotion/styled';
import { useNavigate } from 'react-router-dom';
import { PRACTICE_PACKAGE_ID, type Category } from '../content/catalog';
import {
  getCityStats,
  getFlagMode,
  getStars,
  getToetsGrades,
  setFlagMode,
  type FlagMode,
} from '../storage';
import { useSaveData } from '../storage/useSaveData';
import { hardCities } from '../game/progress';
import { flagQuizKey } from '../game/flagQuiz';
import { formatGrade } from '../game/toets';
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

// Beginscherm van "Vlaggen van de wereld": kies hoe je speelt (meerkeuze, typen of
// aanwijzen op de kaart) en welk werelddeel. Plus de vlaggen rustig bekijken.

const MODES: Array<{ mode: FlagMode; label: string; help: string }> = [
  {
    mode: 'choice',
    label: 'Meerkeuze',
    help: 'Er staat een vlag in beeld: kies het goede land uit vier.',
  },
  {
    mode: 'type',
    label: 'Typen',
    help: 'Er staat een vlag in beeld: typ het land. Spelling maakt niet uit, als maar duidelijk is welk land je bedoelt.',
  },
  {
    mode: 'map',
    label: 'Aanwijzen',
    help: 'Er staat een vlag in beeld: klik het land aan op de wereldkaart. Kleine landen zijn een stip.',
  },
];

const QUERY: Record<Exclude<FlagMode, 'map'>, string> = {
  choice: 'meerkeuze',
  type: 'typen',
};

const Credit = styled.p`
  color: #5f6368;
  font-size: 0.85rem;
  margin-top: 1.5rem;
`;

const FlagsHome: React.FC<{ category: Category }> = ({ category }) => {
  const navigate = useNavigate();
  // Opnieuw tekenen als de voortgang bij het account is opgehaald.
  useSaveData();
  const [mode, setMode] = useState<FlagMode>(getFlagMode);
  const stars = getStars();
  const grades = getToetsGrades();
  const continents = category.sections[0]?.packages ?? [];
  const hardCount = hardCities(
    getCityStats(category.id),
    category.locations.map((l) => l.name),
  ).length;

  const choose = (next: FlagMode) => {
    setFlagMode(next);
    setMode(next);
  };

  const open = (packageId: string) =>
    navigate(
      mode === 'map'
        ? `/game/${category.id}/${packageId}`
        : `/vlaggen/${packageId}?modus=${QUERY[mode]}`,
    );

  /** Beste resultaat bij deze speelmanier: sterren (aanwijzen) of een cijfer. */
  const best = (packageId: string): { extra?: React.ReactNode; text: string } => {
    if (mode === 'map') return { extra: <Stars count={stars[packageId] ?? 0} />, text: '' };
    const grade = grades[flagQuizKey(packageId, mode)];
    return { text: grade === undefined ? '' : ` Beste cijfer: ${formatGrade(grade)}.` };
  };

  return (
    <Page>
      <BackLink onClick={() => navigate('/categories')}>← Terug naar categorieën</BackLink>
      <PageTitle>{category.heading}</PageTitle>

      <ModeBar>
        Speelmanier:
        <ModeSwitch role="group" aria-label="Speelmanier">
          {MODES.map((m) => (
            <ModeButton
              key={m.mode}
              active={mode === m.mode}
              aria-pressed={mode === m.mode}
              onClick={() => choose(m.mode)}
            >
              {m.label}
            </ModeButton>
          ))}
        </ModeSwitch>
      </ModeBar>
      <ModeHelp>{MODES.find((m) => m.mode === mode)?.help}</ModeHelp>

      {hardCount > 0 && (
        <>
          <SectionTitle>Oefenen</SectionTitle>
          <CardGrid>
            <Card
              title="Mijn lastige vlaggen"
              description={`${hardCount} ${hardCount === 1 ? 'vlag' : 'vlaggen'} die je vaak fout hebt.`}
              color="#f39c12"
              onClick={() => open(PRACTICE_PACKAGE_ID)}
            />
          </CardGrid>
        </>
      )}

      {category.sections.map((section) => (
        <React.Fragment key={section.title}>
          <SectionTitle>{section.title}</SectionTitle>
          <CardGrid>
            {section.packages.map((pkg) => {
              const { extra, text } = best(pkg.id);
              return (
                <Card
                  key={pkg.id}
                  title={pkg.title}
                  description={pkg.description + text}
                  color={pkg.color}
                  extra={extra}
                  onClick={() => open(pkg.id)}
                />
              );
            })}
          </CardGrid>
        </React.Fragment>
      ))}

      <SectionTitle>Vlaggen bekijken</SectionTitle>
      <CardGrid>
        {continents.map((pkg) => (
          <Card
            key={pkg.id}
            title={`Vlaggen van ${pkg.title}`}
            description="Alle vlaggen met hun naam, om rustig te leren."
            color={pkg.color}
            onClick={() => navigate(`/vlaggen/bekijk/${pkg.id}`)}
          />
        ))}
      </CardGrid>

      <Credit>Vlaggen: flag-icons (MIT-licentie). Kaart: Natural Earth.</Credit>

      <TrophyButton onClick={() => navigate('/trophy-cabinet')}>
        <TrophyIcon>🏆</TrophyIcon>
        Prijzenkast
      </TrophyButton>
      <VersionTag>Versie: 9.0</VersionTag>
    </Page>
  );
};

export default FlagsHome;
