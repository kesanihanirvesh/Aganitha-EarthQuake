import { Card } from '@/components/ui/card';

const MagnitudeLegend = () => {
  const legendItems = [
    { label: 'M ≥ 6.0', color: 'hsl(var(--quake-critical))', desc: 'Critical' },
    { label: 'M 5.0-5.9', color: 'hsl(var(--quake-high))', desc: 'High' },
    { label: 'M 4.0-4.9', color: 'hsl(var(--quake-medium))', desc: 'Medium' },
    { label: 'M 2.5-3.9', color: 'hsl(var(--quake-low))', desc: 'Low' },
    { label: 'M < 2.5', color: 'hsl(var(--quake-minimal))', desc: 'Minimal' },
  ];

  return (
    <Card className="p-4 bg-card/80 backdrop-blur-sm">
      <h3 className="text-sm font-semibold mb-3 text-foreground">Magnitude Scale</h3>
      <div className="space-y-2">
        {legendItems.map((item, index) => (
          <div key={index} className="flex items-center gap-3">
            <div
              className="w-4 h-4 rounded-full border border-white/20"
              style={{ backgroundColor: item.color }}
            />
            <div className="flex-1 flex justify-between items-center">
              <span className="text-xs font-medium text-foreground">{item.label}</span>
              <span className="text-xs text-muted-foreground">{item.desc}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default MagnitudeLegend;
