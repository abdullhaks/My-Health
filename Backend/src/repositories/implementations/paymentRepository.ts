import { injectable , inject } from "inversify";
import BaseRepository from "./baseRepository";
import IPaymentRepository from "../interfaces/IPaymentRepository";
import { ISubscriptionDocument } from "../../entities/subscriptionEntities";


@injectable()

export default class PaymentRepository extends BaseRepository<ISubscriptionDocument> implements IPaymentRepository{

    constructor(
        @inject("subscriptionModel") private _subscriptionModel: any,
        
      
    ) {
        super(_subscriptionModel);
    }

    

}