import { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import type { LatLngExpression } from 'leaflet';
import { useNavigate } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';

interface EarthquakeFeature {
  type: string;
  properties: {
    mag: number;
    place: string;
    time: number;
    tsunami: number;
    sig: number;
    type: string;
    title: string;
    url: string;
    detail: string;
  };
  geometry: {
    type: string;
    coordinates: [number, number, number];
  };
  id: string;
}

interface EarthquakeMapProps {
  earthquakes: EarthquakeFeature[];
  onEarthquakeSelect?: (earthquake: EarthquakeFeature) => void;
}

const getMarkerColor = (magnitude: number) => {
  if (magnitude >= 6) return '#dc2626';
  if (magnitude >= 5) return '#ea580c';
  if (magnitude >= 4) return '#f59e0b';
  if (magnitude >= 2.5) return '#14b8a6';
  return '#6ee7b7';
};

const getMarkerSize = (magnitude: number) => {
  return Math.max(4, magnitude * 3);
};

const MapUpdater = ({ earthquakes }: { earthquakes: EarthquakeFeature[] }) => {
  const map = useMap();
  
  useEffect(() => {
    if (earthquakes.length > 0) {
      const bounds = earthquakes.map(eq => [
        eq.geometry.coordinates[1],
        eq.geometry.coordinates[0]
      ] as LatLngExpression);
      
      if (bounds.length > 0) {
        map.fitBounds(bounds as any, { padding: [50, 50] });
      }
    }
  }, [earthquakes, map]);

  return null;
};

const EarthquakeMap = ({ earthquakes, onEarthquakeSelect }: EarthquakeMapProps) => {
  const navigate = useNavigate();
  const center: LatLngExpression = [20, 0];

  return (
    <div className="relative h-full w-full rounded-lg overflow-hidden border border-border">
      <MapContainer
        center={center}
        zoom={2}
        scrollWheelZoom={true}
        className="h-full w-full"
        zoomControl={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <MapUpdater earthquakes={earthquakes} />
        {earthquakes.map((earthquake) => {
          const [lng, lat, depth] = earthquake.geometry.coordinates;
          const magnitude = earthquake.properties.mag;
          
          return (
            <CircleMarker
              key={earthquake.id}
              center={[lat, lng]}
              pathOptions={{
                fillColor: getMarkerColor(magnitude),
                color: getMarkerColor(magnitude),
                weight: 1,
                opacity: 0.8,
                fillOpacity: 0.6,
              }}
              radius={getMarkerSize(magnitude)}
              eventHandlers={{
                click: () => {
                  navigate(`/earthquake/${earthquake.id}`);
                },
              }}
            >
              <Popup>
                <div className="text-sm">
                  <h3 className="font-bold text-base mb-2">{earthquake.properties.title}</h3>
                  <div className="space-y-1">
                    <p><span className="font-semibold">Magnitude:</span> {magnitude}</p>
                    <p><span className="font-semibold">Location:</span> {earthquake.properties.place}</p>
                    <p><span className="font-semibold">Depth:</span> {depth.toFixed(2)} km</p>
                    <p><span className="font-semibold">Time:</span> {new Date(earthquake.properties.time).toLocaleString()}</p>
                    {earthquake.properties.tsunami === 1 && (
                      <p className="text-red-600 font-semibold">⚠️ Tsunami Warning</p>
                    )}
                  </div>
                  <a 
                    href={earthquake.properties.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-teal-500 hover:underline text-xs mt-2 block"
                  >
                    View USGS Details →
                  </a>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default EarthquakeMap;
