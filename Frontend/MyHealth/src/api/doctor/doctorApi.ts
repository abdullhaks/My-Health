import { message } from "antd";
import { doctorInstance } from "../../services/doctorInstance";
import { ROUTES } from "../../constants/routes";



export const signupDoctor = async (doctorData: any) => {
  try {

    for (const [key, value] of doctorData.entries()) {
        console.log(`api side...${key}:`, value);
      }

    
    const response = await doctorInstance.post(ROUTES.doctor.signup, doctorData);
    message.success("Signup successful!");
    return response.data;
  } catch (error) {
    console.error("Error signing up doctor:", error);
    throw error;
  }
};

export const getMe = async ()=>{
  try{

    console.log("get me calling......")
    const response = await doctorInstance.get(ROUTES.doctor.me);
    console.log("me me me...",response.data);

    return response.data
  }catch(error){
    console.error("Error signing up user:", error);
    throw error;
  }
  

}

export const loginDoctor = async (doctorData: any) => {
  try {
    const response = await doctorInstance.post("/doctor/login", doctorData);
    console.log("Login response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error logging in user:", error);
    throw error;
  }
};


export const verifyDoctorOtp = async (otpData: any) => {
  try {
    console.log("OTP data:", otpData);
    const response = await doctorInstance.post("/doctor/verifyOtp", otpData);
    return response.data;
  } catch (error) {
    console.error("Error verifying OTP:", error);
    throw error;
  }
};

export const resendDoctorOtp = async (email: string) => {
  try {
    const response = await doctorInstance.get("/doctor/resentOtp", {
      params: { email },
    });
    return response.data;
  } catch (error: any) {
    console.error("Error resending OTP:", error);
    throw error.response?.data?.msg || "Something went wrong";
  }
};


export const refreshToken = async () => {
  try {
    const response = await doctorInstance.post("/doctor/refreshToken");

    console.log("user api response is ",response);

    return response.data;
  } catch (error) {
    console.error("Error refreshing token:", error);
    throw error;
  }
};

export const logoutDoctor = async () => {
  try {
    await doctorInstance.post("/doctor/logout");
    // return response.data;
  } catch (error) {
    console.error("Error logging out user:", error);
    throw error;
  }
};

export const handlePayment = async (priceId:any,metadata:any) =>{
  try{

    const response = await doctorInstance.post("/doctor/stripe/create-checkout-session",{priceId,metadata});

    return response.data;

  }catch(error) {

    console.log("Error in handle stripe payment :",error);
    throw error;
  }
}

export const verifySubscription = async (sessionId:string) =>{
try{

  const response = await doctorInstance.post("/doctor/verifySubscription",{sessionId});

  return response.data;

}catch(error){
  console.log("Error in verify subscription.. :",error);
    throw error;
}
}


export const changePassword = async (data:any ,userId:string)=>{
  console.log("new password....",data,userId);

  try{
    const response = await doctorInstance.patch(`/doctor/changePassword/${userId}`,{
      data
    });

    console.log("resop......",response);
    return response != null;
    
  }catch(error){
    console.error("Error in change password :", error);
    throw error;
  }
}


export const updateDoctorProfile = async (userData: any,userId:string) => {
  try {

    console.log("User data for update:", userData);
    
    const response = await doctorInstance.patch(`/doctor/updateProfile/${userId}`, userData, {
    
    });
    return response.data;
  }
  catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
};

export const updateProfileImage = async(formData:any, userId:string) =>{

  try{
  console.log("doctor dp changin api is working......")
    const response = await doctorInstance.patch(`/doctor/updateDp/${userId}`,formData,{
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });
    console.log("response from api is ", response)
    return response.data;

  }catch(error){
    console.error("Error updating profile:", error);
    throw error;
  }
  
};

export const getDoctorConversations = async (doctorId: string,from:string) => {
  try {
    const response = await doctorInstance.get(`/doctor/conversation/${doctorId}`, { params: { from } });
    return response.data;
  } catch (error) {
    console.error("Error fetching conversations:", error);
    throw error;
  }
};


export const getDoctorMessages = async (conversationId: string) => {
  try {
    const response = await doctorInstance.get(`/doctor/message/${conversationId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching messages:", error);
    throw error;
  }
};


export const sendDoctorMessage = async (messageData: { conversationId: string; senderId: string; content: string }) => {
  try {
    console.log("Message data:", messageData);
    const response = await doctorInstance.post("/doctor/message", messageData);
    return response.data;
  } catch (error: any) {
    console.error("Error sending message:", error);
    console.log("Error response:", error.response?.data);
    throw error;
  }
};

export const setSessions = async (sessionData:any)=>{
  try{
    console.log("session data is ",sessionData);

    const response = await doctorInstance.post("/doctor/sessions", {sessionData});
    return response.data;

  }catch(error){
    console.error("Error in set sessions", error);
    throw error;
  }
}

export const getSessions = async (doctorId:string)=>{
  try{
    console.log("doctor id",doctorId);

    const response = await doctorInstance.get("/doctor/sessions", { params: { doctorId } });
    return response.data;

  }catch(error){
    console.log("Error in get sessions",error);
    throw error;
  }
};


export const getDoctorAppointments = async(doctorId:string) => {
  try{

    const response = await doctorInstance.get("/doctor/getAppointments",{
      params: { doctorId: doctorId }
    });

    console.log("response data is ....",response.data)
    return response.data;

  }catch(error){
    console.error("Error in get doctor's appointments..:", error);
    throw error;
  }
};

export const getAnalysisReports = async (doctorId:string)=>{
  try{
    console.log("doctorId id",doctorId);

    const response = await doctorInstance.get("/doctor/getAnalysisReports", { params: { doctorId } });
    return response.data;

  }catch(error){
    console.log("Error in get sessions",error);
    throw error;
  }
};


export const submitAnalysisReports = async (analysisId:string,result:string)=>{
  try{
    console.log("analysisId id",analysisId);

    const response = await doctorInstance.post("/doctor/submitAnalysisReports", {analysisId, result});
    return response.data;

  }catch(error){
    console.log("Error in get sessions",error);
    throw error;
  }
};

export const directFileUpload = async (formData:any) => {
  try {

     for (const [key, value] of formData.entries()) {
    console.log(`api side...${key}:`, value);
  }

    const response = await doctorInstance.post("/doctor/directFileUpload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error in directFileUpload:", error);
    throw error;
  }
};


export const cancelAnalysisReports = async (analysisId:string,userId:string,fee:number)=>{
  try{
    console.log("analysisId id",analysisId);

    const response = await doctorInstance.post("/doctor/cancelAnalysisReports",{ analysisId,userId,fee });
    return response.data;

  }catch(error){
    console.log("Error in get sessions",error);
    throw error;
  }
};