const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const authroutes = require("./routes/authRoute");
const {
  requiredAuth,
  checkUser,
  sendVerifyMail
} = require("./middleware/authMiddleware");

const app = express();
dotenv.config();


// middleware
app.use(express.static("public"));
app.use(express.json());
app.use(cookieParser());

// view engine
app.set("view engine", "ejs");

// database connection
const dbURI = process.env.MONGO_URL;
mongoose.connect(dbURI, () => console.log("DB Connected"));

// routes

app.get("*", checkUser);
app.use("/", authroutes);
app.get("/", (req, res) => res.render("home"));
app.get("/blogs", requiredAuth, (req, res) => res.render("smoothies"));

app.listen(3500, () => console.log("Server running"));
