
export interface ISpecializations{
    title:string;
    certificate:string;
}

export interface IUser {
  
    _id:string;
    fullName:string;
    email:string;
    profile?:string;
    phone?:string;
    location?:ILocation;
    gender?:string;
    dob?:string;
    isBlocked:boolean;
    isVerified:boolean;
    bmi?:string;
    medicalTags?:string;
    latestHealthSummary?:string;
    walletBalance:number;
    tags:string[];
    createdAt:Date;
    updatedAt:Date

}

export interface IUserData {

  user:{
    user:IUser
  }
}


export interface userSignupData {
    
    email:string,
    fullName: string,
    password: string,
    confirmPassword: string,
  
}

export interface userLoginData {
    
    email:string,
    password: string,
  
}

export interface recoveryPasswordData {
    
        email:string;
        recoveryCode:string
          
}

export interface userResetPasswordData {
    newPassword:string,
    confirmPassword:string
  };

export interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface ILocation {
  type: "Point";
  coordinates: [number, number];
  text: string;
}

export interface userProfileData {
  fullName: string;
  medicalTags:string,
  location: ILocation| null;
  dob: string;
  phone: string;
  gender: string;
  locationText?: string;
 
}