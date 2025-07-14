import {IDoctor} from "../../../dto/doctorDTO"


export default interface IPaymentService {

handleWebhookEvent(event:any):Promise<{received:boolean}>

}