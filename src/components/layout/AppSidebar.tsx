import { Link, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Users,
  Settings,
  UserCog,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from 'miaoda-auth-react';
import { profilesApi } from '@/services/api';
import { useEffect, useState } from 'react';
import type { Profile } from '@/types/database';

const menuItems = [
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
    path: '/',
  },
  {
    title: 'Prospects',
    icon: Users,
    path: '/prospects',
  },
];

const adminMenuItems = [
  {
    title: 'User Management',
    icon: UserCog,
    path: '/admin/users',
  },
  {
    title: 'Settings',
    icon: Settings,
    path: '/admin/settings',
  },
];

export function AppSidebar() {
  const location = useLocation();
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (user) {
      profilesApi.getCurrentProfile().then(setProfile).catch(console.error);
    }
  }, [user]);

  const isAdmin = profile?.role === 'super_admin' || profile?.role === 'admin';

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">ASR Media Pro</span>
            <span className="text-xs text-muted-foreground">Sales Intelligence</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.path}
                  >
                    <Link to={item.path}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Administration</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminMenuItems.map((item) => (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      asChild
                      isActive={location.pathname === item.path}
                    >
                      <Link to={item.path}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-2 text-sm">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
            {profile?.username?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <span className="font-medium truncate">{profile?.username || 'User'}</span>
            <span className="text-xs text-muted-foreground capitalize">{profile?.role || 'closer'}</span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
