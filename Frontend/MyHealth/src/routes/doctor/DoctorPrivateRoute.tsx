import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import { RootState } from "../../redux/store/store"; 

const DoctorPrivateRoute = () => {
  const doctor = useSelector((state: RootState) => state.doctor.doctor);

  return doctor ? <Outlet /> : <Navigate to="/doctor/login" />;
};

export default DoctorPrivateRoute;