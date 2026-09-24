import React, { Suspense, lazy } from 'react';
import {
  BrowserRouter as Router,
  Navigate,
  Routes,
  Route,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom';
import styled from '@emotion/styled';
import HomeScreen from './components/HomeScreen';
import TitlePage from './components/TitlePage';
import CategoryScreen from './components/CategoryScreen';
import {
  DAILY_PACKAGE_ID,
  findCategory,
  findPackage,
  locationsFor,
  PRACTICE_PACKAGE_ID,
} from './content/catalog';
import { completeDailyChallenge, getCityStats, getDaily, type PlayMode } from './storage';
import { dailyCities, dateKey, doneToday } from './game/daily';
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

/** Speelmanier uit de url: ?modus=meerkeuze, anders aanwijzen op de kaart. */
function usePlayMode(): PlayMode {
  const [params] = useSearchParams();
  return params.get('modus') === 'meerkeuze' ? 'choice' : 'map';
}

/** Voortgang per speelmanier apart bewaren. */
function gameKey(packageId: string, mode: PlayMode): string {
  return mode === 'choice' ? `${packageId}@meerkeuze` : packageId;
}

const GameWrapper: React.FC = () => {
  const { category: categoryId, package: packageId } = useParams<{
    category: string;
    package: string;
  }>();
  const mode = usePlayMode();
  if (packageId === DAILY_PACKAGE_ID)
    return <DailyWrapper key={mode} categoryId={categoryId} mode={mode} />;
  if (packageId === PRACTICE_PACKAGE_ID)
    return <PracticeWrapper key={mode} categoryId={categoryId} mode={mode} />;
  return <PackageGameWrapper mode={mode} />;
};

const PackageGameWrapper: React.FC<{ mode: PlayMode }> = ({ mode }) => {
  const route = usePackageRoute('game');
  if (!route) return <Navigate to="/categories" replace />;
  return (
    <Game
      key={gameKey(route.pkg.id, mode)}
      packageId={gameKey(route.pkg.id, mode)}
      mode={mode}
      categoryId={route.categoryId}
      countStars
      title={route.pkg.title}
      cities={route.cities}
      onBack={route.onBack}
    />
  );
};

// Oefenrondje: alleen de steden die je vaak fout hebt (zie game/progress.ts).
const PracticeWrapper: React.FC<{ categoryId: string | undefined; mode: PlayMode }> = ({
  categoryId,
  mode,
}) => {
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
      packageId={gameKey(`${PRACTICE_PACKAGE_ID}-${category.id}`, mode)}
      mode={mode}
      categoryId={category.id}
      countStars={false}
      title="Mijn lastige steden"
      cities={cities}
      onBack={() => navigate(`/main/${category.id}`)}
    />
  );
};

// Dagelijkse uitdaging: elke dag 10 vaste steden (zie game/daily.ts).
const DailyWrapper: React.FC<{ categoryId: string | undefined; mode: PlayMode }> = ({
  categoryId,
  mode,
}) => {
  const navigate = useNavigate();
  const category = findCategory(categoryId);
  // Datum één keer vastleggen: wie na middernacht doorspeelt, maakt de uitdaging
  // van de dag waarop hij begon af.
  const [today] = React.useState(() => dateKey(new Date()));
  const [cities] = React.useState(() => {
    if (!category) return [];
    const names = new Set(
      dailyCities(
        category.locations.map((l) => l.name),
        today,
        category.id,
      ),
    );
    return category.locations.filter((l) => names.has(l.name));
  });
  const [alreadyDone] = React.useState(() =>
    category ? doneToday(getDaily(category.id), today) : true,
  );
  const onComplete = React.useCallback(() => {
    if (!category) return null;
    const { bonus, streak } = completeDailyChallenge(category.id, today);
    if (bonus === 0) return null;
    return `Uitdaging van vandaag klaar! Reeks: ${streak} ${streak === 1 ? 'dag' : 'dagen'} 🔥 +${bonus} bonusmunten`;
  }, [category, today]);
  if (!category || cities.length === 0 || alreadyDone)
    return <Navigate to={`/main/${categoryId ?? ''}`} replace />;
  return (
    <Game
      packageId={gameKey(`${DAILY_PACKAGE_ID}-${category.id}-${today}`, mode)}
      categoryId={category.id}
      countStars={false}
      mode={mode}
      onComplete={onComplete}
      title="Uitdaging van vandaag"
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
