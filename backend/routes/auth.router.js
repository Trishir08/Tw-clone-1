import express from "express"
import { getMe , signUp , login , logout } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/protectedRoute.js";

const router = express.Router() ; 

router.get("/me" , protectRoute , getMe) ; 
router.post("/signup" , signUp) ; 
router.post("/login" , login) ; 
router.post("/logout" , logout) ; 


export default router