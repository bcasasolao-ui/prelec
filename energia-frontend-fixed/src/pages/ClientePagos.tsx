import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreditCard, AlertTriangle, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { clienteApi } from '../api/energiaCliente';
import { pagarSchema, type PagarForm } from '../schemas';
import { getErrorMessage } from '../api/client';
import { LoadingState, Alert, Currency, PageHeader, Spinner, useToast } from '../components/ui';
import type { PagarSaldoClienteResponseDto } from '../types';

export function ClientePagos() {
  const [searchParams] = useSearchParams();
  const qc = useQueryClient();
  const { showToast } = useToast();
  const [showPin, setShowPin] = useState(false);
  const [result, setResult] = useState<PagarSaldoClienteResponseDto | null>(null);
  const [apiError, setApiError] = useState('');

  const { data: cuenta, isLoading } = useQuery({
    queryKey: ['mi-cuenta'],
    queryFn: clienteApi.miCuenta,
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<PagarForm>({ resolver: zodResolver(pagarSchema) });

  const contadorWatch = watch('numeroContador');

  useEffect(() => {
    const c = searchParams.get('contador');
    if (c) setValue('numeroContador', c);
  }, [searchParams, setValue]);

  const selectedCounter = cuenta?.contadores.find((c) => c.numeroContador === contadorWatch);

  const mutation = useMutation({
    mutationFn: clienteApi.pagar,
    onSuccess: (data) => {
      setResult(data);
      if (data.aplicadoEnEnergia) {
        showToast({
          type: 'success',
          title: 'Pago aplicado',
          message: `Se registró el pago del contador ${data.numeroContador}.`,
        });
        qc.invalidateQueries({ queryKey: ['mi-cuenta'] });
        qc.invalidateQueries({ queryKey: ['recibos'] });
        reset();
      } else {
        showToast({
          type: 'warning',
          title: 'Pago con advertencia',
          message: 'Guarda la referencia bancaria y contacta soporte.',
        });
      }
    },
    onError: (e) => {
      const message = getErrorMessage(e);
      setApiError(message);
      showToast({ type: 'error', title: 'No se pudo procesar el pago', message });
    },
  });

  const onSubmit = (data: PagarForm) => {
    setResult(null);
    setApiError('');
    mutation.mutate(data);
  };

  if (isLoading) return <LoadingState message="Cargando contadores..." />;

  const contadoresConDeuda = cuenta?.contadores.filter((c) => c.saldoPendiente > 0) ?? [];

  return (
    <div>
      <PageHeader title="Pagar Saldo" subtitle="Paga el saldo total de un contador con tu tarjeta" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="card p-4 sm:p-6">
          <h2 className="font-semibold text-slate-900 mb-5 flex items-center gap-2">
            <CreditCard size={18} className="text-blue-600" />
            Datos de pago
          </h2>

          {contadoresConDeuda.length === 0 && (
            <Alert type="success" message="¡Excelente! No tienes saldo pendiente en ningún contador." />
          )}

          {apiError && <div className="mb-4"><Alert type="error" message={apiError} /></div>}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label">Contador a pagar</label>
              <select
                {...register('numeroContador')}
                className={`input-field ${errors.numeroContador ? 'input-error' : ''}`}
              >
                <option value="">Selecciona un contador</option>
                {contadoresConDeuda.map((c) => (
                  <option key={c.numeroContador} value={c.numeroContador}>
                    {c.numeroContador} — Q{c.saldoPendiente.toFixed(2)} pendiente
                  </option>
                ))}
              </select>
              {errors.numeroContador && <p className="error-text">{errors.numeroContador.message}</p>}
            </div>

            {selectedCounter && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-center gap-2 text-amber-700 text-sm font-medium mb-1">
                  <AlertTriangle size={14} />
                  Saldo a cobrar
                </div>
                <div className="text-2xl font-semibold text-amber-700">
                  <Currency amount={selectedCounter.saldoPendiente} />
                </div>
                <div className="text-xs text-amber-600 mt-1">{selectedCounter.direccionInmueble}</div>
              </div>
            )}

            <div>
              <label className="label">Número de tarjeta</label>
              <input
                {...register('numeroTarjeta')}
                type="text"
                placeholder="1234 5678 9012 3456"
                maxLength={20}
                className={`input-field font-mono ${errors.numeroTarjeta ? 'input-error' : ''}`}
              />
              {errors.numeroTarjeta && <p className="error-text">{errors.numeroTarjeta.message}</p>}
            </div>

            <div>
              <label className="label">PIN</label>
              <div className="relative">
                <input
                  {...register('pin')}
                  type={showPin ? 'text' : 'password'}
                  placeholder="••••"
                  maxLength={10}
                  className={`input-field pr-10 font-mono ${errors.pin ? 'input-error' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPin ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.pin && <p className="error-text">{errors.pin.message}</p>}
            </div>

            <div>
              <label className="label">Referencia (opcional)</label>
              <input
                {...register('referenciaCliente')}
                type="text"
                placeholder="Referencia propia"
                className="input-field"
              />
            </div>

            <button
              type="submit"
              disabled={mutation.isPending || contadoresConDeuda.length === 0}
              className="btn-primary w-full justify-center py-3 mt-2"
            >
              {mutation.isPending ? <Spinner size={16} /> : <CreditCard size={16} />}
              {mutation.isPending ? 'Procesando pago...' : 'Pagar ahora'}
            </button>
          </form>
        </div>

        {/* Result */}
        <div>
          {result && (
            <div className={`card p-4 sm:p-6 ${result.aplicadoEnEnergia ? 'border-emerald-200' : 'border-red-200'}`}>
              <div className={`flex items-center gap-3 mb-4 ${result.aplicadoEnEnergia ? 'text-emerald-700' : 'text-red-700'}`}>
                <CheckCircle2 size={24} />
                <h3 className="font-semibold text-lg">
                  {result.aplicadoEnEnergia ? 'Pago exitoso' : 'Pago con advertencia'}
                </h3>
              </div>

              <p className="text-sm text-slate-600 mb-5">{result.mensaje}</p>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Contador</span>
                  <span className="font-mono font-medium">{result.numeroContador}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Monto pagado</span>
                  <Currency amount={result.montoPagado} className="font-semibold text-emerald-700" />
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Saldo restante</span>
                  <Currency amount={result.saldoRestante} className={result.saldoRestante > 0 ? 'text-amber-600 font-medium' : 'text-emerald-600 font-medium'} />
                </div>
                {result.referenciaBanco && (
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500">Ref. banco</span>
                    <span className="font-mono text-xs">{result.referenciaBanco}</span>
                  </div>
                )}
                <div className="flex justify-between py-2">
                  <span className="text-slate-500">Aplicado en sistema</span>
                  <span className={`font-medium ${result.aplicadoEnEnergia ? 'text-emerald-600' : 'text-red-600'}`}>
                    {result.aplicadoEnEnergia ? 'Sí' : 'No — Contacta soporte'}
                  </span>
                </div>
              </div>

              {!result.aplicadoEnEnergia && result.referenciaBanco && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                  <strong>Importante:</strong> Guarda la referencia bancaria{' '}
                  <code className="bg-red-100 px-1 rounded">{result.referenciaBanco}</code>{' '}
                  y contacta a soporte para conciliar el pago. No repitas el pago.
                </div>
              )}
            </div>
          )}

          {!result && (
            <div className="card p-4 sm:p-6 h-fit">
              <h3 className="font-semibold text-slate-900 mb-3">Información de pago</h3>
              <ul className="space-y-3 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</span>
                  El monto es calculado automáticamente por el sistema para evitar errores.
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</span>
                  El pago se procesa a través de la entidad bancaria asociada de forma segura.
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</span>
                  Guarda siempre la referencia bancaria como comprobante.
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
