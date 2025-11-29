import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, BarChart3, TrendingUp, Target, DollarSign } from 'lucide-react';
import { prospectsApi, funnelsApi, metricsApi } from '@/services/api';
import type { Prospect, Funnel, Metrics } from '@/types/database';
import { formatINR } from '@/lib/utils';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  FunnelChart,
  Funnel as RechartsFunnel,
  LabelList,
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function VisualizationDashboard() {
  const { prospectId, funnelId } = useParams<{ prospectId: string; funnelId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [prospect, setProspect] = useState<Prospect | null>(null);
  const [funnel, setFunnel] = useState<Funnel | null>(null);
  const [metrics, setMetrics] = useState<Metrics | null>(null);

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
      
      const metricsRecord = Array.isArray(metricsData) && metricsData.length > 0 
        ? metricsData[0] 
        : null;
      
      setMetrics(metricsRecord);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Prepare funnel visualization data
  const getFunnelData = () => {
    if (!metrics) return [];

    return [
      {
        name: 'Impressions',
        value: metrics.impressions || 0,
        fill: COLORS[0],
      },
      {
        name: 'Clicks',
        value: metrics.clicks || 0,
        fill: COLORS[1],
      },
      {
        name: 'Landing Page Views',
        value: metrics.landing_page_views || 0,
        fill: COLORS[2],
      },
      {
        name: 'Registrations',
        value: metrics.registrations || 0,
        fill: COLORS[3],
      },
      {
        name: 'Attendees',
        value: metrics.attendees || 0,
        fill: COLORS[4],
      },
      {
        name: 'Closes',
        value: metrics.closes || 0,
        fill: COLORS[5],
      },
    ].filter(item => item.value > 0);
  };

  // Prepare conversion rates data
  const getConversionRatesData = () => {
    if (!metrics) return [];

    return [
      {
        name: 'CTR',
        value: metrics.ctr || 0,
        benchmark: 1.5,
      },
      {
        name: 'Registration Rate',
        value: metrics.registration_rate || 0,
        benchmark: 40,
      },
      {
        name: 'Show-Up Rate',
        value: metrics.show_up_rate || 0,
        benchmark: 60,
      },
      {
        name: 'Close Rate',
        value: metrics.close_rate || 0,
        benchmark: 20,
      },
    ];
  };

  // Prepare cost breakdown data
  const getCostBreakdownData = () => {
    if (!metrics) return [];

    const adSpend = metrics.ad_spend || 0;
    const revenue = metrics.revenue_generated || 0;
    const profit = revenue - adSpend;

    return [
      { name: 'Ad Spend', value: adSpend, fill: COLORS[3] },
      { name: 'Profit', value: Math.max(0, profit), fill: COLORS[1] },
    ];
  };

  // Prepare performance metrics data
  const getPerformanceMetricsData = () => {
    if (!metrics) return [];

    return [
      {
        metric: 'CPC',
        value: metrics.cpc || 0,
        label: formatINR(metrics.cpc || 0),
      },
      {
        metric: 'CPL',
        value: metrics.cost_per_lead || 0,
        label: formatINR(metrics.cost_per_lead || 0),
      },
      {
        metric: 'CAC',
        value: metrics.cost_per_acquisition || 0,
        label: formatINR(metrics.cost_per_acquisition || 0),
      },
      {
        metric: 'ROAS',
        value: metrics.roas || 0,
        label: `${(metrics.roas || 0).toFixed(2)}x`,
      },
    ];
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-96 bg-muted" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-96 bg-muted" />
          <Skeleton className="h-96 bg-muted" />
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/prospects/${prospectId}`)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Visualization Dashboard</h1>
            <p className="text-muted-foreground">
              {prospect?.business_name} - {funnel?.funnel_name}
            </p>
          </div>
        </div>

        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No metrics data available. Please input metrics first.
              </p>
              <Button
                variant="default"
                className="mt-4"
                onClick={() => navigate(`/prospects/${prospectId}/funnels/${funnelId}/metrics`)}
              >
                Input Metrics
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const funnelData = getFunnelData();
  const conversionRatesData = getConversionRatesData();
  const costBreakdownData = getCostBreakdownData();
  const performanceMetricsData = getPerformanceMetricsData();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(`/prospects/${prospectId}`)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Visualization Dashboard</h1>
          <p className="text-muted-foreground">
            {prospect?.business_name} - {funnel?.funnel_name}
          </p>
        </div>
      </div>

      {/* Key Metrics Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="text-2xl font-bold">{formatINR(metrics.revenue_generated || 0)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">ROAS</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <span className="text-2xl font-bold">{(metrics.roas || 0).toFixed(2)}x</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Closes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-purple-600" />
              <span className="text-2xl font-bold">{metrics.closes || 0}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ad Spend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-orange-600" />
              <span className="text-2xl font-bold">{formatINR(metrics.ad_spend || 0)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Funnel Visualization */}
      <Card>
        <CardHeader>
          <CardTitle>Funnel Flow</CardTitle>
          <CardDescription>Visual representation of your funnel stages</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <FunnelChart>
              <Tooltip formatter={(value) => value.toLocaleString()} />
              <RechartsFunnel
                dataKey="value"
                data={funnelData}
                isAnimationActive
              >
                <LabelList position="right" fill="#000" stroke="none" dataKey="name" />
              </RechartsFunnel>
            </FunnelChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Conversion Rates Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Conversion Rates vs Benchmarks</CardTitle>
            <CardDescription>Compare your performance against industry standards</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={conversionRatesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `${Number(value).toFixed(2)}%`} />
                <Legend />
                <Bar dataKey="value" fill={COLORS[0]} name="Your Performance" />
                <Bar dataKey="benchmark" fill={COLORS[1]} name="Benchmark" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Cost Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue vs Ad Spend</CardTitle>
            <CardDescription>Breakdown of costs and profits</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={costBreakdownData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${formatINR(value)}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {costBreakdownData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatINR(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
            <CardDescription>Key cost and efficiency indicators</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={performanceMetricsData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="metric" type="category" />
                <Tooltip />
                <Bar dataKey="value" fill={COLORS[4]}>
                  <LabelList dataKey="label" position="right" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
