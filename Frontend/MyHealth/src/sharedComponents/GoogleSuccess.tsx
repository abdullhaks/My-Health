import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getMe } from "../api/user/userApi";
import {loginUser as login, logoutUser } from "../redux/slices/userSlices";
import toast from "react-hot-toast";

const GoogleSuccess = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await getMe();

        console.log("user res from google frontend...",res)

        dispatch(logoutUser());
        dispatch(login({
          user: res.user,
        }));
        
        toast.success("Logged in successfully");
        navigate("/user/dashboard");
      } catch (err) {
        console.error("Error fetching user", err);
        navigate("/login");
      }
    };

    fetchUser();
  }, []);

  return <p>Logging in with Google...</p>;
};

export default GoogleSuccess;
