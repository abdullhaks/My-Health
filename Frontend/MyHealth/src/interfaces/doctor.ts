export interface ILocation {
  type: "Point";
  coordinates: [number, number];
  text: string;
}

export interface ISpecialization {
  title: string;
  certificate: string;
}

export interface IDoctor {
  _id: string;
  fullName: string;
  email: string;
  password: string;
  profile?: string;
  phone?: string;
  location?: ILocation;
  gender?: string;
  dob?: string;
  isBlocked: boolean;
  isVerified: boolean;
  adminVerified: number;
  reportAnalysisFees: number;
  rejectionReason?: string;
  graduation?: string;
  graduationCertificate?: string;
  category?: string;
  registerNo?: string;
  registrationCertificate?: string;
  experience?: number;
  specializations?: ISpecialization[];
  verificationId?: string;
  walletBalance: number;
  bankAccNo?: string;
  bankAccHolderName?: string;
  bankIfscCode?: string;
  premiumMembership: boolean;
  subscriptionId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IDoctorData {
  doctor:{
    doctor:IDoctor;
  } 
}

export interface doctorProfileUpdate {
  fullName: string;
  phone?: string;
  location?: ILocation | string;
  dob?: string;
  gender?: string;
  graduation?: string;
  category?: string;
  registerNo?: string;
  experience?: number;
  specializations?: ISpecialization[];
  bankAccNo?: string;
  bankAccHolderName?: string;
  bankIfscCode?: string;
}

export interface UpdateProfileResponse {
  message: string;
  updatedDoctor: IDoctor;
}

export interface payoutDetails {
  bankAccNo?: string;
  bankAccHolderName?: string;
  bankIfscCode?: string;
}


export interface doctorhCangePasswordDto{
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;

};