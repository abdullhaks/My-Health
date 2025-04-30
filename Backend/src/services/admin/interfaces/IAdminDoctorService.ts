

export default interface IAdminDoctorService {

    getDoctors(page:number,search:string | undefined,limit:number): Promise<any>


}