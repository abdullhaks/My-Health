import { Outlet } from "react-router-dom";
import Layout from "../../components/userComponents/Layout";

function UserMain() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

export default UserMain;