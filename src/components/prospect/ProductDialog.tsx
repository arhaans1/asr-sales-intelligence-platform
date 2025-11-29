import { useEffect } from 'react';
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
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { productsApi } from '@/services/api';
import { toast } from 'sonner';
import { Loader2, Trash2 } from 'lucide-react';
import type { Product } from '@/types/database';
import { useState } from 'react';
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

const productSchema = z.object({
  product_name: z.string().min(1, 'Product name is required'),
  product_type: z.string().min(1, 'Product type is required'),
  ticket_price: z.coerce.number().min(0, 'Must be a positive number'),
  delivery_method: z.string().optional(),
  fulfillment_capacity: z.coerce.number().optional(),
  current_conversion_rate: z.coerce.number().optional(),
  is_primary: z.boolean().default(false),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  prospectId: string;
  product?: Product | null;
}

export function ProductDialog({ open, onClose, onSuccess, prospectId, product }: ProductDialogProps) {
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      product_name: '',
      product_type: 'Course',
      ticket_price: 0,
      delivery_method: '1:1',
      fulfillment_capacity: undefined,
      current_conversion_rate: undefined,
      is_primary: false,
    },
  });

  useEffect(() => {
    if (product) {
      form.reset({
        product_name: product.product_name,
        product_type: product.product_type,
        ticket_price: product.ticket_price,
        delivery_method: product.delivery_method || undefined,
        fulfillment_capacity: product.fulfillment_capacity || undefined,
        current_conversion_rate: product.current_conversion_rate || undefined,
        is_primary: product.is_primary,
      });
    } else {
      form.reset({
        product_name: '',
        product_type: 'Course',
        ticket_price: 0,
        delivery_method: '1:1',
        fulfillment_capacity: undefined,
        current_conversion_rate: undefined,
        is_primary: false,
      });
    }
  }, [product, form]);

  const onSubmit = async (data: ProductFormData) => {
    setLoading(true);

    try {
      const productData = {
        product_name: data.product_name,
        product_type: data.product_type,
        ticket_price: data.ticket_price,
        delivery_method: data.delivery_method || null,
        fulfillment_capacity: data.fulfillment_capacity || null,
        current_conversion_rate: data.current_conversion_rate || null,
        is_primary: data.is_primary,
        prospect_id: prospectId,
      };

      if (product) {
        await productsApi.update(product.id, productData);
        toast.success('Product updated successfully');
      } else {
        await productsApi.create(productData);
        toast.success('Product created successfully');
      }
      onSuccess();
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(err.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!product) return;

    setLoading(true);
    try {
      await productsApi.delete(product.id);
      toast.success('Product deleted successfully');
      setDeleteDialogOpen(false);
      onSuccess();
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(err.message || 'Failed to delete product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{product ? 'Edit Product' : 'Add Product'}</DialogTitle>
            <DialogDescription>
              {product ? 'Update product information' : 'Add a new product to the stack'}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="product_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter product name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="product_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Course">Course</SelectItem>
                          <SelectItem value="Coaching">Coaching</SelectItem>
                          <SelectItem value="Service">Service</SelectItem>
                          <SelectItem value="Software">Software</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="delivery_method"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Delivery Method</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select method" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1:1">1:1</SelectItem>
                          <SelectItem value="Group">Group</SelectItem>
                          <SelectItem value="Self-Paced">Self-Paced</SelectItem>
                          <SelectItem value="Hybrid">Hybrid</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="ticket_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ticket Price (₹)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0" {...field} />
                    </FormControl>
                    <FormDescription>Price in INR</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="fulfillment_capacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fulfillment Capacity</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="Clients per month" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="current_conversion_rate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Conversion Rate (%)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="is_primary"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Primary Product</FormLabel>
                      <FormDescription>
                        Mark this as the main product offering
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <DialogFooter className="gap-2">
                {product && (
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
                  {product ? 'Update' : 'Create'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this product? This action cannot be undone.
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
