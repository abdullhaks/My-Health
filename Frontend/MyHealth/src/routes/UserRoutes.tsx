import { Navigate, Route, Routes } from "react-router-dom";
import UserLogin from "../pages/userPages/UserLogin";
import UserSignup from "../pages/userPages/UserSignup";
import UserForgetPassword from "../pages/userPages/UserForgetPassword";
import UserOtpVerification from "../pages/userPages/UserOtpVerification";
import UserResetPassword from "../pages/userPages/UserResetPassword";
import UserMain from "../pages/userPages/UserMain";
import Dashboard from "../components/userComponents/UserDashboard";
import Profile from "../components/userComponents/UserProfile";

const UserRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/user/login" />} />
      <Route path="/login" element={<UserLogin />} />
      <Route path="/signup" element={<UserSignup />} />
      <Route path="/forgetPassword" element={<UserForgetPassword />} />
      <Route path="/otp" element={<UserOtpVerification />} />
      <Route path="/resetPassword" element={<UserResetPassword />} />
      
      {/* Protected routes wrapped in UserMain layout */}
      <Route path="/" element={<UserMain />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        {/* Add other protected routes here */}
      </Route>
    </Routes>
  );
};

export default UserRoutes;