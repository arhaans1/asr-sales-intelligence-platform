import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { prospectsApi, productsApi, funnelsApi } from '@/services/api';
import type { Prospect, Product, Funnel } from '@/types/database';
import { ArrowLeft, Edit } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { formatINR } from '@/lib/utils';
import { ProductList } from '@/components/prospect/ProductList';
import { FunnelList } from '@/components/prospect/FunnelList';
import NotesSection from '@/components/prospect/NotesSection';
import SessionManager from '@/components/prospect/SessionManager';

export default function ProspectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [prospect, setProspect] = useState<Prospect | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [funnels, setFunnels] = useState<Funnel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    if (!id) return;

    try {
      const [prospectData, productsData, funnelsData] = await Promise.all([
        prospectsApi.getById(id),
        productsApi.getByProspectId(id),
        funnelsApi.getByProspectId(id),
      ]);

      setProspect(prospectData);
      setProducts(productsData);
      setFunnels(funnelsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-primary text-primary-foreground';
      case 'closed_won':
        return 'bg-success text-success-foreground';
      case 'closed_lost':
        return 'bg-destructive text-destructive-foreground';
      case 'archived':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64 bg-muted" />
        <Skeleton className="h-48 w-full bg-muted" />
        <Skeleton className="h-96 w-full bg-muted" />
      </div>
    );
  }

  if (!prospect) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground mb-4">Prospect not found</p>
        <Button onClick={() => navigate('/prospects')}>Back to Prospects</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/prospects')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{prospect.business_name}</h1>
              <Badge className={getStatusColor(prospect.status)}>
                {prospect.status.replace('_', ' ')}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">
              {prospect.contact_name} • {prospect.industry_vertical}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <SessionManager prospectId={id!} />
          <Link to={`/prospects/${id}/edit`}>
            <Button>
              <Edit className="mr-2 h-4 w-4" />
              Edit Prospect
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Current Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatINR(prospect.current_monthly_revenue)}</div>
            <p className="text-xs text-muted-foreground mt-1">Monthly</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Target Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{formatINR(prospect.target_monthly_revenue)}</div>
            <p className="text-xs text-muted-foreground mt-1">Monthly Goal</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{prospect.timeline_months}</div>
            <p className="text-xs text-muted-foreground mt-1">Months to Target</p>
          </CardContent>
        </Card>
      </div>

      {prospect.niche_description && (
        <Card>
          <CardHeader>
            <CardTitle>Niche Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{prospect.niche_description}</p>
          </CardContent>
        </Card>
      )}

      {prospect.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-wrap">{prospect.notes}</p>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="products" className="space-y-4">
        <TabsList>
          <TabsTrigger value="products">Products ({products.length})</TabsTrigger>
          <TabsTrigger value="funnels">Funnels ({funnels.length})</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-4">
          <ProductList prospectId={id!} products={products} onUpdate={loadData} />
        </TabsContent>

        <TabsContent value="funnels" className="space-y-4">
          <FunnelList prospectId={id!} funnels={funnels} onUpdate={loadData} />
        </TabsContent>

        <TabsContent value="notes" className="space-y-4">
          <NotesSection prospectId={id!} />
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Funnel Analysis</CardTitle>
              <CardDescription>
                Select a funnel to start analyzing metrics and get AI-powered recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {funnels.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No funnels created yet</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Create a funnel first to start analyzing performance
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {funnels.map((funnel) => (
                    <Link
                      key={funnel.id}
                      to={`/analysis/${funnel.id}`}
                      className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent transition-smooth"
                    >
                      <div>
                        <h3 className="font-medium">{funnel.funnel_name || funnel.funnel_type}</h3>
                        <p className="text-sm text-muted-foreground">{funnel.funnel_type}</p>
                      </div>
                      <Button variant="ghost" size="sm">
                        Analyze →
                      </Button>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
