import {IDoctor} from "../../../dto/doctorDTO";


export default interface IDetailsService {
getDoctor (doctorId:string):Promise<IDoctor>
getUser (userId:string):Promise<any>

}