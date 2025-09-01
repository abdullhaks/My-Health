import { inject, injectable } from "inversify";
import IDoctorTransactionsService from "../interfaces/IDoctorTransactionServices";
import ITransactionRepository from "../../../repositories/interfaces/ITransactionRepository";
import IAppointmentsRepository from "../../../repositories/interfaces/IAppointmentsRepository";
import IReportAnalysisRepository from "../../../repositories/interfaces/IReportAnalysisRepository";

interface filter {
  method?: string;
  paymentFor?: string;
  startDate?: string;
  endDate?: string;
}

@injectable()
export default class DoctorTransactionsService implements IDoctorTransactionsService {
  constructor(
    @inject("ITransactionRepository") private _transactionRepository: ITransactionRepository,
    @inject("IAppointmentsRepository") private _appointmentsRepository: IAppointmentsRepository,
    @inject("IReportAnalysisRepository") private _reportAnalysisRepository: IReportAnalysisRepository
  ) {}

  async getRevenues(
    doctorId: string,
    pageNumber: number,
    limitNumber: number,
    filters: filter = {}
  ): Promise<{ payouts: any[]; totalPages: number }> {
    const skip = (pageNumber - 1) * limitNumber;

    const mapToPayout = async (item: any, type: string) => {
      const trans = await this._transactionRepository.findOne({ transactionId: item.transactionId });
      return {
        _id: item._id,
        totalAmount: item.fee,
        paid: item.fee,
        serviceAmount: 0,
        status: "completed",
        transactionId: item.transactionId,
        invoiceLink: trans?.invoice || "",
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        paymentFor: type,
        date: item.updatedAt.toISOString(),
        amount: item.fee,
   
      };
    };

    let payouts: any[] = [];
    let totalCount = 0;

    const buildDateQuery = (query: any, field: string = "date") => {
      const dateQuery: any = {};
      if (filters.startDate) {
        dateQuery.$gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        dateQuery.$lte = new Date(filters.endDate);
      }
      if (Object.keys(dateQuery).length > 0) {
        query[field] = dateQuery;
      }
    };

    if (filters.paymentFor === "Appointment") {
      const appQuery: any = { doctorId, appointmentStatus: "completed", paymentStatus: "completed" };
      buildDateQuery(appQuery);
      totalCount = await this._appointmentsRepository.countDocuments(appQuery);
      const appointments = await this._appointmentsRepository.findAll(appQuery,{ sort: { updatedAt: -1 }, skip, limit: limitNumber })
        console.log("appoitnt..........................//////",appointments);
      payouts = await Promise.all(appointments.map((app: any) => mapToPayout(app, "Appointment")));
    } else if (filters.paymentFor === "Analysis") {
      const analQuery: any = { doctorId, analysisStatus: "submited" };
      buildDateQuery(analQuery);
      totalCount = await this._reportAnalysisRepository.countDocuments(analQuery);
      const analyses = await this._reportAnalysisRepository.findAll(analQuery,{ sort: { updatedAt: -1 }, skip, limit: limitNumber })
        
      payouts = await Promise.all(analyses.map((anal: any) => mapToPayout(anal, "Analysis")));
    } else {
      const appQuery: any = { doctorId, appointmentStatus: "completed", paymentStatus: "completed" };
      buildDateQuery(appQuery);
      const analQuery: any = { doctorId, analysisStatus: "submited" };
      buildDateQuery(analQuery);
      const appCount = await this._appointmentsRepository.countDocuments(appQuery);
      const analCount = await this._reportAnalysisRepository.countDocuments(analQuery);
      totalCount = appCount + analCount;
      const appointments = await this._appointmentsRepository.findAll(appQuery,{ sort: { updatedAt: -1 } })
      const analyses = await this._reportAnalysisRepository.findAll(analQuery,{ sort: { updatedAt: -1 } })
      const appPayouts = await Promise.all(appointments.map((app: any) => mapToPayout(app, "Appointment")));
      const analPayouts = await Promise.all(analyses.map((anal: any) => mapToPayout(anal, "Analysis")));
      const combined = [...appPayouts, ...analPayouts].sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
      payouts = combined.slice(skip, skip + limitNumber);
    }

    const totalPages = Math.ceil(totalCount / limitNumber);
    return { payouts, totalPages };
  }
}