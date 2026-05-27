import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileText, Filter } from 'lucide-react';
import { clienteApi } from '../api/energiaCliente';
import {
  LoadingState, Alert, StatusBadge, Currency, PageHeader,
  EmptyState, Modal, Spinner,
} from '../components/ui';
import { getErrorMessage } from '../api/client';
import type { ReciboResumenDto } from '../types';

function PagosModal({ recibo, onClose }: { recibo: ReciboResumenDto; onClose: () => void }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['pagos-recibo', recibo.idRecibo],
    queryFn: () => clienteApi.pagosDeRecibo(recibo.idRecibo),
  });

  return (
    <Modal open onClose={onClose} title={`Pagos — Recibo #${recibo.idRecibo}`}>
      <div className="mb-4 p-3 bg-slate-50 rounded-lg text-sm">
        <div className="flex justify-between">
          <span className="text-slate-500">Contador</span>
          <span className="font-mono font-medium text-blue-700">{recibo.numeroContador}</span>
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-slate-500">Monto total</span>
          <Currency amount={recibo.montoTotal} className="font-medium" />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-slate-500">Saldo pendiente</span>
          <Currency amount={recibo.saldoPendiente} className={recibo.saldoPendiente > 0 ? 'text-amber-600 font-medium' : 'text-emerald-600 font-medium'} />
        </div>
      </div>

      {isLoading && <div className="flex justify-center py-8"><Spinner /></div>}
      {error && <Alert type="error" message={getErrorMessage(error)} />}
      {data && data.length === 0 && (
        <p className="text-sm text-slate-400 text-center py-6">No hay pagos registrados.</p>
      )}
      {data && data.length > 0 && (
        <div className="space-y-2">
          {data.map((p) => (
            <div key={p.idPago} className="border border-slate-200 rounded-lg p-3 text-sm">
              <div className="flex justify-between mb-1">
                <span className="text-slate-500">Monto</span>
                <Currency amount={p.monto} className="font-medium text-emerald-700" />
              </div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-500">Canal</span>
                <span className="font-medium">{p.canalPago}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-500">Fecha</span>
                <span>{new Date(p.fechaCobro).toLocaleDateString('es-GT')}</span>
              </div>
              {p.codigoAutorizacionBanco && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Ref. banco</span>
                  <span className="font-mono text-xs">{p.codigoAutorizacionBanco}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}

export function ClienteRecibos() {
  const [filtroContador, setFiltroContador] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [selected, setSelected] = useState<ReciboResumenDto | null>(null);

  const { data: cuenta } = useQuery({ queryKey: ['mi-cuenta'], queryFn: clienteApi.miCuenta });

  const { data, isLoading, error } = useQuery({
    queryKey: ['recibos', filtroContador, filtroEstado],
    queryFn: () => clienteApi.recibos({
      numeroContador: filtroContador || undefined,
      estado: filtroEstado || undefined,
    }),
  });

  return (
    <div>
      <PageHeader title="Mis Recibos" subtitle="Historial de facturación" />

      {/* Filters */}
      <div className="card p-4 mb-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="flex items-center gap-2 text-sm text-slate-500 sm:mr-2">
          <Filter size={14} />
          <span>Filtros</span>
        </div>
        <div className="w-full sm:flex-1 sm:min-w-40">
          <label className="label">Contador</label>
          <select
            value={filtroContador}
            onChange={(e) => setFiltroContador(e.target.value)}
            className="input-field"
          >
            <option value="">Todos los contadores</option>
            {cuenta?.contadores.map((c) => (
              <option key={c.numeroContador} value={c.numeroContador}>
                {c.numeroContador}
              </option>
            ))}
          </select>
        </div>
        <div className="w-full sm:flex-1 sm:min-w-32">
          <label className="label">Estado</label>
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="input-field"
          >
            <option value="">Todos</option>
            <option value="Pendiente">Pendiente</option>
            <option value="Pagado">Pagado</option>
          </select>
        </div>
        <button
          onClick={() => { setFiltroContador(''); setFiltroEstado(''); }}
          className="btn-secondary text-sm"
        >
          Limpiar
        </button>
      </div>

      {/* Table */}
      <div className="card">
        <div className="px-4 py-4 sm:px-5 border-b border-slate-100 flex items-center gap-2">
          <FileText size={16} className="text-slate-400" />
          <h2 className="font-semibold text-slate-900 text-sm">
            Recibos {data ? `(${data.length})` : ''}
          </h2>
        </div>

        {isLoading && <LoadingState message="Cargando recibos..." />}
        {error && <div className="p-5"><Alert type="error" message={getErrorMessage(error)} /></div>}
        {data && data.length === 0 && (
          <EmptyState message="No se encontraron recibos con los filtros seleccionados" icon={<FileText size={36} />} />
        )}
        {data && data.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead>
                <tr>
                  <th className="table-header">ID</th>
                  <th className="table-header">Contador</th>
                  <th className="table-header">Fecha emisión</th>
                  <th className="table-header">Monto total</th>
                  <th className="table-header">Saldo pendiente</th>
                  <th className="table-header">Estado</th>
                  <th className="table-header">Pagos</th>
                </tr>
              </thead>
              <tbody>
                {data.map((r) => (
                  <tr key={r.idRecibo} className="hover:bg-slate-50 transition-colors">
                    <td className="table-cell font-mono text-xs text-slate-500">#{r.idRecibo}</td>
                    <td className="table-cell font-mono font-medium text-blue-700">{r.numeroContador}</td>
                    <td className="table-cell text-slate-500">
                      {new Date(r.fechaEmision).toLocaleDateString('es-GT')}
                    </td>
                    <td className="table-cell font-medium"><Currency amount={r.montoTotal} /></td>
                    <td className="table-cell">
                      <Currency
                        amount={r.saldoPendiente}
                        className={r.saldoPendiente > 0 ? 'text-amber-600 font-medium' : 'text-emerald-600 font-medium'}
                      />
                    </td>
                    <td className="table-cell"><StatusBadge estado={r.estado} /></td>
                    <td className="table-cell">
                      <button
                        onClick={() => setSelected(r)}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Ver pagos
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && <PagosModal recibo={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
