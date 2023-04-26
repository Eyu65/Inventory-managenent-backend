const asyncHandler = require("express-async-handler");
const sendEmail = require("../utility/email");
const User = require("../models/userModel");

const contactUs = asyncHandler(async(req, res) => {
    const {subject, message} = req.body;
    const user = await User.findById(req.user._id)

    if(!user) {
        res.status(400)
        throw new Error("User not found!")
    }

    if(!subject || !message) {
        res.status(400)
        throw new Error("You need to add subject and message")
    }

    const send_to = user.email
    const sent_from = process.env.EMAIL_USER
    const reply_to = user.email

    try {
        await sendEmail(subject, message, send_to, sent_from)
        res.status(200).json({success: true, message: "Reset Email"})
      } catch (error) {
        res.status(500)
        throw new Error("Email is not sent, try again")
      }
});

module.exports = contactUs;