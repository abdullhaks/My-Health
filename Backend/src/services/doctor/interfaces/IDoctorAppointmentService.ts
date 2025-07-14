import { IAppointment } from "../../../dto/appointmentDTO";

export default interface IDoctorAppointmentService {
getDoctorAppointments(doctorId:string):Promise<IAppointment[]>

}