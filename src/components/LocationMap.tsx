import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Korrigiere das Marker-Icon-Problem
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

interface LocationMapProps {
  address: string;
  onLocationSelect?: (location: { lat: number; lng: number }) => void;
}

interface GeocodingResult {
  lat: number;
  lon: number;
  display_name: string;
}

// Komponente zum Zentrieren der Karte
function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng]);
  }, [lat, lng, map]);
  return null;
}

export function LocationMap({ address, onLocationSelect }: LocationMapProps) {
  const [position, setPosition] = useState<[number, number]>([51.1657, 10.4515]); // Deutschland-Zentrum
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const geocodeAddress = async () => {
      if (!address) return;

      setLoading(true);
      setError('');

      try {
        const encodedAddress = encodeURIComponent(address);
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}`
        );

        if (!response.ok) {
          throw new Error('Geocoding fehlgeschlagen');
        }

        const data: GeocodingResult[] = await response.json();

        if (data && data.length > 0) {
          const { lat, lon } = data[0];
          const newPosition: [number, number] = [parseFloat(lat), parseFloat(lon)];
          setPosition(newPosition);
          onLocationSelect?.({ lat: parseFloat(lat), lng: parseFloat(lon) });
        } else {
          setError('Adresse nicht gefunden');
        }
      } catch (err) {
        setError('Fehler beim Geocoding');
        console.error('Geocoding error:', err);
      } finally {
        setLoading(false);
      }
    };

    geocodeAddress();
  }, [address, onLocationSelect]);

  return (
    <div style={{ height: '400px', width: '100%' }}>
      <MapContainer
        center={position}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position}>
          <Popup>{address}</Popup>
        </Marker>
        <RecenterMap lat={position[0]} lng={position[1]} />
      </MapContainer>
      {loading && <div className="map-loading">Lade Kartenposition...</div>}
      {error && <div className="map-error">{error}</div>}
    </div>
  );
}