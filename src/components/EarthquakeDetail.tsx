import { useQuery } from '@tanstack/react-query';
import { X, MapPin, Clock, Layers, AlertTriangle, Activity, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

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

interface DetailData {
  properties: {
    mag: number;
    place: string;
    time: number;
    updated: number;
    status: string;
    tsunami: number;
    sig: number;
    magType: string;
    type: string;
    title: string;
    url: string;
    felt?: number;
    cdi?: number;
    mmi?: number;
    alert?: string;
    products?: {
      origin?: Array<{
        properties: {
          'azimuthal-gap'?: string;
          'depth-type'?: string;
          'magnitude-error'?: string;
          'num-stations-used'?: string;
          'num-phases-used'?: string;
          'standard-error'?: string;
          'horizontal-error'?: string;
          'vertical-error'?: string;
          'review-status'?: string;
        };
      }>;
    };
  };
  geometry: {
    coordinates: [number, number, number];
  };
}

interface EarthquakeDetailProps {
  earthquake: EarthquakeFeature;
  onClose: () => void;
}

const fetchEarthquakeDetail = async (url: string): Promise<DetailData> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch earthquake details');
  }
  return response.json();
};

const EarthquakeDetail = ({ earthquake, onClose }: EarthquakeDetailProps) => {
  const { data, isLoading } = useQuery({
    queryKey: ['earthquake-detail', earthquake.id],
    queryFn: () => fetchEarthquakeDetail(earthquake.properties.detail),
  });

  const getMagnitudeColor = (mag: number) => {
    if (mag >= 6.0) return 'hsl(var(--magnitude-severe))';
    if (mag >= 5.0) return 'hsl(var(--magnitude-strong))';
    if (mag >= 4.0) return 'hsl(var(--magnitude-moderate))';
    if (mag >= 3.0) return 'hsl(var(--magnitude-light))';
    return 'hsl(var(--magnitude-minor))';
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const originData = data?.properties?.products?.origin?.[0]?.properties;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-end lg:items-center justify-center">
      <div className="bg-card border border-border rounded-t-2xl lg:rounded-2xl w-full lg:w-[800px] max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-border bg-gradient-to-br from-primary/10 to-accent/10">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                  style={{ backgroundColor: getMagnitudeColor(earthquake.properties.mag) }}
                >
                  {earthquake.properties.mag.toFixed(1)}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">
                    {earthquake.properties.title}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Event ID: {earthquake.id}
                  </p>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : data ? (
            <>
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                  <MapPin className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Location</p>
                    <p className="font-medium">{data.properties.place}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {data.geometry.coordinates[1].toFixed(4)}°N, {Math.abs(data.geometry.coordinates[0]).toFixed(4)}°W
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                  <Clock className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Time</p>
                    <p className="font-medium">{formatDate(data.properties.time)}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Updated: {formatDate(data.properties.updated)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                  <Layers className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Depth</p>
                    <p className="font-medium">{data.geometry.coordinates[2].toFixed(2)} km</p>
                    {originData?.['depth-type'] && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Type: {originData['depth-type']}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                  <Activity className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Magnitude</p>
                    <p className="font-medium">
                      {data.properties.mag.toFixed(2)} {data.properties.magType.toUpperCase()}
                    </p>
                    {originData?.['magnitude-error'] && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Error: ±{parseFloat(originData['magnitude-error']).toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Alerts & Status */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Status & Alerts
                </h3>
                <div className="flex flex-wrap gap-2">
                  <Badge variant={data.properties.status === 'reviewed' ? 'default' : 'secondary'}>
                    {data.properties.status}
                  </Badge>
                  {data.properties.tsunami === 1 && (
                    <Badge variant="destructive">Tsunami Alert</Badge>
                  )}
                  {data.properties.felt && (
                    <Badge variant="outline">{data.properties.felt} felt reports</Badge>
                  )}
                  <Badge variant="outline">Significance: {data.properties.sig}</Badge>
                </div>
              </div>

              <Separator />

              {/* Technical Details */}
              {originData && (
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    Technical Details
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                    {originData['num-stations-used'] && (
                      <div>
                        <p className="text-muted-foreground">Stations Used</p>
                        <p className="font-medium">{originData['num-stations-used']}</p>
                      </div>
                    )}
                    {originData['num-phases-used'] && (
                      <div>
                        <p className="text-muted-foreground">Phases Used</p>
                        <p className="font-medium">{originData['num-phases-used']}</p>
                      </div>
                    )}
                    {originData['azimuthal-gap'] && (
                      <div>
                        <p className="text-muted-foreground">Azimuthal Gap</p>
                        <p className="font-medium">{parseFloat(originData['azimuthal-gap']).toFixed(1)}°</p>
                      </div>
                    )}
                    {originData['standard-error'] && (
                      <div>
                        <p className="text-muted-foreground">Standard Error</p>
                        <p className="font-medium">{originData['standard-error']}</p>
                      </div>
                    )}
                    {originData['horizontal-error'] && (
                      <div>
                        <p className="text-muted-foreground">Horizontal Error</p>
                        <p className="font-medium">{parseFloat(originData['horizontal-error']).toFixed(2)} km</p>
                      </div>
                    )}
                    {originData['vertical-error'] && (
                      <div>
                        <p className="text-muted-foreground">Vertical Error</p>
                        <p className="font-medium">{parseFloat(originData['vertical-error']).toFixed(2)} km</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <Separator />

              {/* More Info Link */}
              <div className="flex justify-center">
                <Button asChild variant="outline">
                  <a 
                    href={data.properties.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="gap-2"
                  >
                    View Full Details on USGS
                  </a>
                </Button>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default EarthquakeDetail;
