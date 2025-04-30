// src/routes/UserRoutes.tsx
import { Routes, Route, Navigate } from "react-router-dom";
// import PrivateRoute from "./DoctorPrivateRoute";
import PublicRoute from "./DoctorPublicRoute";

import DoctorLogin from "../../pages/doctorPages/DoctorLogin";
import DoctorSignup from "../../pages/doctorPages/DoctorSignup";
// import DoctorForgetPassword from "../../pages/DoctorPages/DoctorForgetPassword";
// import DoctorOtpVerification from "../../pages/DoctorPages/DoctorOtpVerification";
// import DoctorResetPassword from "../../pages/DoctorPages/DoctorResetPassword";
// // import DoctorMain from "../../pages/DoctorPages/DoctorMain";
// import Dashboard from "../../components/DoctorComponents/DoctorDashboard";
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
        {/* <Route path="/otp" element={<UserOtpVerification />} /> */}
        {/* <Route path="/resetPassword" element={<UserResetPassword />} /> */}
        {/* <Route path="/google-success" element={<GoogleSuccess />} /> */}
      </Route>

      {/* Protected Routes */}
      {/* <Route element={<PrivateRoute />}>
        <Route path="/" element={<UserMain />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Route> */}

      {/* Catch All */}
      <Route path="*" element={<Navigate to="/doctor" />} />
    </Routes>
  );
};

export default DoctorRoutes;
