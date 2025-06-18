import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useParams } from 'react-router-dom';
import styled from '@emotion/styled';
import HomeScreen from './components/HomeScreen';
import Game from './components/Game';
import InteractiveMap from './components/InteractiveMap';
import TitlePage from './components/TitlePage';
import CategoryScreen from './components/CategoryScreen';
import { cities } from './data/cities';
import { features } from './data/features';
import { landscapeShapes } from './data/landscapeShapes';
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
  const { category = 'capitals' } = useParams<{ category: string }>();

  const handleSelectPackage = (packageName: string) => {
    const isInteractiveMap = packageName.startsWith('interactive');
    if (isInteractiveMap) {
      navigate(`/interactive/${category}/${packageName}`);
    } else {
      navigate(`/game/${category}/${packageName}`);
    }
  };

  return <HomeScreen onSelectPackage={handleSelectPackage} category={category} />;
};

// Wrapper component to handle game navigation
const GameWrapper: React.FC = () => {
  const navigate = useNavigate();
  const { category = 'capitals', package: selectedPackage } = useParams<{
    category: string;
    package: string;
  }>();

  const getCitiesForPackage = (cat: string, packageName: string) => {
    if (cat === 'capitals') {
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
    }

    if (cat === 'landscapes') {
      switch (packageName) {
        case 'landschap1':
          return features.filter((f) => f.package === 'landschap1');
        default:
          return [];
      }
    }

    return [];
  };

  return (
    <Game
      cities={getCitiesForPackage(category, selectedPackage || '')}
      onBack={() => navigate(`/main/${category}`)}
      selectedPackage={selectedPackage || ''}
    />
  );
};

// Wrapper component to handle interactive map navigation
const InteractiveMapWrapper: React.FC = () => {
  const navigate = useNavigate();
  const { category = 'capitals', package: selectedPackage } = useParams<{
    category: string;
    package: string;
  }>();

  const getCitiesForPackage = (cat: string, packageName: string) => {
    if (cat === 'capitals') {
      const basePackage = packageName.replace('interactive', 'pakket');
      return cities.filter((city) => city.package === basePackage);
    }

    if (cat === 'landscapes') {
      return features.filter((f) => f.package === 'landschap1');
    }

    return [];
  };

  const getShapesForPackage = (cat: string) => {
    if (cat === 'landscapes') {
      return landscapeShapes;
    }
    return undefined;
  };

  return (
    <InteractiveMap
      cities={getCitiesForPackage(category, selectedPackage || '')}
      onBack={() => navigate(`/main/${category}`)}
      selectedPackage={selectedPackage || ''}
      shapes={getShapesForPackage(category)}
    />
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AppContainer>
        <Routes>
          <Route path="/" element={<TitlePage />} />
          <Route path="/categories" element={<CategoryScreen />} />
          <Route path="/main/:category" element={<HomeScreenWrapper />} />
          <Route path="/game/:category/:package" element={<GameWrapper />} />
          <Route path="/interactive/:category/:package" element={<InteractiveMapWrapper />} />
          <Route path="/trophy-cabinet" element={<TrophyCabinet />} />
          {/* <Route path="/trophy-test" element={<TrophySystemTest />} /> */}
        </Routes>
      </AppContainer>
    </Router>
  );
};

export default App;
