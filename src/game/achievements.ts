// Prestatieprijzen: niet te koop, alleen te verdienen door iets bijzonders te
// doen. Pure functies, getest in achievements.test.ts. De tekeningen staan in
// cabinet/art.tsx (zelfde id).

import type { PlayMode } from '../storage/storage';
import type { GameKind } from './rules';

/** Een spel dat net helemaal af is. */
export interface FinishedGame {
  kind: GameKind;
  mode: PlayMode;
  mistakes: number;
}

/** Alles wat nodig is om te bepalen welke prestaties verdiend zijn. */
export interface AchievementFacts {
  /** Beste sterren per pakket-id (alleen bij aanwijzen op de kaart). */
  stars: Record<string, number>;
  /** Hoogste reeks van de dagelijkse uitdaging, over alle onderwerpen. */
  dailyStreak: number;
  /** Het spel dat net af is; ontbreekt als alleen de opgeslagen stand bekeken wordt. */
  finished?: FinishedGame;
}

export interface Achievement {
  /** Vaste sleutel voor opslag; niet meer wijzigen als hij eenmaal live staat. */
  id: string;
  name: string;
  /** Hoe je hem verdient, in woorden voor de speler. */
  goal: string;
  earned: (facts: AchievementFacts) => boolean;
}

function threeStarPackages(stars: Record<string, number>): number {
  return Object.values(stars).filter((count) => count >= 3).length;
}

/** Van makkelijk naar moeilijk; zo staan ze ook op het prestatiebord. */
export const achievements: Achievement[] = [
  {
    id: 'first-game',
    name: 'Eerste pakket',
    goal: 'Maak je eerste pakket helemaal af.',
    // Sterren betekenen dat je ooit een pakket op de kaart hebt afgemaakt.
    earned: (f) => f.finished?.kind === 'package' || Object.keys(f.stars).length > 0,
  },
  {
    id: 'practice',
    name: 'Oefenen loont',
    goal: 'Maak een rondje "Mijn lastige steden" af.',
    earned: (f) => f.finished?.kind === 'practice',
  },
  {
    id: 'streak-3',
    name: 'Drie dagen op rij',
    goal: 'Doe drie dagen achter elkaar de uitdaging van vandaag.',
    earned: (f) => f.dailyStreak >= 3,
  },
  {
    id: 'flawless',
    name: 'Foutloos',
    goal: 'Vind alle steden van een pakket op de kaart zonder één fout.',
    earned: (f) => threeStarPackages(f.stars) >= 1,
  },
  {
    id: 'quiz-master',
    name: 'Quizmeester',
    goal: 'Maak een pakket af met meerkeuze, zonder één fout.',
    earned: (f) =>
      f.finished?.kind === 'package' && f.finished.mode === 'choice' && f.finished.mistakes === 0,
  },
  {
    id: 'streak-7',
    name: 'Een hele week',
    goal: 'Doe zeven dagen achter elkaar de uitdaging van vandaag.',
    earned: (f) => f.dailyStreak >= 7,
  },
  {
    id: 'all-stars',
    name: 'Sterrenregen',
    goal: 'Haal bij drie verschillende pakketten 3 sterren.',
    earned: (f) => threeStarPackages(f.stars) >= 3,
  },
  {
    id: 'world-tour',
    name: 'Wereldreiziger',
    goal: 'Vind alle steden van pakket 1 + 2 + 3 op de kaart.',
    earned: (f) => (f.stars['pakket1-2-3'] ?? 0) >= 1,
  },
];

/** Prestaties die nu verdiend zijn maar die je nog niet had. */
export function newAchievements(facts: AchievementFacts, owned: string[]): string[] {
  return achievements.filter((a) => !owned.includes(a.id) && a.earned(facts)).map((a) => a.id);
}

export function findAchievement(id: string): Achievement | undefined {
  return achievements.find((a) => a.id === id);
}
