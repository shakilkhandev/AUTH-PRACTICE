import express from 'express'
import dotenv from "dotenv";
import { connecDB } from './db/connectDB.js';
import authRoutes from './routes/auth.route.js'

import cookieParser  from 'cookie-parser';  //this is to parse cookie , work for verify auth each time . 



dotenv.config(); 
//it loads variables from process.env
// so now .env variable can access like 
// url = process.env.MONGO_URI
// PORT = process.env.PORT

const PORT = process.env.PORT || 3300


const app = express();

//uses app.use(express.json()) to  parse incoming requests : req.body 
app.use(express.json());
app.use(cookieParser()) ; 



app.get("/", (req, res) => {
    res.send("hello world")
    // Ends the response
});





app.use("/auth",authRoutes);

// authRoutes is the imported router from auth.js.

// app.use("/auth", authRoutes) mounts all routes under /auth.

// This makes /auth/signup, /auth/login, and /auth/logout available , means it will add /auth for every auth enpoint 







app.listen(PORT, () => {  //port is read from env file or 3300 is default.
    connecDB();  //db coonection 
    console.log("server is running on  port 3000")
})






