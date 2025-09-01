import {Document,Types} from "mongoose"


export default interface IPrescriptionDocument extends Document {

  _id: Types.ObjectId 
  appointmentId: string;
  userId: string;
  doctorId: string;
  medicalCondition:string;
  medications: {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions?: string;
  }[];
  notes?: string;
  createdAt?: Date;
};

export interface IPrescription extends IPrescriptionDocument {}