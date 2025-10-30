import { Card } from '@/components/ui/card';
import { Activity, AlertTriangle, Globe, TrendingUp } from 'lucide-react';

interface EarthquakeFeature {
  properties: {
    mag: number;
    tsunami: number;
    sig: number;
  };
}

interface StatsPanelProps {
  earthquakes: EarthquakeFeature[];
}

const StatsPanel = ({ earthquakes }: StatsPanelProps) => {
  const totalEvents = earthquakes.length;
  const significantEvents = earthquakes.filter(eq => eq.properties.mag >= 4.5).length;
  const tsunamiWarnings = earthquakes.filter(eq => eq.properties.tsunami === 1).length;
  const avgMagnitude = earthquakes.length > 0
    ? (earthquakes.reduce((sum, eq) => sum + eq.properties.mag, 0) / earthquakes.length).toFixed(2)
    : '0.00';

  const stats = [
    {
      label: 'Total Events',
      value: totalEvents,
      icon: Activity,
      color: 'text-primary',
    },
    {
      label: 'Significant (M≥4.5)',
      value: significantEvents,
      icon: TrendingUp,
      color: 'text-accent',
    },
    {
      label: 'Tsunami Warnings',
      value: tsunamiWarnings,
      icon: AlertTriangle,
      color: 'text-destructive',
    },
    {
      label: 'Avg Magnitude',
      value: avgMagnitude,
      icon: Globe,
      color: 'text-primary',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={index} className="p-4 bg-card/50 backdrop-blur-sm border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
            <stat.icon className={`h-8 w-8 ${stat.color} opacity-60`} />
          </div>
        </Card>
      ))}
    </div>
  );
};

export default StatsPanel;
