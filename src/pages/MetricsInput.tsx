import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { ArrowLeft, Save } from 'lucide-react';
import { metricsApi, prospectsApi, funnelsApi } from '@/services/api';
import type { Metrics, Prospect, Funnel } from '@/types/database';
import { TrafficMetricsForm } from '@/components/metrics/TrafficMetricsForm';
import { ConversionMetricsForm } from '@/components/metrics/ConversionMetricsForm';
import { EngagementMetricsForm } from '@/components/metrics/EngagementMetricsForm';
import { SalesMetricsForm } from '@/components/metrics/SalesMetricsForm';

export default function MetricsInput() {
  const { prospectId, funnelId } = useParams<{ prospectId: string; funnelId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [prospect, setProspect] = useState<Prospect | null>(null);
  const [funnel, setFunnel] = useState<Funnel | null>(null);
  const [metrics, setMetrics] = useState<Partial<Metrics>>({
    funnel_id: funnelId,
    // Traffic Metrics
    ad_spend: 0,
    impressions: 0,
    reach: 0,
    cpm: 0,
    clicks: 0,
    ctr: 0,
    cpc: 0,
    landing_page_views: 0,
    cost_per_lpv: 0,
    // Conversion Metrics
    registrations: 0,
    registration_rate: 0,
    cost_per_lead: 0,
    qualified_leads: 0,
    cost_per_qualified_lead: 0,
    lead_quality_score: 5,
    // Engagement Metrics
    attendees: 0,
    show_up_rate: 0,
    cost_per_attendee: 0,
    engagement_score: 5,
    completion_rate: 0,
    replay_views: 0,
    // Sales Metrics
    sales_calls_booked: 0,
    sales_calls_completed: 0,
    proposals_made: 0,
    closes: 0,
    close_rate: 0,
    revenue_generated: 0,
    average_order_value: 0,
    cost_per_acquisition: 0,
    roas: 0,
  });

  useEffect(() => {
    loadData();
  }, [prospectId, funnelId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [prospectData, funnelData, metricsData] = await Promise.all([
        prospectsApi.getById(prospectId!),
        funnelsApi.getById(funnelId!),
        metricsApi.getByFunnelId(funnelId!),
      ]);

      setProspect(prospectData);
      setFunnel(funnelData);

      if (metricsData) {
        setMetrics(metricsData);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load metrics data');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      if (metrics.id) {
        await metricsApi.update(metrics.id, metrics);
        toast.success('Metrics updated successfully');
      } else {
        await metricsApi.create(metrics as Omit<Metrics, 'id' | 'created_at' | 'updated_at'>);
        toast.success('Metrics saved successfully');
      }

      navigate(`/prospects/${prospectId}`);
    } catch (error) {
      console.error('Failed to save metrics:', error);
      toast.error('Failed to save metrics');
    } finally {
      setSaving(false);
    }
  };

  const updateMetrics = (updates: Partial<Metrics>) => {
    setMetrics(prev => ({ ...prev, ...updates }));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Loading...</h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Metrics Input</h1>
            <p className="text-muted-foreground mt-1">
              {prospect?.business_name} - {funnel?.funnel_type}
            </p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? 'Saving...' : 'Save Metrics'}
        </Button>
      </div>

      <Tabs defaultValue="traffic" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="traffic">Traffic</TabsTrigger>
          <TabsTrigger value="conversion">Conversion</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
        </TabsList>

        <TabsContent value="traffic">
          <Card>
            <CardHeader>
              <CardTitle>Traffic Metrics</CardTitle>
              <CardDescription>
                Enter your ad campaign traffic data. Auto-calculated fields are marked with *.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TrafficMetricsForm metrics={metrics} updateMetrics={updateMetrics} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conversion">
          <Card>
            <CardHeader>
              <CardTitle>Conversion Metrics</CardTitle>
              <CardDescription>
                Track lead generation and qualification metrics.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ConversionMetricsForm metrics={metrics} updateMetrics={updateMetrics} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement">
          <Card>
            <CardHeader>
              <CardTitle>Engagement Metrics</CardTitle>
              <CardDescription>
                Monitor audience engagement and participation rates.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EngagementMetricsForm metrics={metrics} updateMetrics={updateMetrics} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sales">
          <Card>
            <CardHeader>
              <CardTitle>Sales Metrics</CardTitle>
              <CardDescription>
                Track sales performance and revenue generation.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SalesMetricsForm metrics={metrics} updateMetrics={updateMetrics} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
