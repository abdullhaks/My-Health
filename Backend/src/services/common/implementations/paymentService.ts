import { inject, injectable } from "inversify";
import IPaymentService from "../interfaces/IPaymentService";
import IPaymentRepository from "../../../repositories/interfaces/IPaymentRepository";
import Stripe from "stripe";
import stripe from "../../../middlewares/common/stripe";
import { ISubscriptionDocument } from "../../../entities/subscriptionEntities";
import IDoctorRepository from "../../../repositories/interfaces/IDoctorRepository";
import IUserRepository from "../../../repositories/interfaces/IUserRepository";
import { IAppointmentDocument } from "../../../entities/appointmentEntities";
import IAppointmentsRepository from "../../../repositories/interfaces/IAppointmentsRepository";
import IReportAnalysisRepository from "../../../repositories/interfaces/IReportAnalysisRepository";
import IAnalyticsRepository from "../../../repositories/interfaces/IAnalyticsRepository";
import ITransactionRepository from "../../../repositories/interfaces/ITransactionRepository";



@injectable()
export default class PaymentService implements IPaymentService {
  constructor(
    @inject("IPaymentRepository") private _paymentRepository: IPaymentRepository,
    @inject("IDoctorRepository") private _doctorRepository: IDoctorRepository,
    @inject("IAppointmentsRepository") private _appointmentsRepository:IAppointmentsRepository,
    @inject("IUserRepository") private _userRepository:IUserRepository,
    @inject("IReportAnalysisRepository") private _reportAnalysisRepository: IReportAnalysisRepository,
    @inject("IAnalyticsRepository") private _analyticsRepository: IAnalyticsRepository,
    @inject("ITransactionRepository") private _transactionRepository: ITransactionRepository,


  ) {}

  async handleWebhookEvent(event: any): Promise<{received:boolean}> {



    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      

      // console.log("event is..................", event);
      console.log("session is..................", session);

      const metadata = session.metadata;
      var invoiceUrl: string | null | undefined 

            const invoice = await stripe.invoices.retrieve(session.invoice as string);
            if(invoice){
            invoiceUrl = invoice.hosted_invoice_url
            }

      if (!metadata) {
        console.error("Metadata is null or undefined.");
        throw new Error("Invalid session metadata.");
      }

      switch (metadata.role) {
        case "user":
          
        if (metadata.type === "appointment") {
          console.log("Processing one-time appointment payment for user:", metadata);

          const user = await this._userRepository.findOne({_id:metadata.userId});

          console.log("user is ",user);

            if (!user) {
              console.error("User not found:", metadata.userId);
              throw new Error("User not found.");
            };


            const doctor = await this._doctorRepository.findOne({_id:metadata.doctorId});
          console.log("doctor is ",doctor);

            if (!doctor) {
              console.error("Doctor not found:", metadata.doctorId);
              throw new Error("Doctor not found.");
            };
            
            // let todaty = new Date();
            // let beforOneMont= new Date(todaty.setMonth(todaty.getMonth()-1));
            // const appointmentsWithSameDoc = await this._appointmentsRepository.findAll({
            //   userId: metadata.userId,
            //   doctorId: metadata.doctorId,
            //   $and: [
            //     { start: { $gte: beforOneMont } },
            //     { start: { $lte: todaty } }
            //   ]
            // });

            // if(appointmentsWithSameDoc && appointmentsWithSameDoc.length > 3){

            //   console.log("you can't......")
              
            // }

            var tempDate = new Date(metadata.start).toISOString().split("T")[0];

            

            const appointmentData: Partial<IAppointmentDocument> = {
              userId: metadata.userId,
              doctorId: metadata.doctorId,
              userName: user.fullName,
              userEmail:user.email,
              doctorName: doctor.fullName,
              doctorCategory: doctor.category,
              date:tempDate,
              start: new Date(metadata.start),
              end: new Date(metadata.end),
              duration: parseInt(metadata.duration),
              fee: parseInt(metadata.fee),
              slotId: metadata.slotId,
              sessionId:metadata.sessionId,
              transactionId: session.id,
              invoice:invoiceUrl || "",
              paymentType: "stripe",
              paymentStatus: "completed",
              appointmentStatus: "booked",
            };

            const updateAnalytics = await this._analyticsRepository.uptadeOneWithUpsert({dataSet:"1"},{ $inc: { totalRevenue: parseInt(metadata.fee)} });
            
            const appointment = await this._appointmentsRepository.create(
              appointmentData
            );
            
            
            
            const transaction = await this._transactionRepository.create({
                      from:"user",
                      to:"admin",
                      method:"stripe",
                      amount:parseInt(metadata.fee),
                      paymentFor:"appointment",
                      transactionId:session.id,
                      invoice:invoiceUrl || "",
                      doctorId:metadata.doctorId.toString(),
                      userId:metadata.userId.toString(),

            })

          
            console.log("Appointment created:", appointment);
        }else if (metadata.type === "report_analysis") {
            console.log("Processing report analysis payment for user:", metadata);

            const user = await this._userRepository.findOne({ _id: metadata.userId });
            if (!user) {
              console.error("User not found:", metadata.userId);
              throw new Error("User not found.");
            }

            const doctor = await this._doctorRepository.findOne({ _id: metadata.doctorId });
            if (!doctor) {
              console.error("Doctor not found:", metadata.doctorId);
              throw new Error("Doctor not found.");
            }

            const uploadedFiles = [];
            if(metadata.file1) uploadedFiles.push(metadata.file1);
            if(metadata.file2) uploadedFiles.push(metadata.file2);
            if(metadata.file3) uploadedFiles.push(metadata.file3);
            if(metadata.file4) uploadedFiles.push(metadata.file4);
            if(metadata.file5) uploadedFiles.push(metadata.file5);

            
            await this._reportAnalysisRepository.create({
              
              userId: metadata.userId,
              doctorId: metadata.doctorId,
              concerns: metadata.concerns,
              files: uploadedFiles.length ? uploadedFiles: [],
              doctorName: metadata.doctorName,
              doctorCategory: metadata.doctorCategory,
              fee: metadata.fee ? parseInt(metadata.fee) : 0, 
              transactionId:session.id,
            });

            const transaction = await this._transactionRepository.create({
                      from:"user",
                      to:"admin",
                      method:"stripe",
                      amount:parseInt(metadata.fee),
                      paymentFor:"analysis",
                      transactionId:session.id,
                      invoice:invoiceUrl || "",
                      doctorId:metadata.doctorId.toString(),
                      userId:metadata.userId.toString(),
                      analysisId:metadata.analysisId || "",

            })




          }
        break;
        case "doctor":

        const subscription = await stripe.subscriptions.retrieve(
        session.subscription as string
      );


      const invoice = await stripe.invoices.retrieve(
        subscription.latest_invoice as string
      );

      console.log("subscription is ", subscription);
      console.log("invoice data is ", invoice);

          const subscriptionData: Partial<ISubscriptionDocument> = {
            sessionId: session.id,
            stripeSubscriptionId: subscription.id,
            stripeCustomerId: session.customer as string,
            stripeInvoiceId: invoice.id || undefined,
            stripeInvoiceUrl: invoice.hosted_invoice_url || undefined,
            subscriptionStatus: subscription.status as
              | "active"
              | "canceled"
              | "past_due"
              | "unpaid",
            priceId: subscription.items.data[0].price.id,
            interval:
              subscription.items.data[0].price.recurring?.interval === "year"
                ? "year"
                : "month",
            amount: subscription.items.data[0].price.unit_amount || 0,
            subscribedAt: new Date(subscription.start_date * 1000),
            doctor: session.metadata?.doctorId || undefined,
          };

          console.log("session data after webhook event ", session);
         
          if (subscriptionData.doctor) {

             const subResp = await this._paymentRepository.create(
                subscriptionData
              );
              console.log("subResp....is...", subResp);

            const docResp = await this._doctorRepository.update(
              subscriptionData.doctor.toString(),
              {
                premiumMembership: true,
                subscriptionId: subscriptionData.stripeSubscriptionId,
              }
            );
            console.log("docResp....is...", docResp);



            const transaction = await this._transactionRepository.create({
                      from:"doctor",
                      to:"admin",
                      method:"stripe",
                      amount:parseInt((subscriptionData.amount?subscriptionData.amount/100:0).toString()),
                      paymentFor:"subscription",
                      transactionId:subscriptionData.sessionId,
                      invoice:subscriptionData.stripeInvoiceUrl || "",
                      doctorId:subscriptionData.doctor.toString(),

            })
          } else {
            console.error("Doctor ID is undefined.");
            throw new Error("Invalid doctor ID.");
          }

          // await this._paymentRepository.
          break;
        case "admin":
          //   await handleAdminPayment(session);
          break;
      }
    } 

    return { received: true };
  };


  
}
