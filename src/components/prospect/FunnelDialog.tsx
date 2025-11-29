import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { funnelsApi } from '@/services/api';
import { toast } from 'sonner';
import { Loader2, Trash2 } from 'lucide-react';
import type { Funnel, FunnelType } from '@/types/database';

const funnelSchema = z.object({
  funnel_type: z.string().min(1, 'Funnel type is required'),
  funnel_name: z.string().optional(),
  stage_count: z.coerce.number().min(2, 'Must have at least 2 stages').max(10, 'Maximum 10 stages'),
});

type FunnelFormData = z.infer<typeof funnelSchema>;

interface FunnelDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  prospectId: string;
  funnel?: Funnel | null;
}

const funnelTypes: FunnelType[] = [
  '1:1 Sales Call Funnel',
  'Live Webinar Funnel',
  'Automated Webinar Funnel',
  'Challenge/Bootcamp Funnel',
  'Workshop Funnel',
  'Direct Sales Page Funnel',
  'Hybrid/Custom',
];

export function FunnelDialog({ open, onClose, onSuccess, prospectId, funnel }: FunnelDialogProps) {
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const form = useForm<FunnelFormData>({
    resolver: zodResolver(funnelSchema),
    defaultValues: {
      funnel_type: '1:1 Sales Call Funnel',
      funnel_name: '',
      stage_count: 5,
    },
  });

  useEffect(() => {
    if (funnel) {
      form.reset({
        funnel_type: funnel.funnel_type,
        funnel_name: funnel.funnel_name || '',
        stage_count: funnel.stage_count,
      });
    } else {
      form.reset({
        funnel_type: '1:1 Sales Call Funnel',
        funnel_name: '',
        stage_count: 5,
      });
    }
  }, [funnel, form]);

  const onSubmit = async (data: FunnelFormData) => {
    setLoading(true);

    try {
      const funnelData = {
        funnel_type: data.funnel_type,
        funnel_name: data.funnel_name || null,
        stage_count: data.stage_count,
        custom_stages: null,
        prospect_id: prospectId,
      };

      if (funnel) {
        await funnelsApi.update(funnel.id, funnelData);
        toast.success('Funnel updated successfully');
      } else {
        await funnelsApi.create(funnelData);
        toast.success('Funnel created successfully');
      }
      onSuccess();
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(err.message || 'Failed to save funnel');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!funnel) return;

    setLoading(true);
    try {
      await funnelsApi.delete(funnel.id);
      toast.success('Funnel deleted successfully');
      setDeleteDialogOpen(false);
      onSuccess();
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(err.message || 'Failed to delete funnel');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{funnel ? 'Edit Funnel' : 'Add Funnel'}</DialogTitle>
            <DialogDescription>
              {funnel ? 'Update funnel configuration' : 'Create a new funnel configuration'}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="funnel_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Funnel Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select funnel type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {funnelTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Choose the type of funnel that best matches your sales process
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="funnel_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Funnel Name (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Q1 2024 Campaign" {...field} />
                    </FormControl>
                    <FormDescription>
                      Give this funnel a custom name for easy identification
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="stage_count"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Stages</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="5" {...field} />
                    </FormControl>
                    <FormDescription>
                      How many stages are in your funnel? (2-10)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="gap-2">
                {funnel && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => setDeleteDialogOpen(true)}
                    disabled={loading}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                )}
                <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {funnel ? 'Update' : 'Create'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Funnel</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this funnel? This will also delete all associated metrics and sessions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={loading} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
