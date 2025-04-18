import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import { RootState } from "../../redux/store/store"; 

const AdminPrivateRoute = () => {
  const admin = useSelector((state: RootState) => state.admin.admin);
  const accessToken = useSelector((state: RootState) => state.admin.accessToken);
  const isLoggedIn = !!admin && !!accessToken; 

  console.log("AdminPrivateRoute", admin);
  return isLoggedIn ? <Outlet /> : <Navigate to="/admin/login" />;
};

export default AdminPrivateRoute;