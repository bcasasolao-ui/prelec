// ── Auth ────────────────────────────────────────────────────────────────────
export interface LoginRequest {
  credencial: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  rol: string;
  nombreUsuario: string;
}

export interface CambiarPasswordRequest {
  passwordActual: string;
  passwordNueva: string;
}

// ── Cliente DTOs ─────────────────────────────────────────────────────────────
export interface ContadorResumenDto {
  numeroContador: string;
  direccionInmueble: string;
  estado: string;
  fechaInstalacion: string;
  saldoPendiente: number;
}

export interface MiCuentaResponseDto {
  idCliente: number;
  dpi: string;
  nombre: string;
  apellido: string;
  correo: string;
  saldoTotalPendiente: number;
  contadores: ContadorResumenDto[];
}

export interface ReciboResumenDto {
  idRecibo: number;
  numeroContador: string;
  fechaEmision: string;
  montoTotal: number;
  saldoPendiente: number;
  estado: string;
}

export interface PagoResumenDto {
  idPago: number;
  idRecibo: number;
  numeroContador: string;
  monto: number;
  fechaCobro: string;
  canalPago: string;
  codigoAutorizacionBanco: string | null;
}

export interface PagarSaldoClienteDto {
  numeroContador: string;
  numeroTarjeta: string;
  pin: string;
  referenciaCliente?: string;
}

export interface PagarSaldoClienteResponseDto {
  numeroContador: string;
  montoPagado: number;
  saldoRestante: number;
  aplicadoEnEnergia: boolean;
  referenciaBanco: string | null;
  mensaje: string;
  respuestaBanco: unknown;
}

// ── Agencia DTOs ─────────────────────────────────────────────────────────────
export interface RegistrarLecturaDto {
  numeroContador: string;
  kilovatios: number;
}

export interface ConsultarDeudaResponseDto {
  numeroContador: string;
  saldoPendiente: number;
}

export interface CrearClienteConContadorRequest {
  dpi: string;
  nombre: string;
  apellido: string;
  correo: string;
  direccionInmueble: string;
}

export interface CrearClienteConContadorResponse {
  numeroContador: string;
  usuarioAsignado: string;
  passwordTemporal: string;
}

export interface PagoEfectivoAgenciaDto {
  numeroContador: string;
  montoRecibido: number;
}

export interface ResultadoPagoDto {
  exito: boolean;
  mensaje: string | null;
  montoAplicado: number;
  saldoRestante: number;
  recibosAfectados: number;
}

// ── App types ────────────────────────────────────────────────────────────────
export type UserRole = 'CLIENTE' | 'ADMIN_AGENCIA';

export interface AuthUser {
  token: string;
  rol: UserRole;
  nombreUsuario: string;
}

export interface ApiError {
  mensaje?: string;
  message?: string;
}
