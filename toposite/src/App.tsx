import React, { useState } from 'react';
import WorldMap from './components/WorldMap';

const App: React.FC = () => {
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h1>Steden Kaart</h1>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => setSelectedPackage('pakket1')}>Pakket 1</button>
          <button onClick={() => setSelectedPackage('pakket2')}>Pakket 2</button>
          <button onClick={() => setSelectedPackage('pakket3')}>Pakket 3</button>
          <button onClick={() => setSelectedPackage('pakket1-2')}>Pakket 1 & 2</button>
          <button onClick={() => setSelectedPackage('pakket2-3')}>Pakket 2 & 3</button>
          <button onClick={() => setSelectedPackage('pakket1-2-3')}>Alle pakketten</button>
        </div>
      </div>

      {selectedPackage && <WorldMap selectedPackage={selectedPackage} />}
    </div>
  );
};

export default App; 