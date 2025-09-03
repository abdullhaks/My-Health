
import mongoose,{Schema} from "mongoose";
import { IBlogDocument } from "../entities/blogEntities"; 

const blogSchema : Schema<IBlogDocument> = new Schema ({

title: { type: String, required: true },
thumbnail: { type: String, required: true },
content: { type: String, required: true },
author: { type: String, required: true },
authorId: { type: String, required: true },
img1: { type: String, required: false },
img2: { type: String, required: false },
img3: { type: String, required: false },
tags: { type: [String], required: false },
createdAt: { type: Date, default: Date.now },
updatedAt: { type: Date, default: Date.now },

});

const blogModel = mongoose.model<IBlogDocument>("Blog",blogSchema);
export default blogModel;