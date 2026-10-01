import React, { useMemo, useRef, useState } from 'react';
import styled from '@emotion/styled';
import type { City } from '../data/cities';
import type { Category } from '../content/catalog';
import { ALIASES, LOOKALIKES } from '../content/aliases';
import {
  flagChoices,
  flagQuizKey,
  flagResult,
  judgeFlag,
  planFlagQuiz,
  type FlagAnswer,
  type FlagQuizMode,
} from '../game/flagQuiz';
import { formatGrade, makeCandidates } from '../game/toets';
import { playSound } from '../game/sounds';
import { addCoins, getToetsGrades, recordCityAnswer, recordToetsGrade } from '../storage';
import { Button, colors, SoundToggle } from '../ui';
import {
  AnswerInput,
  AnswerItem,
  AnswerList,
  Box,
  Grade,
  Header,
  Help,
  Page,
  Progress,
  Question,
  Row,
  Screen,
  Title,
} from './toets/styles';

// Vlaggenquiz (zie src/game/flagQuiz.ts): een vlag in beeld, jij kiest of typt het
// land. Je ziet meteen of het goed was; aan het eind een cijfer.

const FlagImage = styled.img`
  width: 100%;
  max-width: 360px;
  aspect-ratio: 4 / 3;
  object-fit: contain;
  align-self: center;
  border: 1px solid #d6dde6;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  background: white;
`;

const Choices = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

type ChoiceState = 'idle' | 'right' | 'wrong';

const ChoiceButton = styled.button<{ state: ChoiceState }>`
  padding: 0.8rem 1rem;
  font-size: 1.05rem;
  font-weight: 600;
  border-radius: 10px;
  cursor: pointer;
  border: 2px solid
    ${(p) =>
      p.state === 'right' ? colors.success : p.state === 'wrong' ? colors.danger : '#d6dde6'};
  background: ${(p) =>
    p.state === 'right' ? '#e6f4ea' : p.state === 'wrong' ? '#fde8e6' : 'white'};
  color: ${colors.text};

  &:hover:not(:disabled) {
    border-color: ${colors.primary};
  }
  &:disabled {
    cursor: default;
  }
`;

const Verdict = styled.p<{ correct: boolean }>`
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
  color: ${(p) => (p.correct ? colors.success : colors.danger)};
`;

const SmallFlag = styled.img`
  height: 1.4rem;
  width: auto;
  margin-right: 0.5rem;
  vertical-align: middle;
  border: 1px solid #d6dde6;
`;

interface FlagQuizProps {
  category: Category;
  packageId: string;
  title: string;
  /** De landen van dit pakket. */
  places: City[];
  mode: FlagQuizMode;
  onBack: () => void;
}

const FlagQuiz: React.FC<FlagQuizProps> = ({
  category,
  packageId,
  title,
  places,
  mode,
  onBack,
}) => {
  const flagOf = (name: string) => category.flagOf?.(name);
  const allNames = useMemo(() => category.locations.map((l) => l.name), [category]);
  const packageNames = useMemo(() => places.map((p) => p.name), [places]);
  const candidates = useMemo(() => makeCandidates(allNames, ALIASES, LOOKALIKES), [allNames]);

  const [questions, setQuestions] = useState(() => planFlagQuiz(packageNames));
  const [answers, setAnswers] = useState<FlagAnswer[]>([]);
  /** Het antwoord op de huidige vlag, zolang je de uitslag ervan ziet. */
  const [shown, setShown] = useState<FlagAnswer | null>(null);
  const [draft, setDraft] = useState('');
  const [record, setRecord] = useState(() => getToetsGrades()[flagQuizKey(packageId, mode)]);
  const input = useRef<HTMLInputElement>(null);

  const index = answers.length - (shown ? 1 : 0);
  const current = questions[index];
  // Vaste vier keuzes per vraag (niet opnieuw schudden bij elke keer tekenen).
  const choices = useMemo(
    () => (current ? flagChoices(current, packageNames, allNames) : []),
    [current, packageNames, allNames],
  );
  const finished = answers.length === questions.length && !shown;

  const answer = (given: string) => {
    if (!current || shown) return;
    const judged = judgeFlag(mode, current, given, candidates);
    setAnswers([...answers, judged]);
    setShown(judged);
    playSound(judged.correct ? 'correct' : 'wrong');
  };

  const next = () => {
    setShown(null);
    setDraft('');
    if (answers.length < questions.length) {
      setTimeout(() => input.current?.focus(), 0);
      return;
    }
    // Klaar: munten, lastige landen en het beste cijfer bijwerken.
    const result = flagResult(mode, answers);
    addCoins(result.coins);
    for (const a of answers)
      recordCityAnswer(category.id, a.name, a.correct ? 'first-try' : 'wrong');
    recordToetsGrade(flagQuizKey(packageId, mode), result.grade);
    playSound('complete');
  };

  const again = () => {
    setRecord(getToetsGrades()[flagQuizKey(packageId, mode)]);
    setQuestions(planFlagQuiz(packageNames));
    setAnswers([]);
    setShown(null);
    setDraft('');
  };

  const heading = `Vlaggen: ${title}`;

  if (finished) {
    const result = flagResult(mode, answers);
    const newRecord = record === undefined || result.grade > record;
    const wrong = answers.filter((a) => !a.correct);
    return (
      <Screen>
        <Header>
          <Title>{heading}</Title>
          <Button onClick={onBack}>Terug</Button>
        </Header>
        <Page>
          <Box>
            <Question>Je cijfer</Question>
            <Grade passed={result.grade >= 5.5}>{formatGrade(result.grade)}</Grade>
            <Help>
              {result.correct} van de {result.total} goed. +{result.coins} munten.
              {newRecord
                ? ' Je beste cijfer voor deze vlaggen!'
                : ` Je beste cijfer blijft ${formatGrade(record)}.`}
            </Help>
            {wrong.length > 0 && (
              <>
                <Question>Deze moet je nog even oefenen</Question>
                <AnswerList>
                  {wrong.map((a) => (
                    <AnswerItem key={a.name} correct={false}>
                      <SmallFlag src={flagOf(a.name)} alt="" />
                      {a.name}
                      <small>
                        Jij {mode === 'choice' ? 'koos' : 'schreef'}:{' '}
                        {a.given === '' ? '(niets)' : a.given}
                      </small>
                    </AnswerItem>
                  ))}
                </AnswerList>
                <Help>Die staan nu ook bij je lastige vlaggen.</Help>
              </>
            )}
            <Row>
              <Button onClick={again}>Nog een keer</Button>
              <Button variant="outline" onClick={onBack}>
                Terug
              </Button>
            </Row>
          </Box>
        </Page>
      </Screen>
    );
  }

  const choiceState = (name: string): ChoiceState => {
    if (!shown) return 'idle';
    if (name === shown.name) return 'right';
    return name === shown.given ? 'wrong' : 'idle';
  };

  return (
    <Screen>
      <Header>
        <Title>{heading}</Title>
        <Progress>
          Vlag {index + 1} van {questions.length}
        </Progress>
        <Row>
          <SoundToggle />
          <Button variant="danger" onClick={onBack}>
            Stoppen
          </Button>
        </Row>
      </Header>
      <Page>
        <Box style={{ maxWidth: 520 }}>
          {current && <FlagImage key={current} src={flagOf(current)} alt="Welk land is dit?" />}
          <Question>Van welk land is deze vlag?</Question>
          {mode === 'choice' ? (
            <Choices>
              {choices.map((name) => (
                <ChoiceButton
                  key={name}
                  state={choiceState(name)}
                  disabled={shown !== null}
                  onClick={() => answer(name)}
                >
                  {name}
                </ChoiceButton>
              ))}
            </Choices>
          ) : (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                if (shown) next();
                // Per ongeluk Enter zonder antwoord: niet overslaan (daarvoor is 'Weet ik niet').
                else if (draft.trim() !== '') answer(draft);
              }}
              style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
            >
              <AnswerInput
                ref={input}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                aria-label="Naam van het land"
                readOnly={shown !== null}
                autoFocus
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
              />
              {!shown && (
                <Row>
                  <Button type="submit" disabled={draft.trim() === ''}>
                    Nakijken
                  </Button>
                  <Button type="button" variant="outline" onClick={() => answer('')}>
                    Weet ik niet
                  </Button>
                </Row>
              )}
            </form>
          )}
          {shown && (
            <>
              <Verdict correct={shown.correct}>
                {shown.correct
                  ? shown.exact
                    ? `Goed! Dit is ${shown.name}.`
                    : `Goed! Zo schrijf je het: ${shown.name}.`
                  : `Helaas, dit is de vlag van ${shown.name}.`}
              </Verdict>
              <Row>
                <Button autoFocus onClick={next}>
                  {answers.length < questions.length ? 'Volgende vlag' : 'Klaar: naar je cijfer'}
                </Button>
              </Row>
            </>
          )}
        </Box>
      </Page>
    </Screen>
  );
};

export default FlagQuiz;
