import { useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import type { Metrics } from '@/types/database';

interface EngagementMetricsFormProps {
  metrics: Partial<Metrics>;
  updateMetrics: (updates: Partial<Metrics>) => void;
}

export function EngagementMetricsForm({ metrics, updateMetrics }: EngagementMetricsFormProps) {
  // Auto-calculate derived metrics
  useEffect(() => {
    const updates: Partial<Metrics> = {};

    // Calculate Show-Up Rate
    if (metrics.registrations && metrics.attendees) {
      updates.show_up_rate = (metrics.attendees / metrics.registrations) * 100;
    }

    // Calculate Cost Per Attendee
    if (metrics.ad_spend && metrics.attendees) {
      updates.cost_per_attendee = metrics.ad_spend / metrics.attendees;
    }

    if (Object.keys(updates).length > 0) {
      updateMetrics(updates);
    }
  }, [
    metrics.registrations,
    metrics.attendees,
    metrics.ad_spend,
  ]);

  const handleChange = (field: keyof Metrics, value: string) => {
    const numValue = parseFloat(value) || 0;
    updateMetrics({ [field]: numValue });
  };

  const handleSliderChange = (field: keyof Metrics, value: number[]) => {
    updateMetrics({ [field]: value[0] });
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="attendees">Show-Ups/Attendees</Label>
        <Input
          id="attendees"
          type="number"
          min="0"
          value={metrics.attendees || ''}
          onChange={(e) => handleChange('attendees', e.target.value)}
          placeholder="Enter show-ups"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="show_up_rate">Show-Up Rate (%) *</Label>
        <Input
          id="show_up_rate"
          type="number"
          min="0"
          step="0.01"
          value={metrics.show_up_rate?.toFixed(2) || ''}
          disabled
          className="bg-muted"
        />
        <p className="text-xs text-muted-foreground">Auto-calculated</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="cost_per_attendee">Cost Per Attendee (₹) *</Label>
        <Input
          id="cost_per_attendee"
          type="number"
          min="0"
          step="0.01"
          value={metrics.cost_per_attendee?.toFixed(2) || ''}
          disabled
          className="bg-muted"
        />
        <p className="text-xs text-muted-foreground">Auto-calculated</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="completion_rate">Completion Rate (%)</Label>
        <Input
          id="completion_rate"
          type="number"
          min="0"
          max="100"
          step="0.01"
          value={metrics.completion_rate || ''}
          onChange={(e) => handleChange('completion_rate', e.target.value)}
          placeholder="Enter completion rate"
        />
        <p className="text-xs text-muted-foreground">For challenges/workshops</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="replay_views">Replay Views</Label>
        <Input
          id="replay_views"
          type="number"
          min="0"
          value={metrics.replay_views || ''}
          onChange={(e) => handleChange('replay_views', e.target.value)}
          placeholder="Enter replay views"
        />
        <p className="text-xs text-muted-foreground">For webinars</p>
      </div>

      <div className="space-y-4 md:col-span-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="engagement_score">Engagement Score (1-10)</Label>
          <span className="text-sm font-medium">{metrics.engagement_score || 5}</span>
        </div>
        <Slider
          id="engagement_score"
          min={1}
          max={10}
          step={1}
          value={[metrics.engagement_score || 5]}
          onValueChange={(value) => handleSliderChange('engagement_score', value)}
          className="w-full"
        />
        <p className="text-xs text-muted-foreground">
          Subjective assessment of audience engagement (1 = Low, 10 = High)
        </p>
      </div>
    </div>
  );
}
