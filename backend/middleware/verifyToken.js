import jwt, { decode } from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
    const token = req.cookies.JWTtoken;
    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized, no token found"
        })

    }

    try {

        const decoded = jwt.verify(token, process.env.JWT_SECRET)  //jwt.verify should be inside try catch otherwise if token invalid app wil crash . 
        if (!decoded) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized, Fail to decode token"
            })
        }

        req.userId = decoded.userId;



        next();
    }
    catch (error) {
        console.log(error.name, " ", error.message);
        res.status(400).json({ success: false, message: "Error, Token may expired or Invalid " })
    }
}