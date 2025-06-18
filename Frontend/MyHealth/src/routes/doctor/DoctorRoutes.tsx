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

        </Route>
      </Route>

      {/* Catch All */}
      <Route path="*" element={<Navigate to="/doctor/login" />} />
    </Routes>
  );
};

export default DoctorRoutes;
