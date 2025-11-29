import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Calculator, TrendingUp, Target } from 'lucide-react';
import { prospectsApi, funnelsApi, productsApi, metricsApi } from '@/services/api';
import type { Prospect, Funnel, Product, Metrics } from '@/types/database';
import { calculateProjections, createScenarios, calculateTimeline, type ProjectionInputs, type ProjectionResult, type ScenarioComparison } from '@/lib/projections';
import { formatINR } from '@/lib/utils';

export default function ProjectionCalculator() {
  const { prospectId, funnelId } = useParams<{ prospectId: string; funnelId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [prospect, setProspect] = useState<Prospect | null>(null);
  const [funnel, setFunnel] = useState<Funnel | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);

  // Projection inputs
  const [targetRevenue, setTargetRevenue] = useState(0);
  const [ticketPrice, setTicketPrice] = useState(0);
  const [closeRate, setCloseRate] = useState(20);
  const [showUpRate, setShowUpRate] = useState(60);
  const [registrationRate, setRegistrationRate] = useState(40);
  const [ctr, setCtr] = useState(1.5);
  const [costPerClick, setCostPerClick] = useState(15);

  const [projection, setProjection] = useState<ProjectionResult | null>(null);
  const [scenarios, setScenarios] = useState<ScenarioComparison[]>([]);

  useEffect(() => {
    loadData();
  }, [prospectId, funnelId]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const [prospectData, funnelData, productsData, metricsData] = await Promise.all([
        prospectsApi.getById(prospectId!),
        funnelsApi.getById(funnelId!),
        productsApi.getByProspectId(prospectId!),
        metricsApi.getByFunnelId(funnelId!),
      ]);

      setProspect(prospectData);
      setFunnel(funnelData);
      setProducts(Array.isArray(productsData) ? productsData : []);
      
      const metricsRecord = Array.isArray(metricsData) && metricsData.length > 0 
        ? metricsData[0] 
        : null;
      
      setMetrics(metricsRecord);

      // Initialize with prospect's target revenue and primary product price
      if (prospectData.target_monthly_revenue) {
        setTargetRevenue(prospectData.target_monthly_revenue);
      }

      const primaryProduct = Array.isArray(productsData) 
        ? productsData.find(p => p.is_primary) || productsData[0]
        : null;
      
      if (primaryProduct?.ticket_price) {
        setTicketPrice(primaryProduct.ticket_price);
      }

      // Initialize with current metrics if available
      if (metricsRecord) {
        if (metricsRecord.close_rate > 0) setCloseRate(metricsRecord.close_rate);
        if (metricsRecord.show_up_rate > 0) setShowUpRate(metricsRecord.show_up_rate);
        if (metricsRecord.registration_rate > 0) setRegistrationRate(metricsRecord.registration_rate);
        if (metricsRecord.ctr > 0) setCtr(metricsRecord.ctr);
        if (metricsRecord.cpc > 0) setCostPerClick(metricsRecord.cpc);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCalculate = () => {
    if (!funnel || targetRevenue <= 0 || ticketPrice <= 0) return;

    const inputs: ProjectionInputs = {
      targetRevenue,
      ticketPrice,
      closeRate,
      showUpRate,
      registrationRate,
      ctr,
      costPerClick,
    };

    const result = calculateProjections(inputs, funnel, {
      closeRate: metrics?.close_rate,
      showUpRate: metrics?.show_up_rate,
      registrationRate: metrics?.registration_rate,
      ctr: metrics?.ctr,
      cpc: metrics?.cpc,
      costPerLead: metrics?.cost_per_lead,
    });

    setProjection(result);

    // Generate scenarios
    const scenarioResults = createScenarios(inputs, funnel, {
      closeRate: metrics?.close_rate,
      showUpRate: metrics?.show_up_rate,
      registrationRate: metrics?.registration_rate,
      ctr: metrics?.ctr,
      cpc: metrics?.cpc,
      costPerLead: metrics?.cost_per_lead,
      revenue: metrics?.revenue_generated,
      closes: metrics?.closes,
      salesCalls: metrics?.sales_calls_completed,
      attendees: metrics?.attendees,
      registrations: metrics?.registrations,
      adSpend: metrics?.ad_spend,
    });

    setScenarios(scenarioResults);
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
          <h1 className="text-3xl font-bold">Projection Calculator</h1>
          <p className="text-muted-foreground">
            {prospect?.business_name} - {funnel?.funnel_name}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Projection Inputs
            </CardTitle>
            <CardDescription>
              Adjust assumptions to calculate required metrics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Target Revenue */}
            <div className="space-y-2">
              <Label htmlFor="targetRevenue">Target Monthly Revenue (₹)</Label>
              <Input
                id="targetRevenue"
                type="number"
                value={targetRevenue}
                onChange={(e) => setTargetRevenue(Number(e.target.value))}
                placeholder="Enter target revenue"
              />
            </div>

            {/* Ticket Price */}
            <div className="space-y-2">
              <Label htmlFor="ticketPrice">Ticket Price (₹)</Label>
              <Input
                id="ticketPrice"
                type="number"
                value={ticketPrice}
                onChange={(e) => setTicketPrice(Number(e.target.value))}
                placeholder="Enter ticket price"
              />
            </div>

            {/* Close Rate Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Close Rate</Label>
                <span className="text-sm font-medium">{closeRate.toFixed(1)}%</span>
              </div>
              <Slider
                value={[closeRate]}
                onValueChange={(value) => setCloseRate(value[0])}
                min={5}
                max={50}
                step={0.5}
                className="w-full"
              />
            </div>

            {/* Show-Up Rate Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Show-Up Rate</Label>
                <span className="text-sm font-medium">{showUpRate.toFixed(1)}%</span>
              </div>
              <Slider
                value={[showUpRate]}
                onValueChange={(value) => setShowUpRate(value[0])}
                min={10}
                max={90}
                step={1}
                className="w-full"
              />
            </div>

            {/* Registration Rate Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Registration Rate</Label>
                <span className="text-sm font-medium">{registrationRate.toFixed(1)}%</span>
              </div>
              <Slider
                value={[registrationRate]}
                onValueChange={(value) => setRegistrationRate(value[0])}
                min={10}
                max={80}
                step={1}
                className="w-full"
              />
            </div>

            {/* CTR Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>CTR (Click-Through Rate)</Label>
                <span className="text-sm font-medium">{ctr.toFixed(2)}%</span>
              </div>
              <Slider
                value={[ctr]}
                onValueChange={(value) => setCtr(value[0])}
                min={0.5}
                max={5}
                step={0.1}
                className="w-full"
              />
            </div>

            {/* Cost Per Click */}
            <div className="space-y-2">
              <Label htmlFor="costPerClick">Cost Per Click (₹)</Label>
              <Input
                id="costPerClick"
                type="number"
                value={costPerClick}
                onChange={(e) => setCostPerClick(Number(e.target.value))}
                placeholder="Enter cost per click"
              />
            </div>

            <Button onClick={handleCalculate} className="w-full" size="lg">
              <Calculator className="mr-2 h-4 w-4" />
              Calculate Projections
            </Button>
          </CardContent>
        </Card>

        {/* Results Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Required Metrics
            </CardTitle>
            <CardDescription>
              What you need to achieve your target
            </CardDescription>
          </CardHeader>
          <CardContent>
            {projection ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                    <p className="text-sm text-muted-foreground mb-1">Target Revenue</p>
                    <p className="text-2xl font-bold text-primary">{formatINR(projection.targetRevenue)}</p>
                  </div>
                  <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                    <p className="text-sm text-muted-foreground mb-1">Required Budget</p>
                    <p className="text-2xl font-bold text-primary">{formatINR(projection.requiredBudget)}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="font-medium">Required Closes</span>
                    <span className="text-lg font-bold">{projection.requiredCloses}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="font-medium">Required Sales Calls</span>
                    <span className="text-lg font-bold">{projection.requiredSalesCalls}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="font-medium">Required Attendees</span>
                    <span className="text-lg font-bold">{projection.requiredAttendees}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="font-medium">Required Registrations</span>
                    <span className="text-lg font-bold">{projection.requiredRegistrations}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="font-medium">Required Landing Page Views</span>
                    <span className="text-lg font-bold">{projection.requiredLandingPageViews.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="font-medium">Required Clicks</span>
                    <span className="text-lg font-bold">{projection.requiredClicks.toLocaleString()}</span>
                  </div>
                </div>

                <div className="p-4 bg-green-50 rounded-lg border border-green-200 mt-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-green-900">Projected ROAS</span>
                    <span className="text-2xl font-bold text-green-600">{projection.projectedROAS.toFixed(2)}x</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Calculator className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Enter your inputs and click Calculate to see projections
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Scenario Comparison */}
      {scenarios.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Scenario Comparison
            </CardTitle>
            <CardDescription>
              Compare different performance scenarios
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="0" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                {scenarios.map((scenario, index) => (
                  <TabsTrigger key={index} value={index.toString()}>
                    {scenario.name}
                  </TabsTrigger>
                ))}
              </TabsList>
              {scenarios.map((scenario, index) => (
                <TabsContent key={index} value={index.toString()} className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Required Budget</p>
                      <p className="text-xl font-bold">{formatINR(scenario.projection.requiredBudget)}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Gap: {scenario.gapPercentage.budget > 0 ? '+' : ''}{scenario.gapPercentage.budget.toFixed(0)}%
                      </p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Required Closes</p>
                      <p className="text-xl font-bold">{scenario.projection.requiredCloses}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Gap: {scenario.gapPercentage.closes > 0 ? '+' : ''}{scenario.gapPercentage.closes.toFixed(0)}%
                      </p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Required Calls</p>
                      <p className="text-xl font-bold">{scenario.projection.requiredSalesCalls}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Gap: {scenario.gapPercentage.calls > 0 ? '+' : ''}{scenario.gapPercentage.calls.toFixed(0)}%
                      </p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Projected ROAS</p>
                      <p className="text-xl font-bold">{scenario.projection.projectedROAS.toFixed(2)}x</p>
                    </div>
                  </div>

                  <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                    <h4 className="font-semibold mb-2">Assumptions</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Close Rate:</span>
                        <span className="ml-2 font-medium">{scenario.projection.assumptions.closeRate.toFixed(1)}%</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Show-Up Rate:</span>
                        <span className="ml-2 font-medium">{scenario.projection.assumptions.showUpRate.toFixed(1)}%</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Registration Rate:</span>
                        <span className="ml-2 font-medium">{scenario.projection.assumptions.registrationRate.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
