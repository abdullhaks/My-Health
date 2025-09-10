// src/routes/UserRoutes.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import { lazy } from 'react';
import PrivateRoute from "./UserPrivateRoute";
import PublicRoute from "./UserPublicRoute";

const UserLogin = lazy(() => import ("../../pages/userPages/UserLogin"))
const UserSignup = lazy(() => import ("../../pages/userPages/UserSignup"));
const UserForgetPassword = lazy(() => import ( "../../pages/userPages/UserForgetPassword"));
const UserOtpVerification = lazy(() => import ( "../../pages/userPages/UserOtpVerification"));
const UserResetPassword = lazy(() => import ( "../../pages/userPages/UserResetPassword"));
const UserMain = lazy(() => import ( "../../pages/userPages/UserMain"));
const Dashboard = lazy(() => import ( "../../components/userComponents/UserDashboard"));
const Profile = lazy(() => import ( "../../components/userComponents/UserProfile"));
const UserRcoveryPassword = lazy(() => import ( "../../pages/userPages/UserRcoveryPassword"));
const GoogleSuccess = lazy(() => import ( "../../sharedComponents/GoogleSuccess"));
const Doctors = lazy(() => import ( "../../components/userComponents/UserDoctors"));
const UserChat = lazy(() => import ( "../../components/userComponents/UserChat"));
const UserAppointmentSlots = lazy(() => import ( "../../components/userComponents/UserAppointmentSlots"));
const UserAppointmentConfirmation = lazy(() => import ( "../../components/userComponents/UserAppointmentConfirm"));
const UserPaymentSuccess = lazy(() => import ( "../../components/userComponents/UserPaymentSuccess"));
const UserPaymentCancelled = lazy(() => import ( "../../components/userComponents/UserPaymentCancelled"));
const UserAppointments = lazy(() => import ( "../../components/userComponents/UserAppointments"));
// const UserVideoCall = lazy(() => import ( "../../components/userComponents/UserVideoCall"));
const AiHealthStatusGenerator = lazy(() => import ( "../../components/userComponents/AiHealthStatus"));
const UserHealthReportAnalysis = lazy(() => import ( "../../components/userComponents/UserHealthReportAnalysis"));
const VideoCall = lazy(() => import ( "../../sharedComponents/VideoCall"));
const UserReportAnalysis  = lazy(() => import ( "../../components/userComponents/UserReportAnalysis"));
const UserBlogs = lazy(() => import ( "../../components/userComponents/userBlogs"));
const UserBlogDetails = lazy(() => import ( "../../components/userComponents/UserBlog"));
const UserDoctorDetails = lazy(() => import ( "../../components/userComponents/UserDoctorDetails"));
const UserPrescriptionDetails = lazy(() => import ( "../../components/userComponents/UserPrescription"));
const UserTransactions = lazy(() => import ( "../../components/userComponents/UserTransactions"));
const LandingPage = lazy(() => import ( "../../pages/commonPages/landingPage"));


const UserRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicRoute />}>
        <Route path="" element={<LandingPage />} />
        <Route path="/login" element={<UserLogin />} />
        <Route path="/signup" element={<UserSignup />} />
        <Route path="/forgetPassword" element={<UserForgetPassword />} />
        <Route path="/recoverPassword" element={<UserRcoveryPassword/> } />
        <Route path="/otp" element={<UserOtpVerification />} />
        <Route path="/resetPassword" element={<UserResetPassword />} />
        <Route path="/google-success" element={<GoogleSuccess />} />
      </Route>

      {/* Protected Routes */}
      <Route element={<PrivateRoute />}>
        <Route path="/" element={<UserMain />}>
          {/* <Route path="" element={<Dashboard />} /> */}
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="profile" element={<Profile />} />
          <Route path="doctors" element={<Doctors/>} />
          <Route path="chat" element={<UserChat />} />
          <Route path="doctor-appointment-slots" element={<UserAppointmentSlots />} />
          <Route path="appointment-confirmation" element={<UserAppointmentConfirmation />} />
          <Route path="payment-success" element={<UserPaymentSuccess />} />
          <Route path="payment-cancelled" element={<UserPaymentCancelled />} />
          <Route path="appointments" element={<UserAppointments />} />
          <Route path="video-call/:appointmentId" element={<VideoCall role="user" />} />
          <Route path="ai" element={< AiHealthStatusGenerator/>} />
          <Route path="health-report-analysis" element={< UserHealthReportAnalysis/>} />
          <Route path="report-analysis" element={< UserReportAnalysis/>} />
          <Route path="blogs" element={< UserBlogs/>} />
          <Route path="blog" element={< UserBlogDetails/>} />
          <Route path="doctor-details/:doctorId" element={< UserDoctorDetails/>} />
          <Route path="prescription/:appointmentId" element={< UserPrescriptionDetails/>} />
          <Route path="transactions" element={< UserTransactions/>} />
          
       

          
          
        </Route>
        
      </Route>
 
      {/* Catch All */}
      <Route path="*" element={<Navigate to="/user/login" />} />
    </Routes>
  );
};

export default UserRoutes;
