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
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Route>

      {/* Catch All */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default UserRoutes;
