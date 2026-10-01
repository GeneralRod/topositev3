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
import FlagsHome from './components/FlagsHome';
import CategoryScreen from './components/CategoryScreen';
import {
  categories,
  DAILY_PACKAGE_ID,
  findCategory,
  findPackage,
  locationsFor,
  PRACTICE_PACKAGE_ID,
  toetsPackages,
} from './content/catalog';
import {
  completeDailyChallenge,
  getCityStats,
  getDaily,
  type GameMode,
  type PlayMode,
} from './storage';
import { dailyCities, dateKey, doneToday } from './game/daily';
import { hardCities } from './game/progress';
import AccountButton from './account/AccountButton';
import GuestQuestion from './account/GuestQuestion';
import { hasStoredSession } from './account/storedSession';
import { startAccount } from './account/session';

// Deze schermen (met de kaartbibliotheek Leaflet) worden pas geladen als ze
// geopend worden; dat maakt de eerste keer laden van de site sneller.
const Game = lazy(() => import('./components/Game'));
const InteractiveMap = lazy(() => import('./components/InteractiveMap'));
const Toets = lazy(() => import('./components/Toets'));
const Aanwijstoets = lazy(() => import('./components/Aanwijstoets'));
const FlagQuiz = lazy(() => import('./components/FlagQuiz'));
const FlagGallery = lazy(() => import('./components/FlagGallery'));
const PrintMap = lazy(() => import('./components/PrintMap'));
const PrizeCabinet = lazy(() => import('./cabinet/PrizeCabinet'));
const AccountScreen = lazy(() => import('./account/AccountScreen'));
const PrivacyScreen = lazy(() => import('./account/PrivacyScreen'));

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
  if (category.flagOf) return <FlagsHome category={category} />;
  return <HomeScreen category={category} />;
};

/** Het onderwerp met de vlaggen (er is er één). */
const flagCategory = () => categories.find((c) => c.flagOf);

/** Vlaggenquiz: meerkeuze (?modus=meerkeuze) of typen (?modus=typen). */
const FlagQuizWrapper: React.FC = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { package: packageId } = useParams<{ package: string }>();
  const category = flagCategory();
  const found = findPackage(category, packageId);
  // Lastige vlaggen: één keer bepalen bij het openen.
  const [hard] = React.useState(() => {
    if (!category || packageId !== PRACTICE_PACKAGE_ID) return [];
    const names = new Set(
      hardCities(
        getCityStats(category.id),
        category.locations.map((l) => l.name),
      ),
    );
    return category.locations.filter((l) => names.has(l.name));
  });
  if (!category) return <Navigate to="/categories" replace />;
  const places = found ? locationsFor(category, found.pkg) : hard;
  if (places.length === 0) return <Navigate to={`/main/${category.id}`} replace />;
  const mode = params.get('modus') === 'typen' ? 'type' : 'choice';
  return (
    <FlagQuiz
      key={`${packageId}-${mode}`}
      category={category}
      packageId={packageId ?? PRACTICE_PACKAGE_ID}
      title={found?.pkg.title ?? 'Mijn lastige vlaggen'}
      places={places}
      mode={mode}
      onBack={() => navigate(`/main/${category.id}`)}
    />
  );
};

// Oefenkaart printen voor een pakket.
const PrintWrapper: React.FC = () => {
  const route = usePackageRoute('game');
  if (!route) return <Navigate to="/categories" replace />;
  return (
    <PrintMap
      category={route.category}
      pkg={route.pkg}
      places={route.cities}
      onBack={route.onBack}
    />
  );
};

const FlagGalleryWrapper: React.FC = () => {
  const navigate = useNavigate();
  const { package: packageId } = useParams<{ package: string }>();
  const category = flagCategory();
  const found = findPackage(category, packageId);
  if (!category || !found) return <Navigate to="/categories" replace />;
  return (
    <FlagGallery
      category={category}
      pkg={found.pkg}
      places={locationsFor(category, found.pkg)}
      onBack={() => navigate(`/main/${category.id}`)}
    />
  );
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
    category,
    categoryId: category.id,
    cities: locationsFor(category, found.pkg),
    onBack: () => navigate(`/main/${category.id}`),
  };
}

/** Speelmanier uit de url: ?modus=meerkeuze of ?modus=toets, anders aanwijzen op de kaart. */
function usePlayMode(): PlayMode {
  const [params] = useSearchParams();
  const modus = params.get('modus');
  return modus === 'meerkeuze' ? 'choice' : modus === 'toets' ? 'test' : 'map';
}

/** Voortgang per speelmanier apart bewaren. */
function gameKey(packageId: string, mode: GameMode): string {
  return mode === 'choice' ? `${packageId}@meerkeuze` : packageId;
}

const GameWrapper: React.FC = () => {
  const { category: categoryId, package: packageId } = useParams<{
    category: string;
    package: string;
  }>();
  const chosen = usePlayMode();
  if (chosen === 'test' && packageId !== DAILY_PACKAGE_ID && packageId !== PRACTICE_PACKAGE_ID)
    return <AanwijstoetsWrapper />;
  // De uitdaging en de lastige plekken speel je bij de aanwijstoets gewoon met aanwijzen.
  const mode: GameMode = chosen === 'test' ? 'map' : chosen;
  if (packageId === DAILY_PACKAGE_ID)
    return <DailyWrapper key={mode} categoryId={categoryId} mode={mode} />;
  if (packageId === PRACTICE_PACKAGE_ID)
    return <PracticeWrapper key={mode} categoryId={categoryId} mode={mode} />;
  return <PackageGameWrapper mode={mode} />;
};

const AanwijstoetsWrapper: React.FC = () => {
  const route = usePackageRoute('game');
  if (!route) return <Navigate to="/categories" replace />;
  return (
    <Aanwijstoets
      key={route.pkg.id}
      category={route.category}
      packageId={route.pkg.id}
      title={route.pkg.title}
      cities={route.cities}
      onBack={route.onBack}
    />
  );
};

const PackageGameWrapper: React.FC<{ mode: GameMode }> = ({ mode }) => {
  const route = usePackageRoute('game');
  if (!route) return <Navigate to="/categories" replace />;
  return (
    <Game
      key={gameKey(route.pkg.id, mode)}
      packageId={gameKey(route.pkg.id, mode)}
      mode={mode}
      categoryId={route.categoryId}
      kind="package"
      title={route.pkg.title}
      cities={route.cities}
      onBack={route.onBack}
    />
  );
};

// Oefenrondje: alleen de plekken die je vaak fout hebt (zie game/progress.ts).
const PracticeWrapper: React.FC<{ categoryId: string | undefined; mode: GameMode }> = ({
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
      kind="practice"
      title={`Mijn lastige ${category.words.many}`}
      cities={cities}
      onBack={() => navigate(`/main/${category.id}`)}
    />
  );
};

// Dagelijkse uitdaging: elke dag 10 vaste plekken (zie game/daily.ts).
const DailyWrapper: React.FC<{ categoryId: string | undefined; mode: GameMode }> = ({
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
      kind="daily"
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
    <InteractiveMap
      cities={route.cities}
      onBack={route.onBack}
      title={route.pkg.title}
      loadShapes={route.category.loadShapes}
      maxZoom={route.category.maxZoom}
      map={route.category.map}
    />
  );
};

const ToetsWrapper: React.FC = () => {
  const navigate = useNavigate();
  const { category: categoryId, upto } = useParams<{ category: string; upto: string }>();
  const category = findCategory(categoryId);
  const count = Number(upto);
  if (!category || !Number.isInteger(count) || count < 1) {
    return <Navigate to="/categories" replace />;
  }
  if (count > toetsPackages(category).length) return <Navigate to="/categories" replace />;
  return (
    <Toets
      key={`${category.id}-${count}`}
      category={category}
      upto={count}
      onBack={() => navigate(`/main/${category.id}`)}
    />
  );
};

const App: React.FC = () => {
  // Al ingelogd op deze computer: kijk bij Supabase of dat nog klopt.
  React.useEffect(() => {
    if (hasStoredSession()) void startAccount();
  }, []);

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
            <Route path="/toets/:category/:upto" element={<ToetsWrapper />} />
            <Route path="/vlaggen/bekijk/:package" element={<FlagGalleryWrapper />} />
            <Route path="/print/:category/:package" element={<PrintWrapper />} />
            <Route path="/vlaggen/:package" element={<FlagQuizWrapper />} />
            <Route path="/trophy-cabinet" element={<PrizeCabinet />} />
            <Route path="/account" element={<AccountScreen />} />
            <Route path="/privacy" element={<PrivacyScreen />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
        <AccountButton />
        <GuestQuestion />
      </AppContainer>
    </Router>
  );
};

export default App;
