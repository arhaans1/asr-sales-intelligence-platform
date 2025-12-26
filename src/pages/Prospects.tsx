import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { prospectsApi } from '@/services/api';
import type { Prospect } from '@/types/database';
import { Plus, Search } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';


export default function Prospects() {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [filteredProspects, setFilteredProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadProspects();
  }, []);

  useEffect(() => {
    filterProspects();
  }, [prospects, searchQuery, statusFilter]);

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

  const filterProspects = () => {
    let filtered = [...prospects];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.business_name.toLowerCase().includes(query) ||
          p.contact_name.toLowerCase().includes(query) ||
          p.niche_description?.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((p) => p.status === statusFilter);
    }

    setFilteredProspects(filtered);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Prospects</h1>
          <p className="text-muted-foreground mt-1">
            Manage your sales prospects and opportunities
          </p>
        </div>
        <Link to="/prospects/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Prospect
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Search and filter your prospects</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by business name, contact, or niche..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="closed_won">Closed Won</SelectItem>
                <SelectItem value="closed_lost">Closed Lost</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {loading ? (
          <>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full bg-muted" />
            ))}
          </>
        ) : filteredProspects.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">
                {searchQuery || statusFilter !== 'all'
                  ? 'No prospects match your filters'
                  : 'No prospects yet'}
              </p>
              {!searchQuery && statusFilter === 'all' && (
                <Link to="/prospects/new">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Your First Prospect
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredProspects.map((prospect) => (
            <Link key={prospect.id} to={`/prospects/${prospect.id}`}>
              <Card className="hover:bg-accent transition-smooth cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold">{prospect.business_name}</h3>
                        <Badge className={getStatusColor(prospect.status)}>
                          {prospect.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <p>{prospect.contact_name} • {prospect.industry_vertical}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
