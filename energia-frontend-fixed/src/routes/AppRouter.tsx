import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { AppLayout } from '../components/layout/AppLayout';
import { LoginPage } from '../pages/LoginPage';
import { ClienteDashboard } from '../pages/ClienteDashboard';
import { ClienteRecibos } from '../pages/ClienteRecibos';
import { ClientePagos } from '../pages/ClientePagos';
import { ClienteAjustes } from '../pages/ClienteAjustes';
import { AgenciaDashboard } from '../pages/AgenciaDashboard';
import { AgenciaLectura } from '../pages/AgenciaLectura';
import { AgenciaClientes } from '../pages/AgenciaClientes';
import { AgenciaPagos } from '../pages/AgenciaPagos';
import { AgenciaBuscar } from '../pages/AgenciaBuscar';
import { useAuthContext } from '../hooks/AuthContext';

function RootRedirect() {
  const { user, isAuthenticated } = useAuthContext();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.rol === 'CLIENTE') return <Navigate to="/cliente/dashboard" replace />;
  return <Navigate to="/agencia/dashboard" replace />;
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<RootRedirect />} />

        {/* Cliente routes */}
        <Route
          path="/cliente/*"
          element={
            <ProtectedRoute role="CLIENTE">
              <AppLayout>
                <Routes>
                  <Route path="dashboard" element={<ClienteDashboard />} />
                  <Route path="recibos" element={<ClienteRecibos />} />
                  <Route path="pagar" element={<ClientePagos />} />
                  <Route path="ajustes" element={<ClienteAjustes />} />
                  <Route path="*" element={<Navigate to="dashboard" replace />} />
                </Routes>
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* Agencia routes */}
        <Route
          path="/agencia/*"
          element={
            <ProtectedRoute role="ADMIN_AGENCIA">
              <AppLayout>
                <Routes>
                  <Route path="dashboard" element={<AgenciaDashboard />} />
                  <Route path="lectura" element={<AgenciaLectura />} />
                  <Route path="clientes" element={<AgenciaClientes />} />
                  <Route path="pagos" element={<AgenciaPagos />} />
                  <Route path="buscar" element={<AgenciaBuscar />} />
                  <Route path="*" element={<Navigate to="dashboard" replace />} />
                </Routes>
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
