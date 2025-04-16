
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import { RootState } from "../../redux/store/store";

const AdminPublicRoute = () => {
  const user = useSelector((state: RootState) => state.admin.admin);

  return user ? <Navigate to="/admin/dashboard" /> : <Outlet />;
};

export default AdminPublicRoute;


