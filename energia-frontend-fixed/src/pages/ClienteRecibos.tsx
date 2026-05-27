import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileText, Filter, Printer } from 'lucide-react';
import { clienteApi } from '../api/energiaCliente';
import {
  LoadingState, Alert, StatusBadge, Currency, PageHeader,
  EmptyState, Modal, Spinner,
} from '../components/ui';
import { getErrorMessage } from '../api/client';
import type { MiCuentaResponseDto, ReciboResumenDto } from '../types';

const COMPANY_NAME = 'ENERGIA DE GUATEMALA, S.A.';
const COMPANY_NIT = '4589201-5';
const TAX_RATE = 0.12;

function formatInvoiceDate(value: string) {
  return new Date(value).toLocaleString('es-GT', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function buildAuthorization(recibo: ReciboResumenDto) {
  const source = `${recibo.idRecibo}-${recibo.numeroContador}-${recibo.fechaEmision}`;
  let hash = 0;
  for (let i = 0; i < source.length; i += 1) {
    hash = (hash * 31 + source.charCodeAt(i)) >>> 0;
  }
  const padded = hash.toString(16).toUpperCase().padStart(8, '0');
  return `${padded.slice(0, 8)}-${recibo.idRecibo.toString().padStart(4, '0')}-4BC3-A8F4`;
}

function InvoiceModal({
  recibo,
  cuenta,
  onClose,
}: {
  recibo: ReciboResumenDto;
  cuenta?: MiCuentaResponseDto;
  onClose: () => void;
}) {
  const subtotal = recibo.montoTotal / (1 + TAX_RATE);
  const iva = recibo.montoTotal - subtotal;
  const clientName = cuenta ? `${cuenta.nombre} ${cuenta.apellido}`.trim() : 'Cliente';
  const isPaid = recibo.estado?.toLowerCase() === 'pagado';
  const barcodeBars = Array.from({ length: 34 }, (_, index) => (
    <span
      key={index}
      className="h-4 border-l border-slate-700"
      style={{ opacity: index % 5 === 0 ? 0.9 : 0.45 }}
    />
  ));

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/45 p-4 backdrop-blur-sm">
      <div className="invoice-actions mx-auto mb-4 flex max-w-4xl justify-end gap-2">
        <button type="button" onClick={onClose} className="btn-secondary text-sm">
          Cerrar
        </button>
        <button type="button" onClick={() => window.print()} className="btn-primary text-sm">
          <Printer size={16} />
          Imprimir / Guardar PDF
        </button>
      </div>

      <article className="invoice-print-root mx-auto max-w-4xl rounded-xl border border-slate-200 bg-white p-6 text-slate-800 shadow-2xl sm:p-8">
        <header className="flex flex-col gap-5 border-b-2 border-blue-600 pb-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-wide text-blue-900 sm:text-3xl">{COMPANY_NAME}</h2>
            <p className="mt-2 text-sm text-slate-500">Distribuidora de Energia Electrica</p>
            <p className="text-sm text-slate-500">NIT: {COMPANY_NIT} · SAT-FEL</p>
          </div>
          <div className="text-left sm:text-right">
            <h1 className="text-2xl font-bold text-slate-900">FACTURA ELECTRONICA</h1>
            <p className="mt-1 text-sm text-slate-500">Documento Tributario Electronico</p>
            <span className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase ${isPaid ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
              {isPaid ? 'Totalmente pagado' : 'Pendiente de pago'}
            </span>
          </div>
        </header>

        <section className="mt-7 grid gap-4 rounded-lg bg-slate-50 p-5 text-sm sm:grid-cols-2">
          <div className="space-y-3">
            <p><span className="font-bold">Numero de Autorizacion (DTE):</span> <span className="font-mono">{buildAuthorization(recibo)}</span></p>
            <p><span className="font-bold">No. de Recibo:</span> #{recibo.idRecibo}</p>
            <p><span className="font-bold">Fecha de Emision:</span> {formatInvoiceDate(recibo.fechaEmision)}</p>
          </div>
          <div className="space-y-3 sm:text-right">
            <p><span className="font-bold">Numero de Contador:</span> <span className="font-mono">{recibo.numeroContador}</span></p>
            <p><span className="font-bold">Cliente:</span> {clientName}</p>
            <p><span className="font-bold">NIT:</span> CF</p>
          </div>
        </section>

        <section className="mt-8">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-300 bg-slate-100">
                <th className="px-4 py-3 text-left font-bold text-slate-600">Descripcion del Cargo</th>
                <th className="px-4 py-3 text-right font-bold text-slate-600">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-200">
                <td className="px-4 py-4">Consumo de Energia Electrica Registrado en Medidor Comercial autorizado por CNEE.</td>
                <td className="px-4 py-4 text-right">Q{subtotal.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section className="mt-7 ml-auto max-w-xs space-y-3 text-sm">
          <div className="flex justify-between gap-8">
            <span>Subtotal (sin IVA):</span>
            <span>Q{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between gap-8">
            <span>IVA (12%):</span>
            <span>Q{iva.toFixed(2)}</span>
          </div>
          <div className="flex justify-between gap-8 border-t border-slate-300 pt-3 text-xl font-bold text-blue-900">
            <span>Total General:</span>
            <Currency amount={recibo.montoTotal} />
          </div>
        </section>

        <footer className="mt-14 border-t border-dashed border-slate-200 pt-6 text-center text-xs text-slate-400">
          <p>Sujeto a pagos trimestrales del ISR / Certificador: FEL-Guate-Express</p>
          <div className="mx-auto mt-7 flex h-6 max-w-md items-center justify-center gap-2 bg-slate-100 px-4 font-mono text-slate-700">
            {barcodeBars}
            <span className="ml-3"># {recibo.idRecibo}</span>
          </div>
          <p className="mt-4">Gracias por mantenerte al dia con tu servicio electrico.</p>
        </footer>
      </article>
    </div>
  );
}

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
  const [invoice, setInvoice] = useState<ReciboResumenDto | null>(null);

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
                  <th className="table-header">Acción</th>
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
                        onClick={() => setInvoice(r)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                      >
                        <span aria-hidden="true">📥</span>
                        Factura
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
      {invoice && <InvoiceModal recibo={invoice} cuenta={cuenta} onClose={() => setInvoice(null)} />}
    </div>
  );
}
