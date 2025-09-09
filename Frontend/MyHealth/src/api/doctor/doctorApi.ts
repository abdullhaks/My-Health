import { message } from "antd";
import { ROUTES } from "../../constants/routes";
import { doctorInstance } from "../../services/axiosFactory";
import { metadataDto } from "../../interfaces/subscription";
import { doctorhCangePasswordDto,doctorProfileUpdate, UpdateProfileResponse } from "../../interfaces/doctor";
import { blogCreate } from "../../interfaces/blog";
import { advertisement } from "../../interfaces/advertisement";
import { prescriptionData } from "../../interfaces/prescription";
import { payoutDetails } from "../../interfaces/payout";
import { sessionData } from "../../interfaces/session";
import { payoutFilter } from "../../interfaces/payout";

export const signupDoctor = async (doctorData: FormData) => {
  try {
    for (const [key, value] of doctorData.entries()) {
      console.log(`api side...${key}:`, value);
    }

    const response = await doctorInstance.post(
      ROUTES.doctor.signup,
      doctorData
    );
    message.success("Signup successful!");
    return response.data;
  } catch (error) {
    console.error("Error signing up doctor:", error);
    throw error;
  }
};

export const getMe = async () => {
  try {
    console.log("get me calling......");
    const response = await doctorInstance.get(ROUTES.doctor.me);
    console.log("me me me...", response.data);

    return response.data;
  } catch (error) {
    console.error("Error signing up user:", error);
    throw error;
  }
};

export const loginDoctor = async (doctorData: {email:string,password:string}) => {
  try {
    const response = await doctorInstance.post(ROUTES.doctor.login, doctorData);
    console.log("Login response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error logging in user:", error);
    throw error;
  }
};

export const verifyDoctorOtp = async (otpData: { email:string, otp: string }) => {
  try {
    console.log("OTP data:", otpData);
    const response = await doctorInstance.post(
      ROUTES.doctor.verifyOtp,
      otpData
    );
    return response.data;
  } catch (error) {
    console.error("Error verifying OTP:", error);
    throw error;
  }
};

export const resendDoctorOtp = async (email: string) => {
  try {
    const response = await doctorInstance.get(ROUTES.doctor.resentOtp, {
      params: { email },
    });
    return response.data;
  } catch (error) {
    console.error("Error resending OTP:", error);
    throw error || "Something went wrong";
  }
};

export const refreshToken = async () => {
  try {
    const response = await doctorInstance.post(ROUTES.doctor.refreshToken);

    console.log("user api response is ", response);

    return response.data;
  } catch (error) {
    console.error("Error refreshing token:", error);
    throw error;
  }
};

export const logoutDoctor = async () => {
  try {
    await doctorInstance.post(ROUTES.doctor.logout);
    // return response.data;
  } catch (error) {
    console.error("Error logging out user:", error);
    throw error;
  }
};

export const handlePayment = async (priceId: string, metadata: metadataDto) => {
  try {
    const response = await doctorInstance.post(
      ROUTES.doctor.stripe.createCheckoutSession,
      { priceId, metadata }
    );

    return response.data;
  } catch (error) {
    console.log("Error in handle stripe payment :", error);
    throw error;
  }
};

export const verifySubscription = async (sessionId: string,doctorId:string) => {
  try {
    const response = await doctorInstance.post(
      ROUTES.doctor.verifySubscription,
      { sessionId,doctorId }
    );

    return response.data;
  } catch (error) {
    console.log("Error in verify subscription.. :", error);
    throw error;
  }
};

export const changePassword = async (data: doctorhCangePasswordDto, userId: string) => {
  console.log("new password....", data, userId);

  try {
    const response = await doctorInstance.patch(
      ROUTES.doctor.changePassword(userId),
      {
        data,
      }
    );

    console.log("resop......", response);
    return response != null;
  } catch (error) {
    console.error("Error in change password :", error);
    throw error;
  }
};

export const updateDoctorProfile = async (userData: doctorProfileUpdate, userId: string): Promise<UpdateProfileResponse> => {
  try {
    const response = await doctorInstance.patch<UpdateProfileResponse>(
      ROUTES.doctor.updateProfile(userId),
      userData,
      {}
    );
    return response.data;
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
};

export const updateProfileImage = async (formData: FormData, userId: string) => {
  try {
    console.log("doctor dp changin api is working......");
    const response = await doctorInstance.patch(
      ROUTES.doctor.updateDp(userId),
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    console.log("response from api is ", response);
    return response.data;
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
};

export const getDoctorConversations = async (
  doctorId: string,
  from: string
) => {
  try {
    const response = await doctorInstance.get(
      ROUTES.doctor.conversation(doctorId),
      { params: { from } }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching conversations:", error);
    throw error;
  }
};

export const getDoctorMessages = async (conversationId: string) => {
  try {
    const response = await doctorInstance.get(
      ROUTES.doctor.getMessage(conversationId)
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching messages:", error);
    throw error;
  }
};

export const sendDoctorMessage = async (messageData: {
  conversationId: string;
  senderId: string;
  content: string;
}) => {
  try {
    console.log("Message data:", messageData);
    const response = await doctorInstance.post(
      ROUTES.doctor.message,
      messageData
    );
    return response.data;
  } catch (error) {
    console.error("Error sending message:", error);
    console.log("Error response:", error);
    throw error;
  }
};

export const getSessions = async (doctorId: string) => {
  try {
    console.log("doctor id", doctorId);

    const response = await doctorInstance.get(ROUTES.doctor.sessions, {
      params: { doctorId },
    });
    return response.data;
  } catch (error) {
    console.log("Error in get sessions", error);
    throw error;
  }
};

export const getDoctorAppointments = async (doctorId: string,page:number,limit:number,filter:{ appointmentStatus?: string; startDate?: string; endDate?: string }) => {
  try {
    const response = await doctorInstance.get(ROUTES.doctor.getAppointments, {
      params: { 
        doctorId: doctorId,
        page,
        limit,
        filter
      },
    });

    console.log("response data is ....", response.data);
    return response.data;
  } catch (error) {
    console.error("Error in get doctor's appointments..:", error);
    throw error;
  }
};

export const getAnalysisReports = async (doctorId: string) => {
  try {
    console.log("doctorId id", doctorId);

    const response = await doctorInstance.get(ROUTES.doctor.getAnalysisReport, {
      params: { doctorId },
    });
    return response.data;
  } catch (error) {
    console.log("Error in get sessions", error);
    throw error;
  }
};

export const submitAnalysisReports = async (
  analysisId: string,
  result: string
) => {
  try {
    console.log("analysisId id", analysisId);

    const response = await doctorInstance.post(
      ROUTES.doctor.submitAnalysisReport,
      { analysisId, result }
    );
    return response.data;
  } catch (error) {
    console.log("Error in get sessions", error);
    throw error;
  }
};

export const directFileUpload = async (formData: FormData) => {
  try {
    for (const [key, value] of formData.entries()) {
      console.log(`api side...${key}:`, value);
    }

    const response = await doctorInstance.post(
      ROUTES.doctor.directFileUpload,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error in directFileUpload:", error);
    throw error;
  }
};

export const cancelAnalysisReports = async (
  analysisId: string,
  userId: string,
  fee: number
) => {
  try {
    console.log("analysisId id", analysisId);

    const response = await doctorInstance.post(
      ROUTES.doctor.cancelAnalysisReports,
      { analysisId, userId, fee }
    );
    return response.data;
  } catch (error) {
    console.log("Error in get sessions", error);
    throw error;
  }
};

export const getSubscriptions = async () => {
  try {
    const response = await doctorInstance.get(ROUTES.doctor.getSubscriptions);
    console.log("response data is ....", response.data);
    return response.data;
  } catch (error) {
    console.error("Error in get subscriptions..:", error);
    throw error;
  }
};

export const getBlogs = async (
  authorId: string,
  page: number,
  limit: number
) => {
  try {
    const response = await doctorInstance.get(ROUTES.doctor.getBlogs, {
      params: {
        authorId,
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

export const createBlog = async (blogData: blogCreate) => {
  try {
    const response = await doctorInstance.post(ROUTES.doctor.blog, blogData);

    return response.data;
  } catch (err) {
    console.log("error in get total analytics");
    throw err;
  }
};

export const updateBlog = async (blogId: string, blogData: blogCreate) => {
  try {
    console.log("blogdate from frndend...", blogData);

    const response = await doctorInstance.put(ROUTES.doctor.blog, {
      blogId,
      blogData,
    });
    return response.data;
  } catch (err) {
    console.log("error in get total analytics");
    throw err;
  }
};

export const deleteBlog = async (blogId: string) => {
  try {
    console.log("deleteBlog from frndend...", blogId);

    // const response = await doctorInstance.post(ROUTES.doctor.createBlog,blogData);
    // return response.data;
  } catch (err) {
    console.log("error in get total analytics");
    throw err;
  }
};

export const createAdvertisement = async (AddData: advertisement) => {
  try {
    console.log("deleteBlog from frndend...", AddData);

    const response = await doctorInstance.post(
      ROUTES.doctor.advertisement,
      AddData
    );
    return response.data;
  } catch (err) {
    console.log("error in get total analytics");
    throw err;
  }
};

export const getAdds = async (doctorId: string, page: number, limit: number) => {
  try {
    console.log("deleteBlog from frndend...", doctorId);

    const response = await doctorInstance.get(ROUTES.doctor.getAdvertisements, {
      params: { doctorId, page, limit },
    });
    return response.data;
  } catch (err) {
    console.log("error in get total analytics");
    throw err;
  }
};

export const getNotifications = async (id: string) => {
  try {
    const response = await doctorInstance.get(ROUTES.doctor.notifications, {
      params: { id },
    });
    return response.data;
  } catch (error) {
    console.log("Error in get notifications");
    throw error;
  }
};

export const getPrescriptions = async (userId: string) => {
  try {
    const response = await doctorInstance.get(ROUTES.doctor.prescriptions, {
      params: { userId },
    });
    return response.data;
  } catch (error) {
    console.log("Error in get prescriptions");
    throw error;
  }
};


export const submitPrescription = async (prescriptionData:prescriptionData) => {
  try{

    console.log("prescriptionData is............",prescriptionData);
    const response = await doctorInstance.post(ROUTES.doctor.prescription,{prescriptionData});
    return response.data;

  }catch(error){
    console.log("Error in submiting prescription");
    throw error;
  }
};

export const getUser = async (userId:string) => {
  try{

   
    const response = await doctorInstance.get(ROUTES.doctor.getUser,{
      params:{userId:userId} });

      return response.data;

  }catch(error){
    console.log("Error in get user detials");
    throw error;
  }
  
}


export const getDashboardContent = async (doctorId: string) => {
  try {
    console.log(" doctor id ... is ...",doctorId);
    
    const response = await doctorInstance.get(ROUTES.doctor.dashboard,{
      params:{doctorId:doctorId}
    });
    console.log('Dashboard API response:', response.data);
    return response.data.data;
  } catch (err) {
    console.log('Error fetching dashboard content:', err);
    throw new Error('Failed to fetch dashboard content');
  }
};


export const payoutRequest = async (payoutDetails:payoutDetails,doctorId:string) =>{
  try{
    console.log("payoutDetails is",payoutDetails);
    console.log("doctorId is",doctorId);

    const response = await doctorInstance.post(ROUTES.doctor.requestPayout,{
      doctorId,
      payoutDetails
    });
    return response.data;
  }catch(err){
    console.log("Error in requesting payout");
    throw new Error ("requesting payment failed");
  }
};


export const getBookedSlots = async (doctorId:string, selectedDate:string)=>{
  try{
    console.log("data is",doctorId, selectedDate);
    const response = await doctorInstance.get(ROUTES.doctor.bookedSlots, { params: { doctorId, selectedDate } });
    return response.data;
  }catch(error){
    console.log("Error in get doctor booked slots",error);
    throw error;
  }
};


export const addSession = async (sessionToAdd:sessionData )=>{
  try{
    console.log("data id",sessionToAdd);
    const response = await doctorInstance.post(ROUTES.doctor.session, {
      sessionToAdd
    });
    return response.data;
  }catch(error){
    console.log("Error in adding new session",error);
    throw error;
  }
};

export const updateSession = async ( sessionId:string, editingSession:sessionData)=>{
  try{
    console.log("data id",sessionId, editingSession);
    const response = await doctorInstance.patch(ROUTES.doctor.session, {
      sessionId,
      editingSession
    });
    return response.data;
  }catch(error){
    console.log("Error in get doctor booked slots",error);
    throw error;
  }
};

export const deleteSession = async ( id:string)=>{
  try{
    console.log("data id",id);
    const response = await doctorInstance.delete(ROUTES.doctor.session,{
      params:{sessionId:id}
    });
    console.log('Dashboard API response:', response.data);
    return response.data;

  }catch(error){
    console.log("Error in get doctor booked slots",error);
    throw error;
  }
};



export const getUnavailableSlots = async ( doctorId:string, localDate:string )=>{
  try{
    console.log("data id",doctorId,localDate);
  }catch(error){
    console.log("Error in get doctor booked slots",error);
    throw error;
  }
};

  export const makeSessionUnavailable = async (doctorId:string, date:Date, sessionId:string )=>{
  try{
    console.log("data id",doctorId, date, sessionId);
    const response = await doctorInstance.post(ROUTES.doctor.unAvailableSessions,{
      doctorId,
      date,
      sessionId
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
     const response = await doctorInstance.get(ROUTES.doctor.unAvailableSessions,{
      params:{doctorId}
    });
    return response.data;
  }catch(error){
    console.log("Error in get unavailable sessions",error);
    throw error;
  }
};


export const makeSessionAvailable = async ( doctorId:string, date:Date, sessionId:string)=>{
  try{
        console.log("data id",doctorId, date, sessionId);
    const response = await doctorInstance.delete(ROUTES.doctor.unAvailableSessions,{
      params:{doctorId,
      date,
      sessionId}
    });
    return response.data;
  }catch(error){
    console.log("Error in make session available",error);
    throw error;
  }
};

export const makeDayUnavailable = async (doctorId:string, date:Date)=>{
  try{
    console.log("makeDayUnavailable data is......",doctorId, date, );
    const response = await doctorInstance.post(ROUTES.doctor.unAvailableDays,{
      doctorId,
      date
    });
    return response.data;
  }catch(error){
    console.log("Error in get doctor booked slots",error);
    throw error;
  }
};


export const getUnavailableDays = async ( doctorId:string)=>{
  try{
    console.log("data id",doctorId);
     const response = await doctorInstance.get(ROUTES.doctor.unAvailableDays,{
      params:{doctorId}
    });
    return response.data;
  }catch(error){
    console.log("Error in get unavailable days",error);
    throw error;
  }
};

export const makeDayAvailable = async ( doctorId:string, date:Date, )=>{
  try{
    console.log("data id",doctorId, date);
    const response = await doctorInstance.delete(ROUTES.doctor.unAvailableDays,{
      params:{doctorId,
      date}
    });
    return response.data;
  }catch(error){
    console.log("Error in gmake day available",error);
    throw error;
  }
};


export const cancelAppointment = async (appointmentId:string) => {
  try{

    console.log("appointment id is ",appointmentId);
    const response = await doctorInstance.patch(ROUTES.doctor.cancelAppointment, null, {
      params: { appointmentId }
    });

    console.log("response data is ....",response.data)
    return response.data;

  }catch(error){
    console.error("Error in cancel appointments..:", error);
    throw error;
  }
};




export const getPayouts = async (doctorId:string,page:number, limit:number,filters:payoutFilter)=>{
    try{

        const response = await doctorInstance.get(ROUTES.doctor.getPayouts,{
      params: {
        doctorId,
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


export const getRevenues = async (doctorId:string,page:number, limit:number,filters:payoutFilter)=>{
    try{
        const response = await doctorInstance.get(ROUTES.doctor.getRevenues,{
      params: {
        doctorId,
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


export const getDoctorAppointmentsStats = async (doctorId: string, filter: "day" | "month" | "year") => {
  console.log("doctorId and filter in stats api is", doctorId,filter);
  try{

    const response = await doctorInstance.get(ROUTES.doctor.appointmentStats,{
      params:{doctorId, filter}
    });
    console.log("appointment stats response is ", response.data);
    return response.data;

  }catch(err){
    console.log("error in get doctor appointment stats");
    throw err
  }
  
};

export const getDoctorReportsStats = async (doctorId: string, filter: "day" | "month" | "year") => {
   console.log("doctorId and filter in stats api is", doctorId,filter);
  try{

    const response = await doctorInstance.get(ROUTES.doctor.reportsStats,{
      params:{doctorId, filter}
    });
    console.log("appointment stats response is ", response.data);
    return response.data;

  }catch(err){
    console.log("error in get doctor appointment stats");
    throw err
  }

};

export const getDoctorPayouts = async (doctorId: string) => {

  console.log("doctorId in payouts api is", doctorId);
  try{
    const response = await doctorInstance.get(ROUTES.doctor.payoutsStats,{
      params:{doctorId}
    });
    console.log("payouts response is ", response.data);
    return response.data;

  }catch(err){
    console.log("error in get doctor payouts");
    throw err
  }

 
};





// export const setSessions = async (sessionData) => {
//   try {
//     console.log("session data is ", sessionData);

//     const response = await doctorInstance.post(ROUTES.doctor.sessions, {
//       sessionData,
//     });
//     return response.data;
//   } catch (error) {
//     console.error("Error in set sessions", error);
//     throw error;
//   }
// };

// export const getDoctorTransactions = async (doctorId: string) => {
//   return [
//     { date: new Date().toISOString(), amount: 1500, paymentFor: "appointment", method: "stripe" },
//     { date: new Date().toISOString(), amount: 2000, paymentFor: "analysis", method: "wallet" },
//   ];
// };


// Note: Add these new API functions to ../../api/doctor/doctorApi.ts
// export const addSession = async (session: Session) => {
//   const response = await axios.post('/api/doctor/sessions', session);
//   return response.data;
// };
// export const updateSession = async (id: string, session: Partial<Session>) => {
  // const response = await axios.put(`/api/doctor/sessions/${id}`, session);
  // return response.data;
// };
// export const deleteSession = async (id: string) => {
//   const response = await axios.delete(`/api/doctor/sessions/${id}`);
//   return response.data;
// };
// export const getUnavailableSlots = async (doctorId: string, date: string) => {
//   const response = await axios.get(`/api/doctor/unavailableSlots?doctorId=${doctorId}&date=${date}`);
//   return response.data; // Assume returns string[] of slotIds
// };
// export const makeSlotsUnavailable = async (doctorId: string, date: string, slotIds: string[]) => {
//   const response = await axios.post('/api/doctor/makeUnavailable', { doctorId, date, slotIds });
//   return response.data;
// };
// export const makeSlotsAvailable = async (doctorId: string, date: string, slotIds: string[]) => {
//   const response = await axios.post('/api/doctor/makeAvailable', { doctorId, date, slotIds });
//   return response.data;
// };
// export const cancelAppointment = async (appointmentId: string) => {
//   const response = await axios.post(`/api/doctor/cancelAppointment/${appointmentId}`);
//   return response.data;
// };
