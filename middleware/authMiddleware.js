const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const nodemailer = require("nodemailer");
const User = require("../models/User");

dotenv.config();

const requiredAuth = (req, res, next) => {
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, process.env.JWT_TOKEN, (err, decodedToken) => {
      if (err) {
        res.redirect("/login");
      } else {
        next();
      }
    });
  } else {
    res.redirect("/login");
  }
};

//check current user
const checkUser = (req, res, next) => {
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, process.env.JWT_TOKEN, async (err, decodedToken) => {
      if (err) {
        res.locals.user = null;
        next();
      } else {
        let user = await User.findById(decodedToken.id);
        res.locals.user = user;
        next();
      }
    });
  } else {
    res.locals.user = null;
    next();
  }
};

const sendVerifyMail = async (email, Token, id) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: "patilajit020@gmail.com",
        pass: "nsnfzouvtpvsbmsx",
      },
    });
    console.log(email);
    const mailOptions = {
      from: "patilajit020@gmail.com",
      to: email,
      subject: "For Verification mail",
      html: `<a href="http://localhost:5000/resetpassword/${id}/${Token}">Click here to verify</a>
      http://localhost:5000/resetpassword/${id}/${Token}
      `,
    };
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        // return "Check your email to verify ";
        console.log("Email has been sent :-", info.response);
      }
    });
  } catch (err) {
    console.log(err);
  }
};

module.exports = { requiredAuth, checkUser, sendVerifyMail };
