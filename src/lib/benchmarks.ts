import type { FunnelType } from '@/types/database';

export interface BenchmarkRange {
  min: number;
  max: number;
  average: number;
  label: string;
}

export interface FunnelBenchmarks {
  [key: string]: BenchmarkRange;
}

export const FUNNEL_BENCHMARKS: Record<FunnelType, FunnelBenchmarks> = {
  '1:1 Sales Call Funnel': {
    landing_to_application: {
      min: 12,
      max: 28,
      average: 20,
      label: 'Landing Page → Application',
    },
    application_to_booked: {
      min: 55,
      max: 75,
      average: 65,
      label: 'Application → Booked Call',
    },
    show_up_rate: {
      min: 50,
      max: 70,
      average: 60,
      label: 'Show-Up Rate',
    },
    close_rate: {
      min: 15,
      max: 25,
      average: 20,
      label: 'Close Rate',
    },
  },
  'Live Webinar Funnel': {
    registration_rate: {
      min: 30,
      max: 50,
      average: 40,
      label: 'Registration Rate',
    },
    show_up_rate: {
      min: 20,
      max: 35,
      average: 27.5,
      label: 'Show-Up Rate (Live)',
    },
    pitch_to_application: {
      min: 3,
      max: 10,
      average: 6.5,
      label: 'Pitch → Application',
    },
    application_to_close: {
      min: 8,
      max: 15,
      average: 10,
      label: 'Application → Close',
    },
  },
  'Automated Webinar Funnel': {
    registration_rate: {
      min: 30,
      max: 50,
      average: 40,
      label: 'Registration Rate',
    },
    show_up_rate: {
      min: 10,
      max: 25,
      average: 17.5,
      label: 'Show-Up Rate (Automated)',
    },
    pitch_to_application: {
      min: 3,
      max: 10,
      average: 6.5,
      label: 'Pitch → Application',
    },
    application_to_close: {
      min: 8,
      max: 15,
      average: 10,
      label: 'Application → Close',
    },
  },
  'Challenge/Bootcamp Funnel': {
    registration_rate: {
      min: 35,
      max: 55,
      average: 45,
      label: 'Registration Rate',
    },
    day1_show_up: {
      min: 35,
      max: 50,
      average: 42.5,
      label: 'Day 1 Show-Up',
    },
    day5_retention: {
      min: 10,
      max: 22,
      average: 16,
      label: 'Day 5 Retention',
    },
    offer_conversion: {
      min: 2,
      max: 6,
      average: 4,
      label: 'Offer Conversion (% of registrants)',
    },
    close_rate: {
      min: 8,
      max: 15,
      average: 10,
      label: 'Close Rate',
    },
  },
  'Workshop Funnel': {
    registration_rate: {
      min: 30,
      max: 45,
      average: 37.5,
      label: 'Registration Rate',
    },
    attendance_rate: {
      min: 25,
      max: 40,
      average: 32.5,
      label: 'Attendance Rate',
    },
    offer_conversion: {
      min: 4,
      max: 12,
      average: 8,
      label: 'Offer Conversion',
    },
  },
  'Direct Sales Page Funnel': {
    sales_page_conversion: {
      min: 0.8,
      max: 3.5,
      average: 2.15,
      label: 'Sales Page Conversion',
    },
    upsell_take_rate: {
      min: 8,
      max: 25,
      average: 16.5,
      label: 'Upsell Take Rate',
    },
  },
  'Hybrid/Custom': {
    registration_rate: {
      min: 25,
      max: 50,
      average: 37.5,
      label: 'Registration Rate',
    },
    show_up_rate: {
      min: 20,
      max: 60,
      average: 40,
      label: 'Show-Up Rate',
    },
    close_rate: {
      min: 10,
      max: 25,
      average: 17.5,
      label: 'Close Rate',
    },
  },
};

export interface GapAnalysisResult {
  metric: string;
  current: number;
  benchmark: BenchmarkRange;
  variance: number;
  status: 'excellent' | 'good' | 'warning' | 'critical';
  priority: number;
}

export function analyzeGaps(
  funnelType: FunnelType,
  metrics: Record<string, number>
): GapAnalysisResult[] {
  const benchmarks = FUNNEL_BENCHMARKS[funnelType];
  const results: GapAnalysisResult[] = [];

  for (const [key, benchmark] of Object.entries(benchmarks)) {
    const current = metrics[key] || 0;
    const variance = ((current - benchmark.average) / benchmark.average) * 100;

    let status: GapAnalysisResult['status'];
    let priority: number;

    if (current >= benchmark.max) {
      status = 'excellent';
      priority = 4;
    } else if (current >= benchmark.average) {
      status = 'good';
      priority = 3;
    } else if (current >= benchmark.min) {
      status = 'warning';
      priority = 2;
    } else {
      status = 'critical';
      priority = 1;
    }

    results.push({
      metric: benchmark.label,
      current,
      benchmark,
      variance,
      status,
      priority,
    });
  }

  return results.sort((a, b) => a.priority - b.priority);
}

export function identifyBottleneck(results: GapAnalysisResult[]): GapAnalysisResult | null {
  const criticalIssues = results.filter(r => r.status === 'critical');
  if (criticalIssues.length > 0) {
    return criticalIssues.reduce((worst, current) =>
      current.variance < worst.variance ? current : worst
    );
  }

  const warnings = results.filter(r => r.status === 'warning');
  if (warnings.length > 0) {
    return warnings.reduce((worst, current) =>
      current.variance < worst.variance ? current : worst
    );
  }

  return null;
}

export function identifyOpportunities(results: GapAnalysisResult[]): GapAnalysisResult[] {
  return results.filter(r => r.status === 'excellent' || r.status === 'good');
}
