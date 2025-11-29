import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, RequireAuth } from 'miaoda-auth-react';
import { supabase } from '@/db/supabase';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';
import routes, { protectedRoutes } from './routes';
import { MainLayout } from './components/layout/MainLayout';

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <Router>
        <AuthProvider client={supabase}>
          <Toaster />
          <Routes>
            <Route path="/login" element={routes.find(r => r.path === '/login')?.element} />
            <Route
              path="/*"
              element={
                <RequireAuth whiteList={['/login']}>
                  <Routes>
                    <Route element={<MainLayout />}>
                      {protectedRoutes.map((route, index) => (
                        <Route
                          key={index}
                          path={route.path}
                          element={route.element}
                        />
                      ))}
                    </Route>
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </RequireAuth>
              }
            />
          </Routes>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
