var express = require('express');
var router = express.Router();
var passport = require('passport');

// Note in app.js, app.use(passport) creates req.user when a user is logged in.

router.get('/', isLoggedIn, function(req, res, next) {
    //This will probably be the home page for your application
    //Let's redirect to the secret page, if the user is logged in.
    //If the user is not logged in, the isLoggedIn middleware
    //will catch that, and redirect to a login page.
    res.redirect('/secret');
});


/* GET signup page */
router.get('/signup', function(req, res, next){
    res.render('signup')
});


/* POST signup - this is called by clicking signup button on form
 *  * Call passport.authenticate with these arguments:
 *    what method to use - in this case, local-signup, defined in /config/passport.js
 *    what to do in event of success
 *    what to do in event of failure
 *    whether to display flash messages to user */
router.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/secret',
    failureRedirect: '/signup',
    failureFlash :true
}));



/* GET login page. Any flash messages are automatically added. */
router.get('/login', function(req, res, next){
    res.render('login');
});


/* POST login - this is called when clicking login button
 Very similar to POST to signup, except using local-login method.  */
router.post('/login', passport.authenticate('local-login', {
    successRedirect: '/secret',
    failureRedirect: '/login',
    failureFlash: true
}));


/* GET Logout */
router.get('/logout', function(req, res, next) {
    req.logout();         //passport middleware adds these functions to req object.
    res.redirect('/');
});



/* GET secret page. Note isLoggedIn middleware - verify if user is logged in */
router.get('/secret', isLoggedIn, function(req, res, next) {
    res.render('secret', { username : req.user.local.username,
        signupDate: req.user.signupDate,
        favorites: req.user.favorites });
});


router.post('/saveSecrets', isLoggedIn, function(req, res, next){

    // Check if the user has provided any new data
    if (!req.body.color && !req.body.luckyNumber) {
        req.flash('updateMsg', 'Please enter some new data');
        return res.redirect('/secret')
    }

    //Collect any updated data from req.body, and add to req.user

    if (req.body.color) {
        req.user.favorites.color = req.body.color;
    }
    if (req.body.luckyNumber) {
        req.user.favorites.luckyNumber = req.body.luckyNumber;
    }

    //And save the modified user, to save the new data.
    req.user.save(function(err) {
        if (err) {
            if (err.name == 'ValidationError') {
                req.flash('updateMsg', 'Error updating, check your data is valid');
            }
            else {
                return next(err);  // Some other DB error
            }
        }

        else {
            req.flash('updateMsg', 'Updated data');
        }

        //Redirect back to secret page, which will fetch and show the updated data.
        return res.redirect('/secret');
    })
});


/* Middleware function. If user is logged in, call next - this calls the next
 middleware (if any) to continue chain of request processing. Typically, this will
 end up with the route handler that uses this middleware being called,
 for example GET /secret.
 If the user is not logged in, call res.redirect to send them back to the home page
 Could also send them to the login or signup pages if you prefer
 res.redirect ends the request handling for this request,
 so the route handler that uses this middleware (in this example, GET /secret) never runs.
 */
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}


module.exports = router;
