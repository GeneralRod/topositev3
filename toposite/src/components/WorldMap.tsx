import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Icon } from 'leaflet';
import { cities, City } from '../data/cities';

// Fix for default marker icons in Leaflet with React
const defaultIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface WorldMapProps {
  selectedPackage: string;
}

const WorldMap: React.FC<WorldMapProps> = ({ selectedPackage }) => {
  const filteredCities = React.useMemo(() => {
    if (!selectedPackage) return [];
    
    switch (selectedPackage) {
      case 'pakket1-2':
        return cities.filter(city => city.package === 'pakket1' || city.package === 'pakket2');
      case 'pakket2-3':
        return cities.filter(city => city.package === 'pakket2' || city.package === 'pakket3');
      case 'pakket1-2-3':
        return cities;
      default:
        return cities.filter(city => city.package === selectedPackage);
    }
  }, [selectedPackage]);

  return (
    <div style={{ height: '600px', width: '100%' }}>
      <MapContainer
        center={[20, 0]}
        zoom={2}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {filteredCities.map((city) => (
          <Marker
            key={city.name}
            position={[city.lat, city.lng]}
            icon={defaultIcon}
          >
            <Popup>
              <div>{city.name}</div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default WorldMap; 