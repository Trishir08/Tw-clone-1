import Post from "../models/posts.model.js";
import User from "../models/user.model.js";
import { v2 as cloudinary } from "cloudinary";

export const createPost = async (req,res)=>{

    try{
        const {text} = req.body ; 
        let {img} = req.body ; 

        const userId = req.user._id ; 
        const user = await User.findById(userId) ; 

        if(!user) res.status(404).json({message : "User not found"}) ; 
        if(!text && !img) res.status(404).json({message : "Post must have a image or some text"}) ; 

        if(img){
            const uploadedResponse = await cloudinary.uploader.upload(img) ; 
            img = uploadedResponse.secure_url ; 
        }

        const newPost = new Post({
            text , 
            img , 
            user : userId , 
        }) ; 

        await newPost.save() ; 
        res.status(201).json({message : "Post created successfully"}) ; 


    }catch(error){
        console.log(`Error in createPost :- ${error.message}`);
        res.status(500).json({error : "Internal server error"}) ; 
    }
}


export const deletePost = async (req , res)=>{
    
    try{
        const postId = req.params.id ;

        const post = await Post.findById(postId) ; 

        if(post.user.toString() !== req.user._id) return res.status(404).json({message : "You are not authorized to delete this post"}) ;

        if(post.img){
            await cloudinary.uploader.destroy(post.img.split("/").pop().split(".")[0]);
        }

        await Post.findByIdAndDelete(postId) ; 
        res.status(201).json({message : "Post deleted successfully"}) ; 

    }catch(error){
        console.log(`Error in deletePost :- ${error.message}`);
        res.status(500).json({error : "Internal server error"}) ; 
    }
}


export const commentOnPost = async(req , res) => {

    try{
        const {text} = req.body ; 
        const userId = req.user._id ; 
        const postId = req.params.id ; 

        if(!text) return res.status(404).message({message : "Text field required"}) ;

        const post = await Post.findById(postId) ; 

        const com = {user : userId , text} ; 

        post.comment.push(com) ; 
        await post.save() ; 

        res.status(201).json({message : "Comment added successfully"}) ; 

    }catch(error){
        console.log(`Error in commentOnPost :- ${error.message}`);
        res.status(500).json({error : "Internal server error"}) ; 
    }
}


export const likeUnlikePost = async (req ,res)=>{
    try{

    }catch(error){
        console.log(`Error in likeUnlikePost :- ${error.message}`);
        res.status(500).json({error : "Internal server error"}) ; 
    }
}