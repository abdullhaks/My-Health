// src/routes/UserRoutes.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import PrivateRoute from "./AdminPrivateRoute";
import PublicRoute from "./AdminPublicRoute";

import AdminLogin from "../../pages/adminPages/AdminLogin";
import AdminForgetPassword from "../../pages/adminPages/AdminForgetPassword";
import AdminRcoveryPassword from "../../pages/adminPages/AdminRecoveryPassword";
// import AdminResetPassword from "../../pages/adminPages/";
import AdminMain from "../../pages/adminPages/AdminMain";
import AdminDashboard from "../../components/adminComponents/AdminDashboard";
import AdminUsers from "../../components/adminComponents/AdminUsers";
import AdminDoctors from "../../components/adminComponents/AdminDoctors";
import AdminDoctorDetails from "../../components/adminComponents/AdminDoctorDetails";

const UserRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<AdminLogin />} />
        <Route path="/forgetPassword" element={<AdminForgetPassword />} />
        <Route path="/recoverPassword" element={<AdminRcoveryPassword/> } />
        {/* <Route path="/resetPassword" element={<UserResetPassword />} /> */}
      </Route>

      {/* Protected Routes */}
      <Route element={<PrivateRoute />}>
        <Route path="/" element={<AdminMain />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="doctors" element={<AdminDoctors />} />
          <Route path="doctor/:id" element={<AdminDoctorDetails/>} />
        </Route>
      </Route>

      {/* Catch All */}
      <Route path="*" element={<Navigate to="/admin" />} />
    </Routes>
  );
};

export default UserRoutes;
