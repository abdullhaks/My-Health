import { inject, injectable } from "inversify";
import IAdminDoctorService from "../interfaces/IAdminDoctorService";
import IAdminRepository from "../../../repositories/interfaces/IAdminRepository";
import { getSignedImageURL } from "../../../middlewares/common/uploadS3";


@injectable()
export default class AdminDoctorService implements IAdminDoctorService {
  constructor(
    @inject("IAdminRepository") private _adminRepository: IAdminRepository
  ) {}

  async getDoctors(
    page: number,
    search: string | undefined,
    limit: number
    ,onlyPremium:boolean
  ): Promise<any> {
    const response = await this._adminRepository.getDoctors(
      page,
      search,
      limit,
      onlyPremium
    );

    if (!response) {
      throw new Error("doctors not found..!");
    }

    return response;
  }

  async getDoctor(id: string): Promise<any> {
    const response = await this._adminRepository.getDoctor(id);
    if (!response) {
      throw new Error("doctor not found..!");
    }

    const { password, ...userWithoutPassword } = response.toObject();
            if (userWithoutPassword.profile) {
              userWithoutPassword.profile = await getSignedImageURL(response.profile);
            }
    return userWithoutPassword;
  }

  async verifyDoctor(id: string): Promise<any> {
    const response = await this._adminRepository.verifyDoctor(id);

    if (!response) {
      throw new Error("doctor verifying failed");
    }
    return response;
  }

  async declineDoctor(id: string,reason:string): Promise<any> {
    const response = await this._adminRepository.declineDoctor(id,reason);

    if (!response) {
      throw new Error("doctor verifying failed");
    }
    return response;
  }

  async block(id: string): Promise<any> {
    console.log("id from block....", id);
    const response = await this._adminRepository.blockDoctor(id);

    console.log("blocked result is ", response);

    return response;
  }

  async unblock(id: string): Promise<any> {
    console.log("id from block....", id);
    const response = await this._adminRepository.unblockDoctor(id);

    console.log("blocked result is ", response);

    return response;
  }
}