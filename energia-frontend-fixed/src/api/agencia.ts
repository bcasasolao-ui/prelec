import { apiClient } from './client';
import type {
  RegistrarLecturaDto,
  ConsultarDeudaResponseDto,
  CrearClienteConContadorRequest,
  CrearClienteConContadorResponse,
  PagoEfectivoAgenciaDto,
  ResultadoPagoDto,
  MiCuentaResponseDto,
  ReciboResumenDto,
} from '../types';

export const agenciaApi = {
  registrarLectura: (data: RegistrarLecturaDto) =>
    apiClient
      .post<ConsultarDeudaResponseDto>('/api/Energia/Agencia/lectura', data)
      .then((r) => r.data),

  crearCliente: (data: CrearClienteConContadorRequest) =>
    apiClient
      .post<CrearClienteConContadorResponse>('/api/Energia/Agencia/cliente', data)
      .then((r) => r.data),

  pagoEfectivo: (data: PagoEfectivoAgenciaDto) =>
    apiClient
      .post<ResultadoPagoDto>('/api/Energia/Agencia/pago-efectivo', data)
      .then((r) => r.data),

  consultarCliente: (dpi: string) =>
    apiClient
      .get<MiCuentaResponseDto>(`/api/Energia/Agencia/cliente/${dpi}`)
      .then((r) => r.data),

  recibosCliente: (dpi: string, params?: { numeroContador?: string; estado?: string }) =>
    apiClient
      .get<ReciboResumenDto[]>(`/api/Energia/Agencia/cliente/${dpi}/recibos`, { params })
      .then((r) => r.data),
};
