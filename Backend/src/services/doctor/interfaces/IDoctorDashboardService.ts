

export default interface IDoctorDashboardService {

    getDashboardContent(doctorId:string):Promise<any>
    appointmentStats(doctorId:string,filter:string):Promise<any>
    reportsStats(doctorId:string,filter:string):Promise<any>
    payoutsStats(doctorId:string):Promise<any>
}