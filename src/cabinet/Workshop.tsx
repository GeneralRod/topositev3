import React, { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { FaCoins, FaCompass, FaLightbulb, FaMagic, FaBorderStyle, FaCheck } from 'react-icons/fa';
import { Button } from '../ui';
import { DEFAULT_FINISH, extras, finishes, type CabinetItem } from './catalog';
import type { CabinetStyle } from './rules';

// De werkplaats: hier koop en kies je de kleur en extra's van de kast.

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(40, 25, 10, 0.55);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
`;

const Panel = styled.div`
  width: min(720px, 100%);
  max-height: 100%;
  overflow-y: auto;
  background: #fffaf0;
  border: 4px solid #8b5a2b;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.3);
`;

const Heading = styled.h2`
  color: #6b4226;
  font-size: 1.6rem;
`;

const Intro = styled.p`
  color: #5f6368;
  margin-bottom: 1rem;
`;

const SectionTitle = styled.h3`
  color: #6b4226;
  text-align: left;
  margin: 1rem 0 0.5rem;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
`;

const Option = styled.div<{ active: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  padding: 0.75rem 0.5rem;
  background: white;
  border: 3px solid ${(p) => (p.active ? '#3aa655' : '#eadcc4')};
  border-radius: 12px;
  position: relative;
`;

const ActiveBadge = styled.span`
  position: absolute;
  top: 6px;
  right: 8px;
  color: #3aa655;
`;

const Swatch = styled.span<{ wood: string; light: string; dark: string }>`
  width: 54px;
  height: 54px;
  border-radius: 10px;
  background: linear-gradient(135deg, ${(p) => p.light}, ${(p) => p.wood} 60%, ${(p) => p.dark});
  border: 3px solid ${(p) => p.dark};
`;

const ExtraIcon = styled.span`
  width: 54px;
  height: 54px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff3d6;
  color: #c48f10;
  font-size: 1.6rem;
  border: 3px solid #f7c531;
`;

const Name = styled.strong`
  color: #3b2a1a;
`;

const Small = styled.span`
  font-size: 0.8rem;
  color: #5f6368;
  min-height: 2.2em;
`;

const Actions = styled.div`
  display: flex;
  gap: 0.35rem;
  flex-wrap: wrap;
  justify-content: center;

  button {
    padding: 0.3rem 0.7rem;
    font-size: 0.9rem;
  }
`;

const BuyButton = styled(Button)`
  background: #3aa655;
  border-color: #3aa655;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;

  &:hover:not(:disabled) {
    background: #2b7f40;
    border-color: #2b7f40;
  }

  &:disabled {
    background: #b9c4bc;
    border-color: #b9c4bc;
  }
`;

const Footer = styled.div`
  margin-top: 1.25rem;
`;

const EXTRA_ICONS: Record<string, React.ReactNode> = {
  lights: <FaLightbulb />,
  'compass-rose': <FaCompass />,
  'gold-trim': <FaBorderStyle />,
  sparkles: <FaMagic />,
};

interface WorkshopProps {
  coins: number;
  owned: string[];
  style: CabinetStyle;
  onBuy: (item: CabinetItem) => void;
  onStyleChange: (style: CabinetStyle) => void;
  onClose: () => void;
}

const Workshop: React.FC<WorkshopProps> = ({
  coins,
  owned,
  style,
  onBuy,
  onStyleChange,
  onClose,
}) => {
  // Eerst "Kopen" en dan nog eens "Ja!": zo koop je niet per ongeluk iets.
  const [confirming, setConfirming] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const isOwned = (item: CabinetItem) => item.id === DEFAULT_FINISH || owned.includes(item.id);

  const buyActions = (item: CabinetItem) =>
    confirming === item.id ? (
      <>
        <BuyButton
          onClick={() => {
            onBuy(item);
            setConfirming(null);
          }}
        >
          Ja, kopen!
        </BuyButton>
        <Button variant="outline" onClick={() => setConfirming(null)}>
          Nee
        </Button>
      </>
    ) : (
      <BuyButton
        onClick={() => setConfirming(item.id)}
        disabled={coins < item.price}
        title={coins < item.price ? `Nog ${item.price - coins} munten nodig` : undefined}
      >
        <FaCoins /> {item.price}
      </BuyButton>
    );

  return (
    <Overlay onClick={onClose}>
      <Panel role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <Heading>De werkplaats</Heading>
        <Intro>Maak je kast mooier! Wat je koopt, kun je daarna altijd wisselen.</Intro>

        <SectionTitle>Kleur van de kast</SectionTitle>
        <Grid>
          {finishes.map((finish) => {
            const active = style.finish === finish.id;
            return (
              <Option key={finish.id} active={active}>
                {active && (
                  <ActiveBadge aria-label="In gebruik">
                    <FaCheck />
                  </ActiveBadge>
                )}
                <Swatch wood={finish.wood} light={finish.woodLight} dark={finish.woodDark} />
                <Name>{finish.name}</Name>
                <Small>{finish.description}</Small>
                <Actions>
                  {isOwned(finish) ? (
                    <Button
                      variant={active ? 'outline' : 'primary'}
                      disabled={active}
                      onClick={() => onStyleChange({ ...style, finish: finish.id })}
                    >
                      {active ? 'In gebruik' : 'Kiezen'}
                    </Button>
                  ) : (
                    buyActions(finish)
                  )}
                </Actions>
              </Option>
            );
          })}
        </Grid>

        <SectionTitle>Extra's</SectionTitle>
        <Grid>
          {extras.map((extra) => {
            const on = style.extras.includes(extra.id);
            return (
              <Option key={extra.id} active={on}>
                {on && (
                  <ActiveBadge aria-label="Aan">
                    <FaCheck />
                  </ActiveBadge>
                )}
                <ExtraIcon>{EXTRA_ICONS[extra.id]}</ExtraIcon>
                <Name>{extra.name}</Name>
                <Small>{extra.description}</Small>
                <Actions>
                  {isOwned(extra) ? (
                    <Button
                      variant={on ? 'outline' : 'primary'}
                      onClick={() =>
                        onStyleChange({
                          ...style,
                          extras: on
                            ? style.extras.filter((id) => id !== extra.id)
                            : [...style.extras, extra.id],
                        })
                      }
                    >
                      {on ? 'Uitzetten' : 'Aanzetten'}
                    </Button>
                  ) : (
                    buyActions(extra)
                  )}
                </Actions>
              </Option>
            );
          })}
        </Grid>

        <Footer>
          <Button onClick={onClose}>Klaar</Button>
        </Footer>
      </Panel>
    </Overlay>
  );
};

export default Workshop;
