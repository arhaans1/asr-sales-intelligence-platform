import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { prospectsApi } from '@/services/api';
import type { Prospect } from '@/types/database';
import { Users, TrendingUp, Target, Plus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function Dashboard() {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProspects();
  }, []);

  const loadProspects = async () => {
    try {
      const data = await prospectsApi.getAll();
      setProspects(data);
    } catch (error) {
      console.error('Failed to load prospects:', error);
    } finally {
      setLoading(false);
    }
  };

  const activeProspects = prospects.filter(p => p.status === 'active').length;
  const closedWon = prospects.filter(p => p.status === 'closed_won').length;
  const totalRevenue = prospects
    .filter(p => p.status === 'closed_won')
    .reduce((sum, p) => sum + (p.target_monthly_revenue || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome to ASR Media Pro Sales Intelligence Platform
          </p>
        </div>
        <Link to="/prospects/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Prospect
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Prospects</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-20 bg-muted" />
            ) : (
              <>
                <div className="text-2xl font-bold">{prospects.length}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {activeProspects} active
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Closed Won</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-20 bg-muted" />
            ) : (
              <>
                <div className="text-2xl font-bold">{closedWon}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {prospects.length > 0 ? ((closedWon / prospects.length) * 100).toFixed(1) : 0}% conversion rate
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-32 bg-muted" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  ₹{(totalRevenue / 100000).toFixed(2)}L
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Target monthly revenue
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Prospects</CardTitle>
          <CardDescription>Your most recently added prospects</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full bg-muted" />
              ))}
            </div>
          ) : prospects.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No prospects yet</p>
              <Link to="/prospects/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Prospect
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {prospects.slice(0, 5).map((prospect) => (
                <Link
                  key={prospect.id}
                  to={`/prospects/${prospect.id}`}
                  className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent transition-smooth"
                >
                  <div className="flex-1">
                    <h3 className="font-medium">{prospect.business_name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {prospect.contact_name} • {prospect.industry_vertical}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      ₹{(prospect.target_monthly_revenue / 100000).toFixed(2)}L
                    </div>
                    <div className="text-xs text-muted-foreground capitalize">
                      {prospect.status.replace('_', ' ')}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
