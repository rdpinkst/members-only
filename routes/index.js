const express = require("express");
const router = express.Router();
const { body, check, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const passport = require("passport");

const User = require("../models/user");
const Post = require("../models/posts");

/* GET home page. */
router.get("/", (req, res, next) => {
  Post.find({})
    .sort({ timeStamp: 1 })
    .populate("user")
    .exec(function (err, postList) {
      if (err) {
        return next(err);
      }
      res.render("index", {
        title: "Express",
        user: req.user,
        messages: postList,
      });
    });
});

router.get("/sign-up", function (req, res, next) {
  res.render("signUp");
});

router.post(
  "/sign-up",
  body("firstName").trim().isLength({ min: 1 }).escape().isAlphanumeric(),
  body("lastName").trim().isLength({ min: 1 }).escape().isAlphanumeric(),
  body("username").trim().isLength({ min: 1 }).escape(),
  body("password").trim().isLength({ min: 1 }).escape(),
  body("confirmPassword").trim().isLength({ min: 1 }).escape(),
  check("password").exists(),
  check("confirmPassword", "Confirm password must match password field.")
    .exists()
    .custom((value, { req }) => value === req.body.password),

  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.render("signUp", {
        userInfo: req.body,
        errors: errors.array(),
      });
      return;
    }

    // Need to use bcrypt to encrypt password
    bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
      if (err) {
        return next(err);
      }

      const newUser = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        username: req.body.username,
        password: hashedPassword,
        membership: false,
      });

      newUser.save((err) => {
        if (err) {
          return next(err);
        }

        res.redirect("/");
      });
    });
  }
);

router.get("/sign-in", (req, res, next) => {
  res.render("signIn");
});

router.post(
  "/sign-in",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/",
  })
);

router.get("/log-out", (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/sign-in");
  });
});

router.get("/member", (req, res, next) => {
  console.log(req.user)
  res.render("membership", {
    user: req.user,
  });
});

router.post(
  "/member",
  body("password").trim().isLength({ min: 1 }).escape(),
  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.render("member", {
        userInfo: req.body,
        errors: errors.array(),
      });
      return;
    }

    if (req.body.password === process.env.MEMBERS_VIP) {
      const userUpdate = new User({
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        username: req.user.username,
        password: req.user.password,
        membership: true,
        _id: req.user._id,
      });

      User.findByIdAndUpdate(req.user._id, userUpdate, {}, (err, theuser) => {
        if (err) {
          return next(err);
        }
      });
    }
    res.redirect("/");
  }
);

router.get("/message", (req, res, next) => {
  res.render("message", {
    user: req.user,
  });
});

router.post(
  "/message",
  body("message").trim().isLength({ min: 1 }).escape(),
  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty) {
      res.render("message", {
        user: req.user,
        message: req.body.message,
        error: errors.array(),
      });
      return;
    }

    const post = new Post({
      user: req.user._id,
      message: req.body.message,
    });

    post.save((err) => {
      if (err) {
        return next(err);
      }

      res.redirect("/");
    });
  }
);

router.get("/admin", (req,res, next) => {
  res.render('admin', {
    user: req.user
  })
})

router.post("/admin", 
  body("admin").trim().isLength({ min: 1 }).escape(),
  (req, res, next) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()) {
      res.render("admin", {
        user: req.user,
        message: req.body.admin,
        error: errors.array(),
      })
      return;
    }

    if (req.body.admin === process.env.ADMIN_PASSWORD) {
      const userUpdate = new User({
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        username: req.user.username,
        password: req.user.password,
        membership: req.user.membership,
        admin: true,
        _id: req.user._id,
      });

      User.findByIdAndUpdate(req.user._id, userUpdate, {}, (err, theuser) => {
        if (err) {
          return next(err);
        }
      });
    }
    res.redirect("/");

})

module.exports = router;
