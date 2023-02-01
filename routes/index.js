const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');


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
  
});

router.get('/sign-in', (req, res, next) => {
  res.render("signIn")
})

module.exports = router;
