const express = require("express");
const router = express.Router();
const { register, verifyOtp, login } = require("../controllers/authController");
const auth = require("../middlewares/authMiddleware");

// Auth routes
router.post("/register", register);
router.post("/verify-otp", verifyOtp);
router.post("/login", login);

// Exemple d’action protégée
router.get("/profile", auth, (req, res) => {
  res.json({ msg: `Bienvenue utilisateur ${req.user.id}` });
});

module.exports = router;
