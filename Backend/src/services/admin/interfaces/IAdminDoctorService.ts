

export default interface IAdminDoctorService {

    getDoctors(page:number,search:string | undefined,limit:number): Promise<any>
    getDoctor(id:string):Promise<any>
    verifyDoctor(id:string):Promise<any>
    declineDoctor(id:string):Promise<any>

}