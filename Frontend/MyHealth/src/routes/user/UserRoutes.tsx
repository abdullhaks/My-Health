// src/routes/UserRoutes.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import PrivateRoute from "./UserPrivateRoute";
import PublicRoute from "./UserPublicRoute";

import UserLogin from "../../pages/userPages/UserLogin";
import UserSignup from "../../pages/userPages/UserSignup";
import UserForgetPassword from "../../pages/userPages/UserForgetPassword";
import UserOtpVerification from "../../pages/userPages/UserOtpVerification";
import UserResetPassword from "../../pages/userPages/UserResetPassword";
import UserMain from "../../pages/userPages/UserMain";
import Dashboard from "../../components/userComponents/UserDashboard";
import Profile from "../../components/userComponents/UserProfile";
import UserRcoveryPassword from "../../pages/userPages/UserRcoveryPassword";
import GoogleSuccess from "../../sharedComponents/GoogleSuccess";
import Doctors from "../../components/userComponents/UserDoctors";
import UserChat from "../../components/userComponents/UserChat";
import UserAppointmentSlots from "../../components/userComponents/UserAppointmentSlots";
import UserAppointmentConfirmation from "../../components/userComponents/UserAppointmentConfirm";
import UserPaymentSuccess from "../../components/userComponents/UserPaymentSuccess";
import UserPaymentCancelled from "../../components/userComponents/UserPaymentCancelled";
import UserAppointments from "../../components/userComponents/UserAppointments";
import UserVideoCall from "../../components/userComponents/UserVideoCall";
import AiHealthStatusGenerator from "../../components/userComponents/AiHealthStatus";
import UserHealthReportAnalysis from "../../components/userComponents/UserHealthReportAnalysis";
import VideoCall from "../../sharedComponents/VideoCall";
import { UserReportAnalysis } from "../../components/userComponents/UserReportAnalysis";
import UserBlogs from "../../components/userComponents/userBlogs";
import UserBlogDetails from "../../components/userComponents/UserBlog";
import UserDoctorDetails from "../../components/userComponents/UserDoctorDetails";
import UserPrescriptionDetails from "../../components/userComponents/UserPrescription";

const UserRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicRoute />}>
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
          <Route path="" element={<Dashboard />} />
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
          
       

          
          
        </Route>
        
      </Route>
 
      {/* Catch All */}
      <Route path="*" element={<Navigate to="/user/login" />} />
    </Routes>
  );
};

export default UserRoutes;
