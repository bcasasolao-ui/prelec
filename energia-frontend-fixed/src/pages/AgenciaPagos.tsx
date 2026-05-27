import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { DollarSign, Receipt } from 'lucide-react';
import { agenciaApi } from '../api/agencia';
import { pagoEfectivoSchema, type PagoEfectivoForm } from '../schemas';
import { getErrorMessage } from '../api/client';
import { Alert, PageHeader, Spinner, Currency, useToast } from '../components/ui';
import type { ResultadoPagoDto } from '../types';

export function AgenciaPagos() {
  const { showToast } = useToast();
  const [result, setResult] = useState<ResultadoPagoDto | null>(null);
  const [apiError, setApiError] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PagoEfectivoForm>({ resolver: zodResolver(pagoEfectivoSchema) });

  const mutation = useMutation({
    mutationFn: agenciaApi.pagoEfectivo,
    onSuccess: (data) => {
      setResult(data);
      setApiError('');
      showToast({
        type: data.exito ? 'success' : 'warning',
        title: data.exito ? 'Pago registrado' : 'Pago no aplicado',
        message: data.mensaje ?? `${data.recibosAfectados} recibos afectados.`,
      });
      if (data.exito) reset();
    },
    onError: (e) => {
      const message = getErrorMessage(e);
      setResult(null);
      setApiError(message);
      showToast({ type: 'error', title: 'No se pudo registrar el pago', message });
    },
  });

  return (
    <div>
      <PageHeader title="Pago en Efectivo" subtitle="Registra un pago recibido en agencia" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-4 sm:p-6">
          <h2 className="font-semibold text-slate-900 mb-5 flex items-center gap-2">
            <DollarSign size={18} className="text-amber-600" />
            Datos del pago
          </h2>

          {apiError && <div className="mb-4"><Alert type="error" message={apiError} /></div>}

          <form onSubmit={handleSubmit((d) => mutation.mutate({ numeroContador: d.numeroContador, montoRecibido: Number(d.montoRecibido) }))} className="space-y-4">
            <div>
              <label className="label">Número de contador</label>
              <input
                {...register('numeroContador')}
                type="text"
                placeholder="Ej. CTR-00123"
                className={`input-field font-mono ${errors.numeroContador ? 'input-error' : ''}`}
              />
              {errors.numeroContador && <p className="error-text">{errors.numeroContador.message}</p>}
            </div>

            <div>
              <label className="label">Monto recibido (Q)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm">Q</span>
                <input
                  {...register('montoRecibido')}
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  className={`input-field pl-7 ${errors.montoRecibido ? 'input-error' : ''}`}
                />
              </div>
              {errors.montoRecibido && <p className="error-text">{errors.montoRecibido.message}</p>}
            </div>

            <button
              type="submit"
              disabled={mutation.isPending}
              className="btn-primary w-full justify-center py-3 mt-2"
            >
              {mutation.isPending ? <Spinner size={16} /> : <DollarSign size={16} />}
              {mutation.isPending ? 'Procesando...' : 'Registrar pago'}
            </button>
          </form>
        </div>

        <div>
          {result && (
            <div className={`card p-4 sm:p-6 ${result.exito ? 'border-emerald-200' : 'border-red-200'}`}>
              <div className={`flex items-center gap-3 mb-4 ${result.exito ? 'text-emerald-700' : 'text-red-700'}`}>
                <Receipt size={24} />
                <h3 className="font-semibold text-lg">
                  {result.exito ? 'Pago registrado' : 'Error en pago'}
                </h3>
              </div>

              {result.mensaje && (
                <p className="text-sm text-slate-600 mb-4">{result.mensaje}</p>
              )}

              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-3 border-b border-slate-100">
                  <span className="text-slate-500">Monto aplicado</span>
                  <Currency amount={result.montoAplicado} className="font-semibold text-emerald-700" />
                </div>
                <div className="flex justify-between py-3 border-b border-slate-100">
                  <span className="text-slate-500">Saldo restante</span>
                  <Currency
                    amount={result.saldoRestante}
                    className={result.saldoRestante > 0 ? 'text-amber-600 font-medium' : 'text-emerald-600 font-medium'}
                  />
                </div>
                <div className="flex justify-between py-3">
                  <span className="text-slate-500">Recibos afectados</span>
                  <span className="font-medium">{result.recibosAfectados}</span>
                </div>
              </div>
            </div>
          )}

          {!result && (
            <div className="card p-4 sm:p-6">
              <h3 className="font-semibold text-slate-900 mb-3">Notas</h3>
              <ul className="space-y-3 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <DollarSign size={14} className="text-amber-500 shrink-0 mt-0.5" />
                  El pago se aplica automáticamente a los recibos pendientes más antiguos.
                </li>
                <li className="flex items-start gap-2">
                  <DollarSign size={14} className="text-amber-500 shrink-0 mt-0.5" />
                  Si el monto supera la deuda total, el excedente no se acredita como saldo a favor.
                </li>
                <li className="flex items-start gap-2">
                  <DollarSign size={14} className="text-amber-500 shrink-0 mt-0.5" />
                  Canal de pago registrado: <strong>AGENCIA_LOCAL</strong>.
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
