import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { City } from '../data/cities';

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
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%);
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
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

const MapWrapper = styled.div`
  flex: 1;
  position: relative;
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

const Game: React.FC<GameProps> = ({ cities, onBack, selectedPackage }) => {
  const [currentCity, setCurrentCity] = useState<City | null>(null);
  const [score, setScore] = useState(0);
  const [totalCities] = useState(cities.length);
  const [foundCities, setFoundCities] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showCompletion, setShowCompletion] = useState(false);

  const selectNextCity = (excludeCity?: City) => {
    const remainingCities = cities.filter(c => 
      !foundCities.includes(c.name) && 
      (!excludeCity || c.name !== excludeCity.name)
    );
    
    if (remainingCities.length > 0) {
      const randomIndex = Math.floor(Math.random() * remainingCities.length);
      setCurrentCity(remainingCities[randomIndex]);
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
    if (score === totalCities && totalCities > 0) {
      setShowCompletion(true);
    }
  }, [score, totalCities]);

  const handleMarkerClick = (city: City) => {
    if (currentCity && city.name === currentCity.name) {
      setScore(prev => prev + 1);
      setFoundCities(prev => [...prev, city.name]);
      setFeedback({ message: 'Goed! 🎉', type: 'success' });
      selectNextCity(city);
    } else {
      setFeedback({ message: 'Volgende keer beter', type: 'error' });
      selectNextCity(city);
    }
  };

  // Clear feedback message after animation
  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => {
        setFeedback(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  // Create custom red dot icon
  const createDotIcon = (isFound: boolean) => {
    return L.divIcon({
      className: 'custom-dot',
      html: `<div style="
        width: 12px;
        height: 12px;
        background-color: ${isFound ? '#34a853' : '#ea4335'};
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

  return (
    <GameContainer>
      <Header>
        <HeaderLeft>
          <Title>Topografie Oefenen - {selectedPackage}</Title>
          {currentCity && (
            <CityQuestion>Vind: {currentCity.name}</CityQuestion>
          )}
        </HeaderLeft>
        <ScoreContainer>
          <ScoreItem>
            <ScoreLabel>Score</ScoreLabel>
            <ScoreValue>{score}/{totalCities}</ScoreValue>
          </ScoreItem>
          <ScoreItem>
            <ScoreLabel>Percentage</ScoreLabel>
            <ScoreValue>{percentage}%</ScoreValue>
          </ScoreItem>
          <ScoreItem>
            <ScoreLabel>Nog te vinden</ScoreLabel>
            <ScoreValue>{remaining}</ScoreValue>
          </ScoreItem>
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
          center={[20, 0]} // Center of the world map
          zoom={2} // Zoomed out to show the whole world
          style={{ height: '100%', width: '100%' }}
          zoomControl={false} // Disable zoom controls
          doubleClickZoom={false} // Disable double-click zoom
          scrollWheelZoom={false} // Disable scroll wheel zoom
          dragging={false} // Disable map dragging
          touchZoom={false} // Disable touch zoom
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {cities.map((city) => (
            <Marker
              key={city.name}
              position={[city.lat, city.lng]}
              icon={createDotIcon(foundCities.includes(city.name))}
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