import React, { useState } from 'react';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaCoins } from 'react-icons/fa';
import { BackLink } from '../ui';
import { buyItem, getCoins, getPrizes, getStickers } from '../storage';
import { allPrizes, shelves, stickers, type CabinetItem } from './catalog';
import { nextGoal, slotState } from './rules';
import { PrizeArt, StickerArt } from './art';
import BuyDialog, { type Selection } from './BuyDialog';
import DevTools from './DevTools';

const WOOD = '#8b5a2b';
const WOOD_DARK = '#6b4226';
const WOOD_LIGHT = '#b07a45';

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
  color: ${WOOD_DARK};
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
  color: ${WOOD_DARK};
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.12);

  svg {
    color: #e0a526;
  }
`;

const Goal = styled.p`
  margin: 0.25rem 0 0.75rem;
  color: ${WOOD_DARK};
  font-size: 1.05rem;
`;

const Cabinet = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  filter: drop-shadow(0 12px 18px rgba(60, 35, 15, 0.35));
`;

const Crown = styled.div`
  width: calc(100% - 40px);
  height: 46px;
  background: linear-gradient(${WOOD_LIGHT}, ${WOOD});
  border: 3px solid ${WOOD_DARK};
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
  background: ${WOOD};
  border: 3px solid ${WOOD_DARK};
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
  background: linear-gradient(90deg, ${WOOD_LIGHT}, ${WOOD} 70%);
  border: 2px solid ${WOOD_DARK};
  border-radius: 6px;
  padding: 12px 0;
`;

const Glass = styled.div`
  position: relative;
  background: linear-gradient(#f5e6cc, #ead3ad);
  border: 3px solid ${WOOD_DARK};
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

const ShelfRow = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 120px);
  gap: 8px;
  align-items: end;
  height: 98px;
`;

const ShelfBoard = styled.div`
  height: 22px;
  margin: 0 -12px;
  background: linear-gradient(${WOOD_LIGHT} 0 5px, ${WOOD} 5px);
  border-top: 2px solid ${WOOD_DARK};
  border-bottom: 2px solid ${WOOD_DARK};
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

  ${(p) => (p.state === 'affordable' ? `& > span:first-of-type { animation: ${glow} 1.8s ease-in-out infinite; }` : '')}
  ${(p) => (p.fresh ? `& > span:first-of-type { animation: ${pop} 0.7s ease-out; }` : '')}

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
  color: ${(p) => (p.affordable ? 'white' : WOOD_DARK)};
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
  background: linear-gradient(${WOOD}, ${WOOD_DARK});
  border: 3px solid ${WOOD_DARK};
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
    background: ${WOOD_DARK};
    border-radius: 0 0 10px 10px;
  }
`;

const STICKER_TILTS = [-8, 6, -4, 7, -6, 5];

export const PrizeCabinet: React.FC = () => {
  const navigate = useNavigate();
  const showDevTools = new URLSearchParams(useLocation().search).has('ontwikkelaar');
  const [coins, setCoins] = useState(getCoins);
  const [prizes, setPrizes] = useState(getPrizes);
  const [ownedStickers, setOwnedStickers] = useState(getStickers);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [fresh, setFresh] = useState<string | null>(null);

  const refresh = () => {
    setCoins(getCoins());
    setPrizes(getPrizes());
    setOwnedStickers(getStickers());
  };

  const buy = (selected: Selection) => {
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
        {goal
          ? coins >= goal.price
            ? `Je hebt genoeg munten voor: ${goal.name}! Klik op een lichtgevende plek.`
            : `Volgend doel: ${goal.name}. Nog ${goal.price - coins} munten sparen!`
          : 'Wauw, je kast is helemaal vol! Jij bent een echte topografiekampioen.'}
      </Goal>

      <Cabinet>
        <Crown>
          <NamePlate>PRIJZENKAST</NamePlate>
        </Crown>
        <Body>
          <SidePanel>{stickers.slice(0, half).map((s, i) => renderSticker(s, i))}</SidePanel>
          <Glass>
            {shelves.map((shelf) => (
              <React.Fragment key={shelf.id}>
                <ShelfRow>
                  {shelf.items.map((item) => {
                    const state = slotState(item, prizes, coins);
                    return (
                      <Slot
                        key={item.id}
                        state={state.kind}
                        fresh={fresh === item.id}
                        onClick={() => setSelection({ kind: 'prize', item })}
                        aria-label={
                          state.kind === 'owned' ? item.name : `${item.name}, ${item.price} munten`
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

      {selection && (
        <BuyDialog
          selection={selection}
          coins={coins}
          owned={(selection.kind === 'prize' ? prizes : ownedStickers).includes(selection.item.id)}
          onBuy={() => buy(selection)}
          onClose={() => setSelection(null)}
        />
      )}

      {showDevTools && <DevTools onChange={refresh} />}
    </Room>
  );
};

export default PrizeCabinet;
