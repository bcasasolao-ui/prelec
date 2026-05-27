import { Activity, Users, DollarSign, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHeader, StatCard } from '../components/ui';
import { useAuthContext } from '../hooks/AuthContext';

export function AgenciaDashboard() {
  const { user } = useAuthContext();

  const quickActions = [
    {
      to: '/agencia/lectura',
      icon: <Activity size={20} className="text-blue-600" />,
      label: 'Registrar Lectura',
      desc: 'Registra la lectura de un contador y genera el recibo automáticamente.',
      color: 'hover:border-blue-300',
    },
    {
      to: '/agencia/clientes',
      icon: <Users size={20} className="text-emerald-600" />,
      label: 'Crear Cliente',
      desc: 'Alta de nuevo cliente con contador y credenciales de acceso al portal.',
      color: 'hover:border-emerald-300',
    },
    {
      to: '/agencia/pagos',
      icon: <DollarSign size={20} className="text-amber-600" />,
      label: 'Pago en Efectivo',
      desc: 'Registra un pago en efectivo recibido en agencia.',
      color: 'hover:border-amber-300',
    },
    {
      to: '/agencia/buscar',
      icon: <Zap size={20} className="text-violet-600" />,
      label: 'Buscar Cliente',
      desc: 'Consulta la cuenta y recibos de cualquier cliente por DPI.',
      color: 'hover:border-violet-300',
    },
  ];

  return (
    <div>
      <PageHeader
        title="Panel de Agencia"
        subtitle={`Operador: ${user?.nombreUsuario}`}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Acciones disponibles" value="4" icon={<Zap size={18} />} colorClass="text-blue-700" />
        <StatCard label="Sesión activa" value="En línea" icon={<Activity size={18} />} colorClass="text-emerald-600" sub="Token válido 2 horas" />
        <StatCard label="Operador" value={user?.nombreUsuario ?? '—'} icon={<Users size={18} />} />
        <StatCard label="Rol" value="Agencia" icon={<DollarSign size={18} />} colorClass="text-violet-600" />
      </div>

      <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-4">Acciones rápidas</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {quickActions.map((a) => (
          <Link
            key={a.to}
            to={a.to}
            className={`card p-5 flex items-start gap-4 border-2 border-transparent transition-all duration-200 ${a.color} hover:shadow-md`}
          >
            <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center shrink-0">
              {a.icon}
            </div>
            <div>
              <div className="font-semibold text-slate-900 text-sm mb-1">{a.label}</div>
              <div className="text-xs text-slate-500 leading-relaxed">{a.desc}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
