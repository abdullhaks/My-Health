import {inject,injectable} from "inversify";
import IDoctorDashboardService from "../interfaces/IDoctorDashboardService";
import IReportAnalysisRepository from "../../../repositories/interfaces/IReportAnalysisRepository";
import IAppointmentsRepository from "../../../repositories/interfaces/IAppointmentsRepository";
import IPayoutRepository from "../../../repositories/interfaces/IPayoutRepository";

import { IBlogDocument } from "../../../entities/blogEntities";
import { IAdvertisementDocument } from "../../../entities/advertisementEntitites";

@injectable()
export default class DoctorDashboardService implements IDoctorDashboardService {
    constructor(
        @inject('IAppointmentsRepository') private _appointmentRepository: IAppointmentsRepository,
        @inject('IReportAnalysisRepository') private _reportAnalysisRepository: IReportAnalysisRepository,
        @inject('IPayoutRepository') private _payoutRepository: IPayoutRepository,
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

        console.log("upcomings are....",upcomingAppointmentsCount)

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
};

async appointmentStats(doctorId: string, filter: string): Promise<any> {
    try {
      if (filter === "day") {

        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - 14);

        const appointments = await this._appointmentRepository.findAll({
            doctorId,
            appointmentStatus: { $in: ["booked", "completed"] },
            date: { 
            $gte: startDate.toISOString().split("T")[0], 
            $lte: endDate.toISOString().split("T")[0] 
            },
        });

        const dayMap = new Map<string, number>();
        for (const a of appointments) {
            const d = new Date(a.date);
            const month = d.toLocaleString("en-US", { month: "short" }); // "Aug"
            const day = String(d.getDate()).padStart(2, "0"); // "10"
            const key = `${month}-${day}`; // "Aug-10"
            dayMap.set(key, (dayMap.get(key) || 0) + 1);
        }

        // Fill missing days with 0
        const result: { day: string; appointments: number }[] = [];
        for (let i = 0; i < 15; i++) {
            const d = new Date(startDate);
            d.setDate(startDate.getDate() + i);

            const month = d.toLocaleString("en-US", { month: "short" });
            const day = String(d.getDate()).padStart(2, "0");
            const key = `${month}-${day}`;

            result.push({ day: key, appointments: dayMap.get(key) || 0 });
        }

        return result;
        }

      if (filter === "month") {
        const year = new Date().getFullYear();
        const startDate = new Date(`${year}-01-01`);
        const endDate = new Date(`${year}-12-31`);

        const appointments = await this._appointmentRepository.findAll({
          doctorId,
          appointmentStatus: {$in:["booked","completed"]},
          date: { $gte: startDate.toISOString().split("T")[0], $lte: endDate.toISOString().split("T")[0] },
        });


        console.log("appointments for month filter...",appointments);

        const monthMap = new Map<number, number>();
        for (const a of appointments) {
          const monthIdx = new Date(a.date).getMonth(); // 0 = Jan
          monthMap.set(monthIdx, (monthMap.get(monthIdx) || 0) + 1);
        }

        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return monthNames.map((m, idx) => ({
          month: m,
          appointments: monthMap.get(idx) || 0,
        }));
      }

      if (filter === "year") {
        const currentYear = new Date().getFullYear();
        const startYear = currentYear - 9; 

        const appointments = await this._appointmentRepository.findAll({
            doctorId,
            appointmentStatus: { $in: ["booked", "completed"] },
        });

        const yearMap = new Map<number, number>();
        for (const a of appointments) {
            const year = new Date(a.date).getFullYear();
            yearMap.set(year, (yearMap.get(year) || 0) + 1);
        }

       
        const result: { year: string; appointments: number }[] = [];
        for (let y = startYear; y <= currentYear; y++) {
            result.push({ year: String(y), appointments: yearMap.get(y) || 0 });
        }

        return result;
        }


      throw new Error("Invalid filter provided");
    } catch (error) {
      console.error("Error in appointmentStats:", error);
      throw new Error("Failed to fetch appointment stats");
    }
  };



async reportsStats(doctorId: string, filter: string): Promise<any> {
  try {
    if (filter === "day") {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 2); // last 3 days

      const reports = await this._reportAnalysisRepository.findAll({
        doctorId,
        analysisStatus: { $in: ["pending","submited"] },
        createdAt: { // use createdAt instead of "date"
          $gte: startDate,
          $lte: endDate,
        },
      });

      const dayMap = new Map<string, { pending: number; submitted: number }>();
      for (const r of reports) {
        const d = new Date(r.createdAt);
        const key = `${d.toLocaleString("en-US", { month: "short" })}-${String(
          d.getDate()
        ).padStart(2, "0")}`;

        if (!dayMap.has(key)) dayMap.set(key, { pending: 0, submitted: 0 });

        if (r.analysisStatus === "pending") {
          dayMap.get(key)!.pending++;
        } else if (r.analysisStatus === "submited" ) {
          dayMap.get(key)!.submitted++;
        }
      }

      const result: { day: string; pending: number; submitted: number }[] = [];
      for (let i = 0; i < 3; i++) {
        const d = new Date(startDate);
        d.setDate(startDate.getDate() + i);

        const key = `${d.toLocaleString("en-US", { month: "short" })}-${String(
          d.getDate()
        ).padStart(2, "0")}`;
        result.push({ day: key, ...(dayMap.get(key) || { pending: 0, submitted: 0 }) });
      }

      return result;
    }

    if (filter === "month") {
      const now = new Date();
      const reports = await this._reportAnalysisRepository.findAll({
        doctorId,
        analysisStatus: { $in: ["pending","submited"] },
      });

      const monthMap = new Map<number, { pending: number; submitted: number }>();
      for (const r of reports) {
        const d = new Date(r.createdAt);
        const monthIdx = d.getMonth(); // 0 = Jan
        if (!monthMap.has(monthIdx)) monthMap.set(monthIdx, { pending: 0, submitted: 0 });

        if (r.analysisStatus === "pending") {
          monthMap.get(monthIdx)!.pending++;
        } else if (r.analysisStatus === "submited") {
          monthMap.get(monthIdx)!.submitted++;
        }
      }

      const result: { day: string; pending: number; submitted: number }[] = [];
      for (let i = 2; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthIdx = d.getMonth();
        const month = d.toLocaleString("en-US", { month: "short" });
        result.push({ day: month, ...(monthMap.get(monthIdx) || { pending: 0, submitted: 0 }) });
      }

      return result;
    }

    if (filter === "year") {
      const currentYear = new Date().getFullYear();
      const reports = await this._reportAnalysisRepository.findAll({
        doctorId,
        analysisStatus: { $in: ["pending","submited"] },
      });

      const yearMap = new Map<number, { pending: number; submitted: number }>();
      for (const r of reports) {
        const year = new Date(r.createdAt).getFullYear();
        if (!yearMap.has(year)) yearMap.set(year, { pending: 0, submitted: 0 });

        if (r.analysisStatus === "pending") {
          yearMap.get(year)!.pending++;
        } else if ( r.analysisStatus === "submited") {
          yearMap.get(year)!.submitted++;
        }
      }

      const result: { day: string; pending: number; submitted: number }[] = [];
      for (let y = currentYear - 2; y <= currentYear; y++) {
        result.push({ day: String(y), ...(yearMap.get(y) || { pending: 0, submitted: 0 }) });
      }

      return result;
    }

    throw new Error("Invalid filter provided");
  } catch (error) {
    console.error("Error in reportsStats:", error);
    throw new Error("Failed to fetch reports stats");
  }
}


async payoutsStats(doctorId: string): Promise<any> {
    try {
        const payouts = await this._payoutRepository.findAll({
            doctorId,
        }, { sort: { createdAt: -1 }, limit: 5 });
    
        return payouts.map(p => ({
            on:p.createdAt.toISOString().split('T')[0],
            totalAmount: p.totalAmount,
            status: p.status,
            transactionId: p.transactionId || 'N/A'
        }));
    } catch (error) {
        console.error("Error in payoutsStats:", error);
        throw new Error("Failed to fetch payouts stats");
    }

}


}