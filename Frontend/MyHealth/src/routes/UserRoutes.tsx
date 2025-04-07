import { Route,Routes } from "react-router-dom";

import UserLogin from "../pages/userPages/UserLogin";
import UserSignup from "../pages/userPages/UserSignup";
import UserForgetPassword from "../pages/userPages/UserForgetPassword";
import UserOtpVerification from "../pages/userPages/UserOtpVerification";
import UserResetPassword from "../pages/userPages/UserResetPassword";

const UserRoutes = () => {
 
    const routes = [
      {path: "/", element: <UserLogin />},
      {path: "/login", element: <UserLogin />},
      {path: "/signup", element: <UserSignup />},
      {path: "/forgetPassword" , element : <UserForgetPassword/>},
      {path: "/otp" , element : <UserOtpVerification/>},
      {path: "/resetPassword" , element : <UserResetPassword/>}
   
    ]


    return (
        <Routes>
            {routes.map((route, index) => (
                <Route key={index} path={route.path} element={route.element} />
            ))}
        </Routes>
    );

};

export default UserRoutes;
