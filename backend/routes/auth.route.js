import express from "express";

import {  login, logout, signup ,verifyEmail ,forgotPassword,resetpassword , checkAuth } from "../controllers/auth.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { User } from "../models/user.model.js";


const router = express.Router();

router.post("/signup", signup);

router.post("/login", login);

router.post("/logout", logout);

router.post("/verify-email",verifyEmail)

router.post("/forgot-password",forgotPassword)

router.post("/reset-password/:token",resetpassword)
           //this will ensure protected route , if refresh the page it wil run and check if the user is valid or not. 
router.post("/check-auth" , verifyToken, checkAuth)





router.get("/dashboard",verifyToken, async (req, res)=>{
    try {
        const user = await User.findById(req.userId).select("-password");
        res.status(200).json({ success: true, message: `Hey ${user.name} You are on the Dashboard by clicking ${req.path}` })
    } catch (error) {
        res.status(400).json({ success: false, message: "Server error while loading dashboard " })
    }
         
})



// router.get("/test/:paramsofurl",(req,res)=>{
//     const { paramsofurl } = req.params ;
//      //catching the parameters from  url and send it back like json
//     res.status(200).json(paramsofurl)
        
// })

export default router;
