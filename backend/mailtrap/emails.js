import {
  VERIFICATION_EMAIL_TEMPLATE,
  WELCOME_EMAIL_TEMPLATE, PASSWORD_RESET_REQUEST_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE
} from "./emailTemplates.js";

import { mailtrapClient, sender } from "./mailtrap.config.js"
import dotenv from "dotenv";
dotenv.config();



export const sendVerificationEmail = async (email, verificationToken) => {
  const recipient = [{ email }]

  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: "Please, Verify your email",
      html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationToken),
      category: "Email Verification",
    })


  } catch (error) {
    console.log("Error sending verification ", error);
    throw new Error(`Error sending verification${error} `)
  }
}

export const sendWelcomeEmail = async (email, username) => {
  const recipient = [{ email }]

  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: "Your email has been verified 🎉 ",
      html: WELCOME_EMAIL_TEMPLATE.replace("{username}", username),
      category: "Welcome Email",
    })


  } catch (error) {
    console.log("Error sending verification ", error);
    throw new Error(`Error sending verification${error} `)
  }
}


export const sendPasswordResetEmail = async (email, resetURL) => {

  const recipient = [{ email }];

  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: "Reset  Your password 🎉 ",
      html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL),
      category: "password Reset",
    })

  } catch (error) {
    console.log(error);
  }
}


export const sendPasswordResetSuccessEmail = async (email, username) => {

  const recipient = [{ email }];

  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: "Your Password Reset is successfull 🎉 ",
      html: PASSWORD_RESET_SUCCESS_TEMPLATE.replace("{username}", username),
      category: "password Reset",
    })

  } catch (error) {
    console.log(error);
  }
}