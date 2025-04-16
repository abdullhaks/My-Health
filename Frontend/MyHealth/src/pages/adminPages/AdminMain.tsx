import { Outlet } from "react-router-dom";
import Layout from "../../components/adminComponents/Layout";

function AdminMain() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

export default AdminMain;