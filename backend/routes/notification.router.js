import express from "express"
import { protectRoute } from "../middleware/protectedRoute";

const router = express.Router() ; 

router.get('/' , protectRoute , getNotification) ; 
router.delete('/' , protectRoute , deleteNotification) ; 


export default router ; 