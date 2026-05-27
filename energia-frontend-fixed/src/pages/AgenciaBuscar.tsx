import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Search, User, FileText, Filter } from 'lucide-react';
import { agenciaApi } from '../api/agencia';
import { buscarClienteSchema, type BuscarClienteForm } from '../schemas';
import { getErrorMessage } from '../api/client';
import { Alert, PageHeader, Spinner, Currency, StatusBadge } from '../components/ui';
import type { MiCuentaResponseDto, ReciboResumenDto } from '../types';

export function AgenciaBuscar() {
  const [cliente, setCliente] = useState<MiCuentaResponseDto | null>(null);
  const [recibos, setRecibos] = useState<ReciboResumenDto[] | null>(null);
  const [filtroEstado, setFiltroEstado] = useState('');
  const [apiError, setApiError] = useState('');
  const [loadingRecibos, setLoadingRecibos] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<BuscarClienteForm>({
    resolver: zodResolver(buscarClienteSchema),
  });

  const mutation = useMutation({
    mutationFn: agenciaApi.consultarCliente,
    onSuccess: async (data) => {
      setCliente(data);
      setApiError('');
      setRecibos(null);
      // Auto-load receipts
      setLoadingRecibos(true);
      try {
        const r = await agenciaApi.recibosCliente(data.dpi);
        setRecibos(r);
      } catch {
        setRecibos([]);
      } finally {
        setLoadingRecibos(false);
      }
    },
    onError: (e) => {
      setCliente(null);
      setRecibos(null);
      setApiError(getErrorMessage(e));
    },
  });

  const filteredRecibos = recibos?.filter((r) =>
    filtroEstado ? r.estado.toLowerCase() === filtroEstado.toLowerCase() : true
  );

  return (
    <div>
      <PageHeader title="Buscar Cliente" subtitle="Consulta la cuenta de un cliente por su DPI" />

      {/* Search form */}
      <div className="card p-4 sm:p-5 mb-6">
        <form
          onSubmit={handleSubmit((d) => mutation.mutate(d.dpi))}
          className="flex flex-col gap-3 sm:flex-row sm:items-end"
        >
          <div className="flex-1">
            <label className="label">DPI del cliente</label>
            <input
              {...register('dpi')}
              type="text"
              placeholder="1234567890101"
              className={`input-field font-mono ${errors.dpi ? 'input-error' : ''}`}
            />
            {errors.dpi && <p className="error-text">{errors.dpi.message}</p>}
          </div>
          <button type="submit" disabled={mutation.isPending} className="btn-primary">
            {mutation.isPending ? <Spinner size={16} /> : <Search size={16} />}
            {mutation.isPending ? 'Buscando...' : 'Buscar'}
          </button>
        </form>
      </div>

      {apiError && <Alert type="error" message={apiError} />}

      {/* Client data */}
      {cliente && (
        <div className="space-y-5">
          {/* Info card */}
          <div className="card p-4 sm:p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                <User size={18} className="text-blue-600" />
              </div>
              <div>
                <div className="font-semibold text-slate-900">{cliente.nombre} {cliente.apellido}</div>
                <div className="text-xs text-slate-500">DPI: {cliente.dpi}</div>
              </div>
              <div className="ml-auto text-right">
                <div className="text-xs text-slate-500">Saldo total</div>
                <Currency
                  amount={cliente.saldoTotalPendiente}
                  className={`font-semibold text-lg ${cliente.saldoTotalPendiente > 0 ? 'text-amber-600' : 'text-emerald-600'}`}
                />
              </div>
            </div>
            <div className="text-sm text-slate-500">{cliente.correo}</div>

            {/* Counters */}
            <div className="mt-4 pt-4 border-t border-slate-100">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Contadores</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {cliente.contadores.map((c) => (
                  <div key={c.numeroContador} className="border border-slate-200 rounded-lg p-3 text-sm">
                    <div className="flex justify-between items-start">
                      <span className="font-mono font-medium text-blue-700">{c.numeroContador}</span>
                      <StatusBadge estado={c.estado} />
                    </div>
                    <div className="text-xs text-slate-500 mt-1 truncate">{c.direccionInmueble}</div>
                    <div className="mt-2">
                      <Currency
                        amount={c.saldoPendiente}
                        className={`font-medium ${c.saldoPendiente > 0 ? 'text-amber-600' : 'text-emerald-600'}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Receipts */}
          <div className="card">
            <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-slate-400" />
                <h3 className="font-semibold text-slate-900 text-sm">
                  Recibos {recibos ? `(${filteredRecibos?.length ?? 0})` : ''}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <Filter size={14} className="text-slate-400" />
                <select
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value)}
                  className="text-sm border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400"
                >
                  <option value="">Todos</option>
                  <option value="Pendiente">Pendiente</option>
                  <option value="Pagado">Pagado</option>
                </select>
              </div>
            </div>

            {loadingRecibos && (
              <div className="flex justify-center py-10"><Spinner /></div>
            )}

            {!loadingRecibos && filteredRecibos && filteredRecibos.length === 0 && (
              <div className="py-10 text-center text-sm text-slate-400">No hay recibos.</div>
            )}

            {!loadingRecibos && filteredRecibos && filteredRecibos.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px]">
                  <thead>
                    <tr>
                      <th className="table-header">ID</th>
                      <th className="table-header">Contador</th>
                      <th className="table-header">Fecha</th>
                      <th className="table-header">Total</th>
                      <th className="table-header">Pendiente</th>
                      <th className="table-header">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecibos.map((r) => (
                      <tr key={r.idRecibo} className="hover:bg-slate-50 transition-colors">
                        <td className="table-cell font-mono text-xs text-slate-400">#{r.idRecibo}</td>
                        <td className="table-cell font-mono text-blue-700 font-medium">{r.numeroContador}</td>
                        <td className="table-cell text-slate-500">{new Date(r.fechaEmision).toLocaleDateString('es-GT')}</td>
                        <td className="table-cell"><Currency amount={r.montoTotal} /></td>
                        <td className="table-cell">
                          <Currency
                            amount={r.saldoPendiente}
                            className={r.saldoPendiente > 0 ? 'text-amber-600 font-medium' : 'text-emerald-600 font-medium'}
                          />
                        </td>
                        <td className="table-cell"><StatusBadge estado={r.estado} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
