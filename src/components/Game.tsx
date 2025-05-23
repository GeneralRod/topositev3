import React, { useState, useEffect, useCallback } from 'react';
import styled from '@emotion/styled';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { City } from '../data/cities';
import { continentGeo } from '../data/continentsGeo';
import { saveGameState, loadGameState, clearGameState } from '../utils/gameStorage';
import { MapError, StorageError, handleMapError, handleStorageError } from '../utils/errorHandling';

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
`;

const CityQuestion = styled.h2`
  font-size: 1.2rem;
  color: #202124;
  margin: 0;
  font-weight: 500;
`;

const ScoreContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-right: 1rem;
`;

const ScoreItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
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
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showCompletion, setShowCompletion] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);
  const [currentAttempts, setCurrentAttempts] = useState(0);
  const [error, setError] = useState<string | null>(null);

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
  const selectNextCity = () => {
    const eligible = Object.entries(cityStatus)
      .filter(([_, status]) => status === 'blue' || status === 'unanswered')
      .map(([name]) => name);
    if (eligible.length > 0) {
      const nextCityName = eligible[Math.floor(Math.random() * eligible.length)];
      setCurrentCity(cities.find(c => c.name === nextCityName) || null);
      setCurrentAttempts(0);
    } else {
      setCurrentCity(null);
    }
  };

  useEffect(() => {
    if (cities.length > 0) {
      selectNextCity();
    }
  }, [cities]);

  useEffect(() => {
    if (Object.values(cityStatus).every(status => status === 'green')) {
      setShowCompletion(true);
    }
  }, [cityStatus]);

  const handleMarkerClick = (city: City) => {
    setHintUsed(false);
    if (!currentCity) return;
    if (city.name !== currentCity.name) {
      setFeedback(null);
      setTimeout(() => {
        setFeedback({ message: 'Dit is niet de goede stad', type: 'error' });
      }, 10);
      setCurrentAttempts(a => a + 1);
      setCityMistakes(prev => ({ ...prev, [currentCity.name]: prev[currentCity.name] + 1 }));
      return;
    }
    // Correct city
    setFeedback({ message: 'Goed! 🎉', type: 'success' });
    setTimeout(() => {
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
      selectNextCity();
    }, 500);
  };

  // Update createDotIcon to use blue for 'blue', green for 'green', red for unanswered
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

  const percentage = Math.round((score / totalCities) * 100);
  const remaining = totalCities - score;

  // Add back the handleHint function
  const handleHint = () => {
    setHintUsed(true);
  };

  const handleMapError = useCallback((error: unknown) => {
    if (error instanceof MapError) {
      setError('Map loading failed. Please refresh the page.');
    } else {
      setError('An unexpected error occurred. Please try again.');
    }
  }, []);

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

  return (
    <GameContainer>
      {error && (
        <ErrorMessage>
          {error}
          <button onClick={() => setError(null)} style={{ marginLeft: '1rem', background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
            ×
          </button>
        </ErrorMessage>
      )}
      <Header>
        <HeaderLeft>
          <Title>{selectedPackage.replace('pakket', 'Pakket ')}</Title>
          {currentCity && (
            <CityQuestion>Vind: {currentCity.name}</CityQuestion>
          )}
        </HeaderLeft>
        <ScoreContainer>
          {hintUsed && currentCity && (
            <span style={{ color: '#1a73e8', fontWeight: 600, marginRight: '1rem' }}>
              Tip: {currentCity.continent}
            </span>
          )}
          <BackButton onClick={handleHint} disabled={hintUsed} style={{marginRight: '1.2rem'}}>
            Hint
          </BackButton>
          <ScoreItem>
            <ScoreLabel>Score</ScoreLabel>
            <ScoreValue>{Object.values(cityStatus).filter(s => s === 'green').length}/{totalCities}</ScoreValue>
          </ScoreItem>
          <ScoreItem>
            <ScoreLabel>Percentage</ScoreLabel>
            <ScoreValue>{Math.round((Object.values(cityStatus).filter(s => s === 'green').length / totalCities) * 100)}%</ScoreValue>
          </ScoreItem>
          <ScoreItem>
            <ScoreLabel>Nog te vinden</ScoreLabel>
            <ScoreValue>{totalCities - Object.values(cityStatus).filter(s => s === 'green').length}</ScoreValue>
          </ScoreItem>
          <ResetButton onClick={handleReset} style={{marginRight: '1.2rem'}}>
            Herstart
          </ResetButton>
          <BackButton onClick={onBack}>Terug</BackButton>
        </ScoreContainer>
      </Header>
      <MapWrapper>
        {feedback && (
          <FeedbackMessage type={feedback.type}>
            {feedback.message}
          </FeedbackMessage>
        )}
        <MapContainer
          center={[20, 0]}
          zoom={2}
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
          {cities.map((city) => (
            <Marker
              key={city.name}
              position={[city.lat, city.lng]}
              icon={createDotIcon(cityStatus[city.name])}
              eventHandlers={{
                click: () => handleMarkerClick(city),
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
            <div style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
              {(() => {
                const mistakesArr = Object.entries(cityMistakes)
                  .filter(([_, count]) => count > 0)
                  .sort((a, b) => b[1] - a[1]);
                if (mistakesArr.length === 0) {
                  return <div style={{ color: '#34a853', fontWeight: 600 }}>Je hebt alle steden in één keer goed!</div>;
                }
                return <>
                  <div style={{ fontWeight: 600, marginBottom: 8, color: '#111' }}>Moeilijkste steden deze ronde:</div>
                  <ol style={{ paddingLeft: 0, margin: 0, listStyle: 'none' }}>
                    {mistakesArr.map(([name, count], idx) => (
                      <li key={name} style={{ 
                        marginBottom: 4, 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        width: 280,
                        padding: '2px 0'
                      }}>
                        <span style={{ color: '#111', fontWeight: 500 }}>{name}</span>
                        <span style={{ 
                          color: '#ea4335', 
                          fontWeight: 500, 
                          minWidth: 80, 
                          textAlign: 'right', 
                          display: 'inline-block',
                          paddingLeft: 16
                        }}>
                          {count} fout{count > 1 ? 'en' : ''}
                        </span>
                      </li>
                    ))}
                  </ol>
                </>;
              })()}
            </div>
            <BackToMenuButton onClick={onBack}>
              Terug naar hoofdmenu
            </BackToMenuButton>
          </CompletionPopup>
        </>
      )}
    </GameContainer>
  );
};

export default Game; 