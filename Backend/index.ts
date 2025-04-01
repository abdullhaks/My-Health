import express from 'express';
import cookieParser from "cookie-parser";
import dotenv from 'dotenv';
import userRoutes from './src/routes/user/userRoutes';
import logger from './src/utils/logger';
import connectDB from './src/config/connectDB';


dotenv.config();



const app = express();
const port = process.env.PORT || 3000;



app.get("/",(req,res)=>{
    res.send("my health is running....");
});

connectDB();

app.use(express.json());
app.use(cookieParser());
app.use(logger);

app.use("/api/user",userRoutes)



app.listen(port,()=>{
    console.log(`MyHealth is running on port 3000 http://localhost:${port}`);
});



