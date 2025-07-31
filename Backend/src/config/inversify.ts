import { Container } from "inversify";
import userModel from "../models/userModel";
import OtpModel from "../models/otpModel";
import adminModel from "../models/adminModel";
import doctorModel from "../models/doctorModel";
import subscriptionModel from "../models/subscriptionModel";
import conversationModel from "../models/conversationModel";
import messageModel from "../models/messageModel";
import sessionModel from "../models/sessionModel";
import appointmentModel from "../models/appointmentModel";
import reportAnalysisModel from "../models/reportAnalysisModel";
import analyticsModel from "../models/analyticsModel";
import transactionModel from "../models/transactionModel";
import blogModel from "../models/blogModel";
import advertisementModel from "../models/advertisementModel";
import notificationModel from "../models/notificationModel";
import prescriptionModel from "../models/prescriptionModel";

//controllers..................................................................
import UserAuthController from "../controllers/user/implementations/authCtrl";
import IUserAuthCtrl from "../controllers/user/interfaces/IAuthCtrl";
import UserProfileController from "../controllers/user/implementations/profileCtrl";
import IUserProfileCtrl from "../controllers/user/interfaces/IProfileCtrl";
import UserAppointmentController from "../controllers/user/implementations/appointmentCtrl";
import IUserAppointmentController from "../controllers/user/interfaces/IAppointmentCtrl";
import UserSessionController from "../controllers/user/implementations/sessionCtrl";
import IUserSessionCtrl from "../controllers/user/interfaces/ISessionCtrl";
import UserReportAnalyisController from "../controllers/user/implementations/reportAnalysisCtrl";
import IUserReportAnalysisCtrl from "../controllers/user/interfaces/IReportAnalysisCtrl";
import UserBlogController from "../controllers/user/implementations/blogCtrl";
import IUserBlogController from "../controllers/user/interfaces/IBlogCtrl";


import AdminAuthController from "../controllers/admin/implementations/authCtrl";
import IAdminAuthCtrl from "../controllers/admin/interfaces/IAuthCtrl";
import AdminUserController from "../controllers/admin/implementations/userCtrl";
import IAdminUserCtrl from "../controllers/admin/interfaces/IUserCtrl";
import AdminDoctorController from "../controllers/admin/implementations/doctorCtrl";
import IAdminDoctorCtrl from "../controllers/admin/interfaces/IDoctorCtrl";
import AdminProductController from "../controllers/admin/implementations/productCtrl";
import IAdminProductCtrl from "../controllers/admin/interfaces/IProductCtrl";
import AdminAppointmentController from "../controllers/admin/implementations/appointmentCtrl";
import IAdminAppointmentController from "../controllers/admin/interfaces/IAppointmentCtrl";
import AdminAnalyticsContorller from "../controllers/admin/implementations/analyticsCtrl";
import IAdminAnalyticsController from "../controllers/admin/interfaces/IAnalyticsCtrl";
import AdminTransactionController from "../controllers/admin/implementations/transactionCtrl";
import IAdminTransactionController from "../controllers/admin/interfaces/ITransactionCtrl";


import DoctorAuthController from "../controllers/doctor/implementations/authCtrl";
import IDoctorAuthCtrl from "../controllers/doctor/interfaces/IAuthCtrl";
import DoctorProfileController from "../controllers/doctor/implementations/profileCtrl";
import IDoctorProfileCtrl from "../controllers/doctor/interfaces/IProfileCtrl";
import DoctorSessionController from "../controllers/doctor/implementations/sessionCtrl";
import IDoctorSessionCtrl from "../controllers/doctor/interfaces/ISessionCtrl";
import DoctorAppointmentController from "../controllers/doctor/implementations/appointmentCtrl";
import IDoctorAppointmentController from "../controllers/doctor/interfaces/IAppointmentCtrl";
import DoctorReportAnalysisController from "../controllers/doctor/implementations/reportAnalysisCtrl";
import IDoctorReportAnalysisCtrl from "../controllers/doctor/interfaces/IReportAnalysisCtrl";
import DoctorPlansController from "../controllers/doctor/implementations/planCtrl";
import IDoctorPlanCtrl from "../controllers/doctor/interfaces/IPlanCtrl";
import DoctorBlogController from "../controllers/doctor/implementations/blogCtrl";
import IDoctorBlogController from "../controllers/doctor/interfaces/IBlogCtrl";
import IDoctorAdvertisementController from "../controllers/doctor/interfaces/IAdvertisementCtrl";
import DoctorAdvertisementController from "../controllers/doctor/implementations/advertisementCtrl";
import IDoctorPrescriptionCtrl from "../controllers/doctor/interfaces/IPrescriptionCtrl";
import DoctorPrescriptionController from "../controllers/doctor/implementations/prescriptionCtrl";


import PaymentController from "../controllers/common/implementations/paymentCtrl"
import IPaymentCtrl from "../controllers/common/interfaces/IPaymentCtrl";
import ConversationController from "../controllers/common/implementations/conversationCtrl";
import IConversationCtrl from "../controllers/common/interfaces/IConversationCtrl";
import MessageController from "../controllers/common/implementations/messageCtrl";
import IMessageCtrl from "../controllers/common/interfaces/IMessageCtrl";
import DetailsController from "../controllers/common/implementations/detailsCtrl";
import IDetailsCtrl from "../controllers/common/interfaces/IDetailsCtrl";
import DirectDocUploadS3Controller from "../controllers/common/implementations/directDocUploadS3";
import IDirectDocUploadS3Ctrl from "../controllers/common/interfaces/IDirectDocUploadS3";
import NotificationController from "../controllers/common/implementations/notificationCtrl";
import INotificationController from "../controllers/common/interfaces/INotificationCtrl";


//.................................................................................

//services.....................................................................
import UserAuthService from "../services/user/implementations/userAuthServices";
import IUserAuthService from "../services/user/interfaces/IUserAuthServices";
import UserProfileService from "../services/user/implementations/userProfileServices";
import IUserProfileService from "../services/user/interfaces/IuserProfileServices";
import UserAppointmentService from "../services/user/implementations/userAppointmentServices";
import IUserAppointmentService from "../services/user/interfaces/IUserAppointmentServices";
import UserSessionService from "../services/user/implementations/userSessionService";
import IUserSessionService from "../services/user/interfaces/IUserSessionService";
import UserReportAnalysisService from "../services/user/implementations/userReportAnalysis";
import IUserReportAnalysisService from "../services/user/interfaces/IUserReportAnalysis";
import UserBlogService from "../services/user/implementations/userrBlogServices";
import IUserBlogService from "../services/user/interfaces/IUserBlogServices";


import AdminAuthService from "../services/admin/implementations/adminAuthService";
import IAdminAuthService from "../services/admin/interfaces/IAdminAuthService";
import AdminUserService from "../services/admin/implementations/adminUserService";
import IAdminUserService from "../services/admin/interfaces/IAdminUserService";
import AdminDoctorService from "../services/admin/implementations/adminDoctorService";
import IAdminDoctorService from "../services/admin/interfaces/IAdminDoctorService";
import AdminAppointmentService from "../services/admin/implementations/adminAppointmentServices";
import IAdminAppointmentsService from "../services/admin/interfaces/IAdminAppointmentServices";
import AdminAnalyticsServices from "../services/admin/implementations/adminAnalyticsServices";
import IAdminAnalyticsServices from "../services/admin/interfaces/IAdminAnalyticsServices";
import AdminTransactionsService from "../services/admin/implementations/adminTransactionServices";
import IAdminTransactionsService from "../services/admin/interfaces/IAdminTransactionServices";



import DoctorAuthService from "../services/doctor/implementations/doctorAuthServices";
import IDoctorAuthService from "../services/doctor/interfaces/IDoctorAuthServices";
import IDoctorProfileService from "../services/doctor/interfaces/IDoctorProfileSevices";
import DoctorProfileService from "../services/doctor/implementations/doctorProfileService";
import DoctorSessionService from "../services/doctor/implementations/doctorSessionService";
import IDoctorSessionService from "../services/doctor/interfaces/IDoctorSessionService";
import DoctorAppointmentService from "../services/doctor/implementations/doctorAppointmentService";
import IDoctorAppointmentService from "../services/doctor/interfaces/IDoctorAppointmentService";
import DoctorReportAnalysisService from "../services/doctor/implementations/doctorReportAnalysis";
import IDoctorReportAnalysisService from "../services/doctor/interfaces/IDoctorReportAnalysis";
import DoctorBlogService from "../services/doctor/implementations/doctorBlogServices";
import IDoctorBlogService from "../services/doctor/interfaces/IDoctorBlogServices";
import IDoctorAdvertisementService from "../services/doctor/interfaces/IDoctorAdvertisementServices";
import DoctorAdvertisementService from "../services/doctor/implementations/doctorAdvertisementServices";
import IDoctorPrescriptionService from "../services/doctor/interfaces/IDoctorPrescriptionService";
import DoctorPrescriptionService from "../services/doctor/implementations/doctorPrescriptionService";



import PaymentService from "../services/common/implementations/paymentService";
import IPaymentService from "../services/common/interfaces/IPaymentService";
import ConversationService from "../services/common/implementations/conversationService";
import IConversationService from "../services/common/interfaces/IConversationService";
import MessageService from "../services/common/implementations/messageService";
import IMessageService from "../services/common/interfaces/IMessageService";
import DetailsService from "../services/common/implementations/detailsService";
import IDetailsService from "../services/common/interfaces/IDetailsService";
import DirectDocUploadS3Service from "../services/common/implementations/directDocUploadS3Service";
import IDirectDocUploadS3Service from "../services/common/interfaces/IDirectDocUploadS3Service";
import NotificationService from "../services/common/implementations/notificationService";
import INotificationServices from "../services/common/interfaces/INotificationService";

//.................................................................................

//repositories......................................................................
import UserRepository from "../repositories/implementations/userRepository";
import IUserRepository from "../repositories/interfaces/IUserRepository";

import AdminRepository from "../repositories/implementations/adminRepository";
import IAdminRepository from "../repositories/interfaces/IAdminRepository";

import DoctorRepository from "../repositories/implementations/doctorRepository";
import IDoctorRepository from "../repositories/interfaces/IDoctorRepository";

import PaymentRepository from "../repositories/implementations/paymentRepository";
import IPaymentRepository from "../repositories/interfaces/IPaymentRepository";

import AppointmentRepository from "../repositories/implementations/appointmentRepository";
import IAppointmentRepository from "../repositories/interfaces/IAppointmentRepository";

import ConversationRepository from "../repositories/implementations/conversationRepository";
import IConversationRepository from "../repositories/interfaces/IConversationRepository";

import MessageRepository from "../repositories/implementations/messageRepository";
import IMessageRepository from "../repositories/interfaces/IMessageRepository";

import SessionRepository from "../repositories/implementations/sessionRepository";
import ISessionRepository from "../repositories/interfaces/ISessionRepository";

import AppointmentsRepository from "../repositories/implementations/appointmentsRepository";
import IAppointmentsRepository from "../repositories/interfaces/IAppointmentsRepository";

import ReportAnalysisRepository from "../repositories/implementations/reportAnalysisRepository";
import IReportAnalysisRepository from "../repositories/interfaces/IReportAnalysisRepository";

import AnalyticsRepository from "../repositories/implementations/analyticsRepository";
import IAnalyticsRepository from "../repositories/interfaces/IAnalyticsRepository";

import TransactionRepository from "../repositories/implementations/transactionRepositoty";
import ITransactionRepository from "../repositories/interfaces/ITransactionRepository";

import IBlogRepository from "../repositories/interfaces/IBlogRepository";
import BlogsRepository from "../repositories/implementations/blogRepository";

import IAdvertisementRepository from "../repositories/interfaces/IAdvertisementRepository";
import AdvertisementRepository from "../repositories/implementations/advertisementRepositoty";

import INotificationRepository from "../repositories/interfaces/INotificationRepository";
import NotificationRepository from "../repositories/implementations/notificationRepository";


import IPrescriptionRepository from "../repositories/interfaces/IPrescriptionRepositiory";
import PrescriptionRepository from "../repositories/implementations/prescriptionrRepository";



//.................................................................................


const container = new Container();
//models.............................................................
container.bind("userModel").toConstantValue(userModel);
container.bind("otpModel").toConstantValue(OtpModel);
container.bind("adminModel").toConstantValue(adminModel);
container.bind("doctorModel").toConstantValue(doctorModel);
container.bind("subscriptionModel").toConstantValue(subscriptionModel);
container.bind("conversationModel").toConstantValue(conversationModel);
container.bind("messageModel").toConstantValue(messageModel);
container.bind("sessionModel").toConstantValue(sessionModel);
container.bind("appointmentModel").toConstantValue(appointmentModel);
container.bind("reportAnalysisModel").toConstantValue(reportAnalysisModel);
container.bind("analyticsModel").toConstantValue(analyticsModel);
container.bind("transactionModel").toConstantValue(transactionModel);
container.bind("blogModel").toConstantValue(blogModel);
container.bind("advertisementModel").toConstantValue(advertisementModel);
container.bind("notificationModel").toConstantValue(notificationModel);
container.bind("prescriptionModel").toConstantValue(prescriptionModel);

//...................................................................


container.bind<IUserAuthCtrl>("IUserAuthCtrl").to(UserAuthController);
container.bind<IUserProfileCtrl>("IUserProfileCtrl").to(UserProfileController);
container.bind<IUserAppointmentController>("IUserAppointmentController").to(UserAppointmentController);
container.bind<IUserSessionCtrl>("IUserSessionCtrl").to(UserSessionController);
container.bind<IUserReportAnalysisCtrl>("IUserReportAnalysisCtrl").to(UserReportAnalyisController);
container.bind<IUserBlogController>("IUserBlogController").to(UserBlogController);


container.bind<IAdminAuthCtrl>("IAdminAuthCtrl").to(AdminAuthController);
container.bind<IAdminUserCtrl>("IAdminUserCtrl").to(AdminUserController);
container.bind<IAdminDoctorCtrl>("IAdminDoctorCtrl").to(AdminDoctorController);
container.bind<IAdminProductCtrl>("IAdminProductCtrl").to(AdminProductController);
container.bind<IAdminAppointmentController>("IAdminAppointmentController").to(AdminAppointmentController);
container.bind<IAdminAnalyticsController>("IAdminAnalyticsController").to(AdminAnalyticsContorller);
container.bind<IAdminTransactionController>("IAdminTransactionController").to(AdminTransactionController);


container.bind<IDoctorAuthCtrl>("IDoctorAuthCtrl").to(DoctorAuthController)
container.bind<IDoctorProfileCtrl>("IDoctorProfileCtrl").to(DoctorProfileController);
container.bind<IDoctorSessionCtrl>("IDoctorSessionCtrl").to(DoctorSessionController);
container.bind<IDoctorAppointmentController>("IDoctorAppointmentController").to(DoctorAppointmentController);
container.bind<IDoctorReportAnalysisCtrl>("IDoctorReportAnalysisCtrl").to(DoctorReportAnalysisController);
container.bind<IDoctorPlanCtrl>("IDoctorPlanCtrl").to(DoctorPlansController);
container.bind<IDoctorBlogController>("IDoctorBlogController").to(DoctorBlogController);
container.bind<IDoctorAdvertisementController>("IDoctorAdvertisementController").to(DoctorAdvertisementController);
container.bind<IDoctorPrescriptionCtrl>("IDoctorPrescriptionCtrl").to(DoctorPrescriptionController);



container.bind<IPaymentCtrl>("IPaymentCtrl").to(PaymentController);
container.bind<IConversationCtrl>("IConversationCtrl").to(ConversationController)
container.bind<IMessageCtrl>("IMessageCtrl").to(MessageController)
container.bind<IDetailsCtrl>("IDetailsCtrl").to(DetailsController);
container.bind<IDirectDocUploadS3Ctrl>("IDirectDocUploadS3Ctrl").to(DirectDocUploadS3Controller);
container.bind<INotificationController>("INotificationController").to(NotificationController);



//......................................................................



container.bind<IUserAuthService>("IUserAuthService").to(UserAuthService)
container.bind<IUserProfileService>("IUserProfileService").to(UserProfileService);
container.bind<IUserAppointmentService>("IUserAppointmentService").to(UserAppointmentService);
container.bind<IUserSessionService>("IUserSessionService").to(UserSessionService);
container.bind<IUserReportAnalysisService>("IUserReportAnalysisService").to(UserReportAnalysisService);
container.bind<IUserBlogService>("IUserBlogService").to(UserBlogService);


container.bind<IAdminAuthService>("IAdminAuthService").to(AdminAuthService);
container.bind<IAdminUserService>("IAdminUserService").to(AdminUserService);
container.bind<IAdminDoctorService>("IAdminDoctorService").to(AdminDoctorService);
container.bind<IAdminAppointmentsService>("IAdminAppointmentsService").to(AdminAppointmentService);
container.bind<IAdminAnalyticsServices>("IAdminAnalyticsServices").to(AdminAnalyticsServices);
container.bind<IAdminTransactionsService>("IAdminTransactionsService").to(AdminTransactionsService)



container.bind<IDoctorAuthService>("IDoctorAuthService").to(DoctorAuthService);
container.bind<IDoctorProfileService>("IDoctorProfileService").to(DoctorProfileService);
container.bind<IDoctorSessionService>("IDoctorSessionService").to(DoctorSessionService);
container.bind<IDoctorAppointmentService>("IDoctorAppointmentService").to(DoctorAppointmentService);
container.bind<IDoctorReportAnalysisService>("IDoctorReportAnalysisService").to(DoctorReportAnalysisService);
container.bind<IDoctorBlogService>("IDoctorBlogService").to(DoctorBlogService);
container.bind<IDoctorAdvertisementService>("IDoctorAdvertisementService").to(DoctorAdvertisementService);
container.bind<IDoctorPrescriptionService>("IDoctorPrescriptionService").to(DoctorPrescriptionService);



container.bind<IPaymentService>("IPaymentService").to(PaymentService);
container.bind<IConversationService>("IConversationService").to(ConversationService);
container.bind<IMessageService>("IMessageService").to(MessageService);
container.bind<IDetailsService>("IDetailsService").to(DetailsService);
container.bind<IDirectDocUploadS3Service>("IDirectDocUploadS3Service").to(DirectDocUploadS3Service);
container.bind<INotificationServices>("INotificationServices").to(NotificationService);


//..............................................................................


container.bind<IUserRepository>("IUserRepository").to(UserRepository);
container.bind<IAdminRepository>("IAdminRepository").to(AdminRepository);
container.bind<IDoctorRepository>("IDoctorRepository").to(DoctorRepository)
container.bind<IPaymentRepository>("IPaymentRepository").to(PaymentRepository);
container.bind<IAppointmentRepository>("IAppointmentRepository").to(AppointmentRepository);
container.bind<IConversationRepository>("IConversationRepository").to(ConversationRepository);
container.bind<IMessageRepository>("IMessageRepository").to(MessageRepository);
container.bind<ISessionRepository>("ISessionRepository").to(SessionRepository);
container.bind<IAppointmentsRepository>("IAppointmentsRepository").to(AppointmentsRepository);
container.bind<IReportAnalysisRepository>("IReportAnalysisRepository").to(ReportAnalysisRepository);
container.bind<IAnalyticsRepository>("IAnalyticsRepository").to(AnalyticsRepository);
container.bind<ITransactionRepository>("ITransactionRepository").to(TransactionRepository);
container.bind<IBlogRepository>("IBlogRepository").to(BlogsRepository);
container.bind<IAdvertisementRepository>("IAdvertisementRepository").to(AdvertisementRepository);
container.bind<INotificationRepository>("INotificationRepository").to(NotificationRepository);
container.bind<IPrescriptionRepository>("IPrescriptionRepository").to(PrescriptionRepository);



export default container;