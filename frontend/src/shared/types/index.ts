export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  plan: string;
}

export interface BaseEntity {
  id: number;
  createdAt?: string;
  updatedAt?: string;
}
