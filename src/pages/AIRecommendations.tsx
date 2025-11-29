import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Sparkles, AlertTriangle, Lightbulb, CheckCircle2, Clock, TrendingUp } from 'lucide-react';
import { prospectsApi, funnelsApi, productsApi, metricsApi } from '@/services/api';
import type { Prospect, Funnel, Product, Metrics } from '@/types/database';
import { analyzeGap } from '@/lib/gapAnalysis';
import { generateRecommendations, getRecommendationIcon, getRecommendationColor, type AIRecommendation, type AIRecommendationsResponse } from '@/services/aiRecommendations';

export default function AIRecommendations() {
  const { prospectId, funnelId } = useParams<{ prospectId: string; funnelId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [prospect, setProspect] = useState<Prospect | null>(null);
  const [funnel, setFunnel] = useState<Funnel | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [recommendations, setRecommendations] = useState<AIRecommendationsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

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

      setMetrics(metricsData);
    } catch (error) {
      console.error('Failed to load data:', error);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateRecommendations = async () => {
    if (!prospect || !funnel || !metrics) return;

    try {
      setGenerating(true);
      setError(null);

      // Perform gap analysis
      const gapAnalysis = analyzeGap(metrics, funnel);

      // Generate AI recommendations
      const result = await generateRecommendations(
        prospect,
        funnel,
        metrics,
        gapAnalysis,
        products
      );

      setRecommendations(result);
    } catch (error) {
      console.error('Failed to generate recommendations:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate recommendations. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const getPriorityBadgeVariant = (priority: AIRecommendation['priority']) => {
    const variants = {
      high: 'destructive' as const,
      medium: 'default' as const,
      low: 'secondary' as const,
    };
    return variants[priority];
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
            <h1 className="text-3xl font-bold">AI Recommendations</h1>
            <p className="text-muted-foreground">
              {prospect?.business_name} - {funnel?.funnel_name}
            </p>
          </div>
        </div>

        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>No Metrics Data</AlertTitle>
          <AlertDescription>
            Please input metrics data before generating AI recommendations.
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
        <div className="flex-1">
          <h1 className="text-3xl font-bold">AI Recommendations</h1>
          <p className="text-muted-foreground">
            {prospect?.business_name} - {funnel?.funnel_name}
          </p>
        </div>
        <Button
          onClick={handleGenerateRecommendations}
          disabled={generating}
          size="lg"
        >
          <Sparkles className="mr-2 h-4 w-4" />
          {generating ? 'Generating...' : recommendations ? 'Regenerate' : 'Generate Recommendations'}
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {generating && (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center space-y-4">
              <Sparkles className="h-12 w-12 text-primary animate-pulse" />
              <p className="text-lg font-medium">Analyzing your funnel with AI...</p>
              <p className="text-sm text-muted-foreground">This may take a few moments</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations Display */}
      {recommendations && !generating && (
        <>
          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-500" />
                Executive Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg mb-4">{recommendations.summary}</p>
              {recommendations.keyInsights.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold">Key Insights:</h4>
                  <ul className="space-y-2">
                    {recommendations.keyInsights.map((insight, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recommendations List */}
          <div className="space-y-4">
            {recommendations.recommendations.map((rec, index) => (
              <Card key={index} className={getRecommendationColor(rec.priority)}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <span className="text-3xl">{getRecommendationIcon(rec.category)}</span>
                      <div>
                        <CardTitle className="text-xl mb-2">{rec.title}</CardTitle>
                        <div className="flex gap-2">
                          <Badge variant={getPriorityBadgeVariant(rec.priority)}>
                            {rec.priority.toUpperCase()} PRIORITY
                          </Badge>
                          <Badge variant="outline">
                            {rec.category.charAt(0).toUpperCase() + rec.category.slice(1)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-base">{rec.description}</p>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-white rounded-lg border">
                      <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium">Expected Impact</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{rec.expectedImpact}</p>
                    </div>
                    <div className="p-3 bg-white rounded-lg border">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium">Implementation Time</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{rec.implementationTime}</p>
                    </div>
                  </div>

                  {rec.actionItems && rec.actionItems.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Action Items:</h4>
                      <ul className="space-y-2">
                        {rec.actionItems.map((item, itemIndex) => (
                          <li key={itemIndex} className="flex items-start gap-2">
                            <span className="text-primary font-bold mt-0.5">→</span>
                            <span className="text-sm">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Empty State */}
      {!recommendations && !generating && !error && (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center space-y-4">
              <Sparkles className="h-16 w-16 text-muted-foreground" />
              <h3 className="text-xl font-semibold">Ready to Generate AI Recommendations</h3>
              <p className="text-muted-foreground text-center max-w-md">
                Click the "Generate Recommendations" button to get AI-powered insights and actionable strategies tailored to your funnel.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
