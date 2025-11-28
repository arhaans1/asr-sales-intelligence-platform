# ASR Media Pro - Sales Intelligence Platform Requirements Document

## 1. Application Overview

### 1.1 Application Name
ASR Media Pro - Sales Intelligence Platform

### 1.2 Application Description
A comprehensive sales intelligence web application designed for performance marketing agencies in India. The platform transforms raw funnel metrics into actionable insights during live sales calls, helping sales closers diagnose funnel problems, prescribe solutions, and project outcomes in real-time. It serves as a strategic advisor for analyzing coaching, consulting, agency, and SaaS business funnels.

### 1.3 Target Market
- Primary Market: India
- Currency: INR (₹)
- Industry Focus: Coaches, Consultants, Agencies, SaaS companies
- Target Users: Sales closers, marketing strategists, agency teams

## 2. Core Functional Modules

### 2.1 Authentication & User Management
- Multi-role authentication system (super_admin, admin, closer)
- Super Admin capabilities:\n  - Create and manage user accounts
  - Assign user roles and permissions
  - View all user activities
- User-specific data isolation
- Secure login/logout with session management
- Password reset functionality
- NextAuth.js with credentials provider

### 2.2 Prospect Management\n- Complete CRUD operations for prospects
- Prospect Information Fields:
  - Business name
  - Contact name
  - Industry vertical (Coach/Consultant/Agency/SaaS)
  - Niche description
  - Current monthly revenue (₹)
  - Target monthly revenue (₹)
  - Timeline to target (months)
  - Notes/Context
- Status tracking: active, closed_won, closed_lost, archived
- Search and filter functionality
- Prospect history tracking

### 2.3 Product Stack Management (Dynamic)
- Add multiple products per prospect
- Product Fields:
  - Product name\n  - Product type (Course/Coaching/Service/Software)
  - Ticket price (₹)
  - Delivery method (1:1/Group/Self-Paced/Hybrid)
  - Fulfillment capacity (clients per month)
  - Current conversion rate (if known)
- Mark primary product
- Calculate blended metrics across multiple products

### 2.4 Funnel Configuration\n- Funnel Type Selection (Dropdown):
  1. 1:1 Sales Call Funnel
  2. Live Webinar Funnel
  3. Automated Webinar Funnel
  4. Challenge/Bootcamp Funnel (3-5 Day)
  5. Workshop Funnel (1-3 Day)
  6. Direct Sales Page Funnel
  7. Hybrid/Custom\n- Dynamic form fields based on selected funnel type
- Custom stage naming capability
- Funnel stage count configuration

### 2.5 Metrics Input Dashboard\n\n#### Traffic Metrics (Auto-calculated fields marked with *):
- Daily/Monthly Ad Spend (₹)
- Impressions
- Reach
- CPM (₹)
- Clicks (Link Clicks vs All Clicks)
- CTR (%)* \n- CPC (₹)*
- Landing Page Views
- Cost Per Landing Page View (₹)*
- Traffic Source Breakdown (optional)

#### Conversion Metrics:\n- Total Registrations/Leads
- Registration Rate (%)*
- Cost Per Lead (₹)*
- Qualified Leads (if applicable)
- Cost Per Qualified Lead (₹)*
- Lead Quality Score (1-10 subjective input)
\n#### Engagement Metrics (Funnel-Specific):
- Show-Ups/Attendees
- Show-Up Rate (%)*\n- Cost Per Attendee (₹)*
- Engagement Score (for challenges/workshops)
- Completion Rate (for challenges/workshops)
- Replay Views (for webinars)
\n#### Sales Metrics:
- Sales Calls Booked
- Sales Calls Completed
- Proposals/Offers Made
- Closes/Sales\n- Close Rate (%)*
- Revenue Generated (₹)\n- Average Order Value (₹)*
- Cost Per Acquisition (₹)*
- ROAS*

### 2.6 Gap Analysis Engine
\n#### India-Specific Benchmarks:
\n**1:1 Sales Call Funnel:**
- Landing Page → Application: 12-28%
- Application → Booked Call: 55-75%
- Show-Up Rate: 50-70%
- Close Rate: 15-25% (Industry avg: 20%)

**Webinar Funnel:**
- Registration Rate: 30-50%\n- Show-Up Rate (Live): 20-35%
- Show-Up Rate (Automated): 10-25%
- Pitch to Application: 3-10%
- Application to Close: 8-15% (Industry avg: 10%)
\n**Challenge/Bootcamp Funnel:**
- Registration Rate: 35-55%
- Day 1 Show-Up: 35-50%
- Day 5Retention: 10-22%
- Offer Conversion: 2-6% of registrants
- Close Rate: 8-15% (Industry avg: 10%)

**Workshop Funnel:**
- Registration Rate: 30-45%
- Attendance Rate: 25-40%
- Offer Conversion: 4-12%
\n**Direct Sales Page:**
- Sales Page Conversion: 0.8-3.5%
- Upsell Take Rate: 8-25%
\n#### Analysis Features:
- Benchmark comparison with color-coded indicators (Green/Yellow/Red)
- Percentage variance from benchmark
- Priority ranking of issues
- Primary bottleneck identification
- Secondary issues highlighting
- Opportunity areas (above benchmark)
- Strengths identification
- Root cause analysis suggestions

#### Visual Outputs:
- Funnel visualization with conversion rates at each stage
- Heat map showing problem areas
- Benchmark comparison bar charts
\n### 2.7 Projection Calculator

#### Reverse-Engineering Logic:
- Input: Target revenue (₹), Ticket price (₹)
- Calculate using India-specific conversion rates:\n  - Required sales/closes
  - Required sales calls
  - Required show-ups/attendees
  - Required registrations
  - Required landing page views
  - Required clicks\n  - Required budget (₹)
  - Projected ROAS
\n#### What-If Scenarios:
- Interactive slider controls to adjust assumptions
- Real-time recalculation\n- Side-by-side scenario comparison
- Gap percentage display (current vs required)

### 2.8 AI Recommendations (LLM Integration)

#### Technology:\n- Anthropic Claude API (claude-sonnet-4-20250514model)
\n#### Recommendation Categories:
\n**Immediate Optimizations:**
- Quick wins implementable in 1-2 weeks
- Specific tactics with expected impact in INR
- Priority order based on effort vs. impact
\n**Structural Changes:**
- Funnel modifications\n- Offer adjustments
- Audience targeting shifts
- Creative strategy changes

**Funnel Type Recommendations:**
- When current funnel is inappropriate for goals
- Suggested alternative funnel with reasoning
- Transition timeline\n- Expected performance difference
- Risk factors and mitigation strategies

**Creative & Campaign Structure:**
- Recommended number of ad creatives
- Creative types (UGC/Static/Video)\n- Campaign structure (CBO/ABO/ASC)
- Audience strategy\n- Testing cadence

**Budget Recommendations:**
- Minimum viable budget for goals (₹)
- Optimal budget for efficiency (₹)
- Scaling budget with projections (₹)
- Budget allocation by campaign type

#### LLM Context:
- India market-specific insights
- Industry benchmarks database
- Funnel optimization playbooks
- Meta ads best practices
- ASR Media Pro positioning and methodologies

### 2.9 Notes Module
- Rich text editor (headers, bullets, bold, italic)
- Auto-save functionality
- Timestamp entries
- Note tagging system:\n  - Objection\n  - Insight
  - Action Item
  - Follow-Up
- Link notes to specific metrics or recommendations
- Export to PDF/Doc

### 2.10 Visualization Dashboard
\n#### Chart Types (using Recharts):
\n**Funnel Visualization:**
- Stage-by-stage flow with drop-off percentages
- Comparison to benchmark funnel
- Animated flow transitions
\n**Projection Charts:**
- Revenue projection over time (line chart)
- Required metrics at each stage (bar chart)
- Budget vs. projected ROAS (combo chart)
- Scenario comparison (multi-line)\n
**Diagnostic Charts:**
- Metric vs. Benchmark (radar/spider chart)
- Gap severity heat map
- Priority matrix (effort vs. impact)
- Historical trend analysis

**Financial Charts:**
- Cost breakdown (pie chart)
- Revenue vs. spend over time
- CPA trend analysis
- ROAS by funnel stage

### 2.11 Session/Tab Management
- Multiple analysis sessions per prospect
- Save/load session functionality
- Name sessions (e.g., 'Initial Call', 'Follow-up Analysis')
- Auto-save functionality
- Session history tracking

### 2.12 Export Features
- Export analysis to PDF\n- Include all charts and recommendations
- Professional formatting with ASR Media Pro branding
- Customizable report templates

## 3. Technical Architecture
\n### 3.1 Frontend Stack
- Framework: Next.js 14 (App Router)
- Language: TypeScript
- Styling: Tailwind CSS
- Component Library: shadcn/ui\n- Charts: Recharts
- State Management: Zustand
- Forms: React Hook Form + Zod validation
- Animation: Framer Motion (optional)

### 3.2 Backend Stack
- Runtime: Next.js API Routes
- ORM: Prisma\n- Database: PostgreSQL
- Authentication: NextAuth.js with credentials provider
\n### 3.3 External Integrations
- LLM: Anthropic Claude API
\n## 4. UI/UX Design Specifications

### 4.1 Design Style\n\n**Theme:** Dark mode primary with professional, data-focused aesthetic

**Color Palette:**
- Background: #0F0F0F to #1A1A1A (deep black gradient)
- Surface: #2D2D2D (elevated cards)\n- Primary Accent: #3B82F6 (vibrant blue for CTAs and highlights)
- Success: #22C55E (green for positive metrics)
- Warning: #EAB308 (yellow for attention areas)
- Error: #EF4444 (red for critical issues)
- Text Primary: #FFFFFF (high contrast)
- Text Secondary: #A1A1AA (muted gray)

**Visual Elements:**
- Border Radius: 8px for cards, 6px for buttons (modern, slightly rounded)
- Shadows: Subtle elevation with multi-layer shadows for depth
- Typography: Inter or similar sans-serif, clear hierarchy with font weights 400-700
- Icons: Lucide React icon set,20-24px standard size
- Spacing: 8px base unit, consistent padding/margins

**Layout Structure:**
- Collapsible sidebar navigation (240px expanded, 64px collapsed)
- Fixed header with search, notifications, and profile dropdown
- Main content area with tabbed navigation for modules
- Responsive grid system (12-column)\n- Maximum content width: 1440px

### 4.2 Key Components
- Data input cards with INR currency formatting (₹X,XX,XXX)
- Metric display cards with trend indicators (up/down arrows, percentage change)
- Funnel flow visualization (vertical stages with conversion percentages)
- Comparison charts (current vs benchmark vs target)
- Recommendation cards with priority badges (High/Medium/Low)
- Rich text notes editor with toolbar
- Modal dialogs for confirmations\n- Toast notifications for user actions
- Loading skeletons for async operations
- Empty states with helpful guidance

### 4.3 Responsive Design
- Desktop-first approach (primary use case)
- Tablet optimization (closers may use iPads)
- Mobile-friendly for quick reference
- Breakpoints: 640px, 768px, 1024px, 1280px, 1536px

## 5. Key Calculations Reference

```typescript
// All monetary values in INR\n\n// Registration Rate\nregistrationRate = (registrations / landingPageViews) * 100

// Cost Per Lead
costPerLead = totalAdSpend / totalRegistrations

// Show-up Rate
showUpRate = (attendees / registrations) * 100
\n// Cost Per Attendee\ncostPerAttendee = totalAdSpend / attendees

// Close Rate
closeRate = (closes / salesCalls) * 100

// Cost Per Acquisition
cpa = totalAdSpend / closes

// Return on Ad Spend
roas = totalRevenue / totalAdSpend
\n// Average Order Value
aov = totalRevenue / numberOfOrders

// Reverse Calculations for Projections
requiredCloses = targetRevenue / ticketPrice
requiredCalls = requiredCloses / (closeRate / 100)
requiredAttendees = requiredCalls / (showUpRate / 100)
requiredRegistrations = requiredAttendees / (registrationToShowUpRate / 100)
requiredLPV = requiredRegistrations / (registrationRate / 100)
requiredBudget = requiredLPV * costPerLPV
```

## 6. Implementation Roadmap

### Phase 1: Foundation (Weeks 1-3)
- Set up Next.js 14 project with TypeScript, Tailwind CSS, shadcn/ui
- Configure Prisma with PostgreSQL\n- Implement NextAuth.js authentication system
- Create super admin panel for user management
- Build basic layout with sidebar navigation and header
- Set up role-based access control

### Phase 2: Core Features (Weeks 4-6)
- Prospect CRUD operations with search/filter
- Product stack management (dynamic add/edit/delete)
- Funnel session management (save/load/name)
- Metrics input forms with auto-calculations
- Currency formatting (INR with Indian number system)
- Form validation with Zod schemas
\n### Phase 3: Analysis Engine (Weeks 7-9)\n- Gap analysis with India-specific benchmarks
- Benchmark comparison logic with color-coding
- Projection calculator with reverse-engineering
- What-if scenario tool with sliders
- Funnel visualization chart\n- Comparison charts (current vs benchmark vs target)

### Phase 4: AI Integration (Weeks 10-11)
- Claude API integration\n- Prompt engineering with India market context
- Recommendation engine implementation
- Funnel advisor feature
- Response parsing and structured display
- Error handling for API failures

### Phase 5: Visualization & Notes (Weeks 12-13)\n- Recharts integration for all chart types
- Interactive funnel flow visualization
- Projection and diagnostic charts
- Rich text notes editor with tagging
- Note linking to metrics\n- Auto-save functionality
\n### Phase 6: Polish & Export (Week 14)
- PDF export with professional formatting
- ASR Media Pro branding integration
- UI/UX refinements and animations
- Performance optimization
- Mobile responsiveness testing
- Comprehensive error handling
- Loading states and empty states

### Phase 7: Testing & Launch (Week 15)
- User acceptance testing
- Load testing and performance benchmarking
- Security audit
- Documentation (user guides, API docs)
- Training materials for closers
- Production deployment\n\n## 7. Special Requirements

### 7.1 India Market Considerations
- All currency displays in INR with proper formatting (₹X,XX,XXX)
- Lakhs/Crores notation optional based on user preference
- India-specific benchmarks hardcoded in system
- LLM prompts include India market context
- Price sensitivity considerations in recommendations
- Trust-building factors emphasized in analysis

### 7.2 Data Handling
- Auto-save all user inputs every 30 seconds
- Prevent data loss with browser close warnings
- Session recovery on unexpected disconnects
- Data export capabilities for backup
\n### 7.3 Performance Requirements
- Page load time< 2 seconds
- Chart rendering < 1 second
- LLM response time < 10 seconds
- Real-time auto-calculations (< 100ms)
\n### 7.4 Security Requirements
- Secure password hashing (bcrypt)
- JWT-based session management
- Role-based access control enforcement
- SQL injection prevention (Prisma ORM)
- XSS protection\n- CSRF token validation

## 8. Success Metrics

### 8.1 Internal KPIs
- Time saved per sales call (target: 15+ minutes)
- Close rate improvement (track before/after)
- Proposal acceptance rate increase
- Average deal size growth
- Closer satisfaction score (1-10)

### 8.2 Usage Metrics
- Daily active users
- Sessions per user per day
- Average session duration
- Features used per session
- LLM queries per session
- Export frequency

### 8.3 Quality Metrics
- Recommendation accuracy (user feedback)
- Projection accuracy (actuals vs. predicted)
- System error rate (< 0.1%)
- LLM response quality rating
\n## 9. Future Enhancements (Post-Launch)
- Historical data tracking and trend analysis
- Multi-currency support for international expansion
- Integration with CRM systems
- Automated report scheduling
- Team collaboration features
- Mobile native apps (iOS/Android)
- White-label capabilities for agency partners
- Advanced AI features (predictive analytics, anomaly detection)