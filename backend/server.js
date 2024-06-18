import express, { urlencoded } from "express"
import userRoutes from './routes/user.routes.js'
import authRoutes from "./routes/auth.router.js"
import dotenv from "dotenv"
import { dataBaseConnect } from "./config/dataBase.js";
import cookieParser from "cookie-parser";
import { v2 as cloudinary } from "cloudinary";

dotenv.config() ; 

cloudinary.config({
    cloud_name : process.env.CLOUDINARY_CLOUD_NAME , 
    api_key : process.env.CLOUDINARY_API_KEY , 
    api_secret : process.env.CLOUDINARY_API_SECRET 
}) ; 

const app = express() ; 
const PORT = process.env.PORT || 8000 ; 

app.use(express.json()) ; 
app.use(urlencoded({extended : true})) ; 
app.use(cookieParser()) ; 


app.use('/api/auth' , authRoutes) ; 
app.use('/api/user' , userRoutes) ; 

app.listen(PORT, ()=>{
    console.log(`the server is running on port ${PORT}`);
    dataBaseConnect();
})