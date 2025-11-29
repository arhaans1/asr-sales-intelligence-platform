import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { profilesApi } from '@/services/api';
import type { Profile, UserRole } from '@/types/database';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate } from '@/lib/utils';

export default function UserManagement() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      const data = await profilesApi.getAllProfiles();
      setProfiles(data);
    } catch (error) {
      console.error('Failed to load profiles:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    setUpdating(userId);
    try {
      await profilesApi.updateUserRole(userId, newRole);
      toast.success('User role updated successfully');
      await loadProfiles();
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(err.message || 'Failed to update user role');
    } finally {
      setUpdating(null);
    }
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'super_admin':
        return 'bg-destructive text-destructive-foreground';
      case 'admin':
        return 'bg-warning text-warning-foreground';
      case 'closer':
        return 'bg-primary text-primary-foreground';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-muted-foreground mt-1">
          Manage user accounts and permissions
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>
            View and manage user roles and permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full bg-muted" />
              ))}
            </div>
          ) : profiles.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No users found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {profiles.map((profile) => (
                <div
                  key={profile.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-medium">{profile.username}</h3>
                      <Badge className={getRoleBadgeColor(profile.role)}>
                        {profile.role.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {profile.full_name && <p>{profile.full_name}</p>}
                      <p>Joined: {formatDate(profile.created_at)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Select
                      value={profile.role}
                      onValueChange={(value) => handleRoleChange(profile.id, value as UserRole)}
                      disabled={updating === profile.id}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="closer">Closer</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="super_admin">Super Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Role Descriptions</CardTitle>
          <CardDescription>Understanding user roles and permissions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge className="bg-destructive text-destructive-foreground">Super Admin</Badge>
              <span className="text-sm font-medium">Full System Access</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Complete access to all features including user management, system settings, and all prospect data.
              The first user to register automatically becomes a Super Admin.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge className="bg-warning text-warning-foreground">Admin</Badge>
              <span className="text-sm font-medium">Administrative Access</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Access to all prospect data and analysis features. Can view and manage all users' prospects
              but cannot modify user roles or system settings.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge className="bg-primary text-primary-foreground">Closer</Badge>
              <span className="text-sm font-medium">Standard User</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Can create and manage their own prospects, products, funnels, and analysis sessions.
              Cannot access other users' data or administrative features.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
