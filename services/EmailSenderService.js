const nodemailer = require('nodemailer')
const APP_EMAIL = "hamessenger75@gmail.com"
if (process.env.NODE_ENV !== 'production') {
    require("dotenv").config({path: '.env'})

}


const validateEmail = (email) => {
    const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

const sendEmailToVerifyUser = async (body) => {
    try {

        if (!validateEmail(body.email)) {
            return {error: {status: 403, message: "Invalid Email"}}
        }
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
            service: 'gmail',
            auth: {
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


        const res = await transporter.sendMail(information, (err, data) => {
            if (err) {
                console.log(err)

            } else {
                console.log(`message send`, data)

            }

        })

        return {send: {status: 200, message: 'Email send!'}}

    } catch (e) {

        return {error: {status: 403, message: "Invalid Email"}}
    }
}

const sendEmailForPasswordRecovery = async (info) => {
    try {
        const mailbody = `
         <p>Hello ${info.lastName} ${info.firstName}</p>
         <p>We recieved a request to reset the password for your account with the username of ${info.userName}</p>
         <p>If you didn't sent this request or if you remembered your current password, please ignore this message!</p>
         <p>To reset your password please click this <a href="${process.env.SERVER_URL}/password-reset-form/${info.id}">link</a> !</p>
        <p>regards,</p>
        <p>Ha-messenger community.</p>
        `;

        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: APP_EMAIL,
                pass: process.env.EMAIL_PASSWORD
            }
        })

        const information = {
            from: `"ha-messenger" <${APP_EMAIL}>`,
            to: info.email,
            subject: "Password Reset",
            html: mailbody
        }

        await transporter.sendMail(information, (err, data) => {
            if (err) {
                console.log(err)
            } else {
                console.log(`message send`, data)
            }
        })


    } catch (e) {
        throw e
    }

}

module.exports.sendEmailToVerifyUser = sendEmailToVerifyUser
module.exports.validateEmail = validateEmail
module.exports.sendEmailForPasswordRecovery = sendEmailForPasswordRecovery