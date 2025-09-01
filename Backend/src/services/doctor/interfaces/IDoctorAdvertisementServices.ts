import { IAdvertisement } from "../../../dto/advertisementDto";

interface IGetAddsResponse {
    adds: IAdvertisement[];
    totalPages: number;
}

export default interface IDoctorAdvertisementService {

    createAdvertisement(addData:any):Promise<IAdvertisement>;
    getAdds(doctorId:string,pageNumber: number, limitNumber: number): Promise<IGetAddsResponse>; 
    
}