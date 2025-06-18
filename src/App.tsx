import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useParams } from 'react-router-dom';
import styled from '@emotion/styled';
import HomeScreen from './components/HomeScreen';
import Game from './components/Game';
import InteractiveMap from './components/InteractiveMap';
import TitlePage from './components/TitlePage';
import { cities } from './data/cities';
import './App.css';
import { TrophyCabinet } from './features/trophy-system/components/TrophyCabinet';
// import { TrophySystemTest } from './features/trophy-system/components/TrophySystemTest';

const AppContainer = styled.div`
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #f5f7fa;
`;

// Wrapper component to handle navigation
const HomeScreenWrapper: React.FC = () => {
  const navigate = useNavigate();

  const handleSelectPackage = (packageName: string) => {
    const isInteractiveMap = packageName.startsWith('interactive');
    if (isInteractiveMap) {
      navigate(`/interactive/${packageName}`);
    } else {
      navigate(`/game/${packageName}`);
    }
  };

  return <HomeScreen onSelectPackage={handleSelectPackage} />;
};

// Wrapper component to handle game navigation
const GameWrapper: React.FC = () => {
  const navigate = useNavigate();
  const { package: selectedPackage } = useParams<{ package: string }>();

  const getCitiesForPackage = (packageName: string) => {
    switch (packageName) {
      case 'pakket1':
        return cities.filter((city) => city.package === 'pakket1');
      case 'pakket2':
        return cities.filter((city) => city.package === 'pakket2');
      case 'pakket3':
        return cities.filter((city) => city.package === 'pakket3');
      case 'pakket1-2':
        return cities.filter((city) => city.package === 'pakket1' || city.package === 'pakket2');
      case 'pakket2-3':
        return cities.filter((city) => city.package === 'pakket2' || city.package === 'pakket3');
      case 'pakket1-2-3':
        return cities;
      default:
        return [];
    }
  };

  return (
    <Game
      cities={getCitiesForPackage(selectedPackage || '')}
      onBack={() => navigate('/main')}
      selectedPackage={selectedPackage || ''}
    />
  );
};

// Wrapper component to handle interactive map navigation
const InteractiveMapWrapper: React.FC = () => {
  const navigate = useNavigate();
  const { package: selectedPackage } = useParams<{ package: string }>();

  const getCitiesForPackage = (packageName: string) => {
    const basePackage = packageName.replace('interactive', 'pakket');
    return cities.filter((city) => city.package === basePackage);
  };

  return (
    <InteractiveMap
      cities={getCitiesForPackage(selectedPackage || '')}
      onBack={() => navigate('/main')}
      selectedPackage={selectedPackage || ''}
    />
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AppContainer>
        <Routes>
          <Route path="/" element={<TitlePage />} />
          <Route path="/main" element={<HomeScreenWrapper />} />
          <Route path="/game/:package" element={<GameWrapper />} />
          <Route path="/interactive/:package" element={<InteractiveMapWrapper />} />
          <Route path="/trophy-cabinet" element={<TrophyCabinet />} />
          {/* <Route path="/trophy-test" element={<TrophySystemTest />} /> */}
        </Routes>
      </AppContainer>
    </Router>
  );
};

export default App;
