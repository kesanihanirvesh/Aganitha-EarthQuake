import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import type { LatLngExpression } from 'leaflet';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ExternalLink, AlertTriangle, MapPin, Clock, Layers } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import 'leaflet/dist/leaflet.css';

interface DetailData {
  type: string;
  properties: {
    mag: number;
    place: string;
    time: number;
    updated: number;
    tsunami: number;
    sig: number;
    type: string;
    title: string;
    url: string;
    status: string;
    magType: string;
    alert: string | null;
    felt: number | null;
    cdi: number | null;
    mmi: number | null;
    nst: number;
    dmin: number;
    rms: number;
    gap: number;
    products?: {
      origin?: Array<{
        properties: {
          'depth-type'?: string;
          'magnitude-source'?: string;
          'num-stations-used'?: string;
          'num-phases-used'?: string;
          'horizontal-error'?: string;
          'vertical-error'?: string;
          'azimuthal-gap'?: string;
          'minimum-distance'?: string;
          'standard-error'?: string;
        };
      }>;
    };
  };
  geometry: {
    type: string;
    coordinates: [number, number, number];
  };
  id: string;
}

const getMarkerColor = (magnitude: number) => {
  if (magnitude >= 6) return '#dc2626';
  if (magnitude >= 5) return '#ea580c';
  if (magnitude >= 4) return '#f59e0b';
  if (magnitude >= 2.5) return '#14b8a6';
  return '#6ee7b7';
};

const getMagnitudeLabel = (magnitude: number) => {
  if (magnitude >= 6) return { label: 'Major', color: 'destructive' as const };
  if (magnitude >= 5) return { label: 'Moderate', color: 'default' as const };
  if (magnitude >= 4) return { label: 'Light', color: 'secondary' as const };
  if (magnitude >= 2.5) return { label: 'Minor', color: 'outline' as const };
  return { label: 'Micro', color: 'outline' as const };
};

const EarthquakeDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: allEarthquakes } = useQuery({
    queryKey: ['earthquakes'],
    queryFn: async () => {
      const response = await fetch(
        'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson'
      );
      return response.json();
    },
  });

  const earthquake = allEarthquakes?.features?.find((eq: any) => eq.id === id);

  const { data: detailData, isLoading } = useQuery({
    queryKey: ['earthquake-detail', earthquake?.properties?.detail],
    queryFn: async () => {
      if (!earthquake?.properties?.detail) return null;
      const response = await fetch(earthquake.properties.detail);
      if (!response.ok) throw new Error('Failed to fetch earthquake details');
      return response.json() as Promise<DetailData>;
    },
    enabled: !!earthquake?.properties?.detail,
  });

  if (!earthquake) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Earthquake not found</p>
          <Button onClick={() => navigate('/')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Map
          </Button>
        </div>
      </div>
    );
  }

  const [lng, lat, depth] = earthquake.geometry.coordinates;
  const center: LatLngExpression = [lat, lng];
  const magnitude = earthquake.properties.mag;
  const magnitudeInfo = getMagnitudeLabel(magnitude);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button onClick={() => navigate('/')} variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-foreground">{earthquake.properties.title}</h1>
              <p className="text-sm text-muted-foreground">
                {new Date(earthquake.properties.time).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="space-y-6">
          {/* Map Section */}
          <div className="h-[500px] rounded-lg overflow-hidden border border-border">
            <MapContainer
              center={center}
              zoom={8}
              scrollWheelZoom={true}
              className="h-full w-full"
              zoomControl={true}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              />
              <CircleMarker
                center={center}
                pathOptions={{
                  fillColor: getMarkerColor(magnitude),
                  color: getMarkerColor(magnitude),
                  weight: 2,
                  opacity: 0.8,
                  fillOpacity: 0.6,
                }}
                radius={Math.max(8, magnitude * 4)}
              >
                <Popup>
                  <div className="text-sm">
                    <h3 className="font-bold text-base mb-2">{earthquake.properties.title}</h3>
                    <p><span className="font-semibold">Magnitude:</span> {magnitude}</p>
                  </div>
                </Popup>
              </CircleMarker>
            </MapContainer>
          </div>

          {/* Details Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Magnitude</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg">{magnitude}</span>
                    <Badge variant={magnitudeInfo.color}>{magnitudeInfo.label}</Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Location</span>
                  <span className="font-medium text-right">{earthquake.properties.place}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Coordinates</span>
                  <span className="font-mono text-sm">{lat.toFixed(4)}°, {lng.toFixed(4)}°</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Depth</span>
                  <span className="font-medium">{depth.toFixed(2)} km</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Type</span>
                  <span className="font-medium capitalize">{earthquake.properties.type}</span>
                </div>
              </CardContent>
            </Card>

            {/* Temporal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Temporal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Event Time</span>
                  <span className="font-medium text-right">
                    {new Date(earthquake.properties.time).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Last Updated</span>
                  <span className="font-medium text-right">
                    {new Date(detailData?.properties?.updated || earthquake.properties.time).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant="outline" className="capitalize">
                    {detailData?.properties?.status || 'automatic'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Technical Details */}
            {detailData?.properties && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Layers className="h-5 w-5" />
                    Technical Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Magnitude Type</span>
                    <span className="font-medium uppercase">{detailData.properties.magType}</span>
                  </div>
                  {detailData.properties.nst && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Stations Used</span>
                      <span className="font-medium">{detailData.properties.nst}</span>
                    </div>
                  )}
                  {detailData.properties.gap && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Azimuthal Gap</span>
                      <span className="font-medium">{detailData.properties.gap}°</span>
                    </div>
                  )}
                  {detailData.properties.rms && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">RMS</span>
                      <span className="font-medium">{detailData.properties.rms.toFixed(2)}</span>
                    </div>
                  )}
                  {detailData.properties.dmin && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Min Distance</span>
                      <span className="font-medium">{detailData.properties.dmin.toFixed(2)}°</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Alerts & Impact */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Alerts & Impact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Tsunami Warning</span>
                  {earthquake.properties.tsunami === 1 ? (
                    <Badge variant="destructive">Yes ⚠️</Badge>
                  ) : (
                    <Badge variant="outline">No</Badge>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Significance</span>
                  <span className="font-medium">{earthquake.properties.sig}</span>
                </div>
                {detailData?.properties?.felt && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Felt Reports</span>
                    <span className="font-medium">{detailData.properties.felt}</span>
                  </div>
                )}
                {detailData?.properties?.alert && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Alert Level</span>
                    <Badge variant="destructive" className="capitalize">
                      {detailData.properties.alert}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Additional Information */}
          {isLoading && (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Loading detailed information...
              </CardContent>
            </Card>
          )}

          {/* External Link */}
          <div className="flex justify-center">
            <Button asChild variant="outline">
              <a 
                href={earthquake.properties.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="gap-2"
              >
                View on USGS Website
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EarthquakeDetailPage;
