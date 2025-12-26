export type UserRole = 'super_admin' | 'admin' | 'closer';

export type ProspectStatus = 'active' | 'closed_won' | 'closed_lost' | 'archived';

export type IndustryVertical = 'Coach' | 'Consultant' | 'Agency' | 'SaaS';

export type ProductType = 'Course' | 'Coaching' | 'Service' | 'Software';

export type DeliveryMethod = '1:1' | 'Group' | 'Self-Paced' | 'Hybrid';

export type FunnelType =
  | '1:1 Sales Call Funnel'
  | 'Live Webinar Funnel'
  | 'Automated Webinar Funnel'
  | 'Challenge/Bootcamp Funnel'
  | 'Workshop Funnel'
  | 'Direct Sales Page Funnel'
  | 'Hybrid/Custom';

export type NoteTag = 'Objection' | 'Insight' | 'Action Item' | 'Follow-Up';

export interface Profile {
  id: string;
  username: string;
  full_name: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Prospect {
  id: string;
  user_id: string;
  business_name: string;
  contact_name: string;
  industry_vertical: string;
  niche_description: string | null;
  email: string | null;
  mobile: string | null;
  current_monthly_revenue: number;
  target_monthly_revenue: number;
  timeline_months: number;
  notes: string | null;
  status: ProspectStatus;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  prospect_id: string;
  product_name: string;
  product_type: string;
  ticket_price: number;
  delivery_method: string | null;
  fulfillment_capacity: number | null;
  current_conversion_rate: number | null;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export interface Funnel {
  id: string;
  prospect_id: string;
  funnel_type: string;
  funnel_name: string | null;
  stage_count: number;
  custom_stages: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface FunnelSession {
  id: string;
  prospect_id: string;
  funnel_id: string | null;
  session_name: string;
  session_data: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface Metrics {
  id: string;
  funnel_id: string;
  session_id: string | null;
  ad_spend: number;
  impressions: number;
  reach: number;
  cpm: number;
  clicks: number;
  ctr: number;
  cpc: number;
  landing_page_views: number;
  cost_per_lpv: number;
  registrations: number;
  registration_rate: number;
  cost_per_lead: number;
  qualified_leads: number;
  cost_per_qualified_lead: number;
  lead_quality_score: number;
  attendees: number;
  show_up_rate: number;
  cost_per_attendee: number;
  engagement_score: number;
  completion_rate: number;
  replay_views: number;
  sales_calls_booked: number;
  sales_calls_completed: number;
  proposals_made: number;
  closes: number;
  close_rate: number;
  revenue_generated: number;
  average_order_value: number;
  cost_per_acquisition: number;
  roas: number;
  created_at: string;
  updated_at: string;
}

export interface Note {
  id: string;
  prospect_id: string;
  session_id: string | null;
  content: string;
  tags: string[] | null;
  linked_metric: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProspectWithProducts extends Prospect {
  products?: Product[];
}

export interface ProspectWithDetails extends Prospect {
  products?: Product[];
  funnels?: Funnel[];
  sessions?: FunnelSession[];
}
