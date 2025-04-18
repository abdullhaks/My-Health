export interface TokenResponseDto {
    accessToken: string;
    refreshToken: string;
  };

export interface IResponseDTO{
    success?: boolean;
    message?: string;
    data?: any;
    subscription?: string;
    accessToken?:string;
  }