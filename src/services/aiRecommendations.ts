import type { Metrics, Funnel, Prospect, Product } from '@/types/database';
import type { GapAnalysisResult } from '@/lib/gapAnalysis';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

export interface AIRecommendation {
  category: 'immediate' | 'structural' | 'funnel' | 'creative' | 'budget';
  title: string;
  description: string;
  expectedImpact: string;
  implementationTime: string;
  priority: 'high' | 'medium' | 'low';
  actionItems: string[];
}

export interface AIRecommendationsResponse {
  recommendations: AIRecommendation[];
  summary: string;
  keyInsights: string[];
}

/**
 * Generate AI-powered recommendations using Gemini 2.5 Flash
 */
export async function generateRecommendations(
  prospect: Prospect,
  funnel: Funnel,
  metrics: Metrics,
  gapAnalysis: GapAnalysisResult,
  products: Product[]
): Promise<AIRecommendationsResponse> {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key not configured. Please set VITE_GEMINI_API_KEY in your environment.');
  }

  const prompt = buildPrompt(prospect, funnel, metrics, gapAnalysis, products);

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    return parseRecommendations(generatedText);
  } catch (error) {
    console.error('Failed to generate AI recommendations:', error);
    throw error;
  }
}

/**
 * Build the prompt for Gemini with India market context
 */
function buildPrompt(
  prospect: Prospect,
  funnel: Funnel,
  metrics: Metrics,
  gapAnalysis: GapAnalysisResult,
  products: Product[]
): string {
  const primaryProduct = products.find(p => p.is_primary) || products[0];

  return `You are an expert sales funnel consultant specializing in the India market for coaches, consultants, agencies, and SaaS companies. Analyze the following funnel data and provide actionable recommendations.

**Business Context:**
- Business: ${prospect.business_name}
- Industry: ${prospect.industry_vertical}
- Niche: ${prospect.niche_description || 'Not specified'}
- Current Monthly Revenue: ₹${prospect.current_monthly_revenue?.toLocaleString('en-IN') || 0}
- Target Monthly Revenue: ₹${prospect.target_monthly_revenue?.toLocaleString('en-IN') || 0}
- Primary Product: ${primaryProduct?.product_name || 'Not specified'}
- Ticket Price: ₹${primaryProduct?.ticket_price?.toLocaleString('en-IN') || 0}

**Funnel Configuration:**
- Funnel Type: ${funnel.funnel_type}
- Funnel Name: ${funnel.funnel_name || 'Not specified'}

**Current Metrics:**
- Ad Spend: ₹${metrics.ad_spend?.toLocaleString('en-IN') || 0}
- Registrations: ${metrics.registrations || 0}
- Registration Rate: ${metrics.registration_rate?.toFixed(2) || 0}%
- Attendees: ${metrics.attendees || 0}
- Show-Up Rate: ${metrics.show_up_rate?.toFixed(2) || 0}%
- Sales Calls Completed: ${metrics.sales_calls_completed || 0}
- Closes: ${metrics.closes || 0}
- Close Rate: ${metrics.close_rate?.toFixed(2) || 0}%
- Revenue Generated: ₹${metrics.revenue_generated?.toLocaleString('en-IN') || 0}
- ROAS: ${metrics.roas?.toFixed(2) || 0}x
- CTR: ${metrics.ctr?.toFixed(2) || 0}%
- CPC: ₹${metrics.cpc?.toFixed(2) || 0}
- Cost Per Lead: ₹${metrics.cost_per_lead?.toFixed(2) || 0}

**Gap Analysis:**
- Overall Health: ${gapAnalysis.overallHealth}
- Primary Bottleneck: ${gapAnalysis.primaryBottleneck?.metricName || 'None identified'}
${gapAnalysis.primaryBottleneck ? `  - Current: ${gapAnalysis.primaryBottleneck.currentValue.toFixed(2)}%` : ''}
${gapAnalysis.primaryBottleneck ? `  - Benchmark: ${gapAnalysis.primaryBottleneck.benchmarkMin.toFixed(2)}% - ${gapAnalysis.primaryBottleneck.benchmarkMax.toFixed(2)}%` : ''}
${gapAnalysis.primaryBottleneck ? `  - Variance: ${gapAnalysis.primaryBottleneck.variance.toFixed(2)}%` : ''}

**Key Issues:**
${gapAnalysis.secondaryIssues.map(issue => `- ${issue.metricName}: ${issue.variance.toFixed(1)}% ${issue.variance < 0 ? 'below' : 'above'} benchmark`).join('\n')}

**Opportunities:**
${gapAnalysis.opportunities.map(opp => `- ${opp.metricName}: ${opp.variance.toFixed(1)}% above benchmark`).join('\n')}

**Instructions:**
Provide recommendations in the following JSON format:

{
  "summary": "A brief 2-3 sentence executive summary of the funnel's current state and primary focus areas",
  "keyInsights": ["Insight 1", "Insight 2", "Insight 3"],
  "recommendations": [
    {
      "category": "immediate|structural|funnel|creative|budget",
      "title": "Recommendation title",
      "description": "Detailed description of the recommendation",
      "expectedImpact": "Expected impact in INR or percentage improvement",
      "implementationTime": "1-2 weeks|2-4 weeks|1-2 months",
      "priority": "high|medium|low",
      "actionItems": ["Action 1", "Action 2", "Action 3"]
    }
  ]
}

**Important Context for India Market:**
1. Cost considerations: India has lower CPCs and CPLs compared to Western markets
2. Trust factors: Social proof, testimonials, and community are crucial
3. Payment preferences: Consider EMI options, UPI payments, and price sensitivity
4. Language and localization: Consider regional language content if applicable
5. Mobile-first: Most traffic comes from mobile devices
6. Meta Ads best practices for India: Focus on video content, UGC, and relatable messaging

Provide 5-8 recommendations across different categories. Focus on actionable, specific tactics that can be implemented immediately or within 1-2 months. Include expected ROI in INR where possible.`;
}

/**
 * Parse the Gemini response into structured recommendations
 */
function parseRecommendations(generatedText: string): AIRecommendationsResponse {
  try {
    // Try to extract JSON from the response
    const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        summary: parsed.summary || 'AI-generated recommendations based on your funnel analysis.',
        keyInsights: Array.isArray(parsed.keyInsights) ? parsed.keyInsights : [],
        recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
      };
    }

    // Fallback: Return a default structure
    return {
      summary: 'Unable to parse AI recommendations. Please try again.',
      keyInsights: [],
      recommendations: [],
    };
  } catch (error) {
    console.error('Failed to parse recommendations:', error);
    return {
      summary: 'Error parsing AI recommendations.',
      keyInsights: [],
      recommendations: [],
    };
  }
}

/**
 * Get recommendation icon based on category
 */
export function getRecommendationIcon(category: AIRecommendation['category']): string {
  const icons = {
    immediate: '⚡',
    structural: '🏗️',
    funnel: '🎯',
    creative: '🎨',
    budget: '💰',
  };
  return icons[category] || '📋';
}

/**
 * Get recommendation color based on priority
 */
export function getRecommendationColor(priority: AIRecommendation['priority']): string {
  const colors = {
    high: 'border-red-200 bg-red-50',
    medium: 'border-yellow-200 bg-yellow-50',
    low: 'border-blue-200 bg-blue-50',
  };
  return colors[priority] || 'border-border bg-muted';
}
