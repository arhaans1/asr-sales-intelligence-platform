import { FUNNEL_BENCHMARKS } from '@/lib/benchmarks';
import type { Metrics, Funnel } from '@/types/database';

export type IndicatorStatus = 'excellent' | 'good' | 'warning' | 'critical' | 'unknown';
export type Priority = 'high' | 'medium' | 'low';

export interface MetricComparison {
  metricName: string;
  metricKey: keyof Metrics;
  currentValue: number;
  benchmarkMin: number;
  benchmarkMax: number;
  benchmarkAvg: number;
  variance: number; // Percentage difference from benchmark average
  status: IndicatorStatus;
  priority: Priority;
  isBottleneck: boolean;
  isOpportunity: boolean;
  recommendation: string;
}

export interface GapAnalysisResult {
  funnelType: string;
  overallHealth: IndicatorStatus;
  comparisons: MetricComparison[];
  primaryBottleneck: MetricComparison | null;
  secondaryIssues: MetricComparison[];
  opportunities: MetricComparison[];
  strengths: MetricComparison[];
}

/**
 * Determine the status based on variance from benchmark
 */
function getStatus(variance: number, isHigherBetter: boolean = true): IndicatorStatus {
  if (isHigherBetter) {
    if (variance >= 20) return 'excellent';
    if (variance >= 0) return 'good';
    if (variance >= -20) return 'warning';
    return 'critical';
  } else {
    // For metrics where lower is better (costs)
    if (variance <= -20) return 'excellent';
    if (variance <= 0) return 'good';
    if (variance <= 20) return 'warning';
    return 'critical';
  }
}

/**
 * Determine priority based on impact and variance
 */
function getPriority(variance: number, isBottleneck: boolean): Priority {
  if (isBottleneck) return 'high';
  if (Math.abs(variance) >= 30) return 'high';
  if (Math.abs(variance) >= 15) return 'medium';
  return 'low';
}

/**
 * Generate recommendation based on metric and variance
 */
function getRecommendation(
  metricName: string,
  status: IndicatorStatus
): string {
  if (status === 'excellent' || status === 'good') {
    return `${metricName} is performing well. Maintain current strategies.`;
  }

  const recommendations: Record<string, string> = {
    'Registration Rate': 'Improve landing page copy, add social proof, simplify form fields, test different headlines.',
    'Show-Up Rate': 'Send reminder emails/SMS, create urgency, improve event positioning, offer bonuses for attendance.',
    'Close Rate': 'Improve sales script, handle objections better, create urgency, offer payment plans, strengthen value proposition.',
    'CTR': 'Test new ad creatives, improve targeting, use more compelling hooks, add urgency to ad copy.',
    'Cost Per Lead': 'Optimize ad targeting, improve landing page conversion, test lower-cost traffic sources.',
    'Cost Per Attendee': 'Improve show-up rate through reminders, reduce ad spend waste, optimize targeting.',
    'ROAS': 'Focus on improving close rate and average order value, reduce acquisition costs, optimize entire funnel.',
  };

  return recommendations[metricName] || `${metricName} needs improvement. Analyze and optimize this metric.`;
}

/**
 * Perform gap analysis for a funnel's metrics
 */
export function analyzeGap(metrics: Metrics, funnel: Funnel): GapAnalysisResult {
  const benchmarks = FUNNEL_BENCHMARKS[funnel.funnel_type as keyof typeof FUNNEL_BENCHMARKS];

  if (!benchmarks) {
    return {
      funnelType: funnel.funnel_type,
      overallHealth: 'unknown',
      comparisons: [],
      primaryBottleneck: null,
      secondaryIssues: [],
      opportunities: [],
      strengths: [],
    };
  }

  const comparisons: MetricComparison[] = [];

  // Registration Rate
  if (metrics.registration_rate > 0 && benchmarks.registration_rate) {
    const benchmark = benchmarks.registration_rate;
    const benchmarkAvg = benchmark.average;
    const variance = ((metrics.registration_rate - benchmarkAvg) / benchmarkAvg) * 100;
    const status = getStatus(variance);

    comparisons.push({
      metricName: 'Registration Rate',
      metricKey: 'registration_rate',
      currentValue: metrics.registration_rate,
      benchmarkMin: benchmark.min,
      benchmarkMax: benchmark.max,
      benchmarkAvg,
      variance,
      status,
      priority: getPriority(variance, false),
      isBottleneck: variance < -20,
      isOpportunity: variance > 20,
      recommendation: getRecommendation('Registration Rate', status),
    });
  }

  // Show-Up Rate
  if (metrics.show_up_rate > 0 && benchmarks.show_up_rate) {
    const benchmark = benchmarks.show_up_rate;
    const benchmarkAvg = benchmark.average;
    const variance = ((metrics.show_up_rate - benchmarkAvg) / benchmarkAvg) * 100;
    const status = getStatus(variance);

    comparisons.push({
      metricName: 'Show-Up Rate',
      metricKey: 'show_up_rate',
      currentValue: metrics.show_up_rate,
      benchmarkMin: benchmark.min,
      benchmarkMax: benchmark.max,
      benchmarkAvg,
      variance,
      status,
      priority: getPriority(variance, false),
      isBottleneck: variance < -20,
      isOpportunity: variance > 20,
      recommendation: getRecommendation('Show-Up Rate', status),
    });
  }

  // Close Rate
  if (metrics.close_rate > 0 && benchmarks.close_rate) {
    const benchmark = benchmarks.close_rate;
    const benchmarkAvg = benchmark.average;
    const variance = ((metrics.close_rate - benchmarkAvg) / benchmarkAvg) * 100;
    const status = getStatus(variance);

    comparisons.push({
      metricName: 'Close Rate',
      metricKey: 'close_rate',
      currentValue: metrics.close_rate,
      benchmarkMin: benchmark.min,
      benchmarkMax: benchmark.max,
      benchmarkAvg,
      variance,
      status,
      priority: getPriority(variance, false),
      isBottleneck: variance < -20,
      isOpportunity: variance > 20,
      recommendation: getRecommendation('Close Rate', status),
    });
  }

  // CTR
  if (metrics.ctr > 0) {
    const benchmarkAvg = 1.5; // Industry average for India
    const variance = ((metrics.ctr - benchmarkAvg) / benchmarkAvg) * 100;
    const status = getStatus(variance);

    comparisons.push({
      metricName: 'CTR',
      metricKey: 'ctr',
      currentValue: metrics.ctr,
      benchmarkMin: 1.0,
      benchmarkMax: 2.5,
      benchmarkAvg,
      variance,
      status,
      priority: getPriority(variance, false),
      isBottleneck: variance < -30,
      isOpportunity: variance > 30,
      recommendation: getRecommendation('CTR', status),
    });
  }

  // Cost Per Lead
  if (metrics.cost_per_lead > 0 && metrics.ad_spend > 0) {
    const benchmarkAvg = 150; // Average CPL in INR for India
    const variance = ((metrics.cost_per_lead - benchmarkAvg) / benchmarkAvg) * 100;
    const status = getStatus(variance, false);

    comparisons.push({
      metricName: 'Cost Per Lead',
      metricKey: 'cost_per_lead',
      currentValue: metrics.cost_per_lead,
      benchmarkMin: 80,
      benchmarkMax: 250,
      benchmarkAvg,
      variance,
      status,
      priority: getPriority(variance, false),
      isBottleneck: metrics.cost_per_lead > benchmarkAvg * 1.5,
      isOpportunity: metrics.cost_per_lead < benchmarkAvg * 0.7,
      recommendation: getRecommendation('Cost Per Lead', status),
    });
  }

  // ROAS
  if (metrics.roas > 0) {
    const benchmarkAvg = 3.0; // Target ROAS
    const variance = ((metrics.roas - benchmarkAvg) / benchmarkAvg) * 100;
    const status = getStatus(variance);

    comparisons.push({
      metricName: 'ROAS',
      metricKey: 'roas',
      currentValue: metrics.roas,
      benchmarkMin: 2.0,
      benchmarkMax: 5.0,
      benchmarkAvg,
      variance,
      status,
      priority: getPriority(variance, true),
      isBottleneck: variance < -30,
      isOpportunity: variance > 30,
      recommendation: getRecommendation('ROAS', status),
    });
  }

  // Sort by priority and variance
  comparisons.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return Math.abs(b.variance) - Math.abs(a.variance);
  });

  // Identify bottlenecks, opportunities, and strengths
  const bottlenecks = comparisons.filter(c => c.isBottleneck);
  const opportunities = comparisons.filter(c => c.isOpportunity);
  const strengths = comparisons.filter(c => c.status === 'excellent' || c.status === 'good');
  const issues = comparisons.filter(c => c.status === 'warning' || c.status === 'critical');

  // Calculate overall health
  const avgStatus = comparisons.reduce((sum, c) => {
    const statusScore = { excellent: 4, good: 3, warning: 2, critical: 1, unknown: 0 };
    return sum + statusScore[c.status];
  }, 0) / comparisons.length;

  let overallHealth: IndicatorStatus = 'unknown';
  if (avgStatus >= 3.5) overallHealth = 'excellent';
  else if (avgStatus >= 2.5) overallHealth = 'good';
  else if (avgStatus >= 1.5) overallHealth = 'warning';
  else overallHealth = 'critical';

  return {
    funnelType: funnel.funnel_type,
    overallHealth,
    comparisons,
    primaryBottleneck: bottlenecks[0] || null,
    secondaryIssues: issues.slice(0, 3),
    opportunities,
    strengths,
  };
}

/**
 * Get color class for status indicator
 */
export function getStatusColor(status: IndicatorStatus): string {
  const colors = {
    excellent: 'text-green-600 bg-green-50 border-green-200',
    good: 'text-green-600 bg-green-50 border-green-200',
    warning: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    critical: 'text-red-600 bg-red-50 border-red-200',
    unknown: 'text-muted-foreground bg-muted border-border',
  };
  return colors[status];
}

/**
 * Get badge color for status
 */
export function getStatusBadgeVariant(status: IndicatorStatus): 'default' | 'secondary' | 'destructive' | 'outline' {
  const variants = {
    excellent: 'default' as const,
    good: 'secondary' as const,
    warning: 'outline' as const,
    critical: 'destructive' as const,
    unknown: 'outline' as const,
  };
  return variants[status];
}
