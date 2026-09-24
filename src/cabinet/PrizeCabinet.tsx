import React, { useState } from 'react';
import styled from '@emotion/styled';
import { css, keyframes } from '@emotion/react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaCoins, FaHammer } from 'react-icons/fa';
import { BackLink } from '../ui';
import {
  awardAchievements,
  buyItem,
  getAchievements,
  getCoins,
  getPrizes,
  getStickers,
  getStyle,
  getUpgrades,
  setStyle,
} from '../storage';
import {
  allPrizes,
  DEFAULT_FINISH,
  finishes,
  shelves,
  stickers,
  type CabinetItem,
} from './catalog';
import { effectiveStyle, nextGoal, slotState, type CabinetStyle } from './rules';
import { AchievementArt, PrizeArt, StickerArt } from './art';
import { achievements, findAchievement } from '../game/achievements';
import BuyDialog, { type Selection } from './BuyDialog';
import DevTools from './DevTools';
import Workshop from './Workshop';

// Kleur van teksten rond de kast; de kast zelf krijgt zijn kleuren via
// CSS-variabelen, zodat spelers hem kunnen opknappen (zie upgrades).
const TEXT_BROWN = '#6b4226';

const Room = styled.div`
  width: 100%;
  height: 100%;
  overflow-y: auto;
  padding: 1rem 2rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  /* Ontdekkerskamer: behang met streepjes en een houten vloer. */
  background:
    linear-gradient(to bottom, transparent calc(100% - 90px), #c89663 calc(100% - 90px)),
    repeating-linear-gradient(90deg, #f7ecd6 0 38px, #f1e2c6 38px 76px);
  background-attachment: local;
`;

const TopBar = styled.div`
  width: 100%;
  max-width: 980px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;

  & > button {
    margin-bottom: 0;
  }
`;

const Title = styled.h1`
  color: ${TEXT_BROWN};
  font-size: 2rem;
`;

const CoinBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1.1rem;
  background: white;
  border: 3px solid #f7c531;
  border-radius: 999px;
  font-size: 1.25rem;
  font-weight: 700;
  color: ${TEXT_BROWN};
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.12);

  svg {
    color: #e0a526;
  }
`;

const Goal = styled.p`
  margin: 0.25rem 0 0.75rem;
  color: ${TEXT_BROWN};
  font-size: 1.05rem;
`;

const Cabinet = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  filter: drop-shadow(0 12px 18px rgba(60, 35, 15, 0.35));
`;

const Crown = styled.div`
  width: calc(100% - 40px);
  height: 46px;
  background: linear-gradient(var(--wood-light), var(--wood));
  border: 3px solid var(--trim);
  border-bottom: none;
  border-radius: 50% 50% 0 0 / 100% 100% 0 0;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 6px;
`;

const NamePlate = styled.div`
  padding: 2px 18px;
  background: linear-gradient(#f9dc7a, #d9a929);
  border: 2px solid #9c7412;
  border-radius: 6px;
  color: #5c4208;
  font-weight: 700;
  letter-spacing: 1px;
`;

const Body = styled.div`
  display: flex;
  background: var(--wood);
  border: 3px solid var(--trim);
  border-radius: 8px;
  padding: 10px;
  gap: 10px;
`;

const SidePanel = styled.div`
  width: 96px;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
  background: linear-gradient(90deg, var(--wood-light), var(--wood) 70%);
  border: 2px solid var(--trim);
  border-radius: 6px;
  padding: 12px 0;
`;

const Glass = styled.div`
  position: relative;
  background: linear-gradient(#f5e6cc, #ead3ad);
  border: 3px solid var(--trim);
  border-radius: 4px;
  box-shadow: inset 0 0 24px rgba(90, 55, 20, 0.35);
  padding: 8px 12px 0;

  /* Glans van het glas */
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: linear-gradient(
      115deg,
      transparent 0 18%,
      rgba(255, 255, 255, 0.35) 18% 22%,
      transparent 22% 28%,
      rgba(255, 255, 255, 0.2) 28% 30%,
      transparent 30%
    );
  }
`;

const ShelfRow = styled.div<{ lit: boolean }>`
  display: grid;
  grid-template-columns: repeat(4, 120px);
  gap: 8px;
  align-items: end;
  height: 98px;
  margin: 0 -12px;
  padding: 0 12px;
  /* Lampjes: warm licht dat van boven op de plank schijnt. */
  background: ${(p) =>
    p.lit
      ? 'radial-gradient(ellipse 45% 85% at 12.5% 0%, rgba(255, 214, 110, 0.6), transparent), radial-gradient(ellipse 45% 85% at 37.5% 0%, rgba(255, 214, 110, 0.6), transparent), radial-gradient(ellipse 45% 85% at 62.5% 0%, rgba(255, 214, 110, 0.6), transparent), radial-gradient(ellipse 45% 85% at 87.5% 0%, rgba(255, 214, 110, 0.6), transparent)'
      : 'none'};
`;

const ShelfBoard = styled.div`
  height: 22px;
  margin: 0 -12px;
  background: linear-gradient(var(--wood-light) 0 5px, var(--wood) 5px);
  border-top: 2px solid var(--trim);
  border-bottom: 2px solid var(--trim);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ShelfLabel = styled.span`
  padding: 0 10px;
  background: linear-gradient(#f9dc7a, #d9a929);
  border: 1px solid #9c7412;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 700;
  color: #5c4208;
  line-height: 1.4;
`;

const glow = keyframes`
  0%, 100% { filter: drop-shadow(0 0 0 rgba(247, 197, 49, 0)); }
  50% { filter: drop-shadow(0 0 10px rgba(247, 197, 49, 0.95)); }
`;

const pop = keyframes`
  0% { transform: scale(0.2) translateY(20px); opacity: 0; }
  60% { transform: scale(1.2) translateY(-6px); opacity: 1; }
  100% { transform: scale(1) translateY(0); }
`;

const Slot = styled.button<{ state: 'owned' | 'affordable' | 'locked'; fresh: boolean }>`
  position: relative;
  height: 92px;
  background: none;
  border: none;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  padding: 0;
  transition: transform 0.15s;

  svg {
    ${(p) => (p.state === 'owned' ? '' : 'filter: brightness(0); opacity: 0.16;')}
  }

  /* Met css eromheen, anders plakt Emotion de animatie als gewone tekst in en doet hij niets. */
  ${(p) =>
    p.state === 'affordable' &&
    css`
      & > span:first-of-type {
        animation: ${glow} 1.8s ease-in-out infinite;
      }
    `}
  ${(p) =>
    p.fresh &&
    css`
      & > span:first-of-type {
        animation: ${pop} 0.7s ease-out;
      }
    `}

  &:hover {
    transform: translateY(-4px);
  }

  &:hover svg {
    ${(p) => (p.state === 'owned' ? '' : 'opacity: 0.3;')}
  }
`;

const ArtWrap = styled.span`
  display: block;
  line-height: 0;
`;

const PriceTag = styled.span<{ affordable: boolean }>`
  position: absolute;
  bottom: 2px;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 1px 8px;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 700;
  background: ${(p) => (p.affordable ? '#3aa655' : 'rgba(255, 255, 255, 0.9)')};
  color: ${(p) => (p.affordable ? 'white' : TEXT_BROWN)};
  border: 2px solid ${(p) => (p.affordable ? '#2b7f40' : '#d9bf94')};

  svg {
    filter: none !important;
    opacity: 1 !important;
    color: ${(p) => (p.affordable ? '#fff3b0' : '#e0a526')};
  }
`;

const StickerSpot = styled.button<{ owned: boolean; tilt: number }>`
  width: 70px;
  height: 70px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  background: ${(p) => (p.owned ? 'none' : 'rgba(255, 255, 255, 0.12)')};
  border: ${(p) => (p.owned ? 'none' : '2px dashed rgba(255, 240, 210, 0.7)')};
  color: #fff3dc;
  font-size: 0.75rem;
  font-weight: 700;
  transform: rotate(${(p) => p.tilt}deg);
  transition: transform 0.15s;

  &:hover {
    transform: rotate(${(p) => p.tilt}deg) scale(1.08);
  }
`;

const Base = styled.div`
  width: calc(100% + 20px);
  height: 22px;
  background: linear-gradient(var(--wood), var(--wood-dark));
  border: 3px solid var(--trim);
  border-radius: 0 0 6px 6px;
`;

const Feet = styled.div`
  width: calc(100% - 20px);
  display: flex;
  justify-content: space-between;

  &::before,
  &::after {
    content: '';
    width: 34px;
    height: 16px;
    background: var(--trim);
    border-radius: 0 0 10px 10px;
  }
`;

const WorkshopButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.9rem;
  padding: 0.45rem 1.1rem;
  background: #fff3d6;
  color: ${TEXT_BROWN};
  border: 2px solid #e0a526;
  border-radius: 999px;
  font-weight: 700;
  transition:
    transform 0.15s,
    background-color 0.15s;

  &:hover {
    background: #ffe7a8;
    transform: translateY(-2px);
  }
`;

const twinkle = keyframes`
  0%, 100% { opacity: 0; transform: scale(0.4); }
  50% { opacity: 1; transform: scale(1); }
`;

const Sparkle = styled.span<{ x: number; y: number; delay: number }>`
  position: absolute;
  left: ${(p) => p.x}%;
  top: ${(p) => p.y}%;
  color: #fff6c2;
  font-size: 14px;
  text-shadow: 0 0 6px #ffd84d;
  pointer-events: none;
  z-index: 1;
  animation: ${twinkle} 2.4s ease-in-out ${(p) => p.delay}s infinite;
`;

const SPARKLES = [
  [8, 12, 0],
  [30, 40, 0.8],
  [55, 8, 1.6],
  [78, 30, 0.4],
  [92, 60, 1.2],
  [20, 70, 2],
  [48, 58, 0.6],
  [70, 85, 1.4],
  [5, 90, 1],
  [88, 12, 1.8],
] as const;

const Topper = styled.div`
  position: absolute;
  top: -30px;
  left: 50%;
  transform: translateX(-50%);
  line-height: 0;
  z-index: 1;
`;

/** Gouden windroos voor bovenop de kast. */
const CompassRose: React.FC = () => (
  <svg width="58" height="58" viewBox="0 0 64 64" aria-hidden="true">
    <circle cx="32" cy="32" r="14" fill="none" stroke="#9c7412" strokeWidth="3" />
    <path
      d="M32 2 L37 27 L62 32 L37 37 L32 62 L27 37 L2 32 L27 27 Z"
      fill="#f7c531"
      stroke="#9c7412"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <path
      d="M32 2 L37 27 L32 32 Z M62 32 L37 37 L32 32 Z M32 62 L27 37 L32 32 Z M2 32 L27 27 L32 32 Z"
      fill="#d9a929"
    />
    <circle cx="32" cy="32" r="4" fill="#e74c3c" stroke="#9c7412" strokeWidth="1.5" />
  </svg>
);

const STICKER_TILTS = [-8, 6, -4, 7, -6, 5];

/** Kast en prestatiebord naast elkaar; op een smal scherm het bord eronder. */
const Showroom = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: flex-start;
  gap: 1.5rem;
`;

// Prestatiebord: groen vilt in een lijst van hetzelfde hout als de kast.
const Board = styled.section`
  /* Even hoog beginnen als de kast zelf (onder de kroon). */
  margin-top: 46px;
  width: 232px;
  padding: 10px 12px 14px;
  background-color: #2f5d50;
  background-image: radial-gradient(rgba(255, 255, 255, 0.07) 1px, transparent 1px);
  background-size: 6px 6px;
  border: 10px solid var(--wood);
  border-radius: 8px;
  box-shadow:
    0 0 0 3px var(--trim),
    inset 0 0 18px rgba(0, 0, 0, 0.4),
    0 12px 18px rgba(60, 35, 15, 0.35);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
`;

const BoardCount = styled.span`
  color: #e8f3ee;
  font-size: 0.85rem;
  font-weight: 600;
`;

const MedalGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 6px 8px;
  width: 100%;
`;

const MedalSpot = styled.button<{ earned: boolean; fresh: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 4px 2px;
  background: none;
  border: none;
  border-radius: 8px;
  color: ${(p) => (p.earned ? '#ffe7a0' : 'rgba(232, 243, 238, 0.6)')};
  font-size: 0.72rem;
  font-weight: 700;
  line-height: 1.2;
  transition: transform 0.15s;

  /* Nog niet verdiend: een grijze schim van de medaille. */
  svg {
    ${(p) => (p.earned ? '' : 'filter: grayscale(1) brightness(1.5); opacity: 0.3;')}
  }

  ${(p) =>
    p.fresh &&
    css`
      & > span:first-of-type {
        animation: ${pop} 0.7s ease-out;
      }
    `}

  &:hover {
    transform: translateY(-3px);
  }

  &:hover svg {
    ${(p) => (p.earned ? '' : 'opacity: 0.5;')}
  }
`;

export const PrizeCabinet: React.FC = () => {
  const navigate = useNavigate();
  const showDevTools = new URLSearchParams(useLocation().search).has('ontwikkelaar');
  const [coins, setCoins] = useState(getCoins);
  const [prizes, setPrizes] = useState(getPrizes);
  const [ownedStickers, setOwnedStickers] = useState(getStickers);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [fresh, setFresh] = useState<string | null>(null);
  const [upgrades, setUpgrades] = useState(getUpgrades);
  const [style, setStyleState] = useState<CabinetStyle>(getStyle);
  const [workshopOpen, setWorkshopOpen] = useState(false);
  // Eén keer bij het openen: prestaties die je al had verdiend (bijv. met sterren
  // van vóór het prestatiebord) komen er nu bij. Die krijgen een feestelijk effect.
  const [newlyEarned] = useState(() => awardAchievements());
  const [earned, setEarned] = useState(getAchievements);

  const refresh = () => {
    setCoins(getCoins());
    setPrizes(getPrizes());
    setOwnedStickers(getStickers());
    setUpgrades(getUpgrades());
    setStyleState(getStyle());
    setEarned(getAchievements());
  };

  const changeStyle = (next: CabinetStyle) => {
    setStyle(next);
    setStyleState(next);
  };

  const buyUpgrade = (item: CabinetItem) => {
    if (!buyItem('upgrade', item.id, item.price)) return;
    // Meteen gebruiken wat je net gekocht hebt.
    const isFinish = finishes.some((f) => f.id === item.id);
    changeStyle(
      isFinish
        ? { ...style, finish: item.id }
        : { ...style, extras: [...style.extras.filter((id) => id !== item.id), item.id] },
    );
    refresh();
  };

  const shown = effectiveStyle(
    style,
    upgrades,
    finishes.map((f) => f.id),
    DEFAULT_FINISH,
  );
  const finish = finishes.find((f) => f.id === shown.finish) ?? finishes[0];
  const has = (extra: string) => shown.extras.includes(extra);
  const cabinetColors = {
    '--wood': finish.wood,
    '--wood-light': finish.woodLight,
    '--wood-dark': finish.woodDark,
    '--trim': has('gold-trim') ? '#c9a227' : finish.woodDark,
  } as React.CSSProperties;
  const newNames = newlyEarned.flatMap((id) => findAchievement(id)?.name ?? []);
  const newMessage =
    newNames.length === 0
      ? null
      : newNames.length === 1
        ? `Hoera, een nieuwe prestatie: ${newNames[0]}! Kijk maar op je prestatiebord.`
        : `Hoera, ${newNames.length} nieuwe prestaties: ${newNames.slice(0, -1).join(', ')} en ${newNames[newNames.length - 1]}! Kijk maar op je prestatiebord.`;

  const buy = (selected: Selection) => {
    // Prestatieprijzen zijn niet te koop.
    if (selected.kind === 'achievement') return;
    if (buyItem(selected.kind, selected.item.id, selected.item.price)) {
      setFresh(selected.item.id);
      refresh();
    }
    setSelection(null);
  };

  const goal = nextGoal(allPrizes, prizes);
  const half = Math.ceil(stickers.length / 2);

  const renderSticker = (item: CabinetItem, index: number) => {
    const owned = ownedStickers.includes(item.id);
    return (
      <StickerSpot
        key={item.id}
        owned={owned}
        tilt={owned ? STICKER_TILTS[index % STICKER_TILTS.length] : 0}
        onClick={() => setSelection({ kind: 'sticker', item })}
        aria-label={owned ? item.name : `Sticker ${item.name}, ${item.price} munten`}
        title={item.name}
      >
        {owned ? (
          <StickerArt id={item.id} size={64} />
        ) : (
          <>
            <FaCoins />
            {item.price}
          </>
        )}
      </StickerSpot>
    );
  };

  return (
    <Room>
      <TopBar>
        <BackLink
          onClick={() =>
            // Terug naar waar je vandaan kwam; direct geopend → naar het menu.
            (window.history.state?.idx ?? 0) > 0 ? navigate(-1) : navigate('/categories')
          }
        >
          ← Terug
        </BackLink>
        <Title>Mijn prijzenkast</Title>
        <CoinBadge aria-label={`${coins} munten`}>
          <FaCoins /> {coins}
        </CoinBadge>
      </TopBar>

      <Goal>
        {newMessage
          ? newMessage
          : goal
            ? coins >= goal.price
              ? `Je hebt genoeg munten voor: ${goal.name}! Klik op een lichtgevende plek.`
              : `Volgend doel: ${goal.name}. Nog ${goal.price - coins} munten sparen!`
            : 'Wauw, je kast is helemaal vol! Jij bent een echte topografiekampioen.'}
      </Goal>
      <WorkshopButton onClick={() => setWorkshopOpen(true)}>
        <FaHammer /> Kast opknappen
      </WorkshopButton>

      <Showroom style={cabinetColors}>
        {/* Ruimte voor de windroos bovenop, zodat die niet over de knop valt. */}
        <Cabinet style={{ marginTop: has('compass-rose') ? 28 : 0 }}>
          {has('compass-rose') && (
            <Topper>
              <CompassRose />
            </Topper>
          )}
          <Crown>
            <NamePlate>PRIJZENKAST</NamePlate>
          </Crown>
          <Body>
            <SidePanel>{stickers.slice(0, half).map((s, i) => renderSticker(s, i))}</SidePanel>
            <Glass>
              {has('sparkles') &&
                SPARKLES.map(([x, y, delay], i) => (
                  <Sparkle key={i} x={x} y={y} delay={delay}>
                    ✦
                  </Sparkle>
                ))}
              {shelves.map((shelf) => (
                <React.Fragment key={shelf.id}>
                  <ShelfRow lit={has('lights')}>
                    {shelf.items.map((item) => {
                      const state = slotState(item, prizes, coins);
                      return (
                        <Slot
                          key={item.id}
                          state={state.kind}
                          fresh={fresh === item.id}
                          onClick={() => setSelection({ kind: 'prize', item })}
                          aria-label={
                            state.kind === 'owned'
                              ? item.name
                              : `${item.name}, ${item.price} munten`
                          }
                          title={state.kind === 'owned' ? item.name : undefined}
                        >
                          <ArtWrap>
                            <PrizeArt id={item.id} size={74} />
                          </ArtWrap>
                          {state.kind !== 'owned' && (
                            <PriceTag affordable={state.kind === 'affordable'}>
                              <FaCoins /> {item.price}
                            </PriceTag>
                          )}
                        </Slot>
                      );
                    })}
                  </ShelfRow>
                  <ShelfBoard>
                    <ShelfLabel>{shelf.title}</ShelfLabel>
                  </ShelfBoard>
                </React.Fragment>
              ))}
            </Glass>
            <SidePanel>{stickers.slice(half).map((s, i) => renderSticker(s, i + half))}</SidePanel>
          </Body>
          <Base />
          <Feet />
        </Cabinet>

        <Board aria-label="Prestatiebord">
          <NamePlate>PRESTATIES</NamePlate>
          <BoardCount>
            {earned.length} van {achievements.length} verdiend
          </BoardCount>
          <MedalGrid>
            {achievements.map((achievement) => {
              const isEarned = earned.includes(achievement.id);
              return (
                <MedalSpot
                  key={achievement.id}
                  earned={isEarned}
                  fresh={newlyEarned.includes(achievement.id)}
                  onClick={() => setSelection({ kind: 'achievement', item: achievement })}
                  aria-label={
                    isEarned ? achievement.name : `${achievement.name}, nog niet verdiend`
                  }
                >
                  <ArtWrap>
                    <AchievementArt id={achievement.id} size={72} />
                  </ArtWrap>
                  {achievement.name}
                </MedalSpot>
              );
            })}
          </MedalGrid>
        </Board>
      </Showroom>

      {selection && (
        <BuyDialog
          selection={selection}
          coins={coins}
          owned={{ prize: prizes, sticker: ownedStickers, achievement: earned }[
            selection.kind
          ].includes(selection.item.id)}
          onBuy={() => buy(selection)}
          onClose={() => setSelection(null)}
        />
      )}

      {workshopOpen && (
        <Workshop
          coins={coins}
          owned={upgrades}
          style={shown}
          onBuy={buyUpgrade}
          onStyleChange={changeStyle}
          onClose={() => setWorkshopOpen(false)}
        />
      )}

      {showDevTools && <DevTools onChange={refresh} />}
    </Room>
  );
};

export default PrizeCabinet;
