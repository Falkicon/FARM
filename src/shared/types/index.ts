// Shared type definitions
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface HealthCheck {
  status: 'ok' | 'error';
  timestamp: string;
}
