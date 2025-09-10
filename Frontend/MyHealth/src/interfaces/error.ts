interface ApiErrorResponse {
  data?: {
    message?: string;
    msg?:string;
    status?:number
  };
}

export interface ApiError extends Error {
  response?: ApiErrorResponse;
}