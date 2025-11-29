/*
# Create Initial Schema for ASR Media Pro

## 1. New Tables

### profiles
- `id` (uuid, primary key, references auth.users)
- `username` (text, unique, not null)
- `full_name` (text)
- `role` (user_role enum: super_admin, admin, closer, default: closer)
- `created_at` (timestamptz, default: now())
- `updated_at` (timestamptz, default: now())

### prospects
- `id` (uuid, primary key, default: gen_random_uuid())
- `user_id` (uuid, references profiles, not null)
- `business_name` (text, not null)
- `contact_name` (text, not null)
- `industry_vertical` (text, not null) - Coach/Consultant/Agency/SaaS
- `niche_description` (text)
- `current_monthly_revenue` (numeric, default: 0)
- `target_monthly_revenue` (numeric, default: 0)
- `timeline_months` (integer, default: 6)
- `notes` (text)
- `status` (text, default: 'active') - active, closed_won, closed_lost, archived
- `created_at` (timestamptz, default: now())
- `updated_at` (timestamptz, default: now())

### products
- `id` (uuid, primary key, default: gen_random_uuid())
- `prospect_id` (uuid, references prospects, not null, on delete cascade)
- `product_name` (text, not null)
- `product_type` (text, not null) - Course/Coaching/Service/Software
- `ticket_price` (numeric, not null)
- `delivery_method` (text) - 1:1/Group/Self-Paced/Hybrid
- `fulfillment_capacity` (integer) - clients per month
- `current_conversion_rate` (numeric) - percentage
- `is_primary` (boolean, default: false)
- `created_at` (timestamptz, default: now())
- `updated_at` (timestamptz, default: now())

### funnels
- `id` (uuid, primary key, default: gen_random_uuid())
- `prospect_id` (uuid, references prospects, not null, on delete cascade)
- `funnel_type` (text, not null) - 1:1 Sales Call/Live Webinar/Automated Webinar/Challenge/Workshop/Direct Sales Page/Hybrid
- `funnel_name` (text)
- `stage_count` (integer, default: 5)
- `custom_stages` (jsonb) - array of stage names
- `created_at` (timestamptz, default: now())
- `updated_at` (timestamptz, default: now())

### funnel_sessions
- `id` (uuid, primary key, default: gen_random_uuid())
- `prospect_id` (uuid, references prospects, not null, on delete cascade)
- `funnel_id` (uuid, references funnels, on delete set null)
- `session_name` (text, not null)
- `session_data` (jsonb) - stores all metrics and analysis data
- `created_at` (timestamptz, default: now())
- `updated_at` (timestamptz, default: now())

### metrics
- `id` (uuid, primary key, default: gen_random_uuid())
- `funnel_id` (uuid, references funnels, not null, on delete cascade)
- `session_id` (uuid, references funnel_sessions, on delete cascade)
- `ad_spend` (numeric, default: 0)
- `impressions` (integer, default: 0)
- `reach` (integer, default: 0)
- `cpm` (numeric, default: 0)
- `clicks` (integer, default: 0)
- `ctr` (numeric, default: 0)
- `cpc` (numeric, default: 0)
- `landing_page_views` (integer, default: 0)
- `cost_per_lpv` (numeric, default: 0)
- `registrations` (integer, default: 0)
- `registration_rate` (numeric, default: 0)
- `cost_per_lead` (numeric, default: 0)
- `qualified_leads` (integer, default: 0)
- `cost_per_qualified_lead` (numeric, default: 0)
- `lead_quality_score` (integer, default: 5)
- `attendees` (integer, default: 0)
- `show_up_rate` (numeric, default: 0)
- `cost_per_attendee` (numeric, default: 0)
- `engagement_score` (integer, default: 5)
- `completion_rate` (numeric, default: 0)
- `replay_views` (integer, default: 0)
- `sales_calls_booked` (integer, default: 0)
- `sales_calls_completed` (integer, default: 0)
- `proposals_made` (integer, default: 0)
- `closes` (integer, default: 0)
- `close_rate` (numeric, default: 0)
- `revenue_generated` (numeric, default: 0)
- `average_order_value` (numeric, default: 0)
- `cost_per_acquisition` (numeric, default: 0)
- `roas` (numeric, default: 0)
- `created_at` (timestamptz, default: now())
- `updated_at` (timestamptz, default: now())

### notes
- `id` (uuid, primary key, default: gen_random_uuid())
- `prospect_id` (uuid, references prospects, not null, on delete cascade)
- `session_id` (uuid, references funnel_sessions, on delete cascade)
- `content` (text, not null)
- `tags` (text[]) - array of tags: Objection, Insight, Action Item, Follow-Up
- `linked_metric` (text) - reference to specific metric
- `created_at` (timestamptz, default: now())
- `updated_at` (timestamptz, default: now())

## 2. Security

- Enable RLS on all tables
- Create `is_admin` helper function to check if user is super_admin or admin
- Policies:
  - Super admins and admins have full access to all data
  - Closers can only access their own data
  - Users can view and update their own profile (except role field)

## 3. Triggers

- Auto-sync trigger: When auth.users.confirmed_at changes from NULL to NOT NULL, create profile
- First user gets super_admin role, subsequent users get closer role
- Update triggers for updated_at timestamps

## 4. Notes

- All monetary values stored as numeric for precision
- JSONB used for flexible data storage (custom_stages, session_data)
- Cascade deletes ensure data integrity
- India-specific benchmarks will be hardcoded in frontend
*/

-- Create user role enum
CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'closer');

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  full_name text,
  role user_role DEFAULT 'closer'::user_role NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create prospects table
CREATE TABLE IF NOT EXISTS prospects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  business_name text NOT NULL,
  contact_name text NOT NULL,
  industry_vertical text NOT NULL,
  niche_description text,
  current_monthly_revenue numeric DEFAULT 0,
  target_monthly_revenue numeric DEFAULT 0,
  timeline_months integer DEFAULT 6,
  notes text,
  status text DEFAULT 'active' NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id uuid REFERENCES prospects(id) ON DELETE CASCADE NOT NULL,
  product_name text NOT NULL,
  product_type text NOT NULL,
  ticket_price numeric NOT NULL,
  delivery_method text,
  fulfillment_capacity integer,
  current_conversion_rate numeric,
  is_primary boolean DEFAULT false,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create funnels table
CREATE TABLE IF NOT EXISTS funnels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id uuid REFERENCES prospects(id) ON DELETE CASCADE NOT NULL,
  funnel_type text NOT NULL,
  funnel_name text,
  stage_count integer DEFAULT 5,
  custom_stages jsonb,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create funnel_sessions table
CREATE TABLE IF NOT EXISTS funnel_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id uuid REFERENCES prospects(id) ON DELETE CASCADE NOT NULL,
  funnel_id uuid REFERENCES funnels(id) ON DELETE SET NULL,
  session_name text NOT NULL,
  session_data jsonb,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create metrics table
CREATE TABLE IF NOT EXISTS metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  funnel_id uuid REFERENCES funnels(id) ON DELETE CASCADE NOT NULL,
  session_id uuid REFERENCES funnel_sessions(id) ON DELETE CASCADE,
  ad_spend numeric DEFAULT 0,
  impressions integer DEFAULT 0,
  reach integer DEFAULT 0,
  cpm numeric DEFAULT 0,
  clicks integer DEFAULT 0,
  ctr numeric DEFAULT 0,
  cpc numeric DEFAULT 0,
  landing_page_views integer DEFAULT 0,
  cost_per_lpv numeric DEFAULT 0,
  registrations integer DEFAULT 0,
  registration_rate numeric DEFAULT 0,
  cost_per_lead numeric DEFAULT 0,
  qualified_leads integer DEFAULT 0,
  cost_per_qualified_lead numeric DEFAULT 0,
  lead_quality_score integer DEFAULT 5,
  attendees integer DEFAULT 0,
  show_up_rate numeric DEFAULT 0,
  cost_per_attendee numeric DEFAULT 0,
  engagement_score integer DEFAULT 5,
  completion_rate numeric DEFAULT 0,
  replay_views integer DEFAULT 0,
  sales_calls_booked integer DEFAULT 0,
  sales_calls_completed integer DEFAULT 0,
  proposals_made integer DEFAULT 0,
  closes integer DEFAULT 0,
  close_rate numeric DEFAULT 0,
  revenue_generated numeric DEFAULT 0,
  average_order_value numeric DEFAULT 0,
  cost_per_acquisition numeric DEFAULT 0,
  roas numeric DEFAULT 0,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create notes table
CREATE TABLE IF NOT EXISTS notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id uuid REFERENCES prospects(id) ON DELETE CASCADE NOT NULL,
  session_id uuid REFERENCES funnel_sessions(id) ON DELETE CASCADE,
  content text NOT NULL,
  tags text[],
  linked_metric text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE prospects ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE funnels ENABLE ROW LEVEL SECURITY;
ALTER TABLE funnel_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Create helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(uid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = uid AND p.role IN ('super_admin'::user_role, 'admin'::user_role)
  );
$$;

-- Profiles policies
CREATE POLICY "Admins have full access to profiles" ON profiles
  FOR ALL TO authenticated USING (is_admin(auth.uid()));

CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users can update own profile without changing role" ON profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id)
  WITH CHECK (role IS NOT DISTINCT FROM (SELECT role FROM profiles WHERE id = auth.uid()));

-- Prospects policies
CREATE POLICY "Admins have full access to prospects" ON prospects
  FOR ALL TO authenticated USING (is_admin(auth.uid()));

CREATE POLICY "Users can manage own prospects" ON prospects
  FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Products policies
CREATE POLICY "Admins have full access to products" ON products
  FOR ALL TO authenticated USING (is_admin(auth.uid()));

CREATE POLICY "Users can manage products for own prospects" ON products
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM prospects WHERE prospects.id = products.prospect_id AND prospects.user_id = auth.uid())
  );

-- Funnels policies
CREATE POLICY "Admins have full access to funnels" ON funnels
  FOR ALL TO authenticated USING (is_admin(auth.uid()));

CREATE POLICY "Users can manage funnels for own prospects" ON funnels
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM prospects WHERE prospects.id = funnels.prospect_id AND prospects.user_id = auth.uid())
  );

-- Funnel sessions policies
CREATE POLICY "Admins have full access to funnel_sessions" ON funnel_sessions
  FOR ALL TO authenticated USING (is_admin(auth.uid()));

CREATE POLICY "Users can manage sessions for own prospects" ON funnel_sessions
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM prospects WHERE prospects.id = funnel_sessions.prospect_id AND prospects.user_id = auth.uid())
  );

-- Metrics policies
CREATE POLICY "Admins have full access to metrics" ON metrics
  FOR ALL TO authenticated USING (is_admin(auth.uid()));

CREATE POLICY "Users can manage metrics for own funnels" ON metrics
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM funnels f
      JOIN prospects p ON p.id = f.prospect_id
      WHERE f.id = metrics.funnel_id AND p.user_id = auth.uid()
    )
  );

-- Notes policies
CREATE POLICY "Admins have full access to notes" ON notes
  FOR ALL TO authenticated USING (is_admin(auth.uid()));

CREATE POLICY "Users can manage notes for own prospects" ON notes
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM prospects WHERE prospects.id = notes.prospect_id AND prospects.user_id = auth.uid())
  );

-- Create trigger function for auto-sync users to profiles
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_count int;
  extracted_username text;
BEGIN
  SELECT COUNT(*) INTO user_count FROM profiles;
  
  -- Extract username from email (remove @miaoda.com)
  extracted_username := REPLACE(NEW.email, '@miaoda.com', '');
  
  INSERT INTO profiles (id, username, role)
  VALUES (
    NEW.id,
    extracted_username,
    CASE WHEN user_count = 0 THEN 'super_admin'::user_role ELSE 'closer'::user_role END
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger for auto-sync
DROP TRIGGER IF EXISTS on_auth_user_confirmed ON auth.users;
CREATE TRIGGER on_auth_user_confirmed
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  WHEN (OLD.confirmed_at IS NULL AND NEW.confirmed_at IS NOT NULL)
  EXECUTE FUNCTION handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at on all tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prospects_updated_at BEFORE UPDATE ON prospects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_funnels_updated_at BEFORE UPDATE ON funnels
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_funnel_sessions_updated_at BEFORE UPDATE ON funnel_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_metrics_updated_at BEFORE UPDATE ON metrics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better query performance
CREATE INDEX idx_prospects_user_id ON prospects(user_id);
CREATE INDEX idx_prospects_status ON prospects(status);
CREATE INDEX idx_products_prospect_id ON products(prospect_id);
CREATE INDEX idx_funnels_prospect_id ON funnels(prospect_id);
CREATE INDEX idx_funnel_sessions_prospect_id ON funnel_sessions(prospect_id);
CREATE INDEX idx_metrics_funnel_id ON metrics(funnel_id);
CREATE INDEX idx_metrics_session_id ON metrics(session_id);
CREATE INDEX idx_notes_prospect_id ON notes(prospect_id);
CREATE INDEX idx_notes_session_id ON notes(session_id);