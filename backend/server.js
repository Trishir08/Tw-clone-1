import express, { urlencoded } from "express"
import authRoutes from "./routes/auth.router.js"
import dotenv from "dotenv"
import { dataBaseConnect } from "./config/dataBase.js";
import cookieParser from "cookie-parser";

dotenv.config() ; 

const app = express() ; 
const PORT = process.env.PORT || 8000 ; 

app.use(express.json()) ; 
app.use(urlencoded({extended : true})) ; 
app.use(cookieParser()) ; 
app.use('/api/auth' , authRoutes) ; 


app.listen(PORT, ()=>{
    console.log(`the server is running on port ${PORT}`);
    dataBaseConnect();
})