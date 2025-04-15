import mongoose, { Mongoose } from 'mongoose';
// import 'colors';

export let dbInstance: Mongoose; // Mongoose type

const connectDB = async (): Promise<void> => {
    console.log("starting ");
    
    try {
        if (process.env.MONGODB_URL) {
            dbInstance = await mongoose.connect(process.env.MONGODB_URL);
            console.log(`Database connected successfully!`);
        } else {
            throw new Error("MONGODB_URL not defined");
        }
    } catch (error) {
        console.error("DB connection failed: ",error);
        process.exit(1); 
    }
};

export default connectDB;