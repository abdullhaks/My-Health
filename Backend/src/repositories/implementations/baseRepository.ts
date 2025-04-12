import { Model,Document,FilterQuery,UpdateQuery } from "mongoose";
import { injectable } from "inversify";
import IBaseRepository from "../interfaces/IBaseRepository";


@injectable()
export default class BaseRepository<T extends Document> implements IBaseRepository<T> {
  constructor(private _model: Model<T>) {}

  async findOne(filter: FilterQuery<T>): Promise<T | null> {
    try {
      return await this._model.findOne(filter).exec();
    } catch (error) {
      console.error("Error finding document:", error);
      return null;
    }
  }

  async findAll(filter: FilterQuery<T> = {}): Promise<T[]> {
    try {
      return await this._model.find(filter).exec();
    } catch (error) {
      console.error("Error finding documents:", error);
      return [];
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
  async delete(id: string): Promise<T | null> {
    try {
      return await this._model.findByIdAndDelete(id).exec();
    } catch (error) {
      console.log("Error deleting document:", error);
      return null;
    }
  };
};
