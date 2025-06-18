import React, { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { useNavigate } from 'react-router-dom';
import CabinetSVG from './CabinetSVG';
import { prizes } from '../data/prizes';
import { getTotalCoins, setTotalCoins } from '../../../utils/coinStorage';
import {
  saveRibbonsOwned,
  loadRibbonsOwned,
  saveRealPrizesOwned,
  loadRealPrizesOwned,
} from '../../../utils/prizeStorage';

const Container = styled.div`
  width: 100vw;
  height: 100vh;
  overflow-y: auto;
  background: linear-gradient(135deg, #2c3e50 0%, #1a252f 100%);
  color: white;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  max-width: 1200px;
  margin: 0 auto 2rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  background: linear-gradient(135deg, #2c3e50 0%, #1a252f 100%);
  padding: 1.5rem 0 0.5rem 0;
  z-index: 10;
`;

const TitleRow = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: #f1c40f;
  margin: 0;
`;

const CoinCounter = styled.div`
  display: flex;
  align-items: center;
  font-size: 1.3rem;
  color: #f1c40f;
  font-weight: bold;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  padding: 0.5rem 1.2rem;
  margin-left: 1.5rem;
`;

const CoinIcon = styled.span`
  font-size: 1.5rem;
  margin-right: 0.5rem;
`;

const BackButton = styled.button`
  background: transparent;
  border: 2px solid #f1c40f;
  color: #f1c40f;
  padding: 0.7rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1.1rem;
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
  align-self: flex-start;
  transition: all 0.2s;
  font-weight: bold;
  letter-spacing: 0.5px;

  &:hover {
    background: #f1c40f;
    color: #2c3e50;
  }
`;

const CabinetArea = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  gap: 2.5rem;
`;

const CabinetWrapper = styled.div`
  position: relative;
  width: 800px;
  height: 500px;
  margin-bottom: 2.5rem;
  display: flex;
  justify-content: center;
  align-items: flex-start;
`;

const PrizeIcon = styled.div<{ x: number; y: number }>`
  position: absolute;
  left: ${(props) => props.x}px;
  top: ${(props) => props.y}px;
  font-size: 2.2rem;
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ShopPanel = styled.div`
  background: rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 1.5rem 1rem;
  min-width: 320px;
  max-width: 600px;
  width: 100%;
  color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  align-items: center;
  margin-top: 1.5rem;
`;

const ShopTitle = styled.h2`
  color: #f1c40f;
  font-size: 1.3rem;
  margin-bottom: 0.5rem;
`;

const ShopGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(90px, 1fr));
  gap: 1rem;
  width: 100%;
  max-width: 520px;
  margin: 0 auto;
`;

const ShopPrize = styled.div<{ selected?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  background: ${({ selected }) => (selected ? 'rgba(241,196,15,0.18)' : 'rgba(0,0,0,0.08)')};
  border-radius: 8px;
  padding: 0.7rem 0.2rem 0.5rem 0.2rem;
  cursor: pointer;
  border: ${({ selected }) => (selected ? '2px solid #f1c40f' : '2px solid transparent')};
  transition:
    border 0.2s,
    background 0.2s;
  min-height: 90px;
`;

const ShopIcon = styled.span`
  font-size: 2.1rem;
`;

const ShopName = styled.div`
  font-weight: bold;
  color: #fff;
  font-size: 0.95rem;
  margin-top: 0.3rem;
  text-align: center;
  word-break: break-word;
  max-width: 80px;
`;

const ShopDetails = styled.div`
  margin-top: 0.5rem;
  background: rgba(0, 0, 0, 0.13);
  border-radius: 6px;
  padding: 0.6rem 0.7rem;
  text-align: center;
  font-size: 0.97rem;
  color: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.07);
  word-break: break-word;
  min-width: 120px;
`;

const ShopDesc = styled.div`
  font-size: 0.93rem;
  color: #eee;
  margin-bottom: 0.3rem;
  word-break: break-word;
`;

const ShopPrice = styled.div`
  color: #f1c40f;
  font-weight: bold;
  font-size: 1.05rem;
  margin-bottom: 0.5rem;
  margin-top: 0.2rem;
`;

const BuyButton = styled.button`
  background: #f1c40f;
  color: #2c3e50;
  border: none;
  padding: 0.4rem 1.1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: bold;
  margin-top: 0.2rem;
  transition: background 0.2s;
  &:hover:enabled {
    background: #ffd700;
  }
  &:disabled {
    background: #ccc;
    color: #888;
    cursor: not-allowed;
  }
`;

const DevPanel = styled.div`
  margin: 3rem auto 1.5rem auto;
  max-width: 400px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 1.5rem 2rem;
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`;

const DevForm = styled.form`
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
  justify-content: center;
  margin-bottom: 0.5rem;
`;

const DevInput = styled.input`
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: 1px solid #f1c40f;
  font-size: 1rem;
  margin-right: 1rem;
  flex: 1;
`;

const DevButton = styled.button`
  background: #f1c40f;
  color: #2c3e50;
  border: none;
  padding: 0.5rem 1.2rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: bold;
  margin: 0 0.5rem;
  transition: background 0.2s;
  &:hover {
    background: #ffd700;
  }
`;

const DevClose = styled.button`
  background: transparent;
  color: #f1c40f;
  border: none;
  font-size: 1.1rem;
  font-weight: bold;
  margin-top: 0.7rem;
  cursor: pointer;
  text-decoration: underline;
  &:hover {
    color: #ffd700;
  }
`;

const RibbonCount = styled.div`
  color: #f1c40f;
  font-size: 0.9rem;
  margin-top: 2px;
`;

const DevButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
`;

const RibbonIcon = styled.div<{ color: string }>`
  width: 28px;
  height: 28px;
  position: relative;
  &::before {
    content: '🎗️';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
    filter: ${(props) => (props.color === 'red' ? 'hue-rotate(0deg)' : 'hue-rotate(200deg)')};
  }
`;

const DevPanelTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: bold;
  color: #f1c40f;
  margin: 0 0 1rem 0;
  letter-spacing: 0.5px;
  text-align: center;
`;

// For ribbons, define door positions for horizontal stacking (aesthetic, non-overlapping)
const ribbonDoorPositions = {
  left: [
    { x: 70, y: 120 },
    { x: 110, y: 120 },
    { x: 70, y: 170 },
    { x: 110, y: 170 },
    { x: 90, y: 145 },
  ],
  right: [
    { x: 650, y: 120 },
    { x: 690, y: 120 },
    { x: 650, y: 170 },
    { x: 690, y: 170 },
    { x: 670, y: 145 },
  ],
};

// For real prizes, define shelf y positions for the new, larger SVG
const shelfY = {
  1: 340, // bottom shelf
  2: 260, // middle shelf
  3: 180, // top shelf
};
// More x positions for more prizes
const shelfX = [240, 290, 340, 390, 440, 490, 540];

// Helper to render icon (emoji or React component)
const renderPrizeIcon = (
  icon: string | React.ComponentType<{ width?: number; height?: number }>,
): React.ReactNode => {
  if (typeof icon === 'string') return <span>{icon}</span>;
  if (icon) return React.createElement(icon, { width: 36, height: 36 });
  return null;
};

export const TrophyCabinet: React.FC = () => {
  const navigate = useNavigate();

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Dynamic coins state
  const [coins, setCoins] = useState(getTotalCoins());
  const [devCode, setDevCode] = useState('');
  const [devUnlocked, setDevUnlocked] = useState(false);
  const [selectedPrize, setSelectedPrize] = useState<string | null>(null);
  const [ribbonsOwned, setRibbonsOwned] = useState<{ [id: string]: number }>(loadRibbonsOwned());
  const [realPrizesOwned, setRealPrizesOwned] = useState<string[]>(loadRealPrizesOwned());

  useEffect(() => {
    setTotalCoins(coins);
  }, [coins]);

  useEffect(() => {
    saveRibbonsOwned(ribbonsOwned);
  }, [ribbonsOwned]);

  useEffect(() => {
    saveRealPrizesOwned(realPrizesOwned);
  }, [realPrizesOwned]);

  // Dutch translations for prize names and descriptions
  const getDutchPrize = (prize: (typeof prizes)[0]) => {
    switch (prize.id) {
      case 'ribbon-red':
        return { name: 'Rood lint', desc: 'Een simpel rood lint om je kast te versieren.' };
      case 'ribbon-blue':
        return { name: 'Blauw lint', desc: 'Een simpel blauw lint voor je verzameling.' };
      case 'ribbon-gold':
        return { name: 'Gouden lint', desc: 'Een glanzend gouden lint voor speciale prestaties.' };
      case 'mini-trophy':
        return { name: 'Mini trofee', desc: 'Een kleine trofee voor je inzet.' };
      case 'silver-trophy':
        return { name: 'Zilveren trofee', desc: 'Een glanzende zilveren trofee.' };
      case 'gold-trophy':
        return { name: 'Gouden trofee', desc: 'Een prestigieuze gouden trofee.' };
      case 'globe':
        return { name: 'Wereldbol', desc: 'Een prachtige wereldbol voor topografiemeesters.' };
      case 'compass':
        return { name: 'Ontdekkerskompas', desc: 'Een kompas voor echte ontdekkingsreizigers.' };
      case 'map':
        return { name: 'Oude kaart', desc: 'Een zeldzame kaart voor in je kast.' };
      case 'door-sticker':
        return { name: 'Deur-sticker', desc: 'Versier je kastdeuren met een leuke sticker.' };
      case 'door-ribbon':
        return { name: 'Deurlint', desc: 'Een lint om aan je kastdeur te hangen.' };
      case 'book':
        return { name: 'Boek', desc: 'Een dik aardrijkskundeboek voor in je kast.' };
      case 'binoculars':
        return { name: 'Verrekijker', desc: 'Voor de echte ontdekkingsreiziger.' };
      case 'atlas':
        return { name: 'Atlas', desc: 'Een wereldatlas vol kaarten.' };
      case 'cup':
        return { name: 'Beker', desc: 'Een grote beker voor de winnaar.' };
      case 'medal':
        return { name: 'Medaillon', desc: 'Een mooie medaille voor bijzondere prestaties.' };
      case 'camera':
        return { name: 'Camera', desc: 'Leg je ontdekkingen vast met deze camera.' };
      case 'ship':
        return { name: 'Schip', desc: 'Voor de avonturier die de wereldzeeën wil bevaren.' };
      case 'mountain':
        return { name: 'Berg', desc: 'Voor de topografische bergbeklimmer.' };
      default:
        return { name: prize.name, desc: prize.description };
    }
  };

  // Developer code check
  const handleDevSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (devCode === 'rrrrr') {
      setDevUnlocked(true);
    }
  };

  // Fill cabinet instantly
  const handleFillCabinet = () => {
    // Max all ribbons
    const ribbons: { [id: string]: number } = {};
    prizes
      .filter((p) => p.type === 'ribbon')
      .forEach((p) => {
        ribbons[p.id] = p.max || 5;
      });
    setRibbonsOwned(ribbons);
    // Add all real prizes
    setRealPrizesOwned(prizes.filter((p) => p.type !== 'ribbon' && p.shelf).map((p) => p.id));
  };

  // Buy logic
  const handleBuy = (prizeId: string, price: number) => {
    const prize = prizes.find((p) => p.id === prizeId);
    if (!prize) return;
    if (prize.type === 'ribbon') {
      const max = prize.max || 5;
      const current = ribbonsOwned[prizeId] || 0;
      if (coins >= price && current < max) {
        setCoins(coins - price);
        setRibbonsOwned((prev) => ({ ...prev, [prizeId]: current + 1 }));
        setSelectedPrize(null);
      }
    } else {
      if (coins >= price && !realPrizesOwned.includes(prizeId)) {
        setCoins(coins - price);
        setRealPrizesOwned((prev) => [...prev, prizeId]);
        setSelectedPrize(null);
      }
    }
  };

  // For ribbons, alternate between left and right door for stacking
  const getRibbonDoor = (prizeId: string) => {
    const ribbonIndex = prizes
      .filter((p) => p.type === 'ribbon')
      .findIndex((p) => p.id === prizeId);
    return ribbonIndex % 2 === 0 ? 'left' : 'right';
  };

  return (
    <Container>
      <Header>
        <TitleRow>
          <Title>🏆 Trofeeënkast</Title>
          <CoinCounter>
            <CoinIcon>🪙</CoinIcon>
            {coins} munten
          </CoinCounter>
        </TitleRow>
        <BackButton onClick={() => navigate('/main')}>Terug naar hoofdmenu</BackButton>
      </Header>
      <CabinetArea>
        <CabinetWrapper>
          <CabinetSVG />
          {/* Render ribbons stacked on doors, offset y for each ribbon type to avoid overlap */}
          {prizes
            .filter((p) => p.type === 'ribbon')
            .map((prize, ribbonTypeIdx) => {
              const count = ribbonsOwned[prize.id] || 0;
              const door = getRibbonDoor(prize.id);
              return Array.from({ length: count }).map((_, i) => {
                const pos = ribbonDoorPositions[door][i] || ribbonDoorPositions[door][0];
                // Increase y offset for each ribbon type to prevent overlap
                const yOffset = ribbonTypeIdx * 45;
                let icon: React.ReactNode = renderPrizeIcon(prize.icon);
                // Use proper ribbon icons with correct colors
                if (prize.id === 'ribbon-blue' || prize.id === 'ribbon-red') {
                  icon = <RibbonIcon color={prize.id === 'ribbon-blue' ? 'blue' : 'red'} />;
                }
                return (
                  <PrizeIcon key={prize.id + '-' + i} x={pos.x} y={pos.y + yOffset}>
                    {icon}
                  </PrizeIcon>
                );
              });
            })}
          {/* Render real prizes on shelves, spaced */}
          {[1, 2, 3].map((shelfNum) => {
            const shelfPrizes = prizes.filter(
              (p) => p.shelf === shelfNum && realPrizesOwned.includes(p.id),
            );
            return shelfPrizes.map((prize, idx) => {
              const x = shelfX[idx % shelfX.length];
              const y = shelfY[shelfNum as 1 | 2 | 3];
              return (
                <PrizeIcon key={prize.id} x={x} y={y}>
                  {renderPrizeIcon(prize.icon)}
                </PrizeIcon>
              );
            });
          })}
        </CabinetWrapper>
        <ShopPanel>
          <ShopTitle>Winkel voor prijzen</ShopTitle>
          <ShopGrid>
            {prizes.map((prize) => {
              const dutch = getDutchPrize(prize);
              const selected = selectedPrize === prize.id;
              let owned = 0;
              let maxed = false;
              if (prize.type === 'ribbon') {
                owned = ribbonsOwned[prize.id] || 0;
                maxed = owned >= (prize.max || 5);
              } else {
                owned = realPrizesOwned.includes(prize.id) ? 1 : 0;
                maxed = owned > 0;
              }
              return (
                <ShopPrize
                  key={prize.id}
                  selected={selected}
                  onClick={() => setSelectedPrize(selected ? null : prize.id)}
                >
                  <ShopIcon>
                    {prize.id === 'ribbon-blue' || prize.id === 'ribbon-red' ? (
                      <RibbonIcon color={prize.id === 'ribbon-blue' ? 'blue' : 'red'} />
                    ) : (
                      renderPrizeIcon(prize.icon)
                    )}
                  </ShopIcon>
                  <ShopName>{dutch.name}</ShopName>
                  {prize.type === 'ribbon' && owned > 0 && <RibbonCount>x{owned}</RibbonCount>}
                  {selected && (
                    <ShopDetails>
                      <ShopDesc>{dutch.desc}</ShopDesc>
                      <ShopPrice>Kost: {prize.price} munten</ShopPrice>
                      <BuyButton
                        disabled={maxed || coins < prize.price}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBuy(prize.id, prize.price);
                        }}
                      >
                        {maxed ? 'Max' : 'Koop'}
                      </BuyButton>
                    </ShopDetails>
                  )}
                </ShopPrize>
              );
            })}
          </ShopGrid>
        </ShopPanel>
      </CabinetArea>
      {/* Developer panel for coins */}
      {devUnlocked ? (
        <DevPanel>
          <DevPanelTitle>Ontwikkelaarsopties</DevPanelTitle>
          <DevButtonGroup>
            <DevButton onClick={() => setCoins(coins + 500)}>+500 munten</DevButton>
            <DevButton onClick={() => setCoins(0)}>Reset munten naar 0</DevButton>
            <DevButton onClick={handleFillCabinet}>Vul kast</DevButton>
            <DevButton
              onClick={() => {
                // Fill cabinet with max of all prizes
                const ribbons: { [id: string]: number } = {};
                prizes
                  .filter((p) => p.type === 'ribbon')
                  .forEach((p) => {
                    ribbons[p.id] = p.max || 5;
                  });
                setRibbonsOwned(ribbons);
                setRealPrizesOwned(
                  prizes.filter((p) => p.type !== 'ribbon' && p.shelf).map((p) => p.id),
                );
                setCoins(9999); // Give enough coins to buy everything
              }}
            >
              Vul kast (max)
            </DevButton>
          </DevButtonGroup>
          <DevClose onClick={() => setDevUnlocked(false)}>Sluit ontwikkelaarsopties</DevClose>
        </DevPanel>
      ) : (
        <DevPanel>
          <DevPanelTitle>Ontwikkelaarsopties</DevPanelTitle>
          <DevForm onSubmit={handleDevSubmit}>
            <DevInput
              id="devcode"
              type="text"
              value={devCode}
              onChange={(e) => setDevCode(e.target.value)}
              placeholder="Voer code in..."
            />
            <DevButton type="submit">OK</DevButton>
          </DevForm>
        </DevPanel>
      )}
    </Container>
  );
};
