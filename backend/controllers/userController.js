const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Token = require("../models/modelForTheToken");
const crypto = require("crypto");
const multer = require("multer");

const tokenGen = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });
}

// User registration

const registerUser = asyncHandler (async (req, res) => {
  const {name, email, password} = req.body;

  if(!name || !email || !password) {
    res.status(400);
    throw new Error("Please fill in all required fields!")
  }
  if(password.length < 6) {
    res.status(400);
    throw new Error("Password must be at least 6 characters!")
  }

  const userExists = await User.findOne({ email });

  if(userExists) {
    res.status(400);
    throw new Error("User already exists!")
  }


  const user = await User.create({
    name,
    email,
    password
  });

  // Token generation
  const token = tokenGen(user._id)

  // Sending HTTP only cookie
  res.cookie("token", token, {
    path: "/",
    httpOnly: true,
    expires: new Date(Date.now() + 1000 * 86400),
    sameSite: "none",
    secure: true
  });

  if(user) {
    const { _id, name, email, photo, phone, bio } = user;
    res.status(201).json({
        _id, name, email, photo, phone, bio, token
    })
  } else {
    res.status(400);
    throw new Error("Invalid user data!")
  }
})

// Login User

const loginUser = asyncHandler (async (req, res) => {
  const { email, password } = req.body;

  if(!email || !password) {
    res.status(400);
    throw new Error("Please add email and password!");
  }

  const user = await User.findOne({ email });

  if(!user) {
    res.status(400);
    throw new Error("User doesn't exist, please sign-up!")
  }

  const passwordIsCorrect = await bcrypt.compare(password, user.password);

  // Token generation
  const token = tokenGen(user._id);

  // Sending HTTP only cookie
  if(passwordIsCorrect) {
    res.cookie("token", token, {
      path: "/",
      httpOnly: true,
      expires: new Date(Date.now() + 1000 * 86400),
      sameSite: "none",
      secure: true
    });
  }

  if(user && passwordIsCorrect) {
    const { _id, name, email, photo, phone, bio } = user;
    res.status(200).json({
        _id, name, email, photo, phone, bio, token
      });
  } else {
    res.status(400);
    throw new Error("Invalid credentials!")
  }
});

// Log out a user
const logOutUser = asyncHandler (async (req, res) => {
  res.cookie("token", "", {
    path: "/",
    httpOnly: true,
    expires: new Date(0),
    sameSite: "none",
    secure: true,
  });
  return res.status(200).json({message: "Logged out successfully!"})
});

// Get User
const getUser = asyncHandler (async (req, res) => {
  const user = await User.findById(req.user._id);

  if(user) {
    const { _id, name, email, photo, phone, bio } = user;
    res.status(200).json({
        _id, name, email, photo, phone, bio
    });
  } else {
    res.status(400);
    throw new Error("User not found!")
  }
});

const loginStatus = asyncHandler (async (req, res) => {
  const token = req.cookies.token;

  if(!token) {
    return res.json(false);
  }

  const verified = jwt.verify(token, process.env.JWT_SECRET);
  if(verified) {
    return res.json(true);
  }
    return res.json(false);
});

const updateUser = asyncHandler (async(req, res) => {
  const user = await User.findById(req.user._id);

  if(user) {
    const { name, email, photo, phone, bio } = user;
    user.email = email,
    user.name = req.body.name || name;
    user.photo = req.body.photo || photo;
    user.phone = req.body.phone || phone;
    user.bio = req.body.bio || bio;

    const updatedUserInfo = await user.save();
    res.status(200).json({
      _id: updatedUserInfo._id,
      name: updatedUserInfo.name,
      email: updatedUserInfo.email,
      phone: updatedUserInfo.phone,
      bio: updatedUserInfo.bio,
      photo: updatedUserInfo.photo
    });
  } else {
    res.status(404)
    throw new Error("User not found!")
  }
});

const changePassword = asyncHandler (async(req, res) => {
  const user = await User.findById(req.user._id);
  const {formerPassword, password} = req.body;

  if(!user) {
    res.status(400);
    throw new Error("User not found!")
  }

  if(!formerPassword || !password) {
    res.status(400);
    throw new Error("You must insert both passwords!")
  }

  const passwordMatchingCheck = await bcrypt.compare(formerPassword, user.password);

  if(user && passwordMatchingCheck) {
    user.password = password
    await user.save();
    res.status(200).send("Password changed successfully!")
  } else 
  {
    res.status(400);
    throw new Error("Please insert correct password!")
  }
});

const forgotPassword = asyncHandler (async(req, res) => {
  const {email} = req.body;
  const user = await User.findById({email});

  if(!user) {
    res.status(404)
    throw new Error("User doesn't exist!")
  }

  let token = await User.findOne({userId: user._id})
  if(token) {
    await token.deleteOne()
  }
  let resetToken = crypto.randomBytes(32).toString("hex") + user._id

  const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

  await new Token({
    userId: user._id,
    token: hashedToken,
    createdAt: Date.now(),
    expiresOn: Date.now() + 30 * (60 * 1000)
  }).save()

  const resetUrl = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`

  const message = `
  <h2>Hello ${user.name}</h2>
  <p>Please use the url below to reset your password</p>
  <a href=${resetUrl} clicktracking=off>${resetUrl}</a>

  <p>Regards...</p>
  <p>Company Name</p>
  `
  const subject = "Password Reset"
  const send_to = user.email
  const sent_from = process.env.EMAIL_USER

  try {
    await sendEmail(subject, message, send_to, sent_from)
    res.status(200).json({success: true, message: "Reset Email"})
  } catch (error) {
    res.status(500)
    throw new Error("Email is not sent, try again")
  }

});

const resetPassword = asyncHandler (async(req, res) => {
  const {password} = req.body;
  const {resetToken} = req.params

  const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

  const userToken = await Token.findOne({
    token: hashedToken,
    expiresOn: {$gt: Date.now()}
  })

  if(!userToken) {
    res.status(404);
    throw new Error("Invalid or expired token used!")
  }

  const user = await User.findOne({_id: userToken.userId});
  user.password = password;
  await user.save();

  res.status(200).json({
    message: "Password has been reset successfully!"
  })

});

module.exports = {
    registerUser,
    loginUser,
    logOutUser,
    getUser,
    loginStatus,
    updateUser,
    changePassword,
    forgotPassword,
    resetPassword
}