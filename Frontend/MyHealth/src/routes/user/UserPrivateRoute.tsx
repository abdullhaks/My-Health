import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import { RootState } from "../../redux/store/store"; 

const UserPrivateRoute = () => {
  const user = useSelector((state: RootState) => state.user.user);

  return user ? <Outlet /> : <Navigate to="/user/login" />;
};

export default UserPrivateRoute;