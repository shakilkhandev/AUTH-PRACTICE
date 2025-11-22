import { MailtrapClient } from "mailtrap";
import dotenv from "dotenv";
dotenv.config();

// const TOKEN = "012500e43819feb6c40c57f5fc92360b";  //token should be read from env file using  dotenv.config()  

export  const mailtrapClient = new MailtrapClient({
  // token: TOKEN,
  token: process.env.MAILTRAP_TOKEN
});

export const sender = {
  email: "hello@demomailtrap.co",
  name: "AidCMS",
};





// const recipients = [
//   {
//     email: "shakil777a@gmail.com",
//   }
// ];



//client is named as mailtrapClient in above(line 5) and imported another ,don't confused 

// client
//   .send({
//     from: sender,
//     to: recipients,
//     subject: "Hey, Shakil! You are awesome!",
//     text: "Congrats for sending test email with Mailtrap!",
//     category: "Integration Test",
//   })
//   .then(console.log, console.error);