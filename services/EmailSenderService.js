const nodemailer = require('nodemailer')
const APP_EMAIL = "hamessenger75@gmail.com"
if (process.env.NODE_ENV !== 'production') {
    require("dotenv").config({path: '.env'})

}

const sendEmailToVerifyUser = async (body)=>{
 try{
     const mailbody = `
        <h1>Welcome to Ha-messenger!</h1>
        <p>Hello ${body.firstName} ${body.lastName}!</p>
        <p>We are glad that you decided to make an account for this app!</p>
        <p>We hope you to have nice conversations with your friends!</p>
        <p>Click this <a href="${process.env.SERVER_URL}/validation/${body.verificationId}"> link </a> your account validation!</p>
        <p>regards,</p>
        <p>Ha-messenger community.</p>
     `
     let transporter = nodemailer.createTransport({
         service:'gmail',
         auth:{
             user: APP_EMAIL,
             pass: process.env.EMAIL_PASSWORD
         }
     })

     const information = {
         from: `"ha-messenger" <${APP_EMAIL}>`,
         to: body.email,
         subject: "Email Validation",
         html: mailbody
     }

     let info = await transporter.sendMail(information,(err,data)=>{
         if(err)throw err
         else console.log(`message send`)
     })

 }catch (e) {
     throw e
 }
}

module.exports.sendEmailToVerifyUser = sendEmailToVerifyUser