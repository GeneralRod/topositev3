import React, { useState } from 'react';
import styled from '@emotion/styled';
import HomeScreen from './components/HomeScreen';
import Game from './components/Game';
import InteractiveMap from './components/InteractiveMap';
import { cities } from './data/cities';
import './App.css'

const AppContainer = styled.div`
  min-height: 100vh;
  background: #f5f7fa;
`;

const App: React.FC = () => {
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);

  const handleSelectPackage = (packageName: string) => {
    setSelectedPackage(packageName);
  };

  const handleBack = () => {
    setSelectedPackage(null);
  };

  const getCitiesForPackage = (packageName: string) => {
    switch (packageName) {
      case 'pakket1':
        return cities.filter(city => city.package === 'pakket1');
      case 'pakket2':
        return cities.filter(city => city.package === 'pakket2');
      case 'pakket3':
        return cities.filter(city => city.package === 'pakket3');
      case 'pakket1-2':
        return cities.filter(city => city.package === 'pakket1' || city.package === 'pakket2');
      case 'pakket2-3':
        return cities.filter(city => city.package === 'pakket2' || city.package === 'pakket3');
      case 'pakket1-2-3':
        return cities;
      case 'interactive1':
        return cities.filter(city => city.package === 'pakket1');
      case 'interactive2':
        return cities.filter(city => city.package === 'pakket2');
      case 'interactive3':
        return cities.filter(city => city.package === 'pakket3');
      default:
        return [];
    }
  };

  const isInteractiveMap = selectedPackage?.startsWith('interactive');

  return (
    <AppContainer>
      {!selectedPackage ? (
        <HomeScreen onSelectPackage={handleSelectPackage} />
      ) : isInteractiveMap ? (
        <InteractiveMap
          cities={getCitiesForPackage(selectedPackage)}
          onBack={handleBack}
          selectedPackage={selectedPackage}
        />
      ) : (
        <Game
          cities={getCitiesForPackage(selectedPackage)}
          onBack={handleBack}
          selectedPackage={selectedPackage}
        />
      )}
    </AppContainer>
  );
};

export default App;
