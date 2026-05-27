import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Shield, Eye, EyeOff } from 'lucide-react';
import { authApi } from '../api/auth';
import { cambiarPasswordSchema, type CambiarPasswordForm } from '../schemas';
import { getErrorMessage } from '../api/client';
import { Alert, PageHeader, Spinner, useToast } from '../components/ui';
import { useAuthContext } from '../hooks/AuthContext';

export function ClienteAjustes() {
  const { user } = useAuthContext();
  const { showToast } = useToast();
  const [showFields, setShowFields] = useState({ actual: false, nueva: false, confirmar: false });
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CambiarPasswordForm>({ resolver: zodResolver(cambiarPasswordSchema) });

  const mutation = useMutation({
    mutationFn: (data: CambiarPasswordForm) =>
      authApi.cambiarPassword({ passwordActual: data.passwordActual, passwordNueva: data.passwordNueva }),
    onSuccess: () => {
      setSuccess(true);
      setApiError('');
      showToast({ type: 'success', title: 'Contraseña actualizada', message: 'Tu nueva contraseña ya está activa.' });
      reset();
    },
    onError: (e) => {
      const message = getErrorMessage(e);
      setSuccess(false);
      setApiError(message);
      showToast({ type: 'error', title: 'No se pudo actualizar', message });
    },
  });

  const toggle = (field: keyof typeof showFields) =>
    setShowFields((prev) => ({ ...prev, [field]: !prev[field] }));

  const fields: { key: keyof typeof showFields; label: string; name: keyof CambiarPasswordForm }[] = [
    { key: 'actual', label: 'Contraseña actual', name: 'passwordActual' },
    { key: 'nueva', label: 'Nueva contraseña', name: 'passwordNueva' },
    { key: 'confirmar', label: 'Confirmar nueva contraseña', name: 'confirmar' },
  ];

  return (
    <div>
      <PageHeader title="Ajustes" subtitle="Configuración de tu cuenta" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Info card */}
        <div className="card p-4 sm:p-6">
          <h2 className="font-semibold text-slate-900 mb-4">Información de cuenta</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Usuario</span>
              <span className="font-mono font-medium">{user?.nombreUsuario}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Rol</span>
              <span className="font-medium text-blue-700">{user?.rol}</span>
            </div>
          </div>
        </div>

        {/* Change password */}
        <div className="card p-4 sm:p-6">
          <h2 className="font-semibold text-slate-900 mb-1 flex items-center gap-2">
            <Shield size={18} className="text-blue-600" />
            Cambiar contraseña
          </h2>
          <p className="text-xs text-slate-500 mb-5">La nueva contraseña debe tener al menos 6 caracteres.</p>

          {success && <div className="mb-4"><Alert type="success" message="Contraseña actualizada correctamente." /></div>}
          {apiError && <div className="mb-4"><Alert type="error" message={apiError} /></div>}

          <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
            {fields.map(({ key, label, name }) => (
              <div key={key}>
                <label className="label">{label}</label>
                <div className="relative">
                  <input
                    {...register(name)}
                    type={showFields[key] ? 'text' : 'password'}
                    placeholder="••••••"
                    className={`input-field pr-10 ${errors[name] ? 'input-error' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => toggle(key)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showFields[key] ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors[name] && <p className="error-text">{errors[name]?.message}</p>}
              </div>
            ))}

            <button
              type="submit"
              disabled={mutation.isPending}
              className="btn-primary w-full justify-center py-2.5 mt-2"
            >
              {mutation.isPending ? <Spinner size={16} /> : <Shield size={16} />}
              {mutation.isPending ? 'Actualizando...' : 'Actualizar contraseña'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
