import { IUser } from "../dto/userDTO";
import { UserResponseDTO } from "../dto/userDTO";

// Domain User → safe public DTO
export class UserMapper {
  static async toUserResponseDTO(u: IUser): Promise<UserResponseDTO> {
  return {
    _id: u._id.toString(),
    fullName: u.fullName,
    email: u.email,
    profile: u.profile,
    phone: u.phone,
    location: u.location
      ? { type: "Point", text: u.location.text, coordinates: u.location.coordinates }
      : { type: "Point", text: "", coordinates: [0, 0] },
    gender: u.gender,
    dob: u.dob?.toString(),
    isBlocked: u.isBlocked,
    isVerified: u.isVerified,
    bmi: u?.bmi,
    medicalTags: u.medicalTags,
    latestHealthSummary: u.latestHealthSummary,
    walletBalance: u.walletBalance,
    tags: u.tags,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
  };
}
}
