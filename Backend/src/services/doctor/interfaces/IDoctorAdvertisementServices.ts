
export default interface IDoctorAdvertisementService {

    createAdvertisement(addData:any):Promise<any>;
    getAdds(doctorId:string,pageNumber: number, limitNumber: number): Promise<any>; 
    
}