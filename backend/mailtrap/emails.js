import { VERIFICATION_EMAIL_TEMPLATE ,WELCOME_EMAIL_TEMPLATE } from "./emailTemplates.js" ;
import { mailtrapClient , sender } from "./mailtrap.config.js"

export const sendVerificationEmail = async ( email, verificationToken) => {
      const recipient = [{email}]

      try {
        const response = await mailtrapClient.send({
            from : sender ,
            to: recipient,
            subject : "Please, Verify your email",
            html: VERIFICATION_EMAIL_TEMPLATE.replace ("{verificationCode}",verificationToken),
            category:"Email Verification",
        })

        
      }catch(error){
        console.log("Error sending verification ",error);
             throw new Error(`Error sending verification${error} `)
      }
}

export const sendWelcomeEmail = async ( email , username ) => {
      const recipient = [{email}]

      try {
        const response = await mailtrapClient.send({
            from : sender ,
            to: recipient,
            subject : "Your email has been verified 🎉 ",
            html: WELCOME_EMAIL_TEMPLATE.replace("{username}", username ) ,
            category:"Welcome Email",
        })

        
      }catch(error){
             console.log("Error sending verification ",error);
             throw new Error(`Error sending verification${error} `)
      }
}
