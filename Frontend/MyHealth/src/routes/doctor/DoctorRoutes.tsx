// src/routes/UserRoutes.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import PrivateRoute from "./DoctorPrivateRoute";
import PublicRoute from "./DoctorPublicRoute";

import DoctorLogin from "../../pages/doctorPages/DoctorLogin";
import DoctorSignup from "../../pages/doctorPages/DoctorSignup";
import DoctorOtpVerification from "../../pages/doctorPages/DoctorOtpVerification";
// import DoctorForgetPassword from "../../pages/DoctorPages/DoctorForgetPassword";
// import DoctorOtpVerification from "../../pages/DoctorPages/DoctorOtpVerification";
// import DoctorResetPassword from "../../pages/DoctorPages/DoctorResetPassword";
import DoctorMain from "../../pages/doctorPages/DoctorMain";
import Dashboard from "../../components/doctorComponents/DoctorDashboard";
import PaymentSuccess from "../../components/doctorComponents/DoctorPaymentSuccess";
import DoctorProfile from "../../components/doctorComponents/DoctorProfile";
import DoctorChat from "../../components/doctorComponents/DoctorChat";
import DoctorSlots from "../../components/doctorComponents/DoctorSlots";
import DoctorAppointments from "../../components/doctorComponents/DoctorAppointments";
import DoctorVideoCall from "../../components/doctorComponents/DoctorVideoCall";
import VideoCall from "../../sharedComponents/VideoCall";
import { DoctorReportAnalysis } from "../../components/doctorComponents/DoctorReportAnalysis";
import DoctorSubscriptionPlans from "../../components/doctorComponents/DoctorSubscription";
import DoctorBlogs from "../../components/doctorComponents/DoctorBlogs";
import DoctorBlogEditAndCreate from "../../components/doctorComponents/DoctorBlogEditAndCreate";
import DoctorBlogDetails from "../../components/doctorComponents/DoctorBlog";
import DoctorAdvertisementCreate from "../../components/doctorComponents/DoctorAdvertisementCreation";
import DoctorAdds from "../../components/doctorComponents/DoctorAdvertisements";
import DoctorPayouts from "../../components/doctorComponents/DoctorPayouts";
import DoctorRevenue from "../../components/doctorComponents/DoctorRevenue";

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
