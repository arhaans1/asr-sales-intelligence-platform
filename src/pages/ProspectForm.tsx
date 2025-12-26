import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { prospectsApi } from '@/services/api';
import { toast } from 'sonner';
import { ArrowLeft, Loader2 } from 'lucide-react';

const prospectSchema = z.object({
  contact_name: z.string().min(1, 'Contact name is required'),
  business_name: z.string().min(1, 'Business name is required'),
  email: z.string().email('Invalid email address'),
  mobile: z.string().min(1, 'Mobile number is required'),
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
      contact_name: '',
      business_name: '',
      email: '',
      mobile: '',
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
          contact_name: prospect.contact_name,
          business_name: prospect.business_name,
          email: prospect.email || '',
          mobile: prospect.mobile || '',
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
      const prospectData = {
        contact_name: data.contact_name,
        business_name: data.business_name,
        email: data.email,
        mobile: data.mobile,
        // Default values for hidden fields
        industry_vertical: 'Coach',
        niche_description: null,
        current_monthly_revenue: 0,
        target_monthly_revenue: 0,
        timeline_months: 12,
        notes: null,
        status: 'active' as const,
        user_id: '', // Handled by API
      };

      if (id) {
        await prospectsApi.update(id, prospectData);
        toast.success('Prospect updated successfully');
        navigate(`/prospects/${id}`);
      } else {
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
    <div className="space-y-6 max-w-2xl mx-auto">
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
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>Enter the basic details of the prospect</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="contact_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter contact name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="business_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter company name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Enter email address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="mobile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="Enter mobile number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button type="submit" disabled={loading} className="w-full">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {id ? 'Update Prospect' : 'Create Prospect'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
