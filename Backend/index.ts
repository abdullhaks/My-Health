import express from 'express';
import cookieParser from "cookie-parser";
import dotenv from 'dotenv';
import userRoutes from './src/routes/user/userRoutes';
import logger from './src/utils/logs/logger';
import connectDB from './src/config/connectDB';
import cors from 'cors';
import adminRoutes from './src/routes/admin/adminRoutes';
import doctorRoutes from './src/routes/doctor/doctorRoutes';


dotenv.config();


const app = express();
const port = process.env.PORT || 3000;


app.use(cors({
    origin: process.env.CLIENT_URL as string,
    credentials: true,
    methods: ['GET', 'POST','PATCH', 'PUT', 'DELETE', 'OPTIONS'],
}));



app.get("/",(req,res)=>{
    res.send("my health is running....");
});

connectDB();

app.use(express.json());
app.use(cookieParser());
app.use(logger);

app.use("/api/user",userRoutes);
app.use("/api/admin",adminRoutes);
app.use("/api/doctor",doctorRoutes);


app.listen(port,()=>{
    console.log(`MyHealth is running on port 3000 http://localhost:${port}`);
});



