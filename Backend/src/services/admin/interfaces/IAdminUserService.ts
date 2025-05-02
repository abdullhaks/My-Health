

export default interface IAdminUserService {

    getUsers(page:number,search:string | undefined,limit:number):Promise<any>
    block(id:string):Promise<any>
    unblock(id:string):Promise<any>

}