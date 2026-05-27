import { z } from 'zod';

export const loginSchema = z.object({
  credencial: z.string().min(1, 'El usuario o DPI es requerido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

export const cambiarPasswordSchema = z
  .object({
    passwordActual: z.string().min(1, 'La contraseña actual es requerida'),
    passwordNueva: z.string().min(6, 'Mínimo 6 caracteres'),
    confirmar: z.string().min(1, 'Confirma la nueva contraseña'),
  })
  .refine((d) => d.passwordNueva === d.confirmar, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmar'],
  });

export const pagarSchema = z.object({
  numeroContador: z.string().min(1, 'Selecciona un contador'),
  numeroTarjeta: z.string().min(8, 'Número de tarjeta inválido').max(20),
  pin: z.string().min(4, 'PIN inválido').max(10),
  referenciaCliente: z.string().optional(),
});

export const lecturaSchema = z.object({
  numeroContador: z.string().min(1, 'El número de contador es requerido'),
  kilovatios: z.coerce
    .number()
    .int('Debe ser un número entero')
    .min(1, 'Debe ser al menos 1 kWh'),
});

export const crearClienteSchema = z.object({
  dpi: z.string().min(1, 'El DPI es requerido').max(20),
  nombre: z.string().min(1, 'El nombre es requerido').max(100),
  apellido: z.string().min(1, 'El apellido es requerido').max(100),
  correo: z.string().email('Correo inválido').max(150),
  direccionInmueble: z.string().min(1, 'La dirección es requerida').max(255),
});

export const pagoEfectivoSchema = z.object({
  numeroContador: z.string().min(1, 'El número de contador es requerido'),
  montoRecibido: z.coerce
    .number()
    .positive('Debe ser mayor a 0'),
});

export const buscarClienteSchema = z.object({
  dpi: z.string().min(1, 'Ingrese un DPI'),
});

export type LoginForm = z.infer<typeof loginSchema>;
export type CambiarPasswordForm = z.infer<typeof cambiarPasswordSchema>;
export type PagarForm = z.infer<typeof pagarSchema>;
export type LecturaForm = z.infer<typeof lecturaSchema>;
export type CrearClienteForm = z.infer<typeof crearClienteSchema>;
export type PagoEfectivoForm = z.infer<typeof pagoEfectivoSchema>;
export type BuscarClienteForm = z.infer<typeof buscarClienteSchema>;
