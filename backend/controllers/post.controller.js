import Notification from "../models/notification.model.js";
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
        res.status(201).json(newPost);


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

        res.status(200).json(post);

    }catch(error){
        console.log(`Error in commentOnPost :- ${error.message}`);
        res.status(500).json({error : "Internal server error"}) ; 
    }
}


export const likeUnlikePost = async (req ,res)=>{
    
    try{
        const userId = req.user._id ; 
        const {id: postId} = req.params ; 
        
        const post = await Post.findById(postId) ; 
        if(!post) return res.status(404).json({message : "Post not found"}) ; 

        const isLiked = post.likes.includes(userId) ; 

        if(isLiked){
            // already liked 
            await Post.updateOne({_id : postId} , {$pull : {likes : userId}}) ;
            await User.updateOne({_id : userId }, {$pull : {likedPosts : postId}}) ; 
            res.status(201).json({message : "Post Unliked successfully"}) ; 
        }else{
            post.likes.push(userId) ; 
            await post.save() ; 
            await User.updateOne({_id : userId }, {$push : {likedPosts : postId}}) ; 
            const notification = new Notification({
                from : userId , 
                to : post.user  , 
                type : "like"
            }) ; 
            await notification.save() ; 
            // always save the notification
            const updatedLikes = post.likes;
			res.status(200).json(updatedLikes); 
        }
        
    }catch(error){
        console.log(`Error in likeUnlikePost :- ${error.message}`);
        res.status(500).json({error : "Internal server error"}) ; 
    }
}


export const getAllPosts = async (req , res)=>{
    try{

        const posts = await Post.find()
			.sort({ createdAt: -1 })
			.populate({
				path: "user",
				select: "-password",
			})
			.populate({
				path: "comments.user",
				select: "-password",
			});

		if (posts.length === 0) {
			return res.status(200).json([]);
		}

		res.status(200).json(posts);

    }catch(error){
        console.log(`Error in getAllPosts :- ${error.message}`);
        res.status(500).json({error : "Internal server error"}) ; 
    }
}

export const getLikedPosts = async (req,res)=>{

    const userId = req.params.id ; 

    try{
    
        const user = await User.findById(userId) ; 
        if(!user) return res.status(404).json({message : "User not found"}) ;

        const likedPosts = await Post.find({ _id: { $in: user.likedPosts } })
			.populate({
				path: "user",
				select: "-password",
			})
			.populate({
				path: "comments.user",
				select: "-password",
			});

		res.status(200).json(likedPosts);

    }catch(error){
        console.log(`Error in getAllPosts :- ${error.message}`);
        res.status(500).json({error : "Internal server error"}) ; 
    }
}

export const getFollowingPosts = async (req , res)=>{
    try{

        const userId = req.user._id ; 
        const user = await User.findById(userId) ; 

        if(!user) return res.status(404).json({message : "User not found"}) ; 

        const following = user.following ; 

        const feedPosts = (await Post.find({user : {$in : following}})).
        sort({createdAt : -1})
        .populate({
            path : "user" , 
            select : "-password" , 
        })
        .populate({
            path : "comments.user" , 
            select : "-password" 
        }) ;

        res.status(200).json(feedPosts) ; 

    }catch(error){
        console.log(`Error in getFollowingPosts :- ${error.message}`);
        res.status(500).json({error : "Internal server error"}) ;
    }
}


export const getUserPosts = async (req, res) => {
	try {
		const { username } = req.params;

		const user = await User.findOne({ username });
		if (!user) return res.status(404).json({ error: "User not found" });

		const posts = await Post.find({ user: user._id })
			.sort({ createdAt: -1 })
			.populate({
				path: "user",
				select: "-password",
			})
			.populate({
				path: "comments.user",
				select: "-password",
			});

		res.status(200).json(posts);
	} catch (error) {
		console.log("Error in getUserPosts controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
}