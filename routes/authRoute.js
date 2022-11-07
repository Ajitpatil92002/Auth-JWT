const { Router } = require("express");
const {
  signup_get,
  signup_post,
  login_get,
  login_post,
  logout_get,
  forgetpassword_get,
  forgetpassword_post,
  Resetpassword_get,
  Resetpassword_post,
} = require("../controller/authController");

const router = Router();

router.get("/signup", signup_get);
router.post("/signup", signup_post);


router.get("/login", login_get);
router.post("/login", login_post);

router.get("/logout", logout_get);

router.get("/forgetpassword", forgetpassword_get);
router.post("/forgetpassword", forgetpassword_post);

router.get("/resetpassword/:id/:token",Resetpassword_get);
router.post("/resetpassword/:id/:token", Resetpassword_post);
module.exports = router;
