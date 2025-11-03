const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendOtp = require("../utils/sendOtp");

exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ msg: "Email déjà utilisé" });

    const hashed = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const user = new User({ email, password: hashed, otp });
    await user.save();

    await sendOtp(email, otp);

    res.json({ msg: "Utilisateur créé, OTP envoyé !" });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user || user.otp !== otp) return res.status(400).json({ msg: "OTP invalide" });

    user.verified = true;
    user.otp = null;
    await user.save();

    res.json({ msg: "Compte vérifié avec succès !" });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ msg: "Utilisateur introuvable" });
    if (!user.verified) return res.status(400).json({ msg: "Compte non vérifié" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ msg: "Mot de passe incorrect" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.json({ msg: "Connexion réussie", token });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
