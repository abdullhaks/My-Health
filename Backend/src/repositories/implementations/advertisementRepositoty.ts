import BaseRepository from "./baseRepository";
import IAdvertisementRepository from "../interfaces/IAdvertisementRepository";
import { IAdvertisementDocument } from "../../entities/advertisementEntitites";
import { inject,injectable } from "inversify";

interface IGetAddsResponse {
    adds: IAdvertisementDocument[];
    totalPages: number;
}

@injectable()
export default class AdvertisementRepository extends BaseRepository<IAdvertisementDocument> implements IAdvertisementRepository{

    constructor(
        @inject("advertisementModel") private _advertisementModel:any
    ){
        super(_advertisementModel)
    };

    async getAdds(doctorId:string,pageNumber: number,limitNumber: number): Promise<IGetAddsResponse> {
        try {
            const query: any = {authorId:doctorId};

            const skip = (pageNumber - 1) * limitNumber;

            const adds = await this._advertisementModel
                .find(query)
                .skip(skip)
                .limit(limitNumber);

                const total = await this._advertisementModel.countDocuments(query);
            return {
                adds,
                totalPages: Math.ceil(total / limitNumber),
            };
        } catch (error) {
            console.log(error);
            throw new Error("Failed to fetch users");
        }
    };


    async getAdvertisementsByTimePeriodAndTags(startDate: Date,tags:string[],latitude:number,longitude:number): Promise<IAdvertisementDocument[]> {
    try {

      console.log("tags from get adds by tags ....",tags);

      let advertisements = []

      let locationBased = await this.getAdsNearLocation(latitude,longitude,20);

      console.log("locaitoin based adds are....",locationBased);

      if(locationBased){
        advertisements = locationBased;
      }

      if(tags.length>0){
        // const escapedTags = tags.map(tag => tag.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
        let tagAdds = await this._advertisementModel
          .find({
            $or: [
                { tags: { $in: tags.map(t => new RegExp(`^${t}$`, "i")) } },
               
                { title: { $regex: tags.join("|"), $options: "i" } }
              ]
          })
          .limit(5)
          .sort({createdAt:1})
          .lean();

          advertisements = [...advertisements,...tagAdds]
          console.log("adds wiht tags......",advertisements);
          
      }else{
        let latestAdd = await this._advertisementModel
        .find({ createdAt: { $gte: startDate } })
        .limit(2) // Limit to 5 ads for carousel
        .lean();

        advertisements = [...advertisements,...latestAdd]

      }
       
      return advertisements;
    } catch (error) {
      console.error('Error fetching advertisements by time period:', error);
      throw new Error('Failed to fetch advertisements');
    }
  };



  async getAdsNearLocation(lat: number, lng: number, maxDistanceKm: number) {
  const maxDistanceMeters = maxDistanceKm * 1000; 

  return this._advertisementModel.find({
    location: {
      $near: {
        $geometry: { type: "Point", coordinates: [lng, lat] },
        $maxDistance: maxDistanceMeters
      }
    }
  })
  .limit(5)
  .lean();

  }

}