import { useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import type { Metrics } from '@/types/database';

interface SalesMetricsFormProps {
  metrics: Partial<Metrics>;
  updateMetrics: (updates: Partial<Metrics>) => void;
}

export function SalesMetricsForm({ metrics, updateMetrics }: SalesMetricsFormProps) {
  // Auto-calculate derived metrics
  useEffect(() => {
    const updates: Partial<Metrics> = {};

    // Calculate Close Rate
    if (metrics.sales_calls_completed && metrics.closes) {
      updates.close_rate = (metrics.closes / metrics.sales_calls_completed) * 100;
    }

    // Calculate Average Order Value
    if (metrics.revenue_generated && metrics.closes) {
      updates.average_order_value = metrics.revenue_generated / metrics.closes;
    }

    // Calculate Cost Per Acquisition
    if (metrics.ad_spend && metrics.closes) {
      updates.cost_per_acquisition = metrics.ad_spend / metrics.closes;
    }

    // Calculate ROAS
    if (metrics.revenue_generated && metrics.ad_spend) {
      updates.roas = metrics.revenue_generated / metrics.ad_spend;
    }

    if (Object.keys(updates).length > 0) {
      updateMetrics(updates);
    }
  }, [
    metrics.sales_calls_completed,
    metrics.closes,
    metrics.revenue_generated,
    metrics.ad_spend,
  ]);

  const handleChange = (field: keyof Metrics, value: string) => {
    const numValue = parseFloat(value) || 0;
    updateMetrics({ [field]: numValue });
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="sales_calls_booked">Sales Calls Booked</Label>
        <Input
          id="sales_calls_booked"
          type="number"
          min="0"
          value={metrics.sales_calls_booked || ''}
          onChange={(e) => handleChange('sales_calls_booked', e.target.value)}
          placeholder="Enter sales calls booked"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="sales_calls_completed">Sales Calls Completed</Label>
        <Input
          id="sales_calls_completed"
          type="number"
          min="0"
          value={metrics.sales_calls_completed || ''}
          onChange={(e) => handleChange('sales_calls_completed', e.target.value)}
          placeholder="Enter sales calls completed"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="proposals_made">Proposals/Offers Made</Label>
        <Input
          id="proposals_made"
          type="number"
          min="0"
          value={metrics.proposals_made || ''}
          onChange={(e) => handleChange('proposals_made', e.target.value)}
          placeholder="Enter proposals made"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="closes">Closes/Sales</Label>
        <Input
          id="closes"
          type="number"
          min="0"
          value={metrics.closes || ''}
          onChange={(e) => handleChange('closes', e.target.value)}
          placeholder="Enter closes"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="close_rate">Close Rate (%) *</Label>
        <Input
          id="close_rate"
          type="number"
          min="0"
          step="0.01"
          value={metrics.close_rate?.toFixed(2) || ''}
          disabled
          className="bg-muted"
        />
        <p className="text-xs text-muted-foreground">Auto-calculated</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="revenue_generated">Revenue Generated (₹)</Label>
        <Input
          id="revenue_generated"
          type="number"
          min="0"
          step="0.01"
          value={metrics.revenue_generated || ''}
          onChange={(e) => handleChange('revenue_generated', e.target.value)}
          placeholder="Enter revenue generated"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="average_order_value">Average Order Value (₹) *</Label>
        <Input
          id="average_order_value"
          type="number"
          min="0"
          step="0.01"
          value={metrics.average_order_value?.toFixed(2) || ''}
          disabled
          className="bg-muted"
        />
        <p className="text-xs text-muted-foreground">Auto-calculated</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="cost_per_acquisition">Cost Per Acquisition (₹) *</Label>
        <Input
          id="cost_per_acquisition"
          type="number"
          min="0"
          step="0.01"
          value={metrics.cost_per_acquisition?.toFixed(2) || ''}
          disabled
          className="bg-muted"
        />
        <p className="text-xs text-muted-foreground">Auto-calculated</p>
      </div>

      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="roas">ROAS (Return on Ad Spend) *</Label>
        <Input
          id="roas"
          type="number"
          min="0"
          step="0.01"
          value={metrics.roas?.toFixed(2) || ''}
          disabled
          className="bg-muted"
        />
        <p className="text-xs text-muted-foreground">
          Auto-calculated: Revenue ÷ Ad Spend
        </p>
      </div>
    </div>
  );
}
