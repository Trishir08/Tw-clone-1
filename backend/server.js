import express from "express"
import authRoutes from "./routes/auth.router.js"
import dotenv from "dotenv"
import { dataBaseConnect } from "./config/dataBase.js";

dotenv.config() ; 

const app = express() ; 
const PORT = process.env.PORT || 8000 ; 


app.use('/api/auth' , authRoutes) ; 


app.listen(PORT, ()=>{
    console.log(`the server is running on port ${PORT}`);
    dataBaseConnect();
})