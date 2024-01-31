import express  from "express";
import userAuth from "../middlewares/authmiddleware.js";
import { updateUserController } from "../controllers/userController.js";

const router=express.Router();

// routes
// GET USERS

// UPDATE USER || PUT
router.put('/update-user',userAuth,updateUserController)

export default router
