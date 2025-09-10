// src/routes/UserRoutes.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import PrivateRoute from "./DoctorPrivateRoute";
import PublicRoute from "./DoctorPublicRoute";
import { lazy } from 'react';
import DoctorPaymentCancelled from "../../components/doctorComponents/DoctorPaymentCancelled";

const DoctorLogin = lazy(() => import ( "../../pages/doctorPages/DoctorLogin"));
const DoctorSignup = lazy(() => import ( "../../pages/doctorPages/DoctorSignup"));
const DoctorOtpVerification = lazy(() => import ( "../../pages/doctorPages/DoctorOtpVerification"));
// const DoctorForgetPassword = lazy(() => import ( "../../pages/DoctorPages/DoctorForgetPassword"));
// const DoctorResetPassword = lazy(() => import ( "../../pages/DoctorPages/DoctorResetPassword"));
const DoctorMain = lazy(() => import ( "../../pages/doctorPages/DoctorMain"));
const Dashboard = lazy(() => import ( "../../components/doctorComponents/DoctorDashboard"));
const PaymentSuccess = lazy(() => import ( "../../components/doctorComponents/DoctorPaymentSuccess"));
const DoctorProfile = lazy(() => import ( "../../components/doctorComponents/DoctorProfile"));
const DoctorChat = lazy(() => import ( "../../components/doctorComponents/DoctorChat"));
const DoctorSlots = lazy(() => import ( "../../components/doctorComponents/DoctorSlots"));
const DoctorAppointments = lazy(() => import ( "../../components/doctorComponents/DoctorAppointments"));
// const DoctorVideoCall = lazy(() => import ( "../../components/doctorComponents/DoctorVideoCall"));
const VideoCall = lazy(() => import ( "../../sharedComponents/VideoCall"));
const DoctorReportAnalysis  = lazy(() => import ( "../../components/doctorComponents/DoctorReportAnalysis"));
const DoctorSubscriptionPlans = lazy(() => import ( "../../components/doctorComponents/DoctorSubscription"));
const DoctorBlogs = lazy(() => import ( "../../components/doctorComponents/DoctorBlogs"));
const DoctorBlogEditAndCreate = lazy(() => import ( "../../components/doctorComponents/DoctorBlogEditAndCreate"));
const DoctorBlogDetails = lazy(() => import ( "../../components/doctorComponents/DoctorBlog"));
const DoctorAdvertisementCreate = lazy(() => import ( "../../components/doctorComponents/DoctorAdvertisementCreation"));
const DoctorAdds = lazy(() => import ( "../../components/doctorComponents/DoctorAdvertisements"));
const DoctorPayouts = lazy(() => import ( "../../components/doctorComponents/DoctorPayouts"));
const DoctorRevenue = lazy(() => import ( "../../components/doctorComponents/DoctorRevenue"));

// import Profile from "../../components/DoctorComponents/DoctorProfile";
// import DoctorRcoveryPassword from "../../pages/DoctorPages/DoctorRcoveryPassword";
// import GoogleSuccess from "../../sharedComponents/GoogleSuccess";

const DoctorRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<DoctorLogin />} />
        <Route path="/signup" element={<DoctorSignup />} />
        {/* <Route path="/forgetPassword" element={<UserForgetPassword />} /> */}
        {/* <Route path="/recoverPassword" element={<UserRcoveryPassword/> } /> */}
        <Route path="/otp" element={<DoctorOtpVerification />} />
        {/* <Route path="/resetPassword" element={<UserResetPassword />} /> */}
        {/* <Route path="/google-success" element={<GoogleSuccess />} /> */}
      </Route>

      {/* Protected Routes */}
      <Route element={<PrivateRoute />}>
        <Route path="/" element={<DoctorMain />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="profile" element={<DoctorProfile />} />
          <Route path="payment-success" element={<PaymentSuccess />} />
          <Route path="payment-cancelled" element={<DoctorPaymentCancelled />} />
          <Route path="slots" element={<DoctorSlots />} />
          <Route path="chat" element={<DoctorChat />} />
          <Route path="appointments" element={<DoctorAppointments />} />  
          <Route path="video-call/:appointmentId" element={<VideoCall role="doctor" />} />
          <Route path="report-analysis" element={< DoctorReportAnalysis/>} />
          <Route path="plans" element={< DoctorSubscriptionPlans/>} />
          <Route path="blogs" element={< DoctorBlogs/>} />
          <Route path="blog-create-edit" element={< DoctorBlogEditAndCreate/>} />
          <Route path="blog" element={< DoctorBlogDetails/>} />
          <Route path="adds" element={< DoctorAdds/>} />
          <Route path="advertisement-create" element={< DoctorAdvertisementCreate/>} />
          <Route path="payout" element={< DoctorPayouts/>} />
          <Route path="revenue" element={< DoctorRevenue/>} />
          
          

        </Route>
      </Route>

      {/* Catch All */}
      <Route path="*" element={<Navigate to="/doctor/login" />} />
    </Routes>
  );
};

export default DoctorRoutes;
