import { Outlet } from "react-router-dom";
import Layout from "../../components/doctorComponents/Layout";

function DoctorMain( ) {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

export default DoctorMain;