import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import EarthquakeMap from '@/components/EarthquakeMap';
import EarthquakeList from '@/components/EarthquakeList';
import StatsPanel from '@/components/StatsPanel';
import MagnitudeLegend from '@/components/MagnitudeLegend';
import { Button } from '@/components/ui/button';
import { RefreshCw, Waves } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

interface EarthquakeData {
  type: string;
  metadata: {
    generated: number;
    title: string;
    count: number;
  };
  features: EarthquakeFeature[];
}

const fetchEarthquakes = async (): Promise<EarthquakeData> => {
  const response = await fetch(
    'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson'
  );
  if (!response.ok) {
    throw new Error('Failed to fetch earthquake data');
  }
  return response.json();
};

const Index = () => {
  const { toast } = useToast();

  const { data, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ['earthquakes'],
    queryFn: fetchEarthquakes,
    refetchInterval: 5 * 60 * 1000, // Auto-refresh every 5 minutes
  });

  useEffect(() => {
    if (error) {
      toast({
        title: 'Error loading earthquake data',
        description: 'Failed to fetch data from USGS. Please try again.',
        variant: 'destructive',
      });
    }
  }, [error, toast]);

  const handleRefresh = () => {
    refetch();
    toast({
      title: 'Refreshing data',
      description: 'Fetching latest earthquake information...',
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-primary to-accent rounded-lg">
                <Waves className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Seismic Monitor</h1>
                <p className="text-sm text-muted-foreground">
                  Global Earthquake Visualization • USGS Data
                </p>
              </div>
            </div>
            <Button
              onClick={handleRefresh}
              disabled={isRefetching}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-[600px]">
            <div className="text-center">
              <RefreshCw className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Loading earthquake data...</p>
            </div>
          </div>
        ) : data ? (
          <div className="space-y-6">
            {/* Stats Panel */}
            <StatsPanel earthquakes={data.features} />

            {/* Map and List Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Map Section */}
              <div className="lg:col-span-2 space-y-4">
                <div className="h-[600px]">
                  <EarthquakeMap
                    earthquakes={data.features}
                  />
                </div>
                <MagnitudeLegend />
              </div>

              {/* Earthquake List */}
              <div className="lg:col-span-1">
                <div className="h-[600px] bg-card rounded-lg border border-border overflow-hidden">
                  <EarthquakeList
                    earthquakes={data.features}
                    onSelect={() => {}}
                  />
                </div>
              </div>
            </div>

            {/* Data Attribution */}
            <div className="text-center text-xs text-muted-foreground py-4">
              <p>
                Data provided by{' '}
                <a
                  href="https://earthquake.usgs.gov/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  USGS Earthquake Hazards Program
                </a>
              </p>
              <p className="mt-1">
                Last updated: {new Date(data.metadata.generated).toLocaleString()}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-[600px]">
            <div className="text-center">
              <p className="text-destructive">Failed to load earthquake data</p>
              <Button onClick={handleRefresh} variant="outline" className="mt-4">
                Try Again
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
