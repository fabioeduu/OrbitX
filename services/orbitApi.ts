import { api } from './api';
import type {
  ApiResponse,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  ForgotPasswordRequest,
  KpiResponse,
  AlertResponse,
  DatacenterResponse,
  SatelliteResponse,
  SustainabilityScoreResponse,
  ChatRequest,
  ChatResponse,
  HateoasCollection,
} from '../types/api';
export const authApi = {
  login: (body: LoginRequest) =>
    api.post<ApiResponse<AuthResponse>>('/api/v1/auth/login', body),
  register: (body: RegisterRequest) =>
    api.post<ApiResponse<AuthResponse>>('/api/v1/auth/register', body),
  forgotPassword: (body: ForgotPasswordRequest) =>
    api.post<ApiResponse<Record<string, string>>>('/api/v1/auth/forgot-password', body),
};
export const dashboardApi = {
  getKpis: () =>
    api.get<KpiResponse>('/api/v1/dashboard/kpis'),
  getAlerts: () =>
    api.get<HateoasCollection<AlertResponse>>('/api/v1/dashboard/alerts'),
};
export const infrastructureApi = {
  getDatacenters: () =>
    api.get<HateoasCollection<DatacenterResponse>>('/api/v1/infrastructure/datacenters'),
  getSatellites: () =>
    api.get<HateoasCollection<SatelliteResponse>>('/api/v1/infrastructure/satellites'),
};
export const reportsApi = {
  getSustainabilityScore: () =>
    api.get<SustainabilityScoreResponse>('/api/v1/reports/sustainability-score'),
  exportPdf: () =>
    api.get<Blob>('/api/v1/reports/export/pdf', { responseType: 'blob' }),
};
export const assistantApi = {
  chat: (body: ChatRequest) =>
    api.post<ChatResponse>('/api/v1/assistant/chat', body),
};
