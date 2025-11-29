import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';
import type { Product } from '@/types/database';
import { formatINR } from '@/lib/utils';
import { ProductDialog } from './ProductDialog';

interface ProductListProps {
  prospectId: string;
  products: Product[];
  onUpdate: () => void;
}

export function ProductList({ prospectId, products, onUpdate }: ProductListProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setDialogOpen(true);
  };

  const handleClose = () => {
    setDialogOpen(false);
    setEditingProduct(null);
  };

  const handleSuccess = () => {
    handleClose();
    onUpdate();
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Product Stack</CardTitle>
              <CardDescription>Manage products and services offered</CardDescription>
            </div>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No products added yet</p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Product
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="flex items-start justify-between p-4 rounded-lg border border-border hover:bg-accent transition-smooth cursor-pointer"
                  onClick={() => handleEdit(product)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium">{product.product_name}</h3>
                      {product.is_primary && (
                        <Badge variant="outline" className="text-xs">Primary</Badge>
                      )}
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>Type: {product.product_type}</p>
                      {product.delivery_method && <p>Delivery: {product.delivery_method}</p>}
                      {product.fulfillment_capacity && (
                        <p>Capacity: {product.fulfillment_capacity} clients/month</p>
                      )}
                      {product.current_conversion_rate && (
                        <p>Conversion Rate: {product.current_conversion_rate}%</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold">{formatINR(product.ticket_price)}</div>
                    <div className="text-xs text-muted-foreground">Ticket Price</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ProductDialog
        open={dialogOpen}
        onClose={handleClose}
        onSuccess={handleSuccess}
        prospectId={prospectId}
        product={editingProduct}
      />
    </>
  );
}
