import {inject,injectable} from "inversify";
import IDoctorDashboardService from "../interfaces/IDoctorDashboardService";
import IReportAnalysisRepository from "../../../repositories/interfaces/IReportAnalysisRepository";
import IAppointmentsRepository from "../../../repositories/interfaces/IAppointmentsRepository";

import { IBlogDocument } from "../../../entities/blogEntities";
import { IAdvertisementDocument } from "../../../entities/advertisementEntitites";

@injectable()
export default class DoctorDashboardService implements IDoctorDashboardService {
    constructor(
        @inject('IAppointmentsRepository') private _appointmentRepository: IAppointmentsRepository,
        @inject('IReportAnalysisRepository') private _reportAnalysisRepository: IReportAnalysisRepository
    ) {}

    async getDashboardContent(doctorId: string): Promise<any> {
    try {
        const today = new Date();
        const fourDaysLater = new Date();
        const fromDate = new Date(today.setDate(today.getDate()))
        fourDaysLater.setDate(today.getDate() + 4);

        const startDateStr = fromDate.toISOString().split('T')[0];        
        const endDateStr = fourDaysLater.toISOString().split('T')[0];

        // 1. Count of booked appointments in next 4 days
        const upcomingAppointmentsCount = await this._appointmentRepository.findAll({
            doctorId,
            appointmentStatus: 'booked',
            date: {
                $gte: startDateStr,
                $lte: endDateStr
            }
        }, { sort: { date: 1 } });

         const dateAppointmentCountMap = new Map<string, number>();

         if(upcomingAppointmentsCount?.length){
        for (const appointment of upcomingAppointmentsCount) {
            const date = appointment.date; // Assuming string like "2025-08-02"
            const count = dateAppointmentCountMap.get(date) || 0;
            dateAppointmentCountMap.set(date, count + 1);
        }

        }

        console.log("upcomingAppointmentsCount..",upcomingAppointmentsCount);
        console.log("dateAppointmentCountMap..",dateAppointmentCountMap);
        console.log("dateAppointmentCountMap entries....",[...dateAppointmentCountMap.entries()]);

        // 2. Count of today’s booked appointments
        const todayAppointmentsCount = await this._appointmentRepository.findAll({
            doctorId,
            appointmentStatus: 'booked',
            date: new Date().toISOString().split('T')[0]
        }).then(appointments => appointments?.length );

        console.log("todayAppointmentsCount..",todayAppointmentsCount);


        // 3. Count of pending report analyses
        const pendingReportsCount = await this._reportAnalysisRepository.findAll({
            doctorId,
            analysisStatus: 'pending'
        }).then(reports => reports?.length);

        // 4. Today's first appointment time
        const todaysFirstAppointment = await this._appointmentRepository.findOne({
            doctorId,
            appointmentStatus: 'booked',
            date: startDateStr
        }, {
            sort: { start: 1 }
        });

        return {
            upcomingAppointmentsCount:[...dateAppointmentCountMap.entries()],
            todayAppointmentsCount,
            pendingReportsCount,
            todaysFirstAppointmentTime: upcomingAppointmentsCount[0]?.start || null
        };
    } catch (error) {
        console.error('Error in getDashboardContent:', error);
        throw new Error('Failed to fetch dashboard content');
    }
}

}