import { IDoctor } from "../dto/doctorDTO";
import { DoctorResponseDTO } from "../dto/doctorDTO"; 

// Domain User → safe public DTO
export class DoctorMapper {
  static async toDoctorResponseDTO(d: IDoctor): Promise<DoctorResponseDTO> {
  return {
            _id:d._id.toString(),
            fullName:d.fullName,
            email:d.email,
            profile:d.profile,
            phone:d.phone,
            location: d.location
                ? { type: "Point", text: d.location.text, coordinates: d.location.coordinates }
                : { type: "Point", text: "", coordinates: [0, 0] },
            gender:d.gender,
            dob:d.dob,
            isBlocked:d.isBlocked,
            isVerified:d.isVerified,
            premiumMembership:d.premiumMembership,
            adminVerified:d.adminVerified,
            rejectionReason:d.rejectionReason,
            graduation:d.graduation,
            graduationCertificate:d.graduationCertificate,
            category:d.category,
            registerNo:d.registerNo,
            registrationCertificate:d.registrationCertificate,
            experience:d.experience,
            reportAnalysisFees:d.reportAnalysisFees,
            specializations:d.specializations,
            verificationId:d.verificationId,
            walletBalance:d.walletBalance,
            bankAccNo:d.bankAccNo,
            bankAccHolderName:d.bankAccHolderName,
            bankIfscCode:d.bankIfscCode,
            createdAt:d.createdAt,
            updatedAt:d.updatedAt,
  };
}
}
