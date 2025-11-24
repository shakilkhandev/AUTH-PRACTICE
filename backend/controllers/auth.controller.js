
import { User } from "../models/user.model.js";
// import { generateKey } from "crypto";  
import crypto  from "crypto"
import bcryptjs from "bcryptjs";
import { generateVerificationCode } from "../utils/generateVerificationCode.js";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import { sendVerificationEmail , sendWelcomeEmail } from "../mailtrap/emails.js";

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

        const hashedPassword = await bcrypt.hash(password, 10);
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
            verificationCode : code,
            verificationTokenExpiresAt: { $gt: Date.now() }

        })

        if (!user) {
            return res.status(400).json({ success: false, message: "invalid or expired verification code" })
        }

        user.isVerified = true ; 
        user.verificationCode = undefined;
        user.verificationTokenExpiresAt = undefined ;  //these changes in  now on memory not in the database. 

        await user.save();  //update user to DB  , unless .save() is called it will not update to the mongoDB 

        await sendWelcomeEmail( user.email , user.name );
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
            console.log("Verificatioin error " , error) ;
            throw new Error("verification error") ;
    }


}




export const login = async (req, res) => {
   
    const {email , password } = req.body ;
    try{
        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({success : false , message : "Invalid credentials"});

        }
        const isPasswordValid = await bcryptjs.compare(password, user.password);
        if(!isPasswordValid){
            return res.status(400).json({success:false , message : "Invalid credentials"});
        }
        generateTokenAndSetCookie(res, user._id);

        user.lastLogin = new Date();
        await user.save();

        res.status(200).json({
            success: true ,
            message: "Logged in successfully",
            user:{
                ...user._doc,
                password:undefined,
            }
        })

        
    }catch(error){
      console.log("Error in login ", error);
		res.status(400).json({ success: false, message: error.message });
    }


}

export const logout = async (req, res) => {
    
    
    res.clearCookie("JWTtoken")
    res.status(200).json({success: true , message : "logged out successfully"});
    
}


export const forgotPassword = async (req , res ) => {
    const {email} = req.body ; 
    try {
        const user = await User.findOne({email}) ;
        if(!user){
            return res.status(400).json({ success : false , message :"No user found"})

        }

        //Generate reset token 

        const resetToken = crypto.randomBytes(20).toString("hex") ; 
        const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000 ; //1 hour

        user.resetPasswordToken = resetToken ;
        user.resetPasswordExpiresAt = resetTokenExpiresAt ;

        await user.save() ; 

    }catch(error){
       
    }
}