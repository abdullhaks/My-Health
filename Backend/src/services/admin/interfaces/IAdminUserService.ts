

export default interface IAdminUserService {

    getUsers(page:number,search:string | undefined,limit:number):Promise<any>


}