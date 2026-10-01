import React, { useState } from 'react';
import type { City } from '../data/cities';
import type { Category } from '../content/catalog';
import {
  aanwijsResult,
  aanwijstoetsKey,
  judgeClick,
  planAanwijstoets,
  type AanwijsAnswer,
} from '../game/aanwijstoets';
import { formatGrade } from '../game/toets';
import { playSound } from '../game/sounds';
import { addCoins, getToetsGrades, recordCityAnswer, recordToetsGrade } from '../storage';
import { Button, SoundToggle } from '../ui';
import GameMap from './game/GameMap';
import {
  AnswerItem,
  AnswerList,
  Box,
  Grade,
  Header,
  Help,
  MapWrapper,
  Page,
  Panel,
  PlayArea,
  PointName,
  Progress,
  Question,
  Row,
  Screen,
  Title,
} from './toets/styles';

// Aanwijstoets (zie src/game/aanwijstoets.ts): de naam staat in beeld, je klikt
// de plek één keer aan. Tijdens de vragen zie en hoor je niet of het goed was;
// dat komt pas aan het eind, met een cijfer.

interface AanwijstoetsProps {
  category: Category;
  packageId: string;
  title: string;
  cities: City[];
  onBack: () => void;
}

const Aanwijstoets: React.FC<AanwijstoetsProps> = ({
  category,
  packageId,
  title,
  cities,
  onBack,
}) => {
  const [questions, setQuestions] = useState(() => planAanwijstoets(cities.map((c) => c.name)));
  const [answers, setAnswers] = useState<AanwijsAnswer[]>([]);
  const [record, setRecord] = useState<number | undefined>(
    () => getToetsGrades()[aanwijstoetsKey(packageId)],
  );
  const current = questions[answers.length];

  const answer = (clicked: string) => {
    if (!current) return;
    const all = [...answers, judgeClick(current, clicked)];
    setAnswers(all);
    if (all.length < questions.length) return;
    // Klaar: munten, lastige plekken en het beste cijfer bijwerken.
    const result = aanwijsResult(all);
    addCoins(result.coins);
    for (const a of all) recordCityAnswer(category.id, a.name, a.correct ? 'first-try' : 'wrong');
    recordToetsGrade(aanwijstoetsKey(packageId), result.grade);
    playSound('complete');
  };

  const again = () => {
    setRecord(getToetsGrades()[aanwijstoetsKey(packageId)]);
    setQuestions(planAanwijstoets(cities.map((c) => c.name)));
    setAnswers([]);
  };

  if (!current) {
    const result = aanwijsResult(answers);
    const newRecord = record === undefined || result.grade > record;
    return (
      <Screen>
        <Header>
          <Title>Aanwijstoets: {title}</Title>
          <Button onClick={onBack}>Terug</Button>
        </Header>
        <Page>
          <Box>
            <Question>Je cijfer</Question>
            <Grade passed={result.grade >= 5.5}>{formatGrade(result.grade)}</Grade>
            <Help>
              {result.correct} van de {result.total} goed. +{result.coins} munten.
              {newRecord
                ? ' Je beste cijfer voor dit pakket!'
                : ` Je beste cijfer blijft ${formatGrade(record)}.`}
            </Help>
            <AnswerList>
              {answers.map((a) => (
                <AnswerItem key={a.name} correct={a.correct}>
                  {a.correct ? '✓' : '✗'} {a.name}
                  {!a.correct && (
                    <small>Jij wees aan: {a.clicked === '' ? '(niets)' : a.clicked}</small>
                  )}
                </AnswerItem>
              ))}
            </AnswerList>
            <Help>Wat je fout had, staat nu ook bij je lastige {category.words.many}.</Help>
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

  return (
    <Screen>
      <Header>
        <Title>Aanwijstoets: {title}</Title>
        <Progress>
          Vraag {answers.length + 1} van {questions.length}
        </Progress>
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
            cities={cities}
            status={{}}
            onCityClick={answer}
            loadShapes={category.loadShapes}
            maxZoom={category.maxZoom}
            map={category.map}
          />
        </MapWrapper>
        <Panel aria-label="Vraag">
          <Question>Wijs aan op de kaart:</Question>
          <PointName>{current}</PointName>
          <Row>
            <Button type="button" variant="outline" onClick={() => answer('')}>
              Weet ik niet
            </Button>
          </Row>
          <Help>
            Je mag één keer klikken. Pas aan het eind zie je wat goed was. Je kunt in- en uitzoomen.
          </Help>
        </Panel>
      </PlayArea>
    </Screen>
  );
};

export default Aanwijstoets;
