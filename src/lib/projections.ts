import type { Funnel } from '@/types/database';
import { FUNNEL_BENCHMARKS } from '@/lib/benchmarks';

export interface ProjectionInputs {
  targetRevenue: number;
  ticketPrice: number;
  closeRate?: number;
  showUpRate?: number;
  registrationRate?: number;
  ctr?: number;
  costPerClick?: number;
  costPerLead?: number;
}

export interface ProjectionResult {
  targetRevenue: number;
  requiredCloses: number;
  requiredSalesCalls: number;
  requiredAttendees: number;
  requiredRegistrations: number;
  requiredLandingPageViews: number;
  requiredClicks: number;
  requiredImpressions: number;
  requiredBudget: number;
  projectedROAS: number;
  assumptions: {
    closeRate: number;
    showUpRate: number;
    registrationRate: number;
    ctr: number;
    costPerClick: number;
    costPerLead: number;
  };
}

export interface ScenarioComparison {
  name: string;
  projection: ProjectionResult;
  gapPercentage: {
    revenue: number;
    closes: number;
    calls: number;
    attendees: number;
    registrations: number;
    budget: number;
  };
}

/**
 * Calculate projections using reverse-engineering logic
 */
export function calculateProjections(
  inputs: ProjectionInputs,
  funnel: Funnel,
  currentMetrics?: {
    closeRate?: number;
    showUpRate?: number;
    registrationRate?: number;
    ctr?: number;
    cpc?: number;
    costPerLead?: number;
  }
): ProjectionResult {
  const benchmarks = FUNNEL_BENCHMARKS[funnel.funnel_type as keyof typeof FUNNEL_BENCHMARKS];

  // Use provided values or fall back to benchmarks or current metrics
  const closeRate = inputs.closeRate ||
    currentMetrics?.closeRate ||
    (benchmarks?.close_rate?.average || 20);

  const showUpRate = inputs.showUpRate ||
    currentMetrics?.showUpRate ||
    (benchmarks?.show_up_rate?.average || 60);

  const registrationRate = inputs.registrationRate ||
    currentMetrics?.registrationRate ||
    (benchmarks?.registration_rate?.average || 40);

  const ctr = inputs.ctr ||
    currentMetrics?.ctr ||
    1.5; // Default CTR for India

  const costPerClick = inputs.costPerClick ||
    currentMetrics?.cpc ||
    15; // Default CPC in INR

  const costPerLead = inputs.costPerLead ||
    currentMetrics?.costPerLead ||
    150; // Default CPL in INR

  // Reverse calculations
  const requiredCloses = Math.ceil(inputs.targetRevenue / inputs.ticketPrice);
  const requiredSalesCalls = Math.ceil(requiredCloses / (closeRate / 100));
  const requiredAttendees = Math.ceil(requiredSalesCalls / (showUpRate / 100));
  const requiredRegistrations = Math.ceil(requiredAttendees / (showUpRate / 100));
  const requiredLandingPageViews = Math.ceil(requiredRegistrations / (registrationRate / 100));
  const requiredClicks = Math.ceil(requiredLandingPageViews / (ctr / 100));
  const requiredImpressions = Math.ceil(requiredClicks / (ctr / 100));
  const requiredBudget = Math.ceil(requiredClicks * costPerClick);
  const projectedROAS = inputs.targetRevenue / requiredBudget;

  return {
    targetRevenue: inputs.targetRevenue,
    requiredCloses,
    requiredSalesCalls,
    requiredAttendees,
    requiredRegistrations,
    requiredLandingPageViews,
    requiredClicks,
    requiredImpressions,
    requiredBudget,
    projectedROAS,
    assumptions: {
      closeRate,
      showUpRate,
      registrationRate,
      ctr,
      costPerClick,
      costPerLead,
    },
  };
}

/**
 * Calculate gap percentages between current and required metrics
 */
export function calculateGaps(
  projection: ProjectionResult,
  currentMetrics: {
    revenue?: number;
    closes?: number;
    salesCalls?: number;
    attendees?: number;
    registrations?: number;
    adSpend?: number;
  }
): ScenarioComparison['gapPercentage'] {
  const calculateGap = (current: number, required: number) => {
    if (current === 0) return 100;
    return ((required - current) / current) * 100;
  };

  return {
    revenue: calculateGap(currentMetrics.revenue || 0, projection.targetRevenue),
    closes: calculateGap(currentMetrics.closes || 0, projection.requiredCloses),
    calls: calculateGap(currentMetrics.salesCalls || 0, projection.requiredSalesCalls),
    attendees: calculateGap(currentMetrics.attendees || 0, projection.requiredAttendees),
    registrations: calculateGap(currentMetrics.registrations || 0, projection.requiredRegistrations),
    budget: calculateGap(currentMetrics.adSpend || 0, projection.requiredBudget),
  };
}

/**
 * Create scenario comparisons with different assumptions
 */
export function createScenarios(
  baseInputs: ProjectionInputs,
  funnel: Funnel,
  currentMetrics?: {
    closeRate?: number;
    showUpRate?: number;
    registrationRate?: number;
    ctr?: number;
    cpc?: number;
    costPerLead?: number;
    revenue?: number;
    closes?: number;
    salesCalls?: number;
    attendees?: number;
    registrations?: number;
    adSpend?: number;
  }
): ScenarioComparison[] {
  const benchmarks = FUNNEL_BENCHMARKS[funnel.funnel_type as keyof typeof FUNNEL_BENCHMARKS];

  // Scenario 1: Current Performance
  const currentScenario = calculateProjections(
    {
      ...baseInputs,
      closeRate: currentMetrics?.closeRate,
      showUpRate: currentMetrics?.showUpRate,
      registrationRate: currentMetrics?.registrationRate,
      ctr: currentMetrics?.ctr,
      costPerClick: currentMetrics?.cpc,
      costPerLead: currentMetrics?.costPerLead,
    },
    funnel,
    currentMetrics
  );

  // Scenario 2: Benchmark Performance
  const benchmarkScenario = calculateProjections(
    {
      ...baseInputs,
      closeRate: benchmarks?.close_rate?.average,
      showUpRate: benchmarks?.show_up_rate?.average,
      registrationRate: benchmarks?.registration_rate?.average,
    },
    funnel
  );

  // Scenario 3: Optimized Performance (top of benchmark range)
  const optimizedScenario = calculateProjections(
    {
      ...baseInputs,
      closeRate: benchmarks?.close_rate?.max,
      showUpRate: benchmarks?.show_up_rate?.max,
      registrationRate: benchmarks?.registration_rate?.max,
    },
    funnel
  );

  return [
    {
      name: 'Current Performance',
      projection: currentScenario,
      gapPercentage: calculateGaps(currentScenario, currentMetrics || {}),
    },
    {
      name: 'Benchmark Performance',
      projection: benchmarkScenario,
      gapPercentage: calculateGaps(benchmarkScenario, currentMetrics || {}),
    },
    {
      name: 'Optimized Performance',
      projection: optimizedScenario,
      gapPercentage: calculateGaps(optimizedScenario, currentMetrics || {}),
    },
  ];
}

/**
 * Calculate monthly timeline to reach target
 */
export function calculateTimeline(
  currentRevenue: number,
  targetRevenue: number,
  monthlyGrowthRate: number = 20 // Default 20% monthly growth
): {
  months: number;
  milestones: Array<{ month: number; revenue: number }>;
} {
  if (currentRevenue >= targetRevenue) {
    return { months: 0, milestones: [] };
  }

  const milestones: Array<{ month: number; revenue: number }> = [];
  let revenue = currentRevenue;
  let month = 0;

  while (revenue < targetRevenue && month < 24) { // Cap at 24 months
    month++;
    revenue = revenue * (1 + monthlyGrowthRate / 100);
    milestones.push({ month, revenue: Math.round(revenue) });
  }

  return { months: month, milestones };
}
