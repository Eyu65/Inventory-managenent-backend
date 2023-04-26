const express = require('express');
const { registerUser, loginUser, logOutUser, getUser, loginStatus, updateUser, changePassword, forgotPassword, resetPassword } = require('../controllers/userController');
const protectedRoute = require('../middlewares/authMiddleware');
const router = express.Router();


router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/logout", logOutUser);
router.get("/getuser", protectedRoute, getUser);
router.get("/loggedin", loginStatus);
router.put("/update-user", protectedRoute, updateUser);
router.put("/change-password", protectedRoute, changePassword);
router.post("/forgot-password", forgotPassword);
router.post("/resetpassword/:resetToken", resetPassword);








module.exports = router;