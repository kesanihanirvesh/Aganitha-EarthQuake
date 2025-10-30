import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';

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

interface EarthquakeListProps {
  earthquakes: EarthquakeFeature[];
  onSelect?: (earthquake: EarthquakeFeature) => void;
}

const getMagnitudeBadgeVariant = (mag: number) => {
  if (mag >= 6) return 'destructive';
  if (mag >= 5) return 'default';
  if (mag >= 4) return 'secondary';
  return 'outline';
};

const EarthquakeList = ({ earthquakes, onSelect }: EarthquakeListProps) => {
  const navigate = useNavigate();
  const sortedEarthquakes = [...earthquakes].sort(
    (a, b) => b.properties.time - a.properties.time
  );

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border">
        <h2 className="text-xl font-bold text-foreground">Recent Earthquakes</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {earthquakes.length} events in the last 24 hours
        </p>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {sortedEarthquakes.map((earthquake) => (
            <Card
              key={earthquake.id}
              className="p-4 cursor-pointer hover:bg-accent/50 transition-colors"
              onClick={() => navigate(`/earthquake/${earthquake.id}`)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={getMagnitudeBadgeVariant(earthquake.properties.mag)}>
                      M {earthquake.properties.mag.toFixed(1)}
                    </Badge>
                    {earthquake.properties.tsunami === 1 && (
                      <Badge variant="destructive" className="text-xs">
                        Tsunami
                      </Badge>
                    )}
                  </div>
                  
                  <h3 className="font-semibold text-sm text-foreground mb-1 truncate">
                    {earthquake.properties.place}
                  </h3>
                  
                  <p className="text-xs text-muted-foreground">
                    {new Date(earthquake.properties.time).toLocaleString()}
                  </p>
                  
                  <p className="text-xs text-muted-foreground mt-1">
                    Depth: {earthquake.geometry.coordinates[2].toFixed(1)} km
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default EarthquakeList;
