import { apiClient } from './client';
import type {
  MiCuentaResponseDto,
  ReciboResumenDto,
  PagoResumenDto,
  PagarSaldoClienteDto,
  PagarSaldoClienteResponseDto,
} from '../types';

export const clienteApi = {
  miCuenta: () =>
    apiClient.get<MiCuentaResponseDto>('/api/Energia/Cliente/mi-cuenta').then((r) => r.data),

  recibos: (params?: { numeroContador?: string; estado?: string }) =>
    apiClient
      .get<ReciboResumenDto[]>('/api/Energia/Cliente/recibos', { params })
      .then((r) => r.data),

  pagosDeRecibo: (idRecibo: number) =>
    apiClient
      .get<PagoResumenDto[]>(`/api/Energia/Cliente/recibos/${idRecibo}/pagos`)
      .then((r) => r.data),

  pagar: (data: PagarSaldoClienteDto) =>
    apiClient
      .post<PagarSaldoClienteResponseDto>('/api/Energia/Cliente/pagar', data)
      .then((r) => r.data),
};
