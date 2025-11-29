import type { ReactNode } from 'react';
import { MainLayout } from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard';
import Prospects from './pages/Prospects';
import ProspectForm from './pages/ProspectForm';
import ProspectDetail from './pages/ProspectDetail';
import MetricsInput from './pages/MetricsInput';
import UserManagement from './pages/admin/UserManagement';
import Login from './pages/Login';

interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
}

const routes: RouteConfig[] = [
  {
    name: 'Login',
    path: '/login',
    element: <Login />,
  },
  {
    name: 'Main',
    path: '/',
    element: <MainLayout />,
  },
];

export const protectedRoutes: RouteConfig[] = [
  {
    name: 'Dashboard',
    path: '/',
    element: <Dashboard />,
  },
  {
    name: 'Prospects',
    path: '/prospects',
    element: <Prospects />,
  },
  {
    name: 'New Prospect',
    path: '/prospects/new',
    element: <ProspectForm />,
  },
  {
    name: 'Edit Prospect',
    path: '/prospects/:id/edit',
    element: <ProspectForm />,
  },
  {
    name: 'Prospect Detail',
    path: '/prospects/:id',
    element: <ProspectDetail />,
  },
  {
    name: 'Metrics Input',
    path: '/prospects/:prospectId/funnels/:funnelId/metrics',
    element: <MetricsInput />,
  },
  {
    name: 'User Management',
    path: '/admin/users',
    element: <UserManagement />,
  },
];

export default routes;
