import BaseRepository from "../implementations/baseRepository";
import IPrescriptionDocument from "../../entities/prescriptionEntities";


export default interface IPrescriptionRepository extends BaseRepository<IPrescriptionDocument> {
uptadeOneWithUpsert(
        filter: any,
        update: any
    ): Promise<IPrescriptionDocument>
}