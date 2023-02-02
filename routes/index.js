const express = require('express');
const router = express.Router();
const { body, check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');

const User = require('../models/user')


/* GET home page. */
router.get('/', (req, res, next) => {
  res.render('index', { title: 'Express' });
});

router.get('/sign-up', function(req, res, next) {
  res.render("signUp")
});

router.post('/sign-up', 
  body('firstName')
    .trim()
    .isLength({ min: 1 })
    .escape()
    .isAlphanumeric(),
  body('lastName')
    .trim()
    .isLength({ min: 1 })
    .escape()
    .isAlphanumeric(),
  body('username')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body('password')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body('confirmPassword')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  check('password').exists(),
  check('confirmPassword', 'Confirm password must match password field.')
    .exists()
    .custom((value, { req }) => value === req.body.password),

  (req, res, next) => {

    const errors = validationResult(req);

    if(!errors.isEmpty()) {
      res.render('signUp', {
        userInfo: req.body,
        errors: errors.array(),
      })
      return;
    }
    
    // Need to use bcrypt to encrypt password
    bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
      if(err) {
        return next(err);
      }

      const newUser = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        username: req.body.username,
        password: hashedPassword,
        membership: false,
      })

      newUser.save((err) => {
        if(err) {
          return next(err);
        }

        res.redirect('/');
      })
    })
  
});

router.get('/sign-in', (req, res, next) => {
  res.render("signIn")
})

module.exports = router;
