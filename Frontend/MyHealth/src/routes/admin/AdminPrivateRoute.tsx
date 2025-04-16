import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import { RootState } from "../../redux/store/store"; 

const AdminPrivateRoute = () => {
  const admin = useSelector((state: RootState) => state.admin.admin);

  console.log("AdminPrivateRoute", admin);
  return admin ? <Outlet /> : <Navigate to="/admin/login" />;
};

export default AdminPrivateRoute;