import User from "../models/user.model.js";
import bcryptjs from "bcryptjs"
import { generateTokenAndSetCookie } from "../lib/utils/generateToken.js";

export const signUp = async (req , res)=>{

    try{
        const {username , fullName , password , email} = req.body ; 

        const existingUser = await User.findOne({username}) ; 
        if(existingUser){
            return res.status(400).json({message : "User already exists"}) ; 
        }

        const existingEmail = await User.findOne({email}) ; 
        if(existingEmail){
            return res.status(400).json({message : "User already exists"}) ; 
        }

        const salt = await bcryptjs.genSalt(10) ;
        const hashedPassword = await bcryptjs.hash(password , salt) ; 
        
        const newUser = new User({
            username , 
            fullName , 
            email , 
            password : hashedPassword , 
        })

        
		if (newUser) {
			generateTokenAndSetCookie(newUser._id, res);
			await newUser.save();

			res.status(201).json({
				_id: newUser._id,
				fullName: newUser.fullName,
				username: newUser.username,
				email: newUser.email,
				followers: newUser.followers,
				following: newUser.following,
				profileImg: newUser.profileImg,
				coverImg: newUser.coverImg,
			});
		} else {
			res.status(400).json({ error: "Invalid user data" });
		}

    }catch(error){
        res.status(500).json({ error: "Internal server error" });
        console.log(`Error :- ${error}`);
    }
}


export const login = async (req , res)=>{
    try{

        const {username , password} = req.body ; 
        
        const user = await User.findOne({username}) ; 
        const isValidPassword = await bcryptjs.compare(password , user?.password || "") ; 
        
        if(!user || !isValidPassword){
            return res.status(400).json({message : "Invalid username or password"})
        }

        generateTokenAndSetCookie(user._id , res) ; 
        
        res.status(200).json({
			_id: user._id,
			fullName: user.fullName,
			username: user.username,
			email: user.email,
			followers: user.followers,
			following: user.following,
			profileImg: user.profileImg,
			coverImg: user.coverImg,
		});


    }catch(error){
        res.status(500).json({ error: "Internal server error" });
        console.log(`Error :- ${error}`);
    }
}

export const logout = async (req,res)=>{
    try{
        res.cookie("jwt-token" , "" , {
           maxAge : 0
        }) ; 
        return res.status(200).json({message : "Logged Out Successfully"})
            
    }catch(error){
        res.status(500).json({ error: "Internal server error" });
        console.log(`Error :- ${error}`);
    }
}

export const getMe = async (req , res)=>{
    try{

        const user = await User.findById(req.user._id).select("-password") ; 
        return res.status(200).json(user) ; 

    }catch(error){
        res.status(500).json({ error: "Internal server error" });
        console.log(`Error :- ${error}`);
    }
}