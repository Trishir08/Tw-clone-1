import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";
import bcryptjs from "bcryptjs"
import { v2 as cloudinary } from "cloudinary";

export const getUserProfile = async (req,res)=>{
    
    const {username} = req.params ; 

    try{

        const user = await User.findOne({username}).select("-password") ; 
        if(!user) return res.status(404).json({error : "User not found"}) ; 

        return res.status(201).json(user) ; 

    }catch(error){
        console.log('Error is getUserProfile' , error.message);
        return res.status(500).json({error : error.message}) ; 
    }
}


export const followUnfollowUser = async (req, res)=>{
    try{ 
        const {id} = req.params ; 
        const modifyUser = await User.findById(id) ; 
        const currentUser = await User.findById(req.user._id) ; 

        if(id === req.user._id.toString()){
            return res.status(400).json({message : "You cannot follow/unfollow yourself"}) ; 
        }

        if(!modifyUser || !currentUser){
            return res.status(404).json({error : "User not found"}) ; 
        }

        

        const isFollowing = currentUser.following.includes(id) ; 

        if(isFollowing){
            // already follows need to unfollow - pull
            await User.findByIdAndUpdate(id , {$pull : {followers : req.user._id}}) ; 
            await User.findByIdAndUpdate(req.user._id , {$pull : {following : id}}) ;

            res.status(201).json({message : "Unfollowed Successfully !!"})
        }else{
            // need to follow push and send the notifiaction 

            const newNotification = new Notification({
				type: "follow",
				from: req.user._id,
				to: modifyUser._id,
			});

            await User.findByIdAndUpdate(id , {$push : {followers : req.user._id}}) ; 
            await User.findByIdAndUpdate(req.user._id , {$push : {following : id}}) ; 
            res.status(201).json({message : "Followed Successfully !!"})
        }

    }catch(error){
        console.log('Error is getUserProfile' , error.message);
        return res.status(500).json({error : error.message}) ;
    }
}

export const suggestedUsers = async (req ,res) => {
    
    try{

        const userId = req.user._id ; 
        const followedByMe = await User.findById(userId).select("following") ; 

        const users = await User.aggregate([
            {
                $match : {
                _id : {$ne : userId} , 
                } , 
            } , 
            
            {
                $sample : 
                    { size : 10 }, 
             } ,
        ]) ; 

        const filterUsers = users.filter((user)=> !followedByMe.following.includes(user._id)) ; 
        const suggestedUsers = filterUsers.slice(0,4) ; 

        suggestedUsers.forEach((user)=>(user.password =null)) ; 
        res.status(200).json(suggestedUsers) ; 

    }catch(error){
        console.log('Error is suggestedUsers' , error.message);
        return res.status(500).json({error : error.message}) ;
    }
}


export const updateUser = async(req , res)=>{
    
    const {username , email , fullName , currentPassword , newPassword , link , bio} = req.body ; 
    let {coverImg , profileImg} = req.body ;
    const userId = req.user._id ; 

    try{
        let user = await User.findById(userId) ; 

        
		if ((!newPassword && currentPassword) || (!currentPassword && newPassword)) {
			return res.status(400).json({ error: "Please provide both current password and new password" });
		}

        if(currentPassword && newPassword){
            const isValid = await bcryptjs.compare(currentPassword , user.password) ; 
            if(!isValid){
                return res.status(400).json({error : "Invalid current password"}) ; 
            }else{
                const salt = await bcryptjs.genSalt(10) ; 
                user.password = await bcryptjs.hash(newPassword , salt) ; 
            }
        }

        if(profileImg){

            if (user.profileImg) {
				// https://res.cloudinary.com/dyfqon1v6/image/upload/v1712997552/zmxorcxexpdbh8r0bkjb.png
				await cloudinary.uploader.destroy(user.profileImg.split("/").pop().split(".")[0]);
			}

            const uploadedResponse = await cloudinary.uploader.upload(profileImg) ; 
            profileImg = uploadedResponse.secure_url ; 
        }

        if(coverImg){

            if (user.coverImg) {
				// https://res.cloudinary.com/dyfqon1v6/image/upload/v1712997552/zmxorcxexpdbh8r0bkjb.png
				await cloudinary.uploader.destroy(user.coverImg.split("/").pop().split(".")[0]);
			}

            const uploadedResponse = await cloudinary.uploader.upload(coverImg) ; 
            coverImg = uploadedResponse.secure_url ; 
        }

        user.fullName = fullName || user.fullName ; 
        user.username = username || user.username ; 
        user.email = email || user.email ; 
        user.link = link || user.link ; 
        user.bio = bio || user.bio ; 
        user.coverImg = coverImg || user.coverImg ; 
        user.profileImg = profileImg || user.profileImg ; 

        user = await user.save() ; 
        user.password = null ; 
        return res.status(200).json(user) ; 

    }catch(error){
        console.log('Error in update User' , error.message);
        return res.status(500).json({error : error.message}) 
    }
}