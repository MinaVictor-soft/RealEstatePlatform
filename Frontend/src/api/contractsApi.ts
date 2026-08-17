import { request } from './client';
import type {
  ContractResponse,
  ContractsDashboardResponse,
  CreateContractRequest,
  ForecastResponse,
  InstallmentResponse,
  RecordPaymentRequest,
} from '../types/contracts';

export function createContract(body: CreateContractRequest) {
  return request<ContractResponse>('/api/contracts', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function getContracts() {
  return request<ContractResponse[]>('/api/contracts');
}

export function getDashboard(months = 3) {
  return request<ContractsDashboardResponse>(`/api/contracts/dashboard?months=${months}`);
}

export function getContract(id: string) {
  return request<ContractResponse>(`/api/contracts/${id}`);
}

export function generateSchedule(id: string) {
  return request<ContractResponse>(`/api/contracts/${id}/generate-schedule`, { method: 'POST' });
}

export function getInstallments(id: string) {
  return request<InstallmentResponse[]>(`/api/contracts/${id}/installments`);
}

export function addPayment(id: string, body: RecordPaymentRequest) {
  return request<ContractResponse>(`/api/contracts/${id}/payments`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function getForecast(id: string, months: number) {
  return request<ForecastResponse>(`/api/contracts/${id}/forecast?months=${months}`);
}

export function deleteContract(id: string) {
  return request<void>(`/api/contracts/${id}`, {
    method: 'DELETE',
  });
}
