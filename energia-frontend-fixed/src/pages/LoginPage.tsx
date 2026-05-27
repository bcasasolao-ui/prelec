import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Zap, Eye, EyeOff, LogIn, ShieldCheck, Sparkles, ChevronDown } from 'lucide-react';
import { authApi } from '../api/auth';
import { useAuthContext } from '../hooks/AuthContext';
import { loginSchema, type LoginForm } from '../schemas';
import { getErrorMessage } from '../api/client';
import { Alert, Spinner, useToast } from '../components/ui';

const demoUsers = [
  {
    label: 'Agencia',
    credential: 'agencia',
    password: 'Admin123*',
    badge: 'AGENCIA',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-100',
  },
  {
    label: 'Cliente',
    credential: '2200000000101',
    password: 'Cliente123*',
    badge: 'CLIENTE',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  },
];

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuthContext();
  const { showToast } = useToast();
  const [showPass, setShowPass] = useState(false);
  const [showDemoUsers, setShowDemoUsers] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const fillDemoUser = (credential: string, password: string) => {
    setValue('credencial', credential, { shouldValidate: true });
    setValue('password', password, { shouldValidate: true });
  };

  const onSubmit = async (data: LoginForm) => {
    setError('');
    setLoading(true);
    try {
      const res = await authApi.login(data);
      login({ token: res.token, rol: res.rol as 'CLIENTE' | 'ADMIN_AGENCIA', nombreUsuario: res.nombreUsuario });
      showToast({ type: 'success', title: 'Bienvenido', message: `Sesión iniciada como ${res.nombreUsuario}.` });
      if (res.rol === 'CLIENTE') navigate('/cliente/dashboard');
      else navigate('/agencia/dashboard');
    } catch (e) {
      const message = getErrorMessage(e);
      setError(message);
      showToast({ type: 'error', title: 'No se pudo iniciar sesión', message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-slate-950 flex items-center justify-center p-3 sm:p-4">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(6,182,212,0.24),transparent_34%),linear-gradient(315deg,rgba(16,185,129,0.22),transparent_32%),linear-gradient(45deg,rgba(245,158,11,0.12),transparent_38%)]" />
      <div className="absolute inset-0 energy-grid opacity-80" />

      <div className="relative w-full max-w-5xl grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6 items-start">
        <section className="hidden lg:flex self-start rounded-2xl border border-white/10 bg-white/10 p-8 text-white backdrop-blur animate-rise-in overflow-hidden">
          <div className="relative z-10 flex w-full flex-col gap-10">
            <div>
              <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-500 to-emerald-400 shadow-xl shadow-cyan-500/25">
                <Zap size={34} className="text-white" />
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs text-cyan-50">
                <Sparkles size={14} />
                Gestión eléctrica moderna
              </div>
              <h1 className="mt-7 text-4xl font-semibold leading-tight">
                Energía Eléctrica
              </h1>
              <p className="mt-3 max-w-md text-sm leading-6 text-slate-200">
                Administra clientes, recibos, lecturas y pagos desde una experiencia clara, rápida y segura.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {['Recibos', 'Pagos', 'Lecturas'].map((item) => (
                <div key={item} className="rounded-xl border border-white/10 bg-white/10 p-4">
                  <div className="mb-3 h-1.5 w-10 rounded-full bg-gradient-to-r from-cyan-300 to-emerald-300" />
                  <div className="text-sm font-semibold">{item}</div>
                  <div className="mt-1 text-xs text-slate-300">En línea</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative w-full max-w-sm lg:max-w-none mx-auto animate-rise-in">
          <div className="text-center mb-6 lg:hidden">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-cyan-400 via-blue-500 to-emerald-400 rounded-2xl mb-4 shadow-lg shadow-cyan-500/25">
              <Zap size={28} className="text-white" />
            </div>
            <h1 className="text-2xl font-semibold text-white">Energía Eléctrica</h1>
            <p className="text-slate-300 text-sm mt-1">Sistema de gestión de clientes</p>
          </div>

          <div className="bg-white/95 rounded-2xl p-5 sm:p-8 shadow-2xl backdrop-blur border border-white">
            <div className="hidden lg:flex items-center gap-3 mb-7">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 via-blue-500 to-emerald-400 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <Zap size={24} className="text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-950">Iniciar sesión</h2>
                <p className="text-sm text-slate-500">Acceso autorizado al sistema</p>
              </div>
            </div>

            <div className="lg:hidden mb-6">
              <h2 className="text-lg font-semibold text-slate-950 mb-1">Iniciar sesión</h2>
              <p className="text-sm text-slate-500">Ingresa tus credenciales para continuar</p>
            </div>

            {error && <div className="mb-5"><Alert type="error" message={error} /></div>}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="label">Usuario o DPI</label>
                <input
                  {...register('credencial')}
                  type="text"
                  placeholder="Ej. juan.perez o 1234567890101"
                  className={`input-field ${errors.credencial ? 'input-error' : ''}`}
                  autoComplete="username"
                />
                {errors.credencial && <p className="error-text">{errors.credencial.message}</p>}
              </div>

              <div>
                <label className="label">Contraseña</label>
                <div className="relative">
                  <input
                    {...register('password')}
                    type={showPass ? 'text' : 'password'}
                    placeholder="••••••••"
                    className={`input-field pr-10 ${errors.password ? 'input-error' : ''}`}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <p className="error-text">{errors.password.message}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full justify-center py-3 mt-2"
              >
                {loading ? <Spinner size={16} className="text-white" /> : <LogIn size={16} />}
                {loading ? 'Ingresando...' : 'Iniciar sesión'}
              </button>
            </form>

            <div className="mt-6">
              <button
                type="button"
                onClick={() => setShowDemoUsers((open) => !open)}
                className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2 text-sm font-medium text-slate-600 transition-all duration-200 hover:border-cyan-200 hover:bg-cyan-50/70 hover:text-cyan-800"
                aria-expanded={showDemoUsers}
              >
                <span>Usuarios de prueba</span>
                <ChevronDown
                  size={16}
                  className={`transition-transform duration-200 ${showDemoUsers ? 'rotate-180' : ''}`}
                />
              </button>

              {showDemoUsers && (
                <div className="mt-3 space-y-2 animate-rise-in">
                  {demoUsers.map((user) => (
                    <button
                      key={user.credential}
                      type="button"
                      onClick={() => fillDemoUser(user.credential, user.password)}
                      className="group flex w-full flex-col items-start justify-between gap-2 rounded-lg border border-slate-100 bg-white px-3 py-3 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan-200 hover:shadow-md sm:flex-row sm:items-center sm:gap-3"
                    >
                      <span className="min-w-0 break-all text-sm text-slate-600 sm:break-normal">
                        <span className="font-semibold text-slate-950">{user.credential}</span>
                        <span className="mx-1 text-slate-300">/</span>
                        <span>{user.password}</span>
                      </span>
                      <span className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-bold ${user.badgeClass}`}>
                        {user.badge}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6 pt-5 border-t border-slate-100 flex items-start gap-3">
              <div className="mt-0.5 rounded-lg bg-emerald-50 p-2 text-emerald-600">
                <ShieldCheck size={16} />
              </div>
              <p className="text-xs text-slate-500 leading-5">
                El acceso está restringido a usuarios autorizados. Contacta a tu agencia si olvidaste tus credenciales.
              </p>
            </div>
          </div>

          <p className="text-center text-xs text-slate-400 mt-6">
            © {new Date().getFullYear()} Sistema Eléctrico Nacional
          </p>
        </section>
      </div>
    </div>
  );
}
