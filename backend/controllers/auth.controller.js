
import { User } from "../models/user.model.js";
import crypto from "crypto" ;
import bcryptjs from "bcryptjs";
import { generateVerificationCode } from "../utils/generateVerificationCode.js";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import { sendVerificationEmail, sendWelcomeEmail, sendPasswordResetEmail , sendPasswordResetSuccessEmail } from "../mailtrap/emails.js";
import { response } from "express";
import dotenv from "dotenv";
dotenv.config();




export const signup = async (req, res) => {
    const { email, password, name } = req.body;


    // console.log(email) ;  // checking request receiving correctly or not 

    try {
        if (!email || !password || !name) {
            throw new Error("All fields are required");

        }
        const userAlreadyExists = await User.findOne({ email });

        if (userAlreadyExists) {
            return res.status(400).json({ success: false, message: "User Already Exist", });

        }

        const hashedPassword = await bcryptjs.hash(password, 10);
        const verificationCode = generateVerificationCode();





        //send verification code to the user email 

        await sendVerificationEmail(email, verificationCode)

        const user = new User({
            email,
            password: hashedPassword,
            name,
            verificationCode,
            verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000 //expired after 24 hour.  
        });

        await user.save();

        //JWT 
        generateTokenAndSetCookie(res, user._id)

        //sending verification email to the useremail 

        console.log(user.email)
        //send confirm status . 
        res.status(201).json({
            success: true,
            message: "Signup Successfull",
            user: {
                ...user._doc,
                password: undefined,
            }

        })



    } catch (err) {
        res.status(400).json({ success: false, message: err.message })
    }
}


export const verifyEmail = async (req, res) => {
    // 123456

    const { code } = req.body;
    try {
        const user = await User.findOne({
            verificationCode: code,
            verificationTokenExpiresAt: { $gt: Date.now() }

        })

        if (!user) {
            return res.status(400).json({ success: false, message: "invalid or expired verification code" })
        }

        user.isVerified = true;
        user.verificationCode = undefined;
        user.verificationTokenExpiresAt = undefined;  //these changes in  now on memory not in the database. 

        await user.save();  //update user to DB  , unless .save() is called it will not update to the mongoDB 

        await sendWelcomeEmail(user.email, user.name);
        console.log("success");
        res.status(201).json({
            success: true,
            message: "Verification Successfull",
            user: {
                ...user._doc,
                password: undefined,
            }

        })



    } catch (error) {
        console.log("Verificatioin error ", error);
        throw new Error("verification error");
    }


}




export const login = async (req, res) => {

    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid credentials" });

        }
        const isPasswordValid = await bcryptjs.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }
        generateTokenAndSetCookie(res, user._id);

        user.lastLogin = new Date();
        await user.save();

        res.status(200).json({
            success: true,
            message: "Logged in successfully",
            user: {
                ...user._doc,
                password: undefined,
            }
        })


    } catch (error) {
        console.log("Error in login ", error);
        res.status(400).json({ success: false, message: error.message });
    }


}

export const logout = async (req, res) => {


    res.clearCookie("JWTtoken")
    res.status(200).json({ success: true, message: "logged out successfully" });

}


export const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message: "No user found" })

        }

        //Generate reset token 

        const resetToken = crypto.randomBytes(20).toString("hex");
        const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000; //1 hour

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpiresAt = resetTokenExpiresAt;

        await user.save();


        //send email that include resetToken

        // inside the env file   CLIENT_URL = http://localhost:3000   

        await sendPasswordResetEmail(user.email , `${process.env.CLIENT_URL}/auth/reset-password/${resetToken}`);
       
        res.status(200).json({ success: true, message: "password reset link sent to your email" })






    } catch (error) {

        console.log("error in forgot password ", error);
        res.status(400).json({ success: false, message: "An Error occur : " + error.meesage })

    }
}

export const resetpassword = async (req , res ) => {
       
    try {
        
        const { token } =   req.params ; 
        const {password } = req.body ; 
        console.log(token);

        const user = await User.findOne({
            resetPasswordToken : token,
            resetPasswordExpiresAt : {$gt : Date.now()}
        })
         
        console.log(user);

        if(!user){
            return  res.status(400).json({success:false , message : " Invalid or Expired Token"})
        }

        const hashedPassword = await bcryptjs.hash(password , 10 ) ; 

        user.password = hashedPassword ;
        user.resetPasswordToken = undefined ; 
        user.resetPasswordExpiresAt = undefined ; 

        await user.save(); 
      
        await sendPasswordResetSuccessEmail(user.email , user.name);
        
        res.status(200).json({success : true , message : "password reset successfull"}) ; 



    }catch(err){
    
        console.log("error on password reset " , err);
        res.status(400).json({success:false , message : err.message })
    }


}




     //checking auth is a protectd route tiggered by the middleware named verify token 
export const   checkAuth = async  (req , res ) => {
  
    try {
        const user = await User.findById(req.userId).select("-password");
                         //if  write like this .select("-password") it will unselect the password while returning the user from db 
                         //then we can only return the user in response . 

        if(!user){
            return res.status(400).json({success : false , message : "user not found , authentication fail "})
        }
        // res.status(200).json({success : true , user : {
        //     ...user._doc,
        //     password:undefined 
        // }})

        res.status(200).json({success : true , user } ) //as we not selected the password above 
    }catch(error){
         console.log(error.name , " " , error.message )
         res.status(400).json({success: false , message : "Error while checking auth "}) ;
    }


}