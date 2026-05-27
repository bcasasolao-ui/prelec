import { useState, type ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Zap, LayoutDashboard, FileText, CreditCard, Settings,
  LogOut, Menu, Users, Activity, DollarSign, Search,
  ChevronRight, Bell, CheckCircle2, Clock,
} from 'lucide-react';
import { useAuthContext } from '../../hooks/AuthContext';
import { useToast } from '../ui';

interface NavItem {
  to: string;
  label: string;
  icon: ReactNode;
}

const clienteNav: NavItem[] = [
  { to: '/cliente/dashboard', label: 'Mi Cuenta', icon: <LayoutDashboard size={18} /> },
  { to: '/cliente/recibos', label: 'Recibos', icon: <FileText size={18} /> },
  { to: '/cliente/pagar', label: 'Pagar', icon: <CreditCard size={18} /> },
  { to: '/cliente/ajustes', label: 'Ajustes', icon: <Settings size={18} /> },
];

const agenciaNav: NavItem[] = [
  { to: '/agencia/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { to: '/agencia/lectura', label: 'Registrar Lectura', icon: <Activity size={18} /> },
  { to: '/agencia/clientes', label: 'Clientes', icon: <Users size={18} /> },
  { to: '/agencia/pagos', label: 'Pago en Efectivo', icon: <DollarSign size={18} /> },
  { to: '/agencia/buscar', label: 'Buscar Cliente', icon: <Search size={18} /> },
];

export function AppLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuthContext();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const nav = user?.rol === 'CLIENTE' ? clienteNav : agenciaNav;
  const portalLabel = user?.rol === 'CLIENTE' ? 'Portal Cliente' : 'Panel de Agencia';
  const notifications = user?.rol === 'CLIENTE'
    ? [
        { title: 'Recibos al día', text: 'Revisa tu historial y pagos recientes.', icon: <CheckCircle2 size={15} /> },
        { title: 'Portal activo', text: 'Tus contadores se sincronizan al iniciar sesión.', icon: <Clock size={15} /> },
      ]
    : [
        { title: 'Operación lista', text: 'Puedes registrar lecturas, pagos y nuevos clientes.', icon: <CheckCircle2 size={15} /> },
        { title: 'Recordatorio', text: 'Verifica el número de contador antes de guardar.', icon: <Clock size={15} /> },
      ];

  const handleLogout = () => {
    showToast({ type: 'info', title: 'Sesión cerrada', message: 'Vuelve cuando necesites consultar el sistema.' });
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <aside
        className={`
          fixed inset-y-0 left-0 z-40 w-[min(18rem,86vw)] bg-slate-950 flex flex-col
          transform transition-transform duration-300 ease-in-out shadow-2xl shadow-slate-950/25
          lg:relative lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(155deg,rgba(6,182,212,0.22),transparent_34%),linear-gradient(25deg,rgba(16,185,129,0.16),transparent_42%)]" />
        <div className="absolute inset-0 pointer-events-none energy-grid opacity-70" />

        <div className="relative flex items-center gap-3 px-5 py-5 border-b border-white/10">
          <div className="w-9 h-9 bg-gradient-to-br from-cyan-400 via-blue-500 to-emerald-400 rounded-lg flex items-center justify-center shrink-0 shadow-lg shadow-cyan-500/25">
            <Zap size={16} className="text-white" />
          </div>
          <div>
            <div className="text-white font-semibold text-sm leading-none">Energía</div>
            <div className="text-cyan-100/80 text-xs mt-0.5">{portalLabel}</div>
          </div>
        </div>

        <div className="relative mx-3 mt-4 px-3 py-2.5 bg-white/10 border border-white/10 rounded-lg backdrop-blur">
          <div className="text-xs text-cyan-100/70 mb-0.5">Sesión activa</div>
          <div className="text-sm font-medium text-white truncate">{user?.nombreUsuario}</div>
          <div className="text-xs text-emerald-300 mt-0.5 font-mono">{user?.rol}</div>
        </div>

        <nav className="relative flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'sidebar-link-active' : 'sidebar-link-inactive'}`
              }
            >
              {item.icon}
              <span className="flex-1">{item.label}</span>
              <ChevronRight size={14} className="opacity-30" />
            </NavLink>
          ))}
        </nav>

        <div className="relative p-3 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="sidebar-link sidebar-link-inactive w-full text-red-300 hover:text-white hover:bg-red-500/20"
          >
            <LogOut size={18} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-950/55 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="relative z-50 bg-white border-b border-slate-200 px-3 sm:px-4 lg:px-6 h-14 flex items-center gap-3 sm:gap-4 shrink-0 shadow-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-slate-500 hover:text-slate-900 transition-colors"
          >
            <Menu size={20} />
          </button>
          <div className="min-w-0 flex items-center gap-2 text-sm text-slate-600">
            <Zap size={14} className="text-cyan-600" />
            <span className="truncate hidden xs:inline sm:inline">Sistema de Gestión Eléctrica</span>
          </div>
          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotificationsOpen((open) => !open)}
                className="relative rounded-lg border border-slate-200 bg-white p-2 text-slate-600 shadow-sm transition-all hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700"
              >
                <Bell size={17} />
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-cyan-500 px-1 text-[10px] font-bold text-white">
                  {notifications.length}
                </span>
              </button>

              {notificationsOpen && (
                <div className="fixed left-3 right-3 top-16 z-[90] rounded-xl border border-slate-200 bg-white p-3 shadow-2xl shadow-slate-900/20 ring-1 ring-slate-900/5 animate-rise-in sm:absolute sm:left-auto sm:right-0 sm:top-12 sm:w-[22rem]">
                  <div className="mb-3 flex items-center justify-between border-b border-slate-100 px-1 pb-3">
                    <p className="text-sm font-bold text-slate-950">Notificaciones</p>
                    <span className="rounded-full bg-cyan-50 px-2 py-0.5 text-xs font-semibold text-cyan-700">Ahora</span>
                  </div>
                  <div className="space-y-2">
                    {notifications.map((item) => (
                      <div key={item.title} className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition-colors hover:bg-cyan-50/60">
                        <div className="flex gap-3">
                          <div className="mt-0.5 rounded-lg bg-cyan-100 p-2 text-cyan-800">
                            {item.icon}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-950">{item.title}</p>
                            <p className="mt-0.5 text-xs leading-5 text-slate-600">{item.text}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse-soft" />
            <span className="text-xs text-slate-500 hidden sm:inline">Conectado</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-[linear-gradient(135deg,rgba(14,165,233,0.08),transparent_38%),linear-gradient(315deg,rgba(16,185,129,0.08),transparent_34%)]">
          <div className="page-shell p-3 sm:p-4 lg:p-6 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
