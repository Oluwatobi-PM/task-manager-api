const sgMail= require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

sgMail.send({
    to: "raji.oluwatobi@babbangona.com",
    from:'rajioluwatobi3@gmail.com',
    subject: "This is my first creation",
    text: "I hope this email meets you well"
})

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from:'rajioluwatobi3@gmail.com',
        subject: "Welcome!",
        text: `Hello, ${name}. I hope this email meets you well. Thanks for joining the task manager app. We look forward to serving you well.` 
    })
}


const sendGoodbyeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from:'rajioluwatobi3@gmail.com',
        subject: "Sad to see you go!",
        text: `Hello, ${name}. I hope this email meets you well. It's sad to see you leave the task manager app. We would appreciate any feedback from you so we can improve and serve our clients better in the future.` 
    })
}
module.exports = {
    sendWelcomeEmail,
    sendGoodbyeEmail
}