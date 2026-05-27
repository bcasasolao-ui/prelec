import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Activity, Zap } from 'lucide-react';
import { agenciaApi } from '../api/agencia';
import { lecturaSchema, type LecturaForm } from '../schemas';
import { getErrorMessage } from '../api/client';
import { Alert, PageHeader, Spinner, Currency, useToast } from '../components/ui';
import type { ConsultarDeudaResponseDto } from '../types';

export function AgenciaLectura() {
  const { showToast } = useToast();
  const [result, setResult] = useState<ConsultarDeudaResponseDto | null>(null);
  const [apiError, setApiError] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LecturaForm>({ resolver: zodResolver(lecturaSchema) });

  const mutation = useMutation({
    mutationFn: agenciaApi.registrarLectura,
    onSuccess: (data) => {
      setResult(data);
      setApiError('');
      showToast({
        type: 'success',
        title: 'Lectura registrada',
        message: `Se generó saldo para el contador ${data.numeroContador}.`,
      });
      reset();
    },
    onError: (e) => {
      const message = getErrorMessage(e);
      setResult(null);
      setApiError(message);
      showToast({ type: 'error', title: 'No se pudo registrar la lectura', message });
    },
  });

  return (
    <div>
      <PageHeader title="Registrar Lectura" subtitle="Registra la lectura de un contador y genera el recibo" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-4 sm:p-6">
          <h2 className="font-semibold text-slate-900 mb-5 flex items-center gap-2">
            <Activity size={18} className="text-blue-600" />
            Datos de lectura
          </h2>

          {apiError && <div className="mb-4"><Alert type="error" message={apiError} /></div>}

          <form onSubmit={handleSubmit((d) => mutation.mutate({ numeroContador: d.numeroContador, kilovatios: Number(d.kilovatios) }))} className="space-y-4">
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
              <label className="label">Consumo registrado (kWh)</label>
              <div className="relative">
                <input
                  {...register('kilovatios')}
                  type="number"
                  min="1"
                  placeholder="Ej. 150"
                  className={`input-field pr-12 ${errors.kilovatios ? 'input-error' : ''}`}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">kWh</span>
              </div>
              {errors.kilovatios && <p className="error-text">{errors.kilovatios.message}</p>}
            </div>

            <button
              type="submit"
              disabled={mutation.isPending}
              className="btn-primary w-full justify-center py-3 mt-2"
            >
              {mutation.isPending ? <Spinner size={16} /> : <Activity size={16} />}
              {mutation.isPending ? 'Registrando...' : 'Registrar lectura'}
            </button>
          </form>

        </div>

        <div>
          {result && (
            <div className="card p-4 sm:p-6 border-emerald-200">
              <div className="flex items-center gap-3 mb-4 text-emerald-700">
                <Zap size={24} />
                <h3 className="font-semibold text-lg">Recibo generado</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-3 border-b border-slate-100">
                  <span className="text-slate-500">Contador</span>
                  <span className="font-mono font-medium text-blue-700">{result.numeroContador}</span>
                </div>
                <div className="flex justify-between py-3">
                  <span className="text-slate-500">Saldo generado</span>
                  <Currency amount={result.saldoPendiente} className="text-xl font-semibold text-amber-600" />
                </div>
              </div>
              <div className="mt-4">
                <Alert type="success" message="La lectura fue registrada y el recibo fue generado exitosamente." />
              </div>
            </div>
          )}

          {!result && (
            <div className="card p-4 sm:p-6">
              <h3 className="font-semibold text-slate-900 mb-3">Notas de operación</h3>
              <ul className="space-y-3 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <Zap size={14} className="text-blue-500 shrink-0 mt-0.5" />
                  El sistema calcula automáticamente el monto del recibo según la tarifa vigente.
                </li>
                <li className="flex items-start gap-2">
                  <Zap size={14} className="text-blue-500 shrink-0 mt-0.5" />
                  Solo se puede registrar una lectura si el contador está activo.
                </li>
                <li className="flex items-start gap-2">
                  <Zap size={14} className="text-blue-500 shrink-0 mt-0.5" />
                  El recibo quedará en estado Pendiente hasta que el cliente realice su pago.
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
