import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { sessionsApi, prospectsApi } from '@/services/api';
import type { Prospect } from '@/types/database';
import { toast } from 'sonner';
import { Loader2, Calculator } from 'lucide-react';
import { formatINR } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

interface SalesDataFormProps {
    prospect: Prospect;
    onUpdate: () => void;
}

interface QuestionnaireData {
    // Questions 1-19
    business_name: string;
    who_do_you_help: string;
    how_do_you_help: string;
    why_this: string;
    customers_served: string;
    competitors: string;
    better_different: string;
    charge_amount: string; // "How much do you charge?"
    l1_price: number;
    l2_price: number;
    l3_price: number;
    current_funnel: string;
    monthly_ad_spend: number;
    total_leads: number; // registrations
    total_calls: number; // attendees
    total_sales: number;
    current_monthly_revenue: number; // Also on prospect
    target_monthly_revenue: number; // Also on prospect
    biggest_blocker: string;
}

export function SalesDataForm({ prospect, onUpdate }: SalesDataFormProps) {
    const [loading, setLoading] = useState(false);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [calculatedStats, setCalculatedStats] = useState<any>(null);

    const form = useForm<QuestionnaireData>({
        defaultValues: {
            business_name: prospect.business_name || '',
            who_do_you_help: '',
            how_do_you_help: '',
            why_this: '',
            customers_served: '',
            competitors: '',
            better_different: '',
            charge_amount: '',
            l1_price: 0,
            l2_price: 0,
            l3_price: 0,
            current_funnel: '',
            monthly_ad_spend: 0,
            total_leads: 0,
            total_calls: 0,
            total_sales: 0,
            current_monthly_revenue: prospect.current_monthly_revenue || 0,
            target_monthly_revenue: prospect.target_monthly_revenue || 0,
            biggest_blocker: '',
        },
    });



    useEffect(() => {
        loadSessionData();
    }, [prospect.id]);

    const loadSessionData = async () => {
        try {
            // Find existing 'General Data' session or create one
            const sessions = await sessionsApi.getByProspectId(prospect.id);
            const dataSession = sessions.find(s => s.session_name === 'General Data');

            if (dataSession) {
                setSessionId(dataSession.id);
                if (dataSession.session_data) {
                    const data = dataSession.session_data as any;
                    // Merge with current prospect data (prospect data takes precedence for shared fields)
                    form.reset({
                        ...data,
                        business_name: prospect.business_name,
                        current_monthly_revenue: prospect.current_monthly_revenue,
                        target_monthly_revenue: prospect.target_monthly_revenue,
                    });

                    // Also trigger calculation if data exists
                    calculateStats(data);
                    toast.success('Debug: Data loaded successfully');
                } else {
                    toast.warning('Debug: Session found but has no data');
                }
            } else {
                // intentally silent if new prospect, but for debug:
                // toast.info('Debug: No saved session found for this prospect');
            }
        } catch (error: any) {
            console.error('Error loading session data:', error);
            toast.error(`Error loading data: ${error.message}`);
        }
    };

    const calculateStats = (data: QuestionnaireData) => {
        const totalLeads = Number(data.total_leads) || 0;
        const totalCalls = Number(data.total_calls) || 0;
        const totalSales = Number(data.total_sales) || 0;
        const currentRev = Number(data.current_monthly_revenue) || 0;
        const targetRev = Number(data.target_monthly_revenue) || 0;
        const adSpend = Number(data.monthly_ad_spend) || 0;

        // Prices
        const l1 = Number(data.l1_price) || 0;
        const l2 = Number(data.l2_price) || 0;
        const l3 = Number(data.l3_price) || 0;

        // 1. Attendance Rate
        const attendanceRate = totalLeads > 0 ? (totalCalls / totalLeads) : 0;

        // 2. Sales Conversion Rate (Sales / Attendees)
        const salesConvRate = totalCalls > 0 ? (totalSales / totalCalls) : 0;

        // New Metrics
        const costPerLead = totalLeads > 0 ? adSpend / totalLeads : 0;
        const costPerAttendee = totalCalls > 0 ? adSpend / totalCalls : 0;

        // "Effective Value" Calculation (Upsell Logic)
        // Base = L1. If L2 exists, +10% of L2. If L3 exists, +1% of L3.
        let effectiveValue = l1;
        if (l2 > 0) effectiveValue += (l2 * 0.10);
        if (l3 > 0) effectiveValue += (l3 * 0.01);

        // AOV for historical data (fallback to effectiveValue if 0)
        let aov = totalSales > 0 ? currentRev / totalSales : 0;
        if (aov === 0) aov = effectiveValue;

        // 3. Sales needed to hit target (Using Effective Value for projection)
        // detailed logic: Target / EffectiveValue per customer
        const salesNeededForTarget = effectiveValue > 0 ? Math.ceil(targetRev / effectiveValue) : 0;

        // 4. Ad Spend Required
        // CPA Logic: If we have historical CPA, use it. Else estimate.
        let cpa = totalSales > 0 ? adSpend / totalSales : 0;

        if (cpa === 0 && effectiveValue > 0) {
            // Est. CPA = Est. CPL / Est. Conv
            // If we have CPL, use it. Else assume CPL is roughly 10% of L1 (heuristic) or 0.
            let estCpl = costPerLead > 0 ? costPerLead : 0;

            // If no CPL data, we can't really guess perfectly, but let's try:
            if (estCpl === 0 && adSpend > 0 && totalLeads > 0) estCpl = adSpend / totalLeads;

            // Conversion: Use actual if exists, else 5% (0.05) default
            const estConv = (attendanceRate > 0 && salesConvRate > 0)
                ? (attendanceRate * salesConvRate)
                : 0.05;

            if (estCpl > 0) {
                cpa = estCpl / estConv;
            }
        }

        const adSpendRequiredRaw = salesNeededForTarget * cpa;
        const adSpendRequiredWithBuffer = adSpendRequiredRaw * 1.2; // 20% buffer

        // 5. 50% Attendance Rate Scenario
        let scenarioAdSpend = 0;

        if (attendanceRate < 0.5 && effectiveValue > 0) {
            // Scenario: 50% attendance, same conversion rate
            const targetAttendance = 0.5;
            const currentConv = salesConvRate > 0 ? salesConvRate : 0.1;

            // L1 Sales Needed stays same (based on Revenue Target)
            // Leads = Sales / (0.5 * Conv)
            const leadsNeededScenario = salesNeededForTarget / (targetAttendance * currentConv);

            const cpl = costPerLead > 0 ? costPerLead : 0;

            if (cpl > 0) {
                scenarioAdSpend = (leadsNeededScenario * cpl) * 1.2;
            }
        } else {
            scenarioAdSpend = adSpendRequiredWithBuffer;
        }

        setCalculatedStats({
            attendanceRate,
            salesConvRate,
            costPerLead,
            costPerAttendee,
            salesNeededForTarget,
            adSpendRequiredWithBuffer,
            scenarioAdSpend,
            effectiveValue,
            isLowAttendance: attendanceRate < 0.5 && attendanceRate >= 0
        });
    };

    const onSubmit = async (data: QuestionnaireData) => {
        setLoading(true);
        try {
            // Sanitize numeric fields (handle empty strings as 0)
            const numericData = {
                ...data,
                l1_price: Number(data.l1_price) || 0,
                l2_price: Number(data.l2_price) || 0,
                l3_price: Number(data.l3_price) || 0,
                monthly_ad_spend: Number(data.monthly_ad_spend) || 0,
                total_leads: Number(data.total_leads) || 0,
                total_calls: Number(data.total_calls) || 0,
                total_sales: Number(data.total_sales) || 0,
                current_monthly_revenue: Number(data.current_monthly_revenue) || 0,
                target_monthly_revenue: Number(data.target_monthly_revenue) || 0,
            };

            // 1. Update Prospect Table fields
            await prospectsApi.update(prospect.id, {
                business_name: data.business_name,
                current_monthly_revenue: numericData.current_monthly_revenue,
                target_monthly_revenue: numericData.target_monthly_revenue,
            });

            // 2. Save full data to Session
            const sessionData = {
                prospect_id: prospect.id,
                session_name: 'General Data',
                session_data: numericData as unknown as Record<string, unknown>,
            };

            if (sessionId) {
                await sessionsApi.update(sessionId, sessionData);
            } else {
                const newSession = await sessionsApi.create({
                    ...sessionData,
                    funnel_id: null,
                });
                setSessionId(newSession.id);
            }

            // 3. Perform Calculations Logic
            calculateStats(numericData);

            toast.success('Data saved & calculated successfully');
            onUpdate();
        } catch (error: any) {
            console.error('Error saving data:', error);
            const errorMessage = error.message || 'Unknown error occurred';
            toast.error(`Failed to save data: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Sales Questions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* 1. Business Name */}
                        <div className="grid gap-2">
                            <Label>1. Business Name</Label>
                            <Input {...form.register('business_name')} />
                        </div>

                        {/* 2. Who do you help? */}
                        <div className="grid gap-2">
                            <Label>2. Who do you help?</Label>
                            <Input {...form.register('who_do_you_help')} />
                        </div>

                        {/* 3. How do you help? */}
                        <div className="grid gap-2">
                            <Label>3. How do you help?</Label>
                            <Input {...form.register('how_do_you_help')} />
                        </div>

                        {/* 4. Why this? */}
                        <div className="grid gap-2">
                            <Label>4. Why this? and how did you get into this?</Label>
                            <Textarea {...form.register('why_this')} />
                        </div>

                        {/* 5. Customers served */}
                        <div className="grid gap-2">
                            <Label>5. How many customers have you served so far?</Label>
                            <Input {...form.register('customers_served')} />
                        </div>

                        {/* 6. Competitors */}
                        <div className="grid gap-2">
                            <Label>6. Name top 3 competitors</Label>
                            <Input {...form.register('competitors')} />
                        </div>

                        {/* 7. Better/Different */}
                        <div className="grid gap-2">
                            <Label>7. How are you better/different from them?</Label>
                            <Textarea {...form.register('better_different')} />
                        </div>

                        {/* 8-10. Prices (Renumbred) */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="grid gap-2">
                                <Label>8. L1 Price</Label>
                                <Input type="number" {...form.register('l1_price')} />
                            </div>
                            <div className="grid gap-2">
                                <Label>9. L2 Price</Label>
                                <Input type="number" {...form.register('l2_price')} />
                            </div>
                            <div className="grid gap-2">
                                <Label>10. L3 Price</Label>
                                <Input type="number" {...form.register('l3_price')} />
                            </div>
                        </div>

                        {/* 11. Funnel */}
                        <div className="grid gap-2">
                            <Label>11. Your current funnel? (Webinar, Workshop, 1-1 HT)</Label>
                            <Input {...form.register('current_funnel')} />
                        </div>

                        {/* 12. Ad Spend */}
                        <div className="grid gap-2">
                            <Label>12. Monthly Ad Spend (₹)</Label>
                            <Input type="number" {...form.register('monthly_ad_spend')} />
                        </div>

                        {/* 13-15. Funnel Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="grid gap-2">
                                <Label>13. Total leads/registrations</Label>
                                <Input type="number" {...form.register('total_leads')} />
                            </div>
                            <div className="grid gap-2">
                                <Label>14. Total calls/attendees</Label>
                                <Input type="number" {...form.register('total_calls')} />
                            </div>
                            <div className="grid gap-2">
                                <Label>15. Total sales</Label>
                                <Input type="number" {...form.register('total_sales')} />
                            </div>
                        </div>

                        {/* 16. Current Revenue */}
                        <div className="grid gap-2">
                            <Label>16. Current monthly revenue (₹)</Label>
                            <Input type="number" {...form.register('current_monthly_revenue')} />
                        </div>

                        {/* 17. Target Revenue */}
                        <div className="grid gap-2">
                            <Label>17. Target monthly revenue (₹)</Label>
                            <Input type="number" {...form.register('target_monthly_revenue')} />
                        </div>

                        {/* 18. Biggest Blocker */}
                        <div className="grid gap-2">
                            <Label>18. Biggest blocker in your opinion</Label>
                            <Textarea {...form.register('biggest_blocker')} />
                        </div>
                    </CardContent>
                </Card>

                {/* Calculations Section */}
                {calculatedStats && (
                    <Card className="bg-muted/50 transition-all duration-500 animate-in fade-in slide-in-from-top-4">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Calculator className="h-5 w-5 text-primary" />
                                <CardTitle>Auto Calculations</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="space-y-1">
                                    <Label className="text-muted-foreground">Attendance Rate</Label>
                                    <div className="text-2xl font-bold">{(calculatedStats.attendanceRate * 100).toFixed(1)}%</div>
                                    <p className="text-xs text-muted-foreground">Registrations to Attendees</p>
                                </div>

                                <div className="space-y-1">
                                    <Label className="text-muted-foreground">Sales Conversion</Label>
                                    <div className="text-2xl font-bold">{(calculatedStats.salesConvRate * 100).toFixed(1)}%</div>
                                    <p className="text-xs text-muted-foreground">Attendees to Sales</p>
                                </div>

                                <div className="space-y-1">
                                    <Label className="text-muted-foreground">Cost Per Lead (CPL)</Label>
                                    <div className="text-2xl font-bold">{formatINR(calculatedStats.costPerLead)}</div>
                                    <p className="text-xs text-muted-foreground">Ad Spend / Leads</p>
                                </div>

                                <div className="space-y-1">
                                    <Label className="text-muted-foreground">Cost Per Attendee</Label>
                                    <div className="text-2xl font-bold">{formatINR(calculatedStats.costPerAttendee)}</div>
                                    <p className="text-xs text-muted-foreground">Ad Spend / Attendees</p>
                                </div>
                            </div>

                            <Separator />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <Label className="text-muted-foreground">L1 Sales Needed For Target</Label>
                                    <div className="text-2xl font-bold">{calculatedStats.salesNeededForTarget}</div>
                                    <p className="text-xs text-muted-foreground">
                                        Based on Effective Value of {formatINR(calculatedStats.effectiveValue)} (L1 + Upsells)
                                    </p>
                                </div>

                                <div className="space-y-1">
                                    <Label className="text-muted-foreground">Required Ad Spend</Label>
                                    <div className="text-2xl font-bold">{formatINR(calculatedStats.adSpendRequiredWithBuffer)}</div>
                                    <p className="text-xs text-muted-foreground">Includes 20% buffer</p>
                                </div>
                            </div>

                            {calculatedStats.isLowAttendance && (
                                <>
                                    <Separator />
                                    <div>
                                        <h4 className="font-semibold mb-4 text-primary">SCENARIO: If Attendance Rate was 50%</h4>
                                        <div className="grid grid-cols-1 gap-6">
                                            <div className="space-y-1">
                                                <Label className="text-muted-foreground">Required Ad Spend (at 50% attendance)</Label>
                                                <div className="flex items-baseline gap-2">
                                                    <div className="text-2xl font-bold text-success-foreground">{formatINR(calculatedStats.scenarioAdSpend)}</div>
                                                    <span className="text-sm text-muted-foreground line-through">{formatINR(calculatedStats.adSpendRequiredWithBuffer)}</span>
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    You would save {formatINR(Math.max(0, calculatedStats.adSpendRequiredWithBuffer - calculatedStats.scenarioAdSpend))}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                )}

                <div className="flex justify-end sticky bottom-4 z-10">
                    <Button type="submit" size="lg" disabled={loading} className="w-full md:w-auto shadow-lg">
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Calculator className="mr-2 h-4 w-4" />
                                Save & Calculate
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
