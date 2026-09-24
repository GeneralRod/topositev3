import React, { Suspense, lazy } from 'react';
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
import TitlePage from './components/TitlePage';
import CategoryScreen from './components/CategoryScreen';
import { findCategory, findPackage, locationsFor, PRACTICE_PACKAGE_ID } from './content/catalog';
import { getCityStats } from './storage';
import { hardCities } from './game/progress';

// Deze schermen (met de kaartbibliotheek Leaflet) worden pas geladen als ze
// geopend worden; dat maakt de eerste keer laden van de site sneller.
const Game = lazy(() => import('./components/Game'));
const InteractiveMap = lazy(() => import('./components/InteractiveMap'));
const PrizeCabinet = lazy(() => import('./cabinet/PrizeCabinet'));

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
    categoryId: category.id,
    cities: locationsFor(category, found.pkg),
    onBack: () => navigate(`/main/${category.id}`),
  };
}

const GameWrapper: React.FC = () => {
  const { category: categoryId, package: packageId } = useParams<{
    category: string;
    package: string;
  }>();
  if (packageId === PRACTICE_PACKAGE_ID) return <PracticeWrapper categoryId={categoryId} />;
  return <PackageGameWrapper />;
};

const PackageGameWrapper: React.FC = () => {
  const route = usePackageRoute('game');
  if (!route) return <Navigate to="/categories" replace />;
  return (
    <Game
      key={route.pkg.id}
      packageId={route.pkg.id}
      categoryId={route.categoryId}
      countStars
      title={route.pkg.title}
      cities={route.cities}
      onBack={route.onBack}
    />
  );
};

// Oefenrondje: alleen de steden die je vaak fout hebt (zie game/progress.ts).
const PracticeWrapper: React.FC<{ categoryId: string | undefined }> = ({ categoryId }) => {
  const navigate = useNavigate();
  const category = findCategory(categoryId);
  // Lijst één keer bepalen bij het openen; tijdens het spel verandert hij niet.
  const [cities] = React.useState(() => {
    if (!category) return [];
    const hard = new Set(
      hardCities(
        getCityStats(category.id),
        category.locations.map((l) => l.name),
      ),
    );
    return category.locations.filter((l) => hard.has(l.name));
  });
  if (!category || cities.length === 0)
    return <Navigate to={`/main/${categoryId ?? ''}`} replace />;
  return (
    <Game
      packageId={`${PRACTICE_PACKAGE_ID}-${category.id}`}
      categoryId={category.id}
      countStars={false}
      title="Mijn lastige steden"
      cities={cities}
      onBack={() => navigate(`/main/${category.id}`)}
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
        <Suspense fallback={null}>
          <Routes>
            <Route path="/" element={<TitlePage />} />
            <Route path="/categories" element={<CategoryScreen />} />
            <Route path="/main/:category" element={<HomeScreenWrapper />} />
            <Route path="/game/:category/:package" element={<GameWrapper />} />
            <Route path="/interactive/:category/:package" element={<InteractiveMapWrapper />} />
            <Route path="/trophy-cabinet" element={<PrizeCabinet />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </AppContainer>
    </Router>
  );
};

export default App;
