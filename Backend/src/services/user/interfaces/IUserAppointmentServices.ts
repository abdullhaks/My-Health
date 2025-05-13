


export default interface IUserAppointmentService {
    fetchingDoctors(
  search: string,
  location: string,
  category: string,
  sort: string,
  page: number,
  limit: number
): Promise<any> 
}