import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import type { Funnel } from '@/types/database';
import { FunnelDialog } from './FunnelDialog';

interface FunnelListProps {
  prospectId: string;
  funnels: Funnel[];
  onUpdate: () => void;
}

export function FunnelList({ prospectId, funnels, onUpdate }: FunnelListProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFunnel, setEditingFunnel] = useState<Funnel | null>(null);

  const handleEdit = (funnel: Funnel) => {
    setEditingFunnel(funnel);
    setDialogOpen(true);
  };

  const handleClose = () => {
    setDialogOpen(false);
    setEditingFunnel(null);
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
              <CardTitle>Funnels</CardTitle>
              <CardDescription>Configure and manage sales funnels</CardDescription>
            </div>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Funnel
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {funnels.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No funnels created yet</p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Funnel
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {funnels.map((funnel) => (
                <div
                  key={funnel.id}
                  className="flex items-start justify-between p-4 rounded-lg border border-border hover:bg-accent transition-smooth"
                >
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => handleEdit(funnel)}
                  >
                    <h3 className="font-medium mb-1">
                      {funnel.funnel_name || funnel.funnel_type}
                    </h3>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>Type: {funnel.funnel_type}</p>
                      <p>Stages: {funnel.stage_count}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link to={`/prospects/${prospectId}/funnels/${funnel.id}/metrics`}>
                      <Button variant="default" size="sm">
                        Input Metrics
                      </Button>
                    </Link>
                    <Link to={`/prospects/${prospectId}/funnels/${funnel.id}/gap-analysis`}>
                      <Button variant="outline" size="sm">
                        Gap Analysis
                      </Button>
                    </Link>
                    <Link to={`/prospects/${prospectId}/funnels/${funnel.id}/projections`}>
                      <Button variant="secondary" size="sm">
                        Projections
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <FunnelDialog
        open={dialogOpen}
        onClose={handleClose}
        onSuccess={handleSuccess}
        prospectId={prospectId}
        funnel={editingFunnel}
      />
    </>
  );
}
