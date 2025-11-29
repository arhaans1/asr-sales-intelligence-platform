import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, Target } from 'lucide-react';
import { metricsApi, prospectsApi, funnelsApi } from '@/services/api';
import type { Metrics, Prospect, Funnel } from '@/types/database';
import { analyzeGap, getStatusColor, getStatusBadgeVariant, type GapAnalysisResult, type IndicatorStatus } from '@/lib/gapAnalysis';
import { formatINR } from '@/lib/utils';

export default function GapAnalysis() {
  const { prospectId, funnelId } = useParams<{ prospectId: string; funnelId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [prospect, setProspect] = useState<Prospect | null>(null);
  const [funnel, setFunnel] = useState<Funnel | null>(null);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [analysis, setAnalysis] = useState<GapAnalysisResult | null>(null);

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

      setMetrics(metricsData);

      // Perform gap analysis if we have metrics
      if (metricsData && funnelData) {
        const analysisResult = analyzeGap(metricsData, funnelData);
        setAnalysis(analysisResult);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: IndicatorStatus) => {
    switch (status) {
      case 'excellent':
      case 'good':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default:
        return <Target className="h-5 w-5 text-muted-foreground" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 bg-muted" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64 bg-muted" />
            <Skeleton className="h-4 w-96 bg-muted" />
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="h-32 bg-muted" />
          <Skeleton className="h-32 bg-muted" />
          <Skeleton className="h-32 bg-muted" />
        </div>
        <Skeleton className="h-96 bg-muted" />
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
            <h1 className="text-3xl font-bold">Gap Analysis</h1>
            <p className="text-muted-foreground">
              {prospect?.business_name} - {funnel?.funnel_name}
            </p>
          </div>
        </div>

        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>No Metrics Data</AlertTitle>
          <AlertDescription>
            Please input metrics data before performing gap analysis.
            <Button
              variant="link"
              className="ml-2 p-0 h-auto"
              onClick={() => navigate(`/prospects/${prospectId}/funnels/${funnelId}/metrics`)}
            >
              Input Metrics →
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Analysis Error</AlertTitle>
          <AlertDescription>
            Unable to perform gap analysis. Please check your data and try again.
          </AlertDescription>
        </Alert>
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
          <h1 className="text-3xl font-bold">Gap Analysis</h1>
          <p className="text-muted-foreground">
            {prospect?.business_name} - {funnel?.funnel_name}
          </p>
        </div>
      </div>

      {/* Overall Health */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getStatusIcon(analysis.overallHealth)}
            Overall Funnel Health
          </CardTitle>
          <CardDescription>
            Performance assessment based on India market benchmarks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Badge variant={getStatusBadgeVariant(analysis.overallHealth)} className="text-lg px-4 py-2">
              {analysis.overallHealth.toUpperCase()}
            </Badge>
            <div className="flex-1">
              <Progress
                value={
                  analysis.overallHealth === 'excellent' ? 100 :
                    analysis.overallHealth === 'good' ? 75 :
                      analysis.overallHealth === 'warning' ? 50 : 25
                }
                className="h-3"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Primary Bottleneck */}
      {analysis.primaryBottleneck && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle className="text-lg font-semibold">Primary Bottleneck Identified</AlertTitle>
          <AlertDescription className="mt-2 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium">{analysis.primaryBottleneck.metricName}</span>
              <Badge variant="destructive">
                {analysis.primaryBottleneck.variance.toFixed(1)}% below benchmark
              </Badge>
            </div>
            <div className="text-sm">
              <span className="font-medium">Current:</span> {analysis.primaryBottleneck.currentValue.toFixed(2)}% |
              <span className="font-medium ml-2">Benchmark:</span> {analysis.primaryBottleneck.benchmarkMin.toFixed(2)}% - {analysis.primaryBottleneck.benchmarkMax.toFixed(2)}%
            </div>
            <p className="text-sm mt-2">{analysis.primaryBottleneck.recommendation}</p>
          </AlertDescription>
        </Alert>
      )}

      {/* Metrics Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Metrics Comparison</CardTitle>
          <CardDescription>
            Your performance vs. India market benchmarks
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {analysis.comparisons.map((comparison) => (
            <div
              key={comparison.metricKey}
              className={`p-4 rounded-lg border ${getStatusColor(comparison.status)}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getStatusIcon(comparison.status)}
                  <h3 className="font-semibold">{comparison.metricName}</h3>
                  <Badge variant={getStatusBadgeVariant(comparison.status)}>
                    {comparison.priority.toUpperCase()}
                  </Badge>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    {comparison.variance > 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    )}
                    <span className="font-semibold">
                      {comparison.variance > 0 ? '+' : ''}{comparison.variance.toFixed(1)}%
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">vs. benchmark</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-3">
                <div>
                  <p className="text-xs text-muted-foreground">Current</p>
                  <p className="font-semibold">
                    {comparison.metricKey.includes('cost') || comparison.metricKey.includes('cpa')
                      ? formatINR(comparison.currentValue)
                      : `${comparison.currentValue.toFixed(2)}${comparison.metricKey.includes('rate') || comparison.metricKey === 'ctr' ? '%' : 'x'}`
                    }
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Benchmark Range</p>
                  <p className="font-semibold text-sm">
                    {comparison.benchmarkMin.toFixed(1)} - {comparison.benchmarkMax.toFixed(1)}
                    {comparison.metricKey.includes('rate') || comparison.metricKey === 'ctr' ? '%' : ''}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Target (Avg)</p>
                  <p className="font-semibold">
                    {comparison.benchmarkAvg.toFixed(2)}
                    {comparison.metricKey.includes('rate') || comparison.metricKey === 'ctr' ? '%' : ''}
                  </p>
                </div>
              </div>

              <Progress
                value={Math.min(100, Math.max(0, ((comparison.currentValue - comparison.benchmarkMin) / (comparison.benchmarkMax - comparison.benchmarkMin)) * 100))}
                className="h-2 mb-2"
              />

              <p className="text-sm">{comparison.recommendation}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Opportunities */}
      {analysis.opportunities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Opportunities & Strengths
            </CardTitle>
            <CardDescription>
              Areas where you're exceeding benchmarks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {analysis.opportunities.map((opp) => (
              <div key={opp.metricKey} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                <div>
                  <p className="font-medium text-green-900">{opp.metricName}</p>
                  <p className="text-sm text-green-700">
                    {opp.currentValue.toFixed(2)}{String(opp.metricKey).includes('rate') || opp.metricKey === 'ctr' ? '%' : ''} (Benchmark: {opp.benchmarkAvg.toFixed(2)}{String(opp.metricKey).includes('rate') || opp.metricKey === 'ctr' ? '%' : ''})
                  </p>
                </div>
                <Badge className="bg-green-600">
                  +{opp.variance.toFixed(1)}%
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button
          onClick={() => navigate(`/prospects/${prospectId}/funnels/${funnelId}/metrics`)}
        >
          Update Metrics
        </Button>
        <Button
          variant="outline"
          onClick={() => navigate(`/prospects/${prospectId}/funnels/${funnelId}/projections`)}
        >
          View Projections
        </Button>
      </div>
    </div>
  );
}
