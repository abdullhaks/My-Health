export interface doctorhCangePasswordDto{
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;

};

interface ILocation {
  type: "Point";
  coordinates: [number, number];
  text: string;
}

export interface doctorProfileUpdate {
  fullName: string;
  location: ILocation;
  dob: string;
  phone: string;
  gender: string;
  specialization: string;
  experience: string;
  qualification?: string;
  locationText?: string;
  bankAccNo?: string;
  bankAccHolderName?: string;
  bankIfscCode?: string;

}