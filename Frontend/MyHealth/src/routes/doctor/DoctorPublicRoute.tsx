
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import { RootState } from "../../redux/store/store";

const DoctorPublicRoute = () => {
  const doctor = useSelector((state: RootState) => state.doctor.doctor);

  return doctor ? <Navigate to="/doctor/dashboard" /> : <Outlet />;
};

export default DoctorPublicRoute;


