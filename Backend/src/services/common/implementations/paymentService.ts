import {inject,injectable} from "inversify"
import IPaymentService from "../interfaces/IPaymentService"
import IPaymentRepository from "../../../repositories/interfaces/IPaymentRepository"

@injectable()
export default class PaymentService implements IPaymentService {

    constructor(@inject("IPaymentRepository") private _paymentRepository:IPaymentRepository){

    }



}