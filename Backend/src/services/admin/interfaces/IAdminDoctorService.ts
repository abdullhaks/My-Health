import {IDoctor} from "../../../dto/doctorDTO"


export default interface IAdminDoctorService {

    getDoctors(page:number,search:string | undefined,limit:number,onlyPremium:boolean): Promise<IDoctor[]>
    getDoctor(id:string):Promise<IDoctor>
    verifyDoctor(id:string):Promise<IDoctor>
    declineDoctor(id:string,reason:string):Promise<IDoctor>
    block(id:string):Promise<IDoctor>
    unblock(id:string):Promise<IDoctor>

}