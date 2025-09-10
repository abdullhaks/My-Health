import { message } from "antd";
import { ROUTES } from "../../constants/routes";
import { userInstance } from "../../services/axiosFactory";
import { PasswordData, recoveryPasswordData, userLoginData, userProfileData, userResetPasswordData, userSignupData } from "../../interfaces/user";
import { createOneTimePaymentMetaData, walletPaymentData } from "../../interfaces/stripe";
import { transactionsFilter } from "../../interfaces/transaction";



export const signupUser = async (userData: userSignupData) => {
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
    const response = await userInstance.get(ROUTES.user.doctorDetails,{params:{doctorId}});
    console.log("doctor details response is ",response.data);
    return response.data
  }catch(error){
    console.error("Error signing up user:", error);
    throw error;
  }
  
}

export const loginUser = async (userData: userLoginData) => {
  try {
    const response = await userInstance.post(ROUTES.user.login, userData);
    console.log("Login response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error logging in user:", error);
    throw error;
  }
};

export const verifyOtp = async (otpData: { email:string, otp:string }) => {
  try {
    console.log("OTP data:", otpData);
    const response = await userInstance.post(ROUTES.user.verifyOtp, otpData);
    return response.data;
  } catch (error) {
    console.error("Error verifying OTP:", error);
    throw error;
  }
};

export const resentOtp = async (email: string) => {
  try {
    const response = await userInstance.get(ROUTES.user.resentOtp, {
      params: { email },
    });
    return response.data;
  } catch (error) {
    console.error("Error resending OTP:", error);
    throw error || "Something went wrong";
  }
};

export const forgetPassword = async (email: string) => {
  try {
    const response = await userInstance.get(ROUTES.user.forgotPassword, {
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
    const response = await userInstance.get(ROUTES.user.recoveryPassword, {
      params: { email },
    });
    return response.data;
  } catch (error) {
    console.error("Error recovering password:", error);
    throw error;
  }
};

export const verifyRecoveryPassword = async (userData: recoveryPasswordData) => {
  try {
    console.log("User data:", userData);
    const response = await userInstance.post(ROUTES.user.verifyRecoveryPassword, userData);
    console.log("Login response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error verifying recovery password:", error);
    throw error;
  }
};

export const resetPassword = async (email: string, formData: userResetPasswordData) => {
  try {
    const response = await userInstance.patch(ROUTES.user.resetPassword(email), {
      formData,
    });

    console.log("response is ",response.data);
    
    return response.data;
  } catch (error) {
    console.error("Error resetting password:", error);
    throw error;
  }
};


export const changePassword = async (data:PasswordData ,userId:string)=>{
  console.log("new password....",data,userId);

  try{
    const response = await userInstance.patch(ROUTES.user.changePassword(userId),{
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
    const response = await userInstance.post(ROUTES.user.refreshToken);

    console.log("user api response is ",response);

    return response.data;
  } catch (error) {
    console.error("Error refreshing token:", error);
    throw error;
  }
};

export const updateProfile = async (userData: userProfileData,userId:string) => {
  try {

    console.log("User data for update:", userData);
    
    const response = await userInstance.patch(ROUTES.user.updateProfile(userId), userData, {
    
    });
    return response.data;
  }
  catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
};

export const updateProfileImage = async(formData:FormData, userId:string) =>{

  // for (const [key, value] of formData.entries()) {
  //   console.log(`api side...${key}:`, value,userId);
  // }

  const response = await userInstance.patch(ROUTES.user.updateDp(userId),formData,{
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
  console.log("response from api is ", response)
  return response.data;
}

export const logoutUser = async () => {
  try {
    await userInstance.post(ROUTES.user.logout);
    // return response.data;
  } catch (error) {
    console.error("Error logging out user:", error);
    throw error;
  }
};


export const fetchingDoctors = async ({ searchTerm, location, category, sortBy, page, limit }:
  { searchTerm:string, location:string, category:string, sortBy:string, page:number, limit:number }) => {
  try {
    const response = await userInstance.get(ROUTES.user.doctors, {
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
    const response = await userInstance.get(ROUTES.user.conversation(userId),{params:{from}});
    return response.data;
  } catch (error) {
    console.error("Error fetching conversations:", error);
    throw error;
  }
};


export const getUserMessages = async (conversationId: string) => {
  try {
    const response = await userInstance.get(ROUTES.user.message(conversationId));
    return response.data;
  } catch (error) {
    console.error("Error fetching messages:", error);
    throw error;
  }
};



export const getSessions = async (doctorId:string)=>{
  try{
    console.log("doctor id",doctorId);

    const response = await userInstance.get(ROUTES.user.sessions, { params: { doctorId } });
    return response.data;

  }catch(error){
    console.log("Error in get sessions",error);
    throw error;
  }
};


export const createOneTimePayment = async (amount: number, metadata: createOneTimePaymentMetaData) => {
  try {

    console.log("metadata in api is :",metadata);
    
    const response = await userInstance.post(ROUTES.user.stripe.createOneTimePayment, {
      amount,
      metadata,
    });
    return response.data;
  } catch (error) {
    console.error("Error in creating one-time payment session:", error);
    throw error;
  }
};

export const getUserAppointments = async(userId:string,page:number,limit:number,filter:{ appointmentStatus?: string; startDate?: string; endDate?: string }) => {
  try{

    const response = await userInstance.get(ROUTES.user.getAppointments,{
      params: { userId,page,limit,filter}
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
    const response = await userInstance.patch(ROUTES.user.cancelAppointment, null, {
      params: { appointmentId }
    });

    console.log("response data is ....",response.data)
    return response.data;

  }catch(error){
    console.error("Error in cancel appointments..:", error);
    throw error;
  }
};


export const directFileUpload = async (formData:FormData) => {
  try {

     for (const [key, value] of formData.entries()) {
    console.log(`api side...${key}:`, value);
  }

    const response = await userInstance.post(ROUTES.user.directFileUpload, formData, {
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



export const getAnalysisReports = async (userId:string)=>{
  try{
    console.log("userId id",userId);

    const response = await userInstance.get(ROUTES.user.getAnalysisReport, { params: { userId } });
    return response.data;

  }catch(error){
    console.log("Error in get sessions",error);
    throw error;
  }
};


export const cancelAnalysisReports = async (analysisId:string,userId:string,fee:number)=>{
  try{
    console.log("analysisId id",analysisId);

    const response = await userInstance.post(ROUTES.user.cancelAnalysisReport,{ analysisId,userId,fee });
    return response.data;

  }catch(error){
    console.log("Error in get sessions",error);
    throw error;
  }
};


export const walletPayment = async (data:walletPaymentData)=>{
  try{
    console.log("data is,................",data);

    const response = await userInstance.post(ROUTES.user.walletPayment,data );
    return response.data;

  }catch(error){
    console.log("Error in get sessions",error);
    throw error;
  }
};


export const getBookedSlots = async (doctorId:string, selectedDate:string)=>{
  try{
    console.log("data id",doctorId, selectedDate);

    const response = await userInstance.get(ROUTES.user.bookedSlots, { params: { doctorId, selectedDate } });
    return response.data;

  }catch(error){
    console.log("Error in get sessions",error);
    throw error;
  }
};


export const getNotifications = async (id:string,limit:number,notificationSet:number)=>{
  try{

    const response = await userInstance.get(ROUTES.user.notifications,{params: {id,limit,notificationSet}});
    return response.data;

  }catch(error){
    console.log("Error in get notifications");
    throw error;
  }
};


export const getBlogs = async (search: string, page: number, limit: number) => {
  try {
    const response = await userInstance.get(ROUTES.user.getBlogs, {
      params: {
        search,
        page,
        limit,
      },
    });

    console.log("response from frontend....", response);

    return response.data.data;
  } catch (err) {
    console.log("error in get total analytics");
    throw err;
  }
};

export const getDashboardContent = async (days:number,userId: string,latitude:number | null,longitude:number | null) => {
  try {

    console.log("lati and longi ... are ...",latitude,longitude);
    const response = await userInstance.get(ROUTES.user.dashboard, {
      params: { userId,days,latitude,longitude},
    });
    console.log('Dashboard API response:', response.data);
    return response.data.data;
  } catch (err) {
    console.error('Error fetching dashboard content:', err);
    throw new Error('Failed to fetch dashboard content');
  }
};


export const getPrescription = async (appointmentId:string)=>{

  console.log("appointemkszjf id is ",appointmentId);
   try {
    const response = await userInstance.get(ROUTES.user.prescription, {
      params: { appointmentId },
    });
    console.log('getPrescription API response:', response.data);
    return response.data;
  } catch (err) {
    console.error('Error in fetching prescrition:', err);
    throw new Error('Failed to fetch prescrition');
  }
  
}


export const getUnavailableDays = async ( doctorId:string)=>{
  try{
    console.log("data id",doctorId);
     const response = await userInstance.get(ROUTES.user.unAvailableDays,{
      params:{doctorId}
    });
    return response.data;
  }catch(error){
    console.log("Error in get doctor booked slots",error);
    throw error;
  }
};

export const getUnavailableSessions = async ( doctorId:string)=>{
  try{
    console.log("data id",doctorId);
     const response = await userInstance.get(ROUTES.user.unAvailableSessions,{
      params:{doctorId}
    });
    return response.data;
  }catch(error){
    console.log("Error in get doctor booked slots",error);
    throw error;
  }
};


export const getLatestPrescription = async ( userId:string)=>{
  try{
    console.log("data id",userId);
     const response = await userInstance.get(ROUTES.user.latestPrescription,{
      params:{userId}
    });
    return response.data;
  }catch(error){
    console.log("Error in get doctor booked slots",error);
    throw error;
  }
};

export const getLatestDoctorPrescription = async ( userId:string,doctorId:string)=>{
  try{
    console.log("data id",userId);
     const response = await userInstance.get(ROUTES.user.latestDoctorPrescription,{
      params:{userId,doctorId}
    });
    return response.data;
  }catch(error){
    console.log("Error in get doctor booked slots",error);
    throw error;
  }
};


export const checkActiveBooking = async ( userId:string , doctorId:string)=>{
  try{
    console.log("data is",userId,doctorId);
     const response = await userInstance.get(ROUTES.user.activeBooking,{
      params:{userId,doctorId}
    });
    return response.data;
  }catch(error){
    console.log("Error in get doctor booked slots",error);
    throw error;
  }
};


export const getTransactions = async (userId:string ,page:number, limit:number,filters:transactionsFilter)=>{
    try{

      const response = await userInstance.get(ROUTES.user.getTransactions,{
      params: {
        userId,
        page,
        limit,
        ...filters,
      }});
        return response.data;

    }catch(err){
        console.log("error in get total analytics");
        throw err
        
    }
};