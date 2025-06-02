import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled from '@emotion/styled';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { City } from '../data/cities';
import { saveGameState, loadGameState, clearGameState } from '../utils/gameStorage';
import { handleStorageError } from '../utils/errorHandling';
import { FaCoins } from 'react-icons/fa';
import type { LatLngExpression } from 'leaflet';
import type { LeafletEvent, Map as LeafletMap } from 'leaflet';

// Fix for default marker icons
interface IconDefault extends L.Icon.Default {
  _getIconUrl?: string;
}

delete (L.Icon.Default.prototype as IconDefault)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface GameProps {
  cities: City[];
  onBack: () => void;
  selectedPackage: string;
}

const GameContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%);
  overflow: hidden;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  flex-shrink: 0;
  z-index: 1000;

  @media (max-width: 768px) {
    padding: 0.75rem 1rem;
    flex-direction: column;
    gap: 0.5rem;
    height: 120px;
  }
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
`;

const Title = styled.h1`
  font-size: 1.5rem;
  color: #1a73e8;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 1.2rem;
    text-align: center;
  }
`;

const CityQuestion = styled.h2`
  font-size: 1.2rem;
  color: #202124;
  margin: 0;
  font-weight: 500;

  @media (max-width: 768px) {
    font-size: 1rem;
    text-align: center;
  }
`;

const ScoreContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-right: 1rem;

  @media (max-width: 768px) {
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.75rem;
    margin-right: 0;
  }
`;

const ScoreItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;

  @media (max-width: 768px) {
    min-width: 80px;
  }
`;

const ScoreLabel = styled.span`
  font-size: 0.8rem;
  color: #5f6368;
`;

const ScoreValue = styled.span`
  font-size: 1.1rem;
  font-weight: 600;
  color: #1a73e8;
`;

const BackButton = styled.button`
  padding: 0.5rem 1rem;
  background: #1a73e8;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.2s;

  &:hover {
    background: #1557b0;
  }

  @media (max-width: 768px) {
    padding: 0.4rem 0.8rem;
    font-size: 0.9rem;
  }
`;

const ResetButton = styled(BackButton)`
  background-color: #ea4335;
  &:hover {
    background-color: #d33426;
  }
`;

const MapWrapper = styled.div`
  flex: 1;
  position: relative;
  overflow: hidden;
  min-height: 0;
  height: calc(100vh - 80px); // Account for header height

  @media (max-width: 768px) {
    height: calc(100vh - 120px); // Larger header on mobile
    position: fixed;
    top: 120px; // Match header height
    left: 0;
    right: 0;
    bottom: 0;
  }
`;

const FeedbackMessage = styled.div<{ type: 'success' | 'error' }>`
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  padding: 0.5rem 1rem;
  border-radius: 4px;
  color: ${props => props.type === 'success' ? '#34a853' : '#ea4335'};
  font-weight: 600;
  font-size: 1.2rem;
  background: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  z-index: 1000;
  opacity: 0;
  animation: fadeInOut 2s ease-in-out;
  margin-top: 1rem;

  @keyframes fadeInOut {
    0% { opacity: 0; transform: translate(-50%, -20px); }
    15% { opacity: 1; transform: translate(-50%, 0); }
    85% { opacity: 1; transform: translate(-50%, 0); }
    100% { opacity: 0; transform: translate(-50%, -20px); }
  }
`;

const CompletionPopup = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease-in-out;

  @keyframes fadeIn {
    from { opacity: 0; transform: translate(-50%, -60%); }
    to { opacity: 1; transform: translate(-50%, -50%); }
  }
`;

const CompletionMessage = styled.h2`
  color: #34a853;
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
`;

const BackToMenuButton = styled.button`
  background: #1a73e8;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: #1557b0;
  }
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  animation: fadeIn 0.3s ease-in-out;
`;

const ErrorMessage = styled.div`
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #ff4444;
  color: white;
  padding: 1rem 2rem;
  border-radius: 4px;
  z-index: 1000;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  animation: slideIn 0.3s ease-out;

  @keyframes slideIn {
    from { transform: translate(-50%, -100%); }
    to { transform: translate(-50%, 0); }
  }
`;

const HintText = styled.span`
  color: #1a73e8;
  font-weight: 600;
  margin-right: 1rem;
`;

const ButtonMargin = styled.div`
  margin-right: 1.2rem;
`;

const CompletionStats = styled.div`
  margin-bottom: 1.5rem;
  text-align: left;
`;

const PerfectScore = styled.div`
  color: #34a853;
  font-weight: 600;
`;

const StatsTitle = styled.div`
  font-weight: 600;
  margin-bottom: 8px;
  color: #111;
`;

const StatsList = styled.ol`
  padding-left: 0;
  margin: 0;
  list-style: none;
`;

const StatsItem = styled.li`
  margin-bottom: 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 280px;
  padding: 2px 0;
`;

const CityName = styled.span`
  color: #111;
  font-weight: 500;
`;

const MistakeCount = styled.span`
  color: #ea4335;
  font-weight: 500;
  min-width: 80px;
  text-align: right;
  display: inline-block;
  padding-left: 16px;
`;

const ErrorCloseButton = styled.button`
  margin-left: 1rem;
  background: none;
  border: none;
  color: white;
  cursor: pointer;
`;

const COINS_PER_CORRECT = 5;
const SPEED_BONUS_MAX = 5;
const SPEED_BONUS_THRESHOLD = 3;
const SPEED_BONUS_DECAY = 10;
const COINS_PER_PAKKET_BONUS = 0.2;

// Toggle for end-of-game coin display
const SHOW_BONUS_SEPARATELY = true; // Set to false for option 2 (single total)

const SessionCoinCounter = styled.span`
  display: flex;
  align-items: center;
  font-size: 1.1rem;
  font-weight: 600;
  color: #FFD700;
  margin-left: 1.2rem;
  gap: 0.3rem;
`;

const CompletionCoins = styled.div`
  font-weight: 600;
  color: #FFD700;
  margin-bottom: 12px;
`;

const Game: React.FC<GameProps> = ({ cities, onBack, selectedPackage }) => {
  const [currentCity, setCurrentCity] = useState<City | null>(null);
  const [score, setScore] = useState(0);
  const [totalCities] = useState(cities.length);
  const [cityStatus, setCityStatus] = useState<Record<string, 'unanswered' | 'blue' | 'green'>>(() => {
    const status: Record<string, 'unanswered' | 'blue' | 'green'> = {};
    cities.forEach(city => { status[city.name] = 'unanswered'; });
    return status;
  });
  const [cityMistakes, setCityMistakes] = useState<Record<string, number>>(() => {
    const mistakes: Record<string, number> = {};
    cities.forEach(city => { mistakes[city.name] = 0; });
    return mistakes;
  });
  const [showCompletion, setShowCompletion] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);
  const [currentAttempts, setCurrentAttempts] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [sessionCoins, setSessionCoins] = useState(0);
  const [pakketBonus, setPakketBonus] = useState(0);
  const mapRef = useRef<L.Map>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [lastAnswerTime, setLastAnswerTime] = useState<number>(Date.now());
  const [coinsThisGame, setCoinsThisGame] = useState(0);

  // Load saved game state on mount
  useEffect(() => {
    let isMounted = true;

    const loadState = async () => {
      try {
        const savedState = await loadGameState(selectedPackage);
        if (isMounted && savedState) {
          setCityStatus(savedState.cityStatus);
          setCityMistakes(savedState.cityMistakes);
          setScore(savedState.score);
          setCurrentAttempts(savedState.currentAttempts);
          setHintUsed(savedState.hintUsed);
          setCurrentCity(savedState.currentCity);
        } else if (isMounted) {
          selectNextCity();
        }
      } catch (error) {
        if (isMounted) {
          handleStorageError(error);
          setError('Failed to load game state. Starting new game...');
          selectNextCity();
        }
      }
    };

    loadState();

    return () => {
      isMounted = false;
    };
  }, [selectedPackage]);

  // Save game state whenever it changes
  useEffect(() => {
    let isMounted = true;
    let saveTimeout: number;

    const saveState = async () => {
      try {
        await saveGameState({
          cityStatus,
          cityMistakes,
          score,
          currentAttempts,
          hintUsed,
          currentCity,
          selectedPackage,
          lastUpdated: Date.now()
        });
      } catch (error) {
        if (isMounted) {
          handleStorageError(error);
          setError('Failed to save game state. Your progress may not be saved.');
        }
      }
    };

    // Debounce save operations
    saveTimeout = window.setTimeout(saveState, 1000);

    return () => {
      isMounted = false;
      window.clearTimeout(saveTimeout);
    };
  }, [cityStatus, cityMistakes, score, currentAttempts, hintUsed, currentCity, selectedPackage]);

  // Select next city: only from blue or unanswered
  const selectNextCity = useCallback(() => {
    const eligible = Object.entries(cityStatus)
      .filter(([, status]) => status === 'blue' || status === 'unanswered')
      .map(([name]) => name);
    if (eligible.length > 0) {
      const nextCityName = eligible[Math.floor(Math.random() * eligible.length)];
      const nextCity = cities.find(c => c.name === nextCityName);
      if (nextCity) {
        setCurrentCity(nextCity);
        setCurrentAttempts(0);
        setLastAnswerTime(Date.now());
      }
    } else {
      setCurrentCity(null);
    }
  }, [cityStatus, cities]);

  useEffect(() => {
    if (cities.length > 0) {
      selectNextCity();
    }
  }, [cities, selectNextCity]);

  useEffect(() => {
    if (Object.values(cityStatus).every(status => status === 'green')) {
      setShowCompletion(true);
      const bonus = Math.round(coinsThisGame * COINS_PER_PAKKET_BONUS);
      setPakketBonus(bonus);
      if (!SHOW_BONUS_SEPARATELY) {
        setSessionCoins(coinsThisGame + bonus);
      } else {
        setSessionCoins(coinsThisGame); // sessionCoins = coinsThisGame, bonus shown separately
      }
    }
  }, [cityStatus, coinsThisGame]);

  const handleHint = () => {
    setHintUsed(true);
  };

  const handleReset = async () => {
    try {
      await clearGameState(selectedPackage);
      setCityStatus(Object.fromEntries(cities.map(city => [city.name, 'unanswered'])));
      setCityMistakes(Object.fromEntries(cities.map(city => [city.name, 0])));
      setScore(0);
      setCurrentAttempts(0);
      setHintUsed(false);
      selectNextCity();
    } catch (error) {
      handleStorageError(error);
      setError('Failed to reset game. Please try again.');
    }
  };

  // Restore createDotIcon for marker color/status
  const createDotIcon = (status: 'unanswered' | 'blue' | 'green') => {
    let color = '#ea4335'; // red (unanswered)
    if (status === 'green') color = '#34a853'; // green
    if (status === 'blue') color = '#4285f4'; // blue
    return L.divIcon({
      className: 'custom-dot',
      html: `<div style="
        width: 12px;
        height: 12px;
        background-color: ${color};
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      "></div>`,
      iconSize: [12, 12],
      iconAnchor: [6, 6],
    });
  };

  const handleMarkerClick = (city: City) => {
    if (!currentCity) return;
    
    if (city.name !== currentCity.name) {
      setFeedback('Dit is niet de juiste stad.');
      setTimeout(() => setFeedback(null), 1500);
      setCurrentAttempts(a => a + 1);
      setCityMistakes(prev => ({ ...prev, [currentCity.name]: prev[currentCity.name] + 1 }));
      return;
    }

    // Correct city
    const now = Date.now();
    const timeTaken = (now - lastAnswerTime) / 1000;
    setLastAnswerTime(now);
    setFeedback(`Goed! Je hebt ${city.name} gevonden!`);
    setTimeout(() => setFeedback(null), 1200);

    // Calculate speed bonus (declines linearly from SPEED_BONUS_MAX to 0 over SPEED_BONUS_DECAY seconds)
    let speedBonus = 0;
    if (timeTaken <= SPEED_BONUS_THRESHOLD) {
      speedBonus = SPEED_BONUS_MAX;
    } else if (timeTaken < SPEED_BONUS_DECAY) {
      speedBonus = Math.max(0, Math.round(SPEED_BONUS_MAX * (1 - (timeTaken - SPEED_BONUS_THRESHOLD) / (SPEED_BONUS_DECAY - SPEED_BONUS_THRESHOLD))));
    }

    let totalCityCoins = COINS_PER_CORRECT + speedBonus;
    if (totalCityCoins > COINS_PER_CORRECT + SPEED_BONUS_MAX) totalCityCoins = COINS_PER_CORRECT + SPEED_BONUS_MAX;
    setSessionCoins(c => c + totalCityCoins);
    setCoinsThisGame(c => c + totalCityCoins);

    setCityStatus(prev => {
      const newStatus = { ...prev };
      if (currentAttempts === 0) {
        newStatus[city.name] = 'green';
        setScore(s => s + 1);
      } else {
        newStatus[city.name] = 'blue';
      }
      return newStatus;
    });

    setTimeout(() => {
      selectNextCity();
      setCurrentAttempts(0);
    }, 1200);
  };

  if (cities.length === 0) {
    return (
      <GameContainer>
        <ErrorMessage>
          Geen steden gevonden voor dit pakket. <br />
          <BackButton onClick={onBack}>Terug naar hoofdmenu</BackButton>
        </ErrorMessage>
      </GameContainer>
    );
  }

  return (
    <GameContainer>
      {error && (
        <ErrorMessage>
          {error}
          <ErrorCloseButton onClick={() => setError(null)}>×</ErrorCloseButton>
        </ErrorMessage>
      )}
      <Header>
        <HeaderLeft>
          <Title>{selectedPackage.replace('pakket', 'Pakket ')}</Title>
          {currentCity && (
            <CityQuestion style={{ display: 'flex', alignItems: 'center' }}>
              Vind: {currentCity.name}
              <SessionCoinCounter>
                <FaCoins style={{ color: '#FFD700', marginRight: 4 }} />
                {sessionCoins}
              </SessionCoinCounter>
            </CityQuestion>
          )}
        </HeaderLeft>
        <ScoreContainer>
          {hintUsed && currentCity && (
            <HintText>
              Tip: {currentCity.continent}
            </HintText>
          )}
          <ButtonMargin>
            <BackButton onClick={handleHint} disabled={hintUsed}>
              Hint
            </BackButton>
          </ButtonMargin>
          <ScoreItem>
            <ScoreLabel>Score</ScoreLabel>
            <ScoreValue>{Object.values(cityStatus).filter(s => s === 'green').length}/{totalCities}</ScoreValue>
          </ScoreItem>
          <ScoreItem>
            <ScoreLabel>Nog te vinden</ScoreLabel>
            <ScoreValue>{totalCities - Object.values(cityStatus).filter(s => s === 'green').length}</ScoreValue>
          </ScoreItem>
          <ButtonMargin>
            <ResetButton onClick={handleReset}>
              Herstart
            </ResetButton>
          </ButtonMargin>
          <BackButton onClick={onBack}>Terug</BackButton>
        </ScoreContainer>
      </Header>
      <MapWrapper>
        {feedback && (
          <FeedbackMessage type={feedback.startsWith('Goed!') ? 'success' : 'error'}>
            {feedback}
          </FeedbackMessage>
        )}
        <MapContainer
          ref={mapRef}
          center={currentCity ? [currentCity.lat, currentCity.lng] : [20, 0]}
          zoom={currentCity ? 15 : 2}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
          doubleClickZoom={false}
          scrollWheelZoom={false}
          dragging={false}
          touchZoom={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {cities.map(city => (
            <Marker
              key={city.name}
              position={[city.lat, city.lng]}
              icon={createDotIcon(cityStatus[city.name])}
              eventHandlers={{
                click: () => handleMarkerClick(city)
              }}
            />
          ))}
        </MapContainer>
      </MapWrapper>
      {showCompletion && (
        <>
          <Overlay />
          <CompletionPopup>
            <CompletionMessage>Super! Je hebt alle steden gevonden!</CompletionMessage>
            {SHOW_BONUS_SEPARATELY ? (
              <CompletionCoins>
                Munten dit spel: {coinsThisGame} <br />
                Bonus: +{pakketBonus} <br />
                <b>Totaal: {coinsThisGame + pakketBonus}</b>
              </CompletionCoins>
            ) : (
              <CompletionCoins>
                Totaal verdiend: {sessionCoins} munten
              </CompletionCoins>
            )}
            <CompletionStats>
              {(() => {
                const mistakesArr = Object.entries(cityMistakes)
                  .filter(([, count]) => count > 0)
                  .sort((a, b) => b[1] - a[1]);
                if (mistakesArr.length === 0) {
                  return <PerfectScore>Je hebt alle steden in één keer goed!</PerfectScore>;
                }
                return <>
                  <StatsTitle>Moeilijkste steden deze ronde:</StatsTitle>
                  <StatsList>
                    {mistakesArr.map(([name, count]) => (
                      <StatsItem key={name}>
                        <CityName>{name}</CityName>
                        <MistakeCount>
                          {count} fout{count > 1 ? 'en' : ''}
                        </MistakeCount>
                      </StatsItem>
                    ))}
                  </StatsList>
                </>;
              })()}
            </CompletionStats>
            <BackToMenuButton onClick={async () => {
              await handleReset();
              onBack();
            }}>
              Terug naar hoofdmenu
            </BackToMenuButton>
          </CompletionPopup>
        </>
      )}
    </GameContainer>
  );
};

export default Game; 