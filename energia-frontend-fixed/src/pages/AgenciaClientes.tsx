import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserPlus, Copy, CheckCheck } from 'lucide-react';
import { agenciaApi } from '../api/agencia';
import { crearClienteSchema, type CrearClienteForm } from '../schemas';
import { getErrorMessage } from '../api/client';
import { Alert, PageHeader, Spinner, useToast } from '../components/ui';
import type { CrearClienteConContadorResponse } from '../types';

export function AgenciaClientes() {
  const { showToast } = useToast();
  const [result, setResult] = useState<CrearClienteConContadorResponse | null>(null);
  const [apiError, setApiError] = useState('');
  const [copied, setCopied] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CrearClienteForm>({ resolver: zodResolver(crearClienteSchema) });

  const mutation = useMutation({
    mutationFn: agenciaApi.crearCliente,
    onSuccess: (data) => {
      setResult(data);
      setApiError('');
      showToast({
        type: 'success',
        title: 'Cliente creado',
        message: `Usuario ${data.usuarioAsignado} y contador ${data.numeroContador} generados.`,
      });
      reset();
    },
    onError: (e) => {
      const message = getErrorMessage(e);
      setResult(null);
      setApiError(message);
      showToast({ type: 'error', title: 'No se pudo crear el cliente', message });
    },
  });

  const copyCredentials = () => {
    if (!result) return;
    const text = `Usuario: ${result.usuarioAsignado}\nContraseña temporal: ${result.passwordTemporal}\nContador: ${result.numeroContador}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      showToast({ type: 'info', title: 'Credenciales copiadas', message: 'Ya puedes entregarlas al cliente.' });
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div>
      <PageHeader title="Crear Cliente" subtitle="Registra un nuevo cliente y genera su contador" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-4 sm:p-6">
          <h2 className="font-semibold text-slate-900 mb-5 flex items-center gap-2">
            <UserPlus size={18} className="text-emerald-600" />
            Datos del cliente
          </h2>

          {apiError && <div className="mb-4"><Alert type="error" message={apiError} /></div>}

          <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
            <div>
              <label className="label">DPI</label>
              <input
                {...register('dpi')}
                type="text"
                placeholder="1234567890101"
                maxLength={20}
                className={`input-field font-mono ${errors.dpi ? 'input-error' : ''}`}
              />
              {errors.dpi && <p className="error-text">{errors.dpi.message}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Nombre</label>
                <input
                  {...register('nombre')}
                  type="text"
                  placeholder="Juan"
                  className={`input-field ${errors.nombre ? 'input-error' : ''}`}
                />
                {errors.nombre && <p className="error-text">{errors.nombre.message}</p>}
              </div>
              <div>
                <label className="label">Apellido</label>
                <input
                  {...register('apellido')}
                  type="text"
                  placeholder="Pérez"
                  className={`input-field ${errors.apellido ? 'input-error' : ''}`}
                />
                {errors.apellido && <p className="error-text">{errors.apellido.message}</p>}
              </div>
            </div>

            <div>
              <label className="label">Correo electrónico</label>
              <input
                {...register('correo')}
                type="email"
                placeholder="juan@correo.com"
                className={`input-field ${errors.correo ? 'input-error' : ''}`}
              />
              {errors.correo && <p className="error-text">{errors.correo.message}</p>}
            </div>

            <div>
              <label className="label">Dirección del inmueble</label>
              <textarea
                {...register('direccionInmueble')}
                rows={2}
                placeholder="Zona 1, Colonia San José, Calle Principal"
                className={`input-field resize-none ${errors.direccionInmueble ? 'input-error' : ''}`}
              />
              {errors.direccionInmueble && <p className="error-text">{errors.direccionInmueble.message}</p>}
            </div>

            <button
              type="submit"
              disabled={mutation.isPending}
              className="btn-success w-full justify-center py-3 mt-2"
            >
              {mutation.isPending ? <Spinner size={16} /> : <UserPlus size={16} />}
              {mutation.isPending ? 'Creando cliente...' : 'Crear cliente'}
            </button>
          </form>
        </div>

        <div>
          {result && (
            <div className="card p-4 sm:p-6 border-emerald-200">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
                <h3 className="font-semibold text-emerald-700 text-lg flex items-center gap-2">
                  <UserPlus size={20} />
                  Cliente creado
                </h3>
                <button onClick={copyCredentials} className="btn-secondary text-xs">
                  {copied ? <CheckCheck size={14} className="text-emerald-600" /> : <Copy size={14} />}
                  {copied ? 'Copiado' : 'Copiar todo'}
                </button>
              </div>

              <div className="space-y-3 text-sm">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <div className="text-xs text-slate-500 mb-1">Número de contador</div>
                  <div className="font-mono font-semibold text-blue-700">{result.numeroContador}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <div className="text-xs text-slate-500 mb-1">Usuario asignado</div>
                  <div className="font-mono font-semibold">{result.usuarioAsignado}</div>
                </div>
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="text-xs text-amber-600 mb-1 font-medium">⚠ Contraseña temporal</div>
                  <div className="font-mono font-semibold text-amber-700 text-lg">{result.passwordTemporal}</div>
                  <div className="text-xs text-amber-600 mt-1">Entrega estas credenciales al cliente. Se recomienda cambiarla en el primer ingreso.</div>
                </div>
              </div>
            </div>
          )}

          {!result && (
            <div className="card p-4 sm:p-6">
              <h3 className="font-semibold text-slate-900 mb-3">Notas</h3>
              <ul className="space-y-3 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <UserPlus size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                  El sistema genera automáticamente el usuario y la contraseña temporal.
                </li>
                <li className="flex items-start gap-2">
                  <UserPlus size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                  El contador se crea en estado activo listo para registrar lecturas.
                </li>
                <li className="flex items-start gap-2">
                  <UserPlus size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                  El cliente podrá usar las credenciales para acceder al portal.
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
