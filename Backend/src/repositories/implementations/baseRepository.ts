import { Model,Document,FilterQuery,UpdateQuery } from "mongoose";
import { injectable } from "inversify";
import IBaseRepository from "../interfaces/IBaseRepository";


@injectable()
export default class BaseRepository<T extends Document> implements IBaseRepository<T> {
  constructor(private _model: Model<T>) {}

  async findOne(filter: FilterQuery<T>, options: { sort?: Record<string, 1 | -1> } = {}): Promise<T | null> {
        try {
            let query = this._model.findOne(filter);
            if (options.sort) {
                query = query.sort(options.sort);
            }
            
            return await query.exec();
        } catch (error) {
            console.error("Error finding document:", error);
            return null;
        }
    }

  async findAll(filter: FilterQuery<T> = {},options: { sort?: Record<string, 1 | -1> ; limit?:number; skip?:number } = {}): Promise<T[] | []> {
    try {
      let query = this._model.find(filter);
      if (options.sort) {
                query = query.sort(options.sort);
          };

      if (options.limit) {
                query = query.limit(options.limit);
          };

      if (options.skip) {
            query = query.skip(options.skip); 
      }

      return await query.exec() ;
    } catch (error) {
      console.error("Error finding documents:", error);
      return [];
    }
  }

  async deleteAll(filter: FilterQuery<T> = {}): Promise<import("mongodb").DeleteResult> {
    try {
      return await this._model.deleteMany(filter).exec();
    } catch (error) {
      console.error("Error deleting documents:", error);
      return { acknowledged: false, deletedCount: 0 };
    }
  }

  async create(data: Partial<T>): Promise<T> {
    console.log("data sis ==>",data);
    
    try {
      console.log("model is ==>",this._model);
      
      const createdDocument = new this._model(data);
      console.log("careate document",createdDocument);
      
      return await createdDocument.save();
    } catch (error) {
      console.log("Error creating document:", error);
      throw error;
    }
  }


  async update(id: string, data: UpdateQuery<T>): Promise<T | null> {
    try {
      return await this._model.findByIdAndUpdate(id, data, { new: true }).exec();
    } catch (error) {
      console.log("Error updating document:", error);
      return null;
    }
  }
  

  async updateMany(filter: FilterQuery<T>, data: UpdateQuery<T>): Promise<import("mongodb").UpdateResult> {
    try {
      return await this._model.updateMany(filter, data).exec();
    } catch (error) {   
      console.log("Error updating documents:", error);
      return { acknowledged: false, modifiedCount: 0, matchedCount: 0, upsertedCount: 0, upsertedId: null };
    }
    }


  async delete(id: string): Promise<T | null> {
    try {
      return await this._model.findByIdAndDelete(id).exec();
    } catch (error) {
      console.log("Error deleting document:", error);
      return null;
    }
  };


  async countDocuments(filter: FilterQuery<T>): Promise<number> {
    try {
      return await this._model.countDocuments(filter).exec();
    } catch (error) {
      console.error("Error counting documents:", error);
      return 0;
    }
  }



  
};
