import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, ChevronRight, FileText, Wallet, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { clienteApi } from '../api/energiaCliente';
import { LoadingState, Alert, Currency, StatusBadge, PageHeader } from '../components/ui';
import { getErrorMessage } from '../api/client';
import type { ReciboResumenDto } from '../types';

const monthFormatter = new Intl.DateTimeFormat('es-GT', { month: 'short' });
const dateTimeFormatter = new Intl.DateTimeFormat('es-GT', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Sin fecha';
  return dateTimeFormatter.format(date);
}

function buildMonthlyHistory(recibos: ReciboResumenDto[]) {
  const totals = new Map<string, { label: string; total: number; date: Date }>();

  recibos.forEach((recibo) => {
    const date = new Date(recibo.fechaEmision);
    if (Number.isNaN(date.getTime())) return;

    const key = `${date.getFullYear()}-${date.getMonth()}`;
    const current = totals.get(key);
    if (current) {
      current.total += recibo.montoTotal;
      return;
    }

    totals.set(key, {
      label: monthFormatter.format(date).replace('.', ''),
      total: recibo.montoTotal,
      date,
    });
  });

  return [...totals.values()]
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(-6);
}

function ConsumptionBars({ recibos }: { recibos: ReciboResumenDto[] }) {
  const history = buildMonthlyHistory(recibos);
  const max = Math.max(...history.map((item) => item.total), 1);

  if (history.length === 0) {
    return <div className="py-10 text-center text-sm text-slate-400">Aún no hay consumo registrado.</div>;
  }

  return (
    <div className="card p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4 mb-6">
        <div>
          <h2 className="font-semibold text-slate-950 text-sm">Historial de consumo</h2>
          <p className="text-xs text-slate-500">Últimos meses facturados, estimado desde tus recibos.</p>
        </div>
        <span className="badge-active">Tendencia estable</span>
      </div>
      <div className="h-40 flex items-end gap-3 sm:gap-10 border-b border-slate-200 px-1 sm:px-4 overflow-x-auto">
        {history.map((item, index) => {
          const height = Math.max(22, Math.round((item.total / max) * 120));
          const isPeak = item.total === max;
          return (
            <div key={`${item.label}-${index}`} className="flex min-w-10 flex-1 flex-col items-center justify-end gap-2">
              <div
                className={`w-7 sm:w-9 rounded-t-lg shadow-lg transition-all duration-500 hover:scale-105 ${
                  isPeak
                    ? 'bg-gradient-to-t from-amber-500 to-amber-300 shadow-amber-500/20'
                    : 'bg-gradient-to-t from-blue-600 to-cyan-400 shadow-cyan-500/20'
                }`}
                style={{ height }}
                title={`Q${item.total.toFixed(2)}`}
              />
              <span className="text-xs font-medium capitalize text-slate-600">{item.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BillingLineChart({ recibos }: { recibos: ReciboResumenDto[] }) {
  const points = [...recibos]
    .sort((a, b) => new Date(a.fechaEmision).getTime() - new Date(b.fechaEmision).getTime())
    .slice(-7);
  const max = Math.max(...points.map((item) => item.montoTotal), 1);
  const width = 640;
  const height = 190;
  const padX = 18;
  const padY = 18;
  const step = points.length > 1 ? (width - padX * 2) / (points.length - 1) : 0;
  const coords = points.map((item, index) => {
    const x = padX + index * step;
    const y = height - padY - (item.montoTotal / max) * (height - padY * 2);
    return { x, y, item };
  });
  const path = coords.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');
  const area = coords.length > 0
    ? `${path} L ${coords[coords.length - 1].x} ${height - padY} L ${coords[0].x} ${height - padY} Z`
    : '';

  return (
    <div className="card p-4 sm:p-5">
      <div className="mb-4">
        <h2 className="font-semibold uppercase tracking-wide text-slate-950 text-sm">Historial de facturación</h2>
        <p className="text-xs text-slate-500">Evolución de los montos totales facturados en tus últimos recibos.</p>
      </div>

      {coords.length === 0 ? (
        <div className="py-10 text-center text-sm text-slate-400">No hay recibos para graficar.</div>
      ) : (
        <div className="overflow-x-auto">
          <svg viewBox={`0 0 ${width} ${height + 34}`} className="min-w-[520px] w-full">
            {[0, 1, 2, 3].map((line) => {
              const y = padY + line * ((height - padY * 2) / 3);
              return <line key={line} x1={padX} x2={width - padX} y1={y} y2={y} stroke="#e2e8f0" strokeWidth="1" />;
            })}
            <path d={area} fill="url(#billingFill)" />
            <path d={path} fill="none" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            {coords.map((point) => (
              <g key={`${point.x}-${point.item.idRecibo}`}>
                <circle cx={point.x} cy={point.y} r="4" fill="#06b6d4" stroke="#ffffff" strokeWidth="2" />
                <text x={point.x} y={height + 16} textAnchor="middle" className="fill-slate-500 text-[10px]">
                  {new Date(point.item.fechaEmision).toLocaleDateString('es-GT', { day: '2-digit', month: 'short' })}
                </text>
              </g>
            ))}
            <defs>
              <linearGradient id="billingFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.22" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.02" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      )}
    </div>
  );
}

export function ClienteDashboard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['mi-cuenta'],
    queryFn: clienteApi.miCuenta,
  });

  const { data: recibos = [], isLoading: loadingRecibos } = useQuery({
    queryKey: ['recibos-dashboard'],
    queryFn: () => clienteApi.recibos(),
  });

  const activeCounters = useMemo(
    () => data?.contadores.filter((c) => c.estado.toLowerCase() === 'activo').length ?? 0,
    [data],
  );

  if (isLoading) return <LoadingState message="Cargando tu cuenta..." />;
  if (error) return <Alert type="error" message={getErrorMessage(error)} />;
  if (!data) return null;

  const hayDeuda = data.saldoTotalPendiente > 0;
  const fullName = `${data.nombre} ${data.apellido}`.trim();

  return (
    <div className="space-y-5">
      <PageHeader
        title="Mi cuenta"
        subtitle="Resumen de tus contadores y saldo pendiente."
      />

      <section className="card p-4 sm:p-5">
        <p className="text-sm text-slate-500">Hola, {fullName}</p>
        <p className="mt-1 break-words text-sm text-slate-600">
          DPI <span className="font-mono text-cyan-700">{data.dpi}</span> · {data.correo}
        </p>
      </section>

      <section className="card overflow-hidden">
        <div className="flex items-center justify-between gap-3 px-4 py-4 sm:px-5 border-b border-slate-100">
          <h2 className="font-semibold text-slate-950 text-sm">Mis contadores</h2>
          <Link to="/cliente/recibos" className="text-xs text-cyan-700 hover:text-cyan-900 flex items-center gap-1 font-medium">
            Ver recibos <ChevronRight size={12} />
          </Link>
        </div>
        {data.contadores.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-400">No tienes contadores asociados.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead>
                <tr>
                  <th className="table-header">Número</th>
                  <th className="table-header">Dirección</th>
                  <th className="table-header">Estado</th>
                  <th className="table-header">Instalado</th>
                  <th className="table-header">Saldo</th>
                  <th className="table-header">Acción</th>
                </tr>
              </thead>
              <tbody>
                {data.contadores.map((c) => (
                  <tr key={c.numeroContador} className="hover:bg-cyan-50/40 transition-colors">
                    <td className="table-cell font-mono font-semibold text-cyan-800">{c.numeroContador}</td>
                    <td className="table-cell text-slate-600 max-w-xs truncate">{c.direccionInmueble}</td>
                    <td className="table-cell"><StatusBadge estado={c.estado} /></td>
                    <td className="table-cell text-slate-500">{formatDate(c.fechaInstalacion)}</td>
                    <td className="table-cell">
                      <Currency
                        amount={c.saldoPendiente}
                        className={c.saldoPendiente > 0 ? 'text-amber-600 font-semibold' : 'text-emerald-600 font-semibold'}
                      />
                    </td>
                    <td className="table-cell">
                      {c.saldoPendiente > 0 ? (
                        <Link
                          to={`/cliente/pagar?contador=${c.numeroContador}`}
                          className="text-xs text-cyan-700 hover:text-cyan-900 font-semibold"
                        >
                          Pagar ahora
                        </Link>
                      ) : (
                        <span className="text-xs text-slate-400">Sin deuda</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className={`rounded-xl border p-4 sm:p-5 shadow-sm animate-rise-in ${
        hayDeuda
          ? 'border-amber-200 bg-amber-50/80 text-amber-900'
          : 'border-emerald-200 bg-emerald-50/80 text-emerald-900'
      }`}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className={`mt-1 rounded-full p-1 ${hayDeuda ? 'bg-amber-500' : 'bg-emerald-500'} text-white`}>
              <CheckCircle2 size={16} />
            </div>
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide">
                {hayDeuda ? 'Saldo pendiente por pagar' : 'Servicio activo y al día'}
              </h2>
              <p className="mt-1 text-xs">
                {hayDeuda
                  ? 'Realiza tu pago antes de la fecha límite para evitar cortes.'
                  : 'Gracias. No tienes saldos pendientes acumulados a la fecha.'}
              </p>
            </div>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-[10px] font-bold uppercase tracking-wider">Tu saldo</p>
            <Currency amount={data.saldoTotalPendiente} className="text-2xl font-bold" />
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-cyan-50 p-2 text-cyan-700">
              <FileText size={18} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Historial registrado</p>
              <p className="mt-1 text-lg font-semibold text-slate-950">
                {loadingRecibos ? 'Cargando...' : `${recibos.length} facturas emitidas`}
              </p>
            </div>
          </div>
        </div>
        <div className="card p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-700">
              <Wallet size={18} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Moneda de cuenta</p>
              <p className="mt-1 text-lg font-semibold text-slate-950">Quetzales (GTQ)</p>
            </div>
          </div>
        </div>
      </section>

      <ConsumptionBars recibos={recibos} />
      <BillingLineChart recibos={recibos} />

      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="card p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-2 text-blue-700">
              <Zap size={18} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Contadores activos</p>
              <p className="mt-1 text-lg font-semibold text-slate-950">{activeCounters} de {data.contadores.length}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
