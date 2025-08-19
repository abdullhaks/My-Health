import BaseRepository from "../implementations/baseRepository";
import { IOtpDocument } from "../../models/otpModel"; 


export default interface IOtpRepository extends BaseRepository<IOtpDocument>{

 findLatestOtpByEmail(email: string): Promise<any>
 
}