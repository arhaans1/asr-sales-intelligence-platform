import { useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import type { Metrics } from '@/types/database';

interface TrafficMetricsFormProps {
  metrics: Partial<Metrics>;
  updateMetrics: (updates: Partial<Metrics>) => void;
}

export function TrafficMetricsForm({ metrics, updateMetrics }: TrafficMetricsFormProps) {
  // Auto-calculate derived metrics
  useEffect(() => {
    const updates: Partial<Metrics> = {};

    // Calculate CTR
    if (metrics.impressions && metrics.clicks) {
      updates.ctr = (metrics.clicks / metrics.impressions) * 100;
    }

    // Calculate CPC
    if (metrics.ad_spend && metrics.clicks) {
      updates.cpc = metrics.ad_spend / metrics.clicks;
    }

    // Calculate CPM
    if (metrics.ad_spend && metrics.impressions) {
      updates.cpm = (metrics.ad_spend / metrics.impressions) * 1000;
    }

    // Calculate Cost Per Landing Page View
    if (metrics.ad_spend && metrics.landing_page_views) {
      updates.cost_per_lpv = metrics.ad_spend / metrics.landing_page_views;
    }

    if (Object.keys(updates).length > 0) {
      updateMetrics(updates);
    }
  }, [
    metrics.impressions,
    metrics.clicks,
    metrics.ad_spend,
    metrics.landing_page_views,
  ]);

  const handleChange = (field: keyof Metrics, value: string) => {
    const numValue = parseFloat(value) || 0;
    updateMetrics({ [field]: numValue });
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="ad_spend">Ad Spend (₹)</Label>
        <Input
          id="ad_spend"
          type="number"
          min="0"
          step="0.01"
          value={metrics.ad_spend || ''}
          onChange={(e) => handleChange('ad_spend', e.target.value)}
          placeholder="Enter ad spend"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="impressions">Impressions</Label>
        <Input
          id="impressions"
          type="number"
          min="0"
          value={metrics.impressions || ''}
          onChange={(e) => handleChange('impressions', e.target.value)}
          placeholder="Enter impressions"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="reach">Reach</Label>
        <Input
          id="reach"
          type="number"
          min="0"
          value={metrics.reach || ''}
          onChange={(e) => handleChange('reach', e.target.value)}
          placeholder="Enter reach"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="cpm">CPM (₹) *</Label>
        <Input
          id="cpm"
          type="number"
          min="0"
          step="0.01"
          value={metrics.cpm?.toFixed(2) || ''}
          disabled
          className="bg-muted"
        />
        <p className="text-xs text-muted-foreground">Auto-calculated</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="clicks">Clicks</Label>
        <Input
          id="clicks"
          type="number"
          min="0"
          value={metrics.clicks || ''}
          onChange={(e) => handleChange('clicks', e.target.value)}
          placeholder="Enter clicks"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="ctr">CTR (%) *</Label>
        <Input
          id="ctr"
          type="number"
          min="0"
          step="0.01"
          value={metrics.ctr?.toFixed(2) || ''}
          disabled
          className="bg-muted"
        />
        <p className="text-xs text-muted-foreground">Auto-calculated</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="cpc">CPC (₹) *</Label>
        <Input
          id="cpc"
          type="number"
          min="0"
          step="0.01"
          value={metrics.cpc?.toFixed(2) || ''}
          disabled
          className="bg-muted"
        />
        <p className="text-xs text-muted-foreground">Auto-calculated</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="landing_page_views">Landing Page Views</Label>
        <Input
          id="landing_page_views"
          type="number"
          min="0"
          value={metrics.landing_page_views || ''}
          onChange={(e) => handleChange('landing_page_views', e.target.value)}
          placeholder="Enter landing page views"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="cost_per_lpv">Cost Per Landing Page View (₹) *</Label>
        <Input
          id="cost_per_lpv"
          type="number"
          min="0"
          step="0.01"
          value={metrics.cost_per_lpv?.toFixed(2) || ''}
          disabled
          className="bg-muted"
        />
        <p className="text-xs text-muted-foreground">Auto-calculated</p>
      </div>
    </div>
  );
}
