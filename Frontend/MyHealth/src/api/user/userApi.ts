import { message } from "antd";
import { userInstance } from "../../services/userInstance";
import { ROUTES } from "../../constants/routes";



export const signupUser = async (userData: any) => {
  try {
    const response = await userInstance.post(ROUTES.user.signup, userData);
    message.success("Signup successful!");
    return response.data;
  } catch (error) {
    console.error("Error signing up user:", error);
    throw error;
  }
};

export const getMe = async ()=>{
  try{
    console.log("get me calling......")
    const response = await userInstance.get(ROUTES.user.me);
    console.log("me me me...",response.data);

    return response.data
  }catch(error){
    console.error("Error signing up user:", error);
    throw error;
  }
  
}

export const getDoctor = async (doctorId:string)=>{
  try{
    const response = await userInstance.get("/user/doctorDetails",{params:{doctorId}});
    console.log("doctor details response is ",response.data);
    return response.data
  }catch(error){
    console.error("Error signing up user:", error);
    throw error;
  }
  
}

export const loginUser = async (userData: any) => {
  try {
    const response = await userInstance.post("/user/login", userData);
    console.log("Login response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error logging in user:", error);
    throw error;
  }
};

export const verifyOtp = async (otpData: any) => {
  try {
    console.log("OTP data:", otpData);
    const response = await userInstance.post("/user/verifyOtp", otpData);
    return response.data;
  } catch (error) {
    console.error("Error verifying OTP:", error);
    throw error;
  }
};

export const resentOtp = async (email: string) => {
  try {
    const response = await userInstance.get("/user/resentOtp", {
      params: { email },
    });
    return response.data;
  } catch (error: any) {
    console.error("Error resending OTP:", error);
    throw error.response?.data?.msg || "Something went wrong";
  }
};

export const forgetPassword = async (email: string) => {
  try {
    const response = await userInstance.get("/user/forgotPassword", {
      params: { email },
    });
    return response.data;
  } catch (error) {
    console.error("Error sending forgot password email:", error);
    throw error;
  }
};

export const recoveryPassword = async (email: string) => {
  try {
    const response = await userInstance.get("/user/recoveryPassword", {
      params: { email },
    });
    return response.data;
  } catch (error) {
    console.error("Error recovering password:", error);
    throw error;
  }
};

export const verifyRecoveryPassword = async (userData: any) => {
  try {
    console.log("User data:", userData);
    const response = await userInstance.post("/user/verifyRecoveryPassword", userData);
    console.log("Login response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error verifying recovery password:", error);
    throw error;
  }
};

export const resetPassword = async (email: string, formData: any) => {
  try {
    const response = await userInstance.patch(`/user/resetPassword/${email}`, {
      formData,
    });

    console.log("response is ",response.data);
    
    return response.data;
  } catch (error) {
    console.error("Error resetting password:", error);
    throw error;
  }
};


export const changePassword = async (data:any ,userId:string)=>{
  console.log("new password....",data,userId);

  try{
    const response = await userInstance.patch(`/user/changePassword/${userId}`,{
      data
    });

    console.log("resop......",response);
    return response != null;
    
  }catch(error){
    console.error("Error in change password :", error);
    throw error;
  }
}

export const refreshToken = async () => {
  try {
    const response = await userInstance.post("/user/refreshToken");

    console.log("user api response is ",response);

    return response.data;
  } catch (error) {
    console.error("Error refreshing token:", error);
    throw error;
  }
};

export const updateProfile = async (userData: any,userId:string) => {
  try {

    console.log("User data for update:", userData);
    
    const response = await userInstance.patch(`/user/updateProfile/${userId}`, userData, {
    
    });
    return response.data;
  }
  catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
};

export const updateProfileImage = async(formData:any, userId:string) =>{

  // for (const [key, value] of formData.entries()) {
  //   console.log(`api side...${key}:`, value,userId);
  // }

  const response = await userInstance.patch(`user/updateDp/${userId}`,formData,{
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
  console.log("response from api is ", response)
  return response.data;
}

export const logoutUser = async () => {
  try {
    await userInstance.post("/user/logout");
    // return response.data;
  } catch (error) {
    console.error("Error logging out user:", error);
    throw error;
  }
};


export const fetchingDoctors = async ({ searchTerm, location, category, sortBy, page, limit }: any) => {
  try {
    const response = await userInstance.get("/user/doctors", {
      params: {
        search: searchTerm,
        location,
        category,
        sort: sortBy,
        page,
        limit,
      },
    });
    return response.data;
  } catch (error) {
    console.log("Error in fetching doctors:", error);
    throw error;
  }
};


export const getUserConversations = async (userId: string,from:string) => {
  try {
    const response = await userInstance.get(`/user/conversation/${userId}`,{params:{from}});
    return response.data;
  } catch (error) {
    console.error("Error fetching conversations:", error);
    throw error;
  }
};


export const getUserMessages = async (conversationId: string) => {
  try {
    const response = await userInstance.get(`/user/message/${conversationId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching messages:", error);
    throw error;
  }
};



export const getSessions = async (doctorId:string)=>{
  try{
    console.log("doctor id",doctorId);

    const response = await userInstance.get("/user/sessions", { params: { doctorId } });
    return response.data;

  }catch(error){
    console.log("Error in get sessions",error);
    throw error;
  }
};


export const createOneTimePayment = async (amount: number, metadata: any) => {
  try {

    console.log("metadata in api is :",metadata);
    
    const response = await userInstance.post("/user/stripe/create-one-time-payment", {
      amount,
      metadata,
    });
    return response.data;
  } catch (error) {
    console.error("Error in creating one-time payment session:", error);
    throw error;
  }
};

export const getUserAppointments = async(userId:string,page:number,limit:number) => {
  try{

    const response = await userInstance.get("/user/getAppointments",{
      params: { userId,page,limit}
    });

    console.log("response data is ....",response.data)
    return response.data;

  }catch(error){
    console.error("Error in get user's appointments..:", error);
    throw error;
  }
}

export const cancelAppointment = async (appointmentId:string) => {
  try{

    console.log("appointment id is ",appointmentId);
    const response = await userInstance.patch("/user/cancelAppointments", null, {
      params: { appointmentId }
    });

    console.log("response data is ....",response.data)
    return response.data;

  }catch(error){
    console.error("Error in cancel appointments..:", error);
    throw error;
  }
}