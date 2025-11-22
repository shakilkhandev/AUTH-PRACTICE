import jwt from "jsonwebtoken";

export const generateTokenAndSetCookie = (res, userId) => {


  try {

    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });




    res.cookie("JWTtoken", token, {
      httpOnly: true,  // prevent xss attack . 
      secure: process.env.NODE_ENV === 'production',
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,

    })

    return token;


  } catch (err) {
    throw new Error("Token generation failed: " + err.message);
  }
};
