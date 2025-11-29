import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { prospectsApi } from '@/services/api';
import { toast } from 'sonner';
import { ArrowLeft, Loader2 } from 'lucide-react';

const prospectSchema = z.object({
  business_name: z.string().min(1, 'Business name is required'),
  contact_name: z.string().min(1, 'Contact name is required'),
  industry_vertical: z.string().min(1, 'Industry vertical is required'),
  niche_description: z.string().optional(),
  current_monthly_revenue: z.coerce.number().min(0, 'Must be a positive number'),
  target_monthly_revenue: z.coerce.number().min(0, 'Must be a positive number'),
  timeline_months: z.coerce.number().min(1, 'Must be at least 1 month').max(60, 'Maximum 60 months'),
  notes: z.string().optional(),
  status: z.enum(['active', 'closed_won', 'closed_lost', 'archived']),
});

type ProspectFormData = z.infer<typeof prospectSchema>;

export default function ProspectForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!!id);

  const form = useForm<ProspectFormData>({
    resolver: zodResolver(prospectSchema),
    defaultValues: {
      business_name: '',
      contact_name: '',
      industry_vertical: 'Coach',
      niche_description: '',
      current_monthly_revenue: 0,
      target_monthly_revenue: 0,
      timeline_months: 6,
      notes: '',
      status: 'active',
    },
  });

  useEffect(() => {
    if (id) {
      loadProspect();
    }
  }, [id]);

  const loadProspect = async () => {
    if (!id) return;

    try {
      const prospect = await prospectsApi.getById(id);
      if (prospect) {
        form.reset({
          business_name: prospect.business_name,
          contact_name: prospect.contact_name,
          industry_vertical: prospect.industry_vertical,
          niche_description: prospect.niche_description || '',
          current_monthly_revenue: prospect.current_monthly_revenue,
          target_monthly_revenue: prospect.target_monthly_revenue,
          timeline_months: prospect.timeline_months,
          notes: prospect.notes || '',
          status: prospect.status,
        });
      }
    } catch (error) {
      console.error('Failed to load prospect:', error);
      toast.error('Failed to load prospect');
    } finally {
      setInitialLoading(false);
    }
  };

  const onSubmit = async (data: ProspectFormData) => {
    setLoading(true);

    try {
      if (id) {
        await prospectsApi.update(id, data);
        toast.success('Prospect updated successfully');
        navigate(`/prospects/${id}`);
      } else {
        const prospectData = {
          business_name: data.business_name,
          contact_name: data.contact_name,
          industry_vertical: data.industry_vertical,
          niche_description: data.niche_description || null,
          current_monthly_revenue: data.current_monthly_revenue,
          target_monthly_revenue: data.target_monthly_revenue,
          timeline_months: data.timeline_months,
          notes: data.notes || null,
          status: data.status,
          user_id: '',
        };
        const newProspect = await prospectsApi.create(prospectData);
        toast.success('Prospect created successfully');
        navigate(`/prospects/${newProspect.id}`);
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(err.message || 'Failed to save prospect');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{id ? 'Edit Prospect' : 'New Prospect'}</h1>
          <p className="text-muted-foreground mt-1">
            {id ? 'Update prospect information' : 'Add a new prospect to your pipeline'}
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Core details about the prospect</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="business_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter business name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contact_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter contact person name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="industry_vertical"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Industry Vertical</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select industry" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Coach">Coach</SelectItem>
                        <SelectItem value="Consultant">Consultant</SelectItem>
                        <SelectItem value="Agency">Agency</SelectItem>
                        <SelectItem value="SaaS">SaaS</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="niche_description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Niche Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the specific niche or market segment"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Optional: Provide details about their specific market focus
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="closed_won">Closed Won</SelectItem>
                        <SelectItem value="closed_lost">Closed Lost</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Revenue & Goals</CardTitle>
              <CardDescription>Financial targets and timeline</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="current_monthly_revenue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Monthly Revenue (₹)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0" {...field} />
                    </FormControl>
                    <FormDescription>
                      Current monthly revenue in INR
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="target_monthly_revenue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Monthly Revenue (₹)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0" {...field} />
                    </FormControl>
                    <FormDescription>
                      Desired monthly revenue goal in INR
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="timeline_months"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Timeline (Months)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="6" {...field} />
                    </FormControl>
                    <FormDescription>
                      Number of months to reach target revenue
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Additional Notes</CardTitle>
              <CardDescription>Any additional context or information</CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder="Add any relevant notes or context..."
                        className="min-h-32"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {id ? 'Update Prospect' : 'Create Prospect'}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
