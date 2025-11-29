import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type Params = Partial<
  Record<keyof URLSearchParams, string | number | null | undefined>
>;

export function createQueryString(
  params: Params,
  searchParams: URLSearchParams
) {
  const newSearchParams = new URLSearchParams(searchParams?.toString());

  for (const [key, value] of Object.entries(params)) {
    if (value === null || value === undefined) {
      newSearchParams.delete(key);
    } else {
      newSearchParams.set(key, String(value));
    }
  }

  return newSearchParams.toString();
}

export function formatDate(
  date: Date | string | number,
  opts: Intl.DateTimeFormatOptions = {}
) {
  return new Intl.DateTimeFormat("en-IN", {
    month: opts.month ?? "long",
    day: opts.day ?? "numeric",
    year: opts.year ?? "numeric",
    ...opts,
  }).format(new Date(date));
}

export function formatINR(amount: number, decimals = 0): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
}

export function formatNumber(num: number, decimals = 0): string {
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}

export function formatPercentage(value: number, decimals = 2): string {
  return `${value.toFixed(decimals)}%`;
}

export function calculateMetrics(data: {
  ad_spend?: number;
  impressions?: number;
  clicks?: number;
  landing_page_views?: number;
  registrations?: number;
  attendees?: number;
  sales_calls_completed?: number;
  closes?: number;
  revenue_generated?: number;
}) {
  const {
    ad_spend = 0,
    impressions = 0,
    clicks = 0,
    landing_page_views = 0,
    registrations = 0,
    attendees = 0,
    sales_calls_completed = 0,
    closes = 0,
    revenue_generated = 0,
  } = data;

  const cpm = impressions > 0 ? (ad_spend / impressions) * 1000 : 0;
  const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
  const cpc = clicks > 0 ? ad_spend / clicks : 0;
  const cost_per_lpv = landing_page_views > 0 ? ad_spend / landing_page_views : 0;
  const registration_rate = landing_page_views > 0 ? (registrations / landing_page_views) * 100 : 0;
  const cost_per_lead = registrations > 0 ? ad_spend / registrations : 0;
  const show_up_rate = registrations > 0 ? (attendees / registrations) * 100 : 0;
  const cost_per_attendee = attendees > 0 ? ad_spend / attendees : 0;
  const close_rate = sales_calls_completed > 0 ? (closes / sales_calls_completed) * 100 : 0;
  const average_order_value = closes > 0 ? revenue_generated / closes : 0;
  const cost_per_acquisition = closes > 0 ? ad_spend / closes : 0;
  const roas = ad_spend > 0 ? revenue_generated / ad_spend : 0;

  return {
    cpm,
    ctr,
    cpc,
    cost_per_lpv,
    registration_rate,
    cost_per_lead,
    show_up_rate,
    cost_per_attendee,
    close_rate,
    average_order_value,
    cost_per_acquisition,
    roas,
  };
}

export function reverseCalculateMetrics(params: {
  target_revenue: number;
  ticket_price: number;
  close_rate: number;
  show_up_rate: number;
  registration_rate: number;
  cost_per_lpv: number;
}) {
  const {
    target_revenue,
    ticket_price,
    close_rate,
    show_up_rate,
    registration_rate,
    cost_per_lpv,
  } = params;

  const required_closes = ticket_price > 0 ? target_revenue / ticket_price : 0;
  const required_calls = close_rate > 0 ? required_closes / (close_rate / 100) : 0;
  const required_attendees = show_up_rate > 0 ? required_calls / (show_up_rate / 100) : 0;
  const required_registrations = show_up_rate > 0 ? required_attendees / (show_up_rate / 100) : 0;
  const required_lpv = registration_rate > 0 ? required_registrations / (registration_rate / 100) : 0;
  const required_budget = required_lpv * cost_per_lpv;
  const projected_roas = required_budget > 0 ? target_revenue / required_budget : 0;

  return {
    required_closes,
    required_calls,
    required_attendees,
    required_registrations,
    required_lpv,
    required_budget,
    projected_roas,
  };
}
