export interface City {
  name: string;
  country: string;
  coordinates: [number, number];
  package: string;
  lat: number;
  lng: number;
  continent: string;
}

export const cities: City[] = [
  // Pakket 1
  { name: 'Parijs', country: 'Frankrijk', coordinates: [48.8566, 2.3522], package: 'pakket1', lat: 48.8566, lng: 2.3522, continent: 'Europa' },
  { name: 'Washington', country: 'Verenigde Staten', coordinates: [38.8951, -77.0364], package: 'pakket1', lat: 38.8951, lng: -77.0364, continent: 'Noord-Amerika' },
  { name: 'Brasília', country: 'Brazilië', coordinates: [-15.7801, -47.9292], package: 'pakket1', lat: -15.7801, lng: -47.9292, continent: 'Zuid-Amerika' },
  { name: 'Londen', country: 'Verenigd Koninkrijk', coordinates: [51.5074, -0.1278], package: 'pakket1', lat: 51.5074, lng: -0.1278, continent: 'Europa' },
  { name: 'New York', country: 'Verenigde Staten', coordinates: [40.7128, -74.0060], package: 'pakket1', lat: 40.7128, lng: -74.0060, continent: 'Noord-Amerika' },
  { name: 'São Paulo', country: 'Brazilië', coordinates: [-23.5505, -46.6333], package: 'pakket1', lat: -23.5505, lng: -46.6333, continent: 'Zuid-Amerika' },
  { name: 'Berlijn', country: 'Duitsland', coordinates: [52.5200, 13.4050], package: 'pakket1', lat: 52.5200, lng: 13.4050, continent: 'Europa' },
  { name: 'Los Angeles', country: 'Verenigde Staten', coordinates: [34.0522, -118.2437], package: 'pakket1', lat: 34.0522, lng: -118.2437, continent: 'Noord-Amerika' },
  { name: 'Rio de Janeiro', country: 'Brazilië', coordinates: [-22.9068, -43.1729], package: 'pakket1', lat: -22.9068, lng: -43.1729, continent: 'Zuid-Amerika' },
  { name: 'Moskou', country: 'Rusland', coordinates: [55.7558, 37.6173], package: 'pakket1', lat: 55.7558, lng: 37.6173, continent: 'Europa' },
  { name: 'Chicago', country: 'Verenigde Staten', coordinates: [41.8781, -87.6298], package: 'pakket1', lat: 41.8781, lng: -87.6298, continent: 'Noord-Amerika' },
  { name: 'Buenos Aires', country: 'Argentinië', coordinates: [-34.6037, -58.3816], package: 'pakket1', lat: -34.6037, lng: -58.3816, continent: 'Zuid-Amerika' },
  { name: 'Athene', country: 'Griekenland', coordinates: [37.9838, 23.7275], package: 'pakket1', lat: 37.9838, lng: 23.7275, continent: 'Europa' },
  { name: 'Miami', country: 'Verenigde Staten', coordinates: [25.7617, -80.1918], package: 'pakket1', lat: 25.7617, lng: -80.1918, continent: 'Noord-Amerika' },
  { name: 'Bogotá', country: 'Colombia', coordinates: [4.7110, -74.0721], package: 'pakket1', lat: 4.7110, lng: -74.0721, continent: 'Zuid-Amerika' },
  { name: 'Madrid', country: 'Spanje', coordinates: [40.4168, -3.7038], package: 'pakket1', lat: 40.4168, lng: -3.7038, continent: 'Europa' },
  { name: 'Montréal', country: 'Canada', coordinates: [45.5017, -73.5673], package: 'pakket1', lat: 45.5017, lng: -73.5673, continent: 'Noord-Amerika' },
  { name: 'Caracas', country: 'Venezuela', coordinates: [10.4806, -66.9036], package: 'pakket1', lat: 10.4806, lng: -66.9036, continent: 'Zuid-Amerika' },
  { name: 'Rome', country: 'Italië', coordinates: [41.9028, 12.4964], package: 'pakket1', lat: 41.9028, lng: 12.4964, continent: 'Europa' },
  { name: 'Mexico-Stad', country: 'Mexico', coordinates: [19.4326, -99.1332], package: 'pakket1', lat: 19.4326, lng: -99.1332, continent: 'Noord-Amerika' },
  { name: 'Santiago', country: 'Chili', coordinates: [-33.4489, -70.6693], package: 'pakket1', lat: -33.4489, lng: -70.6693, continent: 'Zuid-Amerika' },
  { name: 'Istanbul', country: 'Turkije', coordinates: [41.0082, 28.9784], package: 'pakket1', lat: 41.0082, lng: 28.9784, continent: 'Europa' },
  { name: 'Havana', country: 'Cuba', coordinates: [23.1135, -82.3666], package: 'pakket1', lat: 23.1135, lng: -82.3666, continent: 'Noord-Amerika' },
  { name: 'Paramaribo', country: 'Suriname', coordinates: [5.8520, -55.2038], package: 'pakket1', lat: 5.8520, lng: -55.2038, continent: 'Zuid-Amerika' },
  { name: 'Kaapstad', country: 'Zuid-Afrika', coordinates: [-33.9249, 18.4241], package: 'pakket1', lat: -33.9249, lng: 18.4241, continent: 'Afrika' },
  { name: 'Jeruzalem', country: 'Israël', coordinates: [31.7683, 35.2137], package: 'pakket1', lat: 31.7683, lng: 35.2137, continent: 'Europa' },
  { name: 'Sydney', country: 'Australië', coordinates: [-33.8688, 151.2093], package: 'pakket1', lat: -33.8688, lng: 151.2093, continent: 'Australië' },
  { name: 'Johannesburg', country: 'Zuid-Afrika', coordinates: [-26.2041, 28.0473], package: 'pakket1', lat: -26.2041, lng: 28.0473, continent: 'Afrika' },
  { name: 'Riad', country: 'Saoedi-Arabië', coordinates: [24.7136, 46.6753], package: 'pakket1', lat: 24.7136, lng: 46.6753, continent: 'Azië' },
  { name: 'Melbourne', country: 'Australië', coordinates: [-37.8136, 144.9631], package: 'pakket1', lat: -37.8136, lng: 144.9631, continent: 'Australië' },
  { name: 'Casablanca', country: 'Marokko', coordinates: [33.5731, -7.5898], package: 'pakket1', lat: 33.5731, lng: -7.5898, continent: 'Afrika' },
  { name: 'Bagdad', country: 'Irak', coordinates: [33.3152, 44.3661], package: 'pakket1', lat: 33.3152, lng: 44.3661, continent: 'Azië' },
  { name: 'Dakar', country: 'Senegal', coordinates: [14.7167, -17.4677], package: 'pakket1', lat: 14.7167, lng: -17.4677, continent: 'Afrika' },
  { name: 'Teheran', country: 'Iran', coordinates: [35.6892, 51.3890], package: 'pakket1', lat: 35.6892, lng: 51.3890, continent: 'Azië' },
  { name: 'Nairobi', country: 'Kenia', coordinates: [-1.2921, 36.8219], package: 'pakket1', lat: -1.2921, lng: 36.8219, continent: 'Afrika' },
  { name: 'Kabul', country: 'Afghanistan', coordinates: [34.5553, 69.2075], package: 'pakket1', lat: 34.5553, lng: 69.2075, continent: 'Azië' },
  { name: 'Accra', country: 'Ghana', coordinates: [5.6037, -0.1870], package: 'pakket1', lat: 5.6037, lng: -0.1870, continent: 'Afrika' },
  { name: 'Delhi', country: 'India', coordinates: [28.6139, 77.2090], package: 'pakket1', lat: 28.6139, lng: 77.2090, continent: 'Azië' },
  { name: 'Lagos', country: 'Nigeria', coordinates: [6.5244, 3.3792], package: 'pakket1', lat: 6.5244, lng: 3.3792, continent: 'Afrika' },
  { name: 'Mumbai', country: 'India', coordinates: [19.0760, 72.8777], package: 'pakket1', lat: 19.0760, lng: 72.8777, continent: 'Azië' },
  { name: 'Cairo', country: 'Egypte', coordinates: [30.0444, 31.2357], package: 'pakket1', lat: 30.0444, lng: 31.2357, continent: 'Afrika' },
  { name: 'Bangkok', country: 'Thailand', coordinates: [13.7563, 100.5018], package: 'pakket1', lat: 13.7563, lng: 100.5018, continent: 'Azië' },
  { name: 'Singapore', country: 'Singapore', coordinates: [1.3521, 103.8198], package: 'pakket1', lat: 1.3521, lng: 103.8198, continent: 'Azië' },
  { name: 'Jakarta', country: 'Indonesië', coordinates: [-6.2088, 106.8456], package: 'pakket1', lat: -6.2088, lng: 106.8456, continent: 'Azië' },
  { name: 'Manila', country: 'Filipijnen', coordinates: [14.5995, 120.9842], package: 'pakket1', lat: 14.5995, lng: 120.9842, continent: 'Azië' },
  { name: 'Tokyo', country: 'Japan', coordinates: [35.6762, 139.6503], package: 'pakket1', lat: 35.6762, lng: 139.6503, continent: 'Azië' },
  { name: 'Seoul', country: 'Zuid-Korea', coordinates: [37.5665, 126.9780], package: 'pakket1', lat: 37.5665, lng: 126.9780, continent: 'Azië' },
  { name: 'Beijing', country: 'China', coordinates: [39.9042, 116.4074], package: 'pakket1', lat: 39.9042, lng: 116.4074, continent: 'Azië' },
  { name: 'Shanghai', country: 'China', coordinates: [31.2304, 121.4737], package: 'pakket1', lat: 31.2304, lng: 121.4737, continent: 'Azië' },
  { name: 'Hongkong', country: 'China', coordinates: [22.3193, 114.1694], package: 'pakket1', lat: 22.3193, lng: 114.1694, continent: 'Azië' },

  // Pakket 2
  { name: 'Kiev', country: 'Oekraïne', coordinates: [50.4547, 30.5238], package: 'pakket2', lat: 50.4547, lng: 30.5238, continent: 'Europa' },
  { name: 'Wenen', country: 'Oostenrijk', coordinates: [48.2082, 16.3738], package: 'pakket2', lat: 48.2082, lng: 16.3738, continent: 'Europa' },
  { name: 'San Francisco', country: 'Verenigde Staten', coordinates: [37.7749, -122.4194], package: 'pakket2', lat: 37.7749, lng: -122.4194, continent: 'Noord-Amerika' },
  { name: 'Detroit', country: 'Verenigde Staten', coordinates: [42.3314, -83.0458], package: 'pakket2', lat: 42.3314, lng: -83.0458, continent: 'Noord-Amerika' },
  { name: 'Vancouver', country: 'Canada', coordinates: [49.2827, -123.1207], package: 'pakket2', lat: 49.2827, lng: -123.1207, continent: 'Noord-Amerika' },
  { name: 'Lima', country: 'Peru', coordinates: [-12.0464, -77.0428], package: 'pakket2', lat: -12.0464, lng: -77.0428, continent: 'Zuid-Amerika' },
  { name: 'La Paz', country: 'Bolivia', coordinates: [-16.4897, -68.1193], package: 'pakket2', lat: -16.4897, lng: -68.1193, continent: 'Zuid-Amerika' },
  { name: 'Kinshasa', country: 'Congo', coordinates: [-4.4419, 15.2663], package: 'pakket2', lat: -4.4419, lng: 15.2663, continent: 'Afrika' },
  { name: 'Kolkata', country: 'India', coordinates: [22.5726, 88.3639], package: 'pakket2', lat: 22.5726, lng: 88.3639, continent: 'Azië' },
  { name: 'Perth', country: 'Australië', coordinates: [-31.9523, 115.8613], package: 'pakket2', lat: -31.9523, lng: 115.8613, continent: 'Australië' },

  // Pakket 3
  { name: 'Addis Abeba', country: 'Ethiopië', coordinates: [9.0320, 38.7488], package: 'pakket3', lat: 9.0320, lng: 38.7488, continent: 'Afrika' },
  { name: 'Khartoum', country: 'Soedan', coordinates: [15.5007, 32.5599], package: 'pakket3', lat: 15.5007, lng: 32.5599, continent: 'Afrika' },
  { name: 'Manaus', country: 'Brazilië', coordinates: [-3.1190, -60.0217], package: 'pakket3', lat: -3.1190, lng: -60.0217, continent: 'Zuid-Amerika' },
  { name: 'Montevideo', country: 'Uruguay', coordinates: [-34.9011, -56.1645], package: 'pakket3', lat: -34.9011, lng: -56.1645, continent: 'Zuid-Amerika' },
  { name: 'Houston', country: 'Verenigde Staten', coordinates: [29.7604, -95.3698], package: 'pakket3', lat: 29.7604, lng: -95.3698, continent: 'Noord-Amerika' },
  { name: 'Quito', country: 'Ecuador', coordinates: [-0.1807, -78.4678], package: 'pakket3', lat: -0.1807, lng: -78.4678, continent: 'Zuid-Amerika' },
  { name: 'Sint Petersburg', country: 'Rusland', coordinates: [59.9343, 30.3351], package: 'pakket3', lat: 59.9343, lng: 30.3351, continent: 'Europa' },
  { name: 'Stockholm', country: 'Zweden', coordinates: [59.3293, 18.0686], package: 'pakket3', lat: 59.3293, lng: 18.0686, continent: 'Europa' },
  { name: 'Algiers', country: 'Algerije', coordinates: [36.7538, 3.0588], package: 'pakket3', lat: 36.7538, lng: 3.0588, continent: 'Afrika' },
  { name: 'Karachi', country: 'Pakistan', coordinates: [24.8607, 67.0011], package: 'pakket3', lat: 24.8607, lng: 67.0011, continent: 'Azië' },
  { name: 'Kuala Lumpur', country: 'Maleisië', coordinates: [3.1390, 101.6869], package: 'pakket3', lat: 3.1390, lng: 101.6869, continent: 'Azië' },
  { name: 'Hanoi', country: 'Vietnam', coordinates: [21.0285, 105.8542], package: 'pakket3', lat: 21.0285, lng: 105.8542, continent: 'Azië' },
  { name: 'Adelaide', country: 'Australië', coordinates: [-34.9285, 138.6007], package: 'pakket3', lat: -34.9285, lng: 138.6007, continent: 'Australië' },
  { name: 'Wellington', country: 'Nieuw-Zeeland', coordinates: [-41.2866, 174.7756], package: 'pakket3', lat: -41.2866, lng: 174.7756, continent: 'Australië' },
  { name: 'Osaka', country: 'Japan', coordinates: [34.6937, 135.5023], package: 'pakket3', lat: 34.6937, lng: 135.5023, continent: 'Azië' }
]; 