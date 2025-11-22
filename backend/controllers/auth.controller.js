
import { User } from "../models/user.model.js";
// import { generateKey } from "crypto";  
import bcrypt from "bcryptjs";
import { generateVerificationCode } from "../utils/generateVerificationCode.js";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import { sendVerificationEmail } from "../mailtrap/emails.js";

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


export const verifyEmail = async (res, req) => {
    // 123456

    const { code } = req.body;
    try {
        const user = await User.findOne({
            verificationToken: code,
            verificationTokenExpiresAt: { $gt: Date.now() }

        })

        if (!user) {
            return res.status(400).json({ success: false, message: "invalid or expired verification code" })
        }


    } catch (error) {

    }


}




export const login = async (req, res) => {
    res.send("login route")
}

export const logout = async (req, res) => {
    res.send("logout route working")
}
