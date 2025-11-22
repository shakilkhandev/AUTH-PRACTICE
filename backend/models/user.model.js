import mongoose, { Types } from "mongoose";



// defining shcema for user collection for mongoDB . 

const userSchema = new mongoose.Schema({

    email: {
        type: String,
        required: true,
        unique: true,


    },
    password: {
        type: String,
        required: true,

    },
    name: {
        type: String,
        default: false
    },
    lastLogin: {
        type: Date
    },
    isVerified:{
        type:Boolean ,
        default:false 
    },
    resetPasswordToken:String , 
    resetPasswordExpiresAt : Date,
    verificationCode :String,
    verificationTokenExpiresAt : Date ,
} ,
 { timestamps: true });


 export const User = mongoose.model('User',userSchema);