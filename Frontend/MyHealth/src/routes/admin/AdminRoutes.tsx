// src/routes/UserRoutes.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import PrivateRoute from "./AdminPrivateRoute";
import PublicRoute from "./AdminPublicRoute";
import { lazy } from 'react';


const AdminLogin = lazy(() => import ( "../../pages/adminPages/AdminLogin"));
const AdminForgetPassword = lazy(() => import (  "../../pages/adminPages/AdminForgetPassword"));
const AdminRcoveryPassword = lazy(() => import ( "../../pages/adminPages/AdminRecoveryPassword"));
// const AdminResetPassword = lazy(() => import ( "../../pages/adminPages/"));
const AdminMain = lazy(() => import ( "../../pages/adminPages/AdminMain"));
const AdminDashboard = lazy(() => import ( "../../components/adminComponents/AdminDashboard"));
const AdminUsers = lazy(() => import ( "../../components/adminComponents/AdminUsers"));
const AdminDoctors = lazy(() => import ( "../../components/adminComponents/AdminDoctors"));
const AdminDoctorDetails = lazy(() => import ( "../../components/adminComponents/AdminDoctorDetails"));
const AdminSubscriptions = lazy(() => import ( "../../components/adminComponents/AdminSubscriptions"));
const AdminAppointments = lazy(() => import ( "../../components/adminComponents/AdminAppointments"));
const AdminTransactions = lazy(() => import ( "../../components/adminComponents/AdminTransactions"));
const AdminPayouts = lazy(() => import ( "../../components/adminComponents/AdminPayouts"));

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
          <Route path="/subscriptionPlans" element={<AdminSubscriptions/> } />
          <Route path="/appointments" element={<AdminAppointments/> } />
          <Route path="/transactions" element={<AdminTransactions/> } />
          <Route path="/payout" element={<AdminPayouts/> } />


          
          

        </Route>
      </Route>

      {/* Catch All */}
      <Route path="*" element={<Navigate to="/admin/login" />} />
    </Routes>
  );
};

export default UserRoutes;
