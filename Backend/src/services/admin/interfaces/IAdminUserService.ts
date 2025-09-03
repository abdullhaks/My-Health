import {IUser, IUserDocument} from '../../../dto/userDTO'


export default interface IAdminUserService {

    getUsers(page:number,search:string | undefined,limit:number):Promise<{users:IUserDocument[],totalPages:number}>
    block(id:string):Promise<IUserDocument| null>
    unblock(id:string):Promise<IUserDocument| null>

}