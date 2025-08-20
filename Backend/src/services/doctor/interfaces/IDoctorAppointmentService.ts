import { IAppointment } from "../../../dto/appointmentDTO";

export default interface IDoctorAppointmentService {
getDoctorAppointments(
    doctorId: string,
    page: number,
    limit: number,
    filters: { appointmentStatus?: string; startDate?: string; endDate?: string }
  ): Promise<{ appointments: IAppointment[]; totalPages: number }> 



cancelAppointment(appointmentId:string):Promise<{status:boolean;message:string}>,

}