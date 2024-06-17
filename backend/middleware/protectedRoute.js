import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

export const protectRoute = async (req , res , next)=>{
   try{

    const token = req.cookies.jwt ; //with the help of cookie parser
    if(!token){
        res.status(401).json({ error: "Unauthorized : No token provided" });
    }

    const decode = jwt.verify(token , process.env.SECRET_KEY) ; 

    if(!decode){
        res.status(401).json({ error: "Unauthorized : No token provided" });
    }

    const user = await User.findById(decode.userId).select("-password") ; 
    if(!user){
        res.status(401).json({ error: "Invalid user" });
    }
    req.user = user ; 
    next() ; 

   }catch(error){
    res.status(500).json({ error: "Internal server error" });
    console.log(`Error :- ${error}`);
   }
}