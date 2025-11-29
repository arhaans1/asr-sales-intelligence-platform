import { useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import type { Metrics } from '@/types/database';

interface ConversionMetricsFormProps {
  metrics: Partial<Metrics>;
  updateMetrics: (updates: Partial<Metrics>) => void;
}

export function ConversionMetricsForm({ metrics, updateMetrics }: ConversionMetricsFormProps) {
  // Auto-calculate derived metrics
  useEffect(() => {
    const updates: Partial<Metrics> = {};

    // Calculate Registration Rate
    if (metrics.landing_page_views && metrics.registrations) {
      updates.registration_rate = (metrics.registrations / metrics.landing_page_views) * 100;
    }

    // Calculate Cost Per Lead
    if (metrics.ad_spend && metrics.registrations) {
      updates.cost_per_lead = metrics.ad_spend / metrics.registrations;
    }

    // Calculate Cost Per Qualified Lead
    if (metrics.ad_spend && metrics.qualified_leads) {
      updates.cost_per_qualified_lead = metrics.ad_spend / metrics.qualified_leads;
    }

    if (Object.keys(updates).length > 0) {
      updateMetrics(updates);
    }
  }, [
    metrics.landing_page_views,
    metrics.registrations,
    metrics.ad_spend,
    metrics.qualified_leads,
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
        <Label htmlFor="registrations">Total Registrations/Leads</Label>
        <Input
          id="registrations"
          type="number"
          min="0"
          value={metrics.registrations || ''}
          onChange={(e) => handleChange('registrations', e.target.value)}
          placeholder="Enter total registrations"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="registration_rate">Registration Rate (%) *</Label>
        <Input
          id="registration_rate"
          type="number"
          min="0"
          step="0.01"
          value={metrics.registration_rate?.toFixed(2) || ''}
          disabled
          className="bg-muted"
        />
        <p className="text-xs text-muted-foreground">Auto-calculated</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="cost_per_lead">Cost Per Lead (₹) *</Label>
        <Input
          id="cost_per_lead"
          type="number"
          min="0"
          step="0.01"
          value={metrics.cost_per_lead?.toFixed(2) || ''}
          disabled
          className="bg-muted"
        />
        <p className="text-xs text-muted-foreground">Auto-calculated</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="qualified_leads">Qualified Leads</Label>
        <Input
          id="qualified_leads"
          type="number"
          min="0"
          value={metrics.qualified_leads || ''}
          onChange={(e) => handleChange('qualified_leads', e.target.value)}
          placeholder="Enter qualified leads"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="cost_per_qualified_lead">Cost Per Qualified Lead (₹) *</Label>
        <Input
          id="cost_per_qualified_lead"
          type="number"
          min="0"
          step="0.01"
          value={metrics.cost_per_qualified_lead?.toFixed(2) || ''}
          disabled
          className="bg-muted"
        />
        <p className="text-xs text-muted-foreground">Auto-calculated</p>
      </div>

      <div className="space-y-4 md:col-span-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="lead_quality_score">Lead Quality Score (1-10)</Label>
          <span className="text-sm font-medium">{metrics.lead_quality_score || 5}</span>
        </div>
        <Slider
          id="lead_quality_score"
          min={1}
          max={10}
          step={1}
          value={[metrics.lead_quality_score || 5]}
          onValueChange={(value) => handleSliderChange('lead_quality_score', value)}
          className="w-full"
        />
        <p className="text-xs text-muted-foreground">
          Subjective assessment of lead quality (1 = Poor, 10 = Excellent)
        </p>
      </div>
    </div>
  );
}
