import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { prospectsApi } from '@/services/api';
import type { Prospect } from '@/types/database';
import { ArrowLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import NotesSection from '@/components/prospect/NotesSection';
import { SalesDataForm } from '@/components/prospect/SalesDataForm';

export default function ProspectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [prospect, setProspect] = useState<Prospect | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    if (!id) return;

    try {
      const prospectData = await prospectsApi.getById(id);
      setProspect(prospectData);
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
            <div className="flex gap-4 text-sm text-muted-foreground mt-1">
              {prospect.email && <span>{prospect.email}</span>}
              {prospect.mobile && <span>{prospect.mobile}</span>}
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="data" className="space-y-4">
        <TabsList className="w-full justify-start p-1 bg-muted/20">
          <TabsTrigger value="data" className="flex-1 max-w-[200px]">Data</TabsTrigger>
          <TabsTrigger value="notes" className="flex-1 max-w-[200px]">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="data" className="space-y-4">
          <SalesDataForm prospect={prospect} onUpdate={loadData} />
        </TabsContent>

        <TabsContent value="notes" className="space-y-4">
          <NotesSection prospectId={id!} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
