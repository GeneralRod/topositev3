import React from 'react';
import {
  BrowserRouter as Router,
  Navigate,
  Routes,
  Route,
  useNavigate,
  useParams,
} from 'react-router-dom';
import styled from '@emotion/styled';
import HomeScreen from './components/HomeScreen';
import Game from './components/Game';
import InteractiveMap from './components/InteractiveMap';
import TitlePage from './components/TitlePage';
import CategoryScreen from './components/CategoryScreen';
import { findCategory, findPackage, locationsFor } from './content/catalog';
import './App.css';
import { TrophyCabinet } from './features/trophy-system/components/TrophyCabinet';

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

const HomeScreenWrapper: React.FC = () => {
  const { category: categoryId } = useParams<{ category: string }>();
  const category = findCategory(categoryId);
  if (!category) return <Navigate to="/categories" replace />;
  return <HomeScreen category={category} />;
};

// Zoekt het pakket uit de url op in de catalogus; onbekend → terug naar het menu.
function usePackageRoute(kind: 'game' | 'map') {
  const navigate = useNavigate();
  const { category: categoryId, package: packageId } = useParams<{
    category: string;
    package: string;
  }>();
  const category = findCategory(categoryId);
  const found = findPackage(category, packageId);
  if (!category || !found || found.kind !== kind) return null;
  return {
    pkg: found.pkg,
    cities: locationsFor(category, found.pkg),
    onBack: () => navigate(`/main/${category.id}`),
  };
}

const GameWrapper: React.FC = () => {
  const route = usePackageRoute('game');
  if (!route) return <Navigate to="/categories" replace />;
  return (
    <Game
      key={route.pkg.id}
      packageId={route.pkg.id}
      title={route.pkg.title}
      cities={route.cities}
      onBack={route.onBack}
    />
  );
};

const InteractiveMapWrapper: React.FC = () => {
  const route = usePackageRoute('map');
  if (!route) return <Navigate to="/categories" replace />;
  return (
    <InteractiveMap cities={route.cities} onBack={route.onBack} selectedPackage={route.pkg.id} />
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
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppContainer>
    </Router>
  );
};

export default App;
