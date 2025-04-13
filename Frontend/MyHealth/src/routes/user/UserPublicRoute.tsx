
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import { RootState } from "../../redux/store/store";

const UserPublicRoute = () => {
  const user = useSelector((state: RootState) => state.user.user);

  return user ? <Navigate to="/user/dashboard" /> : <Outlet />;
};

export default UserPublicRoute;


