import React, { useMemo, useRef, useState } from 'react';
import styled from '@emotion/styled';
import { locationsFor, toetsPackages, type Category } from '../content/catalog';
import { ALIASES, LOOKALIKES } from '../content/aliases';
import {
  formatGrade,
  judgeAnswer,
  makeCandidates,
  planToets,
  questionCount,
  TOETS_COINS_PER_CORRECT,
  TOETS_LENGTHS,
  toetsGrade,
  toetsKey,
  toetsTitle,
  type ToetsLength,
  type ToetsQuestion,
} from '../game/toets';
import { addCoins, getToetsGrades, recordCityAnswer, recordToetsGrade } from '../storage';
import { Button, colors } from '../ui';
import GameMap from './game/GameMap';

// Oefentoets (zie src/game/toets.ts): er knippert een plek, het kind schrijft de
// naam op. Eerst alle vragen van deel 1 (pakket 1), dan deel 2, enz. Pas aan het
// eind zie je wat goed was, met een cijfer.

const Screen = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: ${colors.background};
  overflow: hidden;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 0.9rem 1.5rem;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
  z-index: 1000;
`;

const Title = styled.h1`
  font-size: 1.4rem;
  color: ${colors.primary};
  margin: 0;

  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

const Progress = styled.div`
  color: ${colors.muted};
  font-weight: 600;
`;

const PlayArea = styled.div`
  flex: 1;
  display: flex;
  min-height: 0;

  @media (max-width: 700px) {
    flex-direction: column;
  }
`;

const MapWrapper = styled.div`
  flex: 1;
  position: relative;
  min-height: 0;
`;

const Panel = styled.aside`
  width: 320px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 14px;
  padding: 20px;
  background: #f8fafc;
  border-left: 1px solid #e2e8f0;

  @media (max-width: 700px) {
    width: 100%;
    border-left: none;
    border-top: 1px solid #e2e8f0;
    padding: 14px 16px;
  }
`;

const Question = styled.h3`
  color: ${colors.text};
  font-size: 1.2rem;
  margin: 0;
`;

const AnswerInput = styled.input`
  padding: 12px 14px;
  font-size: 1.2rem;
  border: 2px solid #d6dde6;
  border-radius: 12px;
  outline: none;

  &:focus {
    border-color: ${colors.primary};
  }
`;

const Row = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;

const Help = styled.p`
  color: ${colors.muted};
  font-size: 0.9rem;
  margin: 0;
`;

const Page = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 2rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Box = styled.div`
  width: 100%;
  max-width: 720px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const LengthButton = styled.button<{ active: boolean }>`
  flex: 1;
  min-width: 150px;
  padding: 0.8rem 1rem;
  border-radius: 12px;
  border: 2px solid ${(p) => (p.active ? colors.primary : '#d6dde6')};
  background: ${(p) => (p.active ? '#e8f0fe' : 'white')};
  font-size: 1rem;
  text-align: left;
  cursor: pointer;

  strong {
    display: block;
    font-size: 1.1rem;
    margin-bottom: 0.2rem;
  }
`;

const Grade = styled.div<{ passed: boolean }>`
  font-size: 4rem;
  font-weight: 800;
  line-height: 1;
  color: ${(p) => (p.passed ? colors.success : colors.danger)};
`;

const PartLine = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.4rem 0;
  border-bottom: 1px solid #eef2f7;
  font-weight: 600;
`;

const AnswerList = styled.ul`
  text-align: left;
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const AnswerItem = styled.li<{ correct: boolean }>`
  padding: 8px 12px;
  border-radius: 10px;
  background: ${(p) => (p.correct ? '#e6f4ea' : '#fde8e6')};

  small {
    display: block;
    color: ${colors.muted};
  }
`;

interface ToetsAnswer {
  question: ToetsQuestion;
  typed: string;
  correct: boolean;
  exact: boolean;
}

type Phase = 'start' | 'question' | 'between' | 'result';

interface ToetsProps {
  category: Category;
  /** Toets over pakket 1 tot en met dit pakket. */
  upto: number;
  onBack: () => void;
}

const Toets: React.FC<ToetsProps> = ({ category, upto, onBack }) => {
  const packages = useMemo(() => toetsPackages(category).slice(0, upto), [category, upto]);
  const parts = useMemo(
    () => packages.map((pkg) => locationsFor(category, pkg)),
    [category, packages],
  );
  const candidates = useMemo(
    () =>
      makeCandidates(
        category.locations.map((l) => l.name),
        ALIASES,
        LOOKALIKES,
      ),
    [category],
  );
  const { one, neuter } = category.words;
  const which = neuter ? 'Welk' : 'Welke';

  const [phase, setPhase] = useState<Phase>('start');
  const [length, setLength] = useState<ToetsLength>('normaal');
  const [questions, setQuestions] = useState<ToetsQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<ToetsAnswer[]>([]);
  const [draft, setDraft] = useState('');
  const [coins, setCoins] = useState(0);
  const input = useRef<HTMLInputElement>(null);

  const title = toetsTitle(upto);
  const current = questions[index];
  const partQuestions = current ? questions.filter((q) => q.part === current.part) : [];
  const numberInPart = current ? partQuestions.indexOf(current) + 1 : 0;

  const start = () => {
    setQuestions(
      planToets(
        parts.map((places) => places.map((p) => p.name)),
        length,
      ),
    );
    setIndex(0);
    setAnswers([]);
    setDraft('');
    setPhase('question');
  };

  const finish = (all: ToetsAnswer[]) => {
    const correct = all.filter((a) => a.correct).length;
    const earned = correct * TOETS_COINS_PER_CORRECT;
    addCoins(earned);
    setCoins(earned);
    for (const a of all) {
      recordCityAnswer(category.id, a.question.name, a.correct ? 'first-try' : 'wrong');
    }
    recordToetsGrade(toetsKey(category.id, upto, length), toetsGrade(correct, all.length));
    setPhase('result');
  };

  const submit = (typed: string) => {
    if (!current) return;
    const judged = judgeAnswer(typed, current.name, candidates);
    const all = [...answers, { question: current, typed: typed.trim(), ...judged }];
    setAnswers(all);
    setDraft('');
    const next = questions[index + 1];
    if (!next) {
      finish(all);
      return;
    }
    setIndex(index + 1);
    if (next.part !== current.part) setPhase('between');
    else input.current?.focus();
  };

  if (phase === 'start') {
    const best = getToetsGrades();
    return (
      <Screen>
        <Header>
          <Title>{title}</Title>
          <Button onClick={onBack}>Terug</Button>
        </Header>
        <Page>
          <Box>
            <Question>Zo werkt de oefentoets</Question>
            <Help>
              Er knippert een {one} op de kaart. Schrijf op {neuter ? 'welk' : 'welke'} {one} het
              is. Spelling maakt niet uit, als maar duidelijk is {which.toLowerCase()} {one} je
              bedoelt. Pas aan het eind zie je wat goed was, met een cijfer.
            </Help>
            <Help>
              {packages.length === 1
                ? `De toets gaat over ${packages[0].title.toLowerCase()}.`
                : `De toets heeft ${packages.length} delen: ${packages
                    .map((p, i) => `deel ${i + 1} gaat over ${p.title.toLowerCase()}`)
                    .join(', ')}.`}
            </Help>
            <Question>Hoe lang?</Question>
            <Row>
              {(Object.keys(TOETS_LENGTHS) as ToetsLength[]).map((key) => {
                const counts = parts.map((places) => questionCount(places.length, key));
                const total = counts.reduce((a, b) => a + b, 0);
                const record = best[toetsKey(category.id, upto, key)];
                return (
                  <LengthButton
                    key={key}
                    active={length === key}
                    aria-pressed={length === key}
                    onClick={() => setLength(key)}
                  >
                    <strong>{TOETS_LENGTHS[key].label}</strong>
                    {total} vragen{counts.length > 1 ? ` (${counts.join(' + ')})` : ''}
                    {record !== undefined && <small> · beste cijfer {formatGrade(record)}</small>}
                  </LengthButton>
                );
              })}
            </Row>
            <Row>
              <Button onClick={start}>Begin de toets</Button>
            </Row>
          </Box>
        </Page>
      </Screen>
    );
  }

  if (phase === 'result') {
    const correct = answers.filter((a) => a.correct).length;
    const grade = toetsGrade(correct, answers.length);
    return (
      <Screen>
        <Header>
          <Title>{title}</Title>
          <Button onClick={onBack}>Terug</Button>
        </Header>
        <Page>
          <Box>
            <Question>Je cijfer</Question>
            <Grade passed={grade >= 5.5}>{formatGrade(grade)}</Grade>
            <Help>
              {correct} van de {answers.length} goed. +{coins} munten.
            </Help>
            {packages.length > 1 &&
              packages.map((pkg, part) => {
                const mine = answers.filter((a) => a.question.part === part);
                const good = mine.filter((a) => a.correct).length;
                return (
                  <PartLine key={pkg.id}>
                    <span>
                      Deel {part + 1} ({pkg.title}): {good} van {mine.length} goed
                    </span>
                    <span>{formatGrade(toetsGrade(good, mine.length))}</span>
                  </PartLine>
                );
              })}
            {packages.map((pkg, part) => (
              <React.Fragment key={pkg.id}>
                <Question>
                  Deel {part + 1}: {pkg.title}
                </Question>
                <AnswerList>
                  {answers
                    .filter((a) => a.question.part === part)
                    .map((a) => (
                      <AnswerItem key={a.question.name} correct={a.correct}>
                        {a.correct ? '✓' : '✗'} {a.question.name}
                        {!a.correct && (
                          <small>Jij schreef: {a.typed === '' ? '(niets)' : a.typed}</small>
                        )}
                        {a.correct && !a.exact && (
                          <small>
                            Jij schreef: {a.typed}. Goed! Zo schrijf je het: {a.question.name}
                          </small>
                        )}
                      </AnswerItem>
                    ))}
                </AnswerList>
              </React.Fragment>
            ))}
            <Help>Wat je fout had, staat nu ook bij je lastige {category.words.many}.</Help>
            <Row>
              <Button onClick={() => setPhase('start')}>Nog een keer</Button>
              <Button variant="outline" onClick={onBack}>
                Terug
              </Button>
            </Row>
          </Box>
        </Page>
      </Screen>
    );
  }

  const places = current ? parts[current.part] : [];
  return (
    <Screen>
      <Header>
        <Title>{title}</Title>
        {current && (
          <Progress>
            Deel {current.part + 1} · Vraag {numberInPart} van {partQuestions.length}
          </Progress>
        )}
        <Button variant="danger" onClick={onBack}>
          Stoppen
        </Button>
      </Header>
      <PlayArea>
        <MapWrapper>
          <GameMap
            cities={places}
            status={{}}
            onCityClick={() => {}}
            highlight={phase === 'question' ? (current?.name ?? null) : null}
            loadShapes={category.loadShapes}
            maxZoom={category.maxZoom}
            map={category.map}
          />
        </MapWrapper>
        <Panel aria-label="Antwoord">
          {phase === 'between' && current ? (
            <>
              <Question>Deel {current.part} klaar!</Question>
              <Help>
                Nu deel {current.part + 1}: {packages[current.part].title} ({partQuestions.length}{' '}
                vragen).
              </Help>
              <Button onClick={() => setPhase('question')}>Verder</Button>
            </>
          ) : (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                // Per ongeluk Enter zonder antwoord: niet overslaan (daarvoor is 'Weet ik niet').
                if (draft.trim() !== '') submit(draft);
              }}
              style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
            >
              <Question>
                {which} {one} is dit?
              </Question>
              <AnswerInput
                ref={input}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                aria-label={`Naam van ${neuter ? 'het' : 'de'} ${one}`}
                autoFocus
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
              />
              <Row>
                <Button type="submit" disabled={draft.trim() === ''}>
                  Volgende
                </Button>
                <Button type="button" variant="outline" onClick={() => submit('')}>
                  Weet ik niet
                </Button>
              </Row>
              <Help>Druk op Enter voor de volgende vraag.</Help>
            </form>
          )}
        </Panel>
      </PlayArea>
    </Screen>
  );
};

export default Toets;
