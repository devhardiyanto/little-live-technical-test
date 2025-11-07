export interface PaginatedResponse<T> {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  data: T[];
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  responseObject: T;
  statusCode: number;
}

// Legacy - keep for backward compatibility
export interface MovieResponse<T> {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
  data: T[];
}