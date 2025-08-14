export interface UserPublicDTO {
  id: string;
  fullName: string;
  email: string;
  profile?: string | null;
  phone?: string;
  location?: { text: string; coordinates: [number, number] } | null;
  gender?: string;
  dob?: string;
  isBlocked: boolean;
  isVerified: boolean;
  bmi?: string;
  medicalTags?: string;
  latestHealthSummary?: string;
  walletBalance?: number;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TokensDTO {
  accessToken: string;
  refreshToken: string;
}

export interface BaseMsgDTO {
  message: string;
}

export interface LoginResDTO extends BaseMsgDTO {
  user?: UserPublicDTO | { email: string; isVerified?: boolean; isBlocked?: boolean };
  accessToken?: string;
  refreshToken?: string;
}

export interface SignupResDTO extends BaseMsgDTO {
  email?: string;
}

export interface GetMeResDTO extends BaseMsgDTO {
  user: UserPublicDTO;
}
