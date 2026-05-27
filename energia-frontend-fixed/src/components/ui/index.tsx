import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, Loader2, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastItem {
  id: number;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextValue {
  showToast: (toast: Omit<ToastItem, 'id'>) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const toastStyles: Record<ToastType, string> = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  error: 'border-red-200 bg-red-50 text-red-900',
  warning: 'border-amber-200 bg-amber-50 text-amber-900',
  info: 'border-cyan-200 bg-cyan-50 text-cyan-900',
};

const toastIcons: Record<ToastType, typeof Info> = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((toast: Omit<ToastItem, 'id'>) => {
    const id = Date.now() + Math.random();
    setToasts((current) => [...current, { ...toast, id }].slice(-4));
    window.setTimeout(() => dismiss(id), 4200);
  }, [dismiss]);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed inset-x-3 top-3 z-[70] flex max-w-sm flex-col gap-3 sm:inset-x-auto sm:right-6 sm:top-4 sm:w-[calc(100vw-2rem)]">
        {toasts.map((toast) => {
          const Icon = toastIcons[toast.type];
          return (
            <div
              key={toast.id}
              className={`animate-rise-in rounded-xl border p-4 shadow-xl backdrop-blur ${toastStyles[toast.type]}`}
            >
              <div className="flex items-start gap-3">
                <Icon size={18} className="mt-0.5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{toast.title}</p>
                  {toast.message && <p className="mt-1 text-xs opacity-80">{toast.message}</p>}
                </div>
                <button
                  type="button"
                  onClick={() => dismiss(toast.id)}
                  className="rounded-lg p-1 opacity-60 transition-opacity hover:opacity-100"
                >
                  <X size={15} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast debe usarse dentro de ToastProvider');
  }
  return context;
}

export function Spinner({ size = 20, className = '' }: { size?: number; className?: string }) {
  return <Loader2 size={size} className={`animate-spin text-cyan-600 ${className}`} />;
}

export function LoadingState({ message = 'Cargando...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 animate-rise-in">
      <div className="grid w-full max-w-xl gap-3">
        <div className="h-20 rounded-xl bg-slate-200/80 animate-pulse" />
        <div className="grid grid-cols-3 gap-3">
          <div className="h-16 rounded-xl bg-slate-200/70 animate-pulse" />
          <div className="h-16 rounded-xl bg-slate-200/70 animate-pulse" />
          <div className="h-16 rounded-xl bg-slate-200/70 animate-pulse" />
        </div>
      </div>
      <Spinner size={24} />
      <p className="text-sm text-slate-500">{message}</p>
    </div>
  );
}

export function SkeletonCard({ rows = 3 }: { rows?: number }) {
  return (
    <div className="card p-5 animate-rise-in">
      <div className="mb-4 h-4 w-1/3 rounded-full bg-slate-200 animate-pulse" />
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, index) => (
          <div
            key={index}
            className="h-3 rounded-full bg-slate-200/80 animate-pulse"
            style={{ width: `${90 - index * 16}%` }}
          />
        ))}
      </div>
    </div>
  );
}

export function EmptyState({ message, icon }: { message: string; icon?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400 animate-rise-in">
      {icon ?? <Info size={36} />}
      <p className="text-sm">{message}</p>
    </div>
  );
}

type AlertType = 'success' | 'error' | 'warning' | 'info';

const alertMap: Record<AlertType, { cls: string; Icon: typeof AlertCircle }> = {
  success: { cls: 'alert-success', Icon: CheckCircle2 },
  error: { cls: 'alert-error', Icon: AlertCircle },
  warning: { cls: 'alert-warning', Icon: AlertTriangle },
  info: { cls: 'alert-info', Icon: Info },
};

export function Alert({ type, message }: { type: AlertType; message: string }) {
  const { cls, Icon } = alertMap[type];
  return (
    <div className={`${cls} animate-rise-in shadow-sm`}>
      <Icon size={16} className="shrink-0 mt-0.5" />
      <span>{message}</span>
    </div>
  );
}

export function StatusBadge({ estado }: { estado: string }) {
  const normalized = estado?.toLowerCase();
  if (normalized === 'pagado') return <span className="badge-paid">Pagado</span>;
  if (normalized === 'pendiente') return <span className="badge-pending">Pendiente</span>;
  if (normalized === 'activo') return <span className="badge-active">Activo</span>;
  if (normalized === 'inactivo') return <span className="badge-inactive">Inactivo</span>;
  return <span className="badge-inactive">{estado}</span>;
}

export function Currency({ amount, className = '' }: { amount: number; className?: string }) {
  return (
    <span className={className}>
      Q{amount.toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
    </span>
  );
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="energy-panel flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-5 sm:mb-6 rounded-xl border border-white p-4 sm:p-5 shadow-sm animate-rise-in">
      <div>
        <h1 className="text-lg sm:text-xl font-semibold text-slate-950">{title}</h1>
        {subtitle && <p className="text-sm text-slate-600 mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/45 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-rise-in">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors rounded-lg p-1"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

export function StatCard({
  label,
  value,
  icon,
  colorClass = 'text-slate-900',
  sub,
}: {
  label: string;
  value: ReactNode;
  icon: ReactNode;
  colorClass?: string;
  sub?: string;
}) {
  return (
    <div className="stat-card animate-rise-in">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</span>
        <div className="text-cyan-600 bg-cyan-50 border border-cyan-100 rounded-lg p-2">{icon}</div>
      </div>
      <div className={`text-2xl font-semibold ${colorClass}`}>{value}</div>
      {sub && <div className="text-xs text-slate-400 mt-0.5">{sub}</div>}
    </div>
  );
}
