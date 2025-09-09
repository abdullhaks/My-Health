interface ApiErrorResponse {
  data?: {
    message?: string;
  };
}

export interface ApiError extends Error {
  response?: ApiErrorResponse;
}