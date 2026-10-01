// De vraag bij de eerste keer inloggen op een computer waar al voortgang staat:
// is die van jou? (zie guest.ts). Staat over de hele site heen tot je antwoordt.

import React, { useState } from 'react';
import styled from '@emotion/styled';
import { Button, colors } from '../ui';
import { answerGuestQuestion, useGuestQuestion } from './session';

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 3000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: rgba(32, 33, 36, 0.55);
`;

const Dialog = styled.div`
  width: 100%;
  max-width: 440px;
  background: white;
  border-radius: 8px;
  border-top: 4px solid ${colors.primary};
  padding: 1.75rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
`;

const Title = styled.h2`
  margin: 0;
  color: ${colors.text};
  font-size: 1.4rem;
`;

const Text = styled.p`
  margin: 0;
  color: ${colors.text};
  line-height: 1.5;
`;

const Small = styled.p`
  margin: 0;
  color: ${colors.muted};
  font-size: 0.9rem;
  line-height: 1.45;
`;

const Choice = styled(Button)`
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 1.05rem;
  font-weight: 600;
`;

const GuestQuestion: React.FC = () => {
  const question = useGuestQuestion();
  const [busy, setBusy] = useState(false);
  if (!question) return null;

  const answer = async (mine: boolean) => {
    setBusy(true);
    try {
      await answerGuestQuestion(mine);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Backdrop>
      <Dialog role="dialog" aria-modal="true" aria-labelledby="gast-titel">
        <Title id="gast-titel">Is dit jouw voortgang?</Title>
        <Text>
          Op deze computer is al gespeeld: <strong>{question.summary}</strong>. Wil je dat op je
          account zetten?
        </Text>
        <Choice type="button" disabled={busy} onClick={() => answer(true)}>
          Ja, zet het op mijn account
        </Choice>
        <Choice type="button" variant="outline" disabled={busy} onClick={() => answer(false)}>
          Nee, dat is van iemand anders
        </Choice>
        <Small>
          Kies je nee, dan blijft het op deze computer bewaard en staat het er weer als je uitlogt.
          Je kunt het later ook nog op je account zetten.
        </Small>
      </Dialog>
    </Backdrop>
  );
};

export default GuestQuestion;
