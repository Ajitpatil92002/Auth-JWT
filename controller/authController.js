const User = require("../models/User");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const {
  sendVerifyMail,
} = require("../middleware/authMiddleware");
dotenv.config();

//handle error
const handleError = (err) => {
  let errors = { email: "", password: "" };

  if (err.message === "incorrect password") {
    errors.password = "password is incorrect";
  }
  if (err.message === "incorrect email") {
    errors.email = "incorrect email";
  }

  // validation error
  if (err.message.includes("users validation failed")) {
    Object.values(err.errors).forEach(({ properties }) => {
      errors[properties.path] = properties.message;
    });
  }
  // dublicate error code
  if (err.code === 11000) {
    errors.email = "email is already registered";
    return errors;
  }

  return errors;
};

// create token
const maxAge = (3 / 24) * 60 * 60;
const createToken = (id, maxAge) => {
  return jwt.sign({ id }, process.env.JWT_TOKEN, { expiresIn: "3d" });
};

module.exports.signup_get = (req, res) => {
  res.render("signup");
};

module.exports.signup_post = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.create({ email, password });
    const token = createToken(user._id, maxAge);
    res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
    res.status(201).json({ user: user._id });
  } catch (err) {
    const errors = handleError(err);
    res.status(400).json({ errors });
  }
};

module.exports.login_get = (req, res) => {
  res.render("login");
};
module.exports.logout_get = (req, res) => {
  res.cookie("jwt", "", { maxAge: 1 });
  res.redirect("/");
};

module.exports.login_post = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.login(email, password);
    const token = createToken(user._id);
    res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
    res.status(200).json({ user: user._id });
  } catch (err) {
    const errors = handleError(err);
    res.status(400).json({ errors });
  }
};

module.exports.forgetpassword_get = async (req, res) => {
  res.render("forgetpassword");
};

module.exports.forgetpassword_post = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (user === null) {
      res.send({ msg: "You Email is not register ,Please SignIN" });
      return;
    }
    const { _id } = user;
    const Token = jwt.sign({ _id }, process.env.JWT_TOKEN + user.password, {
      expiresIn: "1h",
    });
    sendVerifyMail(user.email, Token, _id);
    res.send({
      msg: `Please, Reset your Password link has been Sent to your Gmail Account :- ${user.email}`,
    });
  } catch (err) {
    res.send({ msg: "You Email is not register ,Please SignIN" });
  }
};

module.exports.Resetpassword_get = async (req, res) => {
  const { id, token } = req.params;
  try {
    const user = await User.findOne({ _id: id });
    jwt.verify(token, process.env.JWT_TOKEN + user.password);
    res.render("resetpassword", { email: user.email });
  } catch (err) {
    res.render("404");
  }
};

module.exports.Resetpassword_post = async (req, res) => {
  try {
    const { id, token } = req.params;
    const user = await User.findById(id);
    jwt.verify(token, process.env.JWT_TOKEN + user.password);
    const { password, confirmPassword } = req.body;
    if (password === confirmPassword) {
      const salt = await bcrypt.genSalt(10);
      const hashpassword = await bcrypt.hash(password, salt);
      await User.updateOne({ _id: id }, { $set: { password: hashpassword } });
      res.json({ msg: "Password is Reseted" });
    } else {
      res.json({ msg: "Incorrect Password" });
    }
  } catch (err) {
    res.render("404");
  }
};
