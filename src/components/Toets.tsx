import React, { useMemo, useRef, useState } from 'react';
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
import { Button, SoundToggle } from '../ui';
import { playSound } from '../game/sounds';
import GameMap from './game/GameMap';
import {
  Screen,
  Header,
  Title,
  Progress,
  PlayArea,
  MapWrapper,
  Panel,
  Question,
  AnswerInput,
  Row,
  Help,
  Page,
  Box,
  LengthButton,
  Grade,
  PartLine,
  AnswerList,
  AnswerItem,
} from './toets/styles';

// Oefentoets (zie src/game/toets.ts): er knippert een plek, het kind schrijft de
// naam op. Eerst alle vragen van deel 1 (pakket 1), dan deel 2, enz. Pas aan het
// eind zie je wat goed was, met een cijfer.

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
    // Tijdens de vragen geen geluid (je hoort pas aan het eind of het goed was).
    playSound('complete');
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
        <Row>
          <SoundToggle />
          <Button variant="danger" onClick={onBack}>
            Stoppen
          </Button>
        </Row>
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
