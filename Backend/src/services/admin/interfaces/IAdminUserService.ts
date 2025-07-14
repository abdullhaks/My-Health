import {IUser} from '../../../dto/userDTO'


export default interface IAdminUserService {

    getUsers(page:number,search:string | undefined,limit:number):Promise<IUser[]>
    block(id:string):Promise<IUser>
    unblock(id:string):Promise<IUser>

}