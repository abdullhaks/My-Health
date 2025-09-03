import { inject, injectable } from "inversify";
import IDoctorTransactionsService from "../interfaces/IDoctorTransactionServices";
import ITransactionRepository from "../../../repositories/interfaces/ITransactionRepository";
import IAppointmentsRepository from "../../../repositories/interfaces/IAppointmentsRepository";
import IReportAnalysisRepository from "../../../repositories/interfaces/IReportAnalysisRepository";
import { ITransactions } from "../../../dto/transactionDto";
import { Payout,filter } from "../../../dto/transactionDto"; 
import { IAppointmentDocument, IAppointmentDTO } from "../../../dto/appointmentDTO";
import { IReportAnalysisDocument } from "../../../entities/reportAnalysisEntities";


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
  ): Promise<{ payouts: Payout[]; totalPages: number }> {
    const skip = (pageNumber - 1) * limitNumber;

    const mapToPayout = async (item: IAppointmentDocument|IReportAnalysisDocument, type: "Appointment" | "Analysis"): Promise<Payout> => {
  const trans = await this._transactionRepository.findOne({ transactionId: item.transactionId });
  return {
    _id: item._id.toString(),
    totalAmount: item.fee,
    paid: item.fee,
    serviceAmount: 0,
    status: "completed",
    transactionId: item.transactionId ?? "",
    invoiceLink: trans?.invoice || "",
    createdAt: item.createdAt,
    updatedAt: item.updatedAt ?? new Date(),
    paymentFor: type,
    date: item.updatedAt.toISOString(),
    amount: item.fee,
  };
};


    let payouts: Payout[] = [];
    let totalCount = 0;

     const buildDateQuery = (query: Record<string, unknown>, field: string = "date") => {
      const dateQuery: Record<string, Date> = {};
      if (filters.startDate) dateQuery.$gte = new Date(filters.startDate);
      if (filters.endDate) dateQuery.$lte = new Date(filters.endDate);
      if (Object.keys(dateQuery).length > 0) {
        query[field] = dateQuery;
      }
    };

    if (filters.paymentFor === "Appointment") {
      const appQuery = { doctorId, appointmentStatus: "completed", paymentStatus: "completed" };
      buildDateQuery(appQuery);
      totalCount = await this._appointmentsRepository.countDocuments(appQuery);
      const appointments = await this._appointmentsRepository.findAll(appQuery, { sort: { updatedAt: -1 }, skip, limit: limitNumber });
      payouts = await Promise.all(
      appointments.map((app) => mapToPayout(app, "Appointment"))
);

    } else if (filters.paymentFor === "Analysis") {
      const analQuery = { doctorId, analysisStatus: "submited" };
      buildDateQuery(analQuery);
      totalCount = await this._reportAnalysisRepository.countDocuments(analQuery);
      const analyses = await this._reportAnalysisRepository.findAll(analQuery, { sort: { updatedAt: -1 }, skip, limit: limitNumber });
      payouts = await Promise.all(analyses.map((anal) => mapToPayout(anal, "Analysis")));
    } else {
      const appQuery = { doctorId, appointmentStatus: "completed", paymentStatus: "completed" };
      buildDateQuery(appQuery);
      const analQuery = { doctorId, analysisStatus: "submited" };
      buildDateQuery(analQuery);

      const appCount = await this._appointmentsRepository.countDocuments(appQuery);
      const analCount = await this._reportAnalysisRepository.countDocuments(analQuery);
      totalCount = appCount + analCount;

      const appointments = await this._appointmentsRepository.findAll(appQuery, { sort: { updatedAt: -1 } });
      const analyses = await this._reportAnalysisRepository.findAll(analQuery, { sort: { updatedAt: -1 } });

      const appPayouts = await Promise.all(appointments.map((app) => mapToPayout(app, "Appointment")));
      const analPayouts = await Promise.all(analyses.map((anal) => mapToPayout(anal, "Analysis")));

      const combined = [...appPayouts, ...analPayouts].sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
      payouts = combined.slice(skip, skip + limitNumber);
    }

    const totalPages = Math.ceil(totalCount / limitNumber);
    return { payouts, totalPages };
  }
}