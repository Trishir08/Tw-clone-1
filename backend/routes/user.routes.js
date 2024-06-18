import express from "express"
import { followUnfollowUser, getUserProfile, suggestedUsers, updateUser } from "../controllers/user.controller.js";
import { protectRoute } from "../middleware/protectedRoute.js";

const router =  express.Router() ; 

router.get('/profile/:username' , protectRoute , getUserProfile) ; 
router.post('/follow/:id' , protectRoute , followUnfollowUser) ; 
router.get('/suggested' , protectRoute , suggestedUsers) ; 
router.post('/update' , protectRoute , updateUser) ; 

export default router 