const express = require('express');
const passport = require('passport');
const router = express.Router();

router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);


router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // If login is successful, user info is in req.user
    console.log('User logged in:', req.user);

    // Redirect to frontend dashboard or success page
    res.redirect('http://localhost:3000/');
  }
);

router.get('/logout', (req, res) => {
  req.logout(err => {
    if (err) return res.status(500).send('Error logging out');
    res.redirect('/');
  });
});

module.exports = router;
