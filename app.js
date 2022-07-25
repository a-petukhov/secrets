//jshint esversion:8
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static('public'));
app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(process.env.MONGO);

const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    active: Boolean
});

userSchema.plugin(passportLocalMongoose, {
    // Set usernameUnique to false to avoid a mongodb index on the username column!
    usernameUnique: false,
  
    findByUsername: function(model, queryParameters) {
      // Add additional query parameter - AND condition - active: true
      queryParameters.active = true;
      return model.findOne(queryParameters);
    }
  });

const User = new mongoose.model('User', userSchema);

// CHANGE: USE "createStrategy" INSTEAD OF "authenticate"
passport.use(User.createStrategy());

// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get('/', function (req, res) {
    res.render('home');
});

app.route('/secrets')
.get(function (req, res) {
    if (req.isAuthenticated()) {
        res.render('secrets');
    } else {
        res.redirect('/login');
    }
});

app.route('/login')
    .get(function (req, res) {
        res.render('login');
    })
    .post(function (req, res) {
        const user = new User({
            username: req.body.username,
            password: req.body.password
        });
        req.login(user, function (err) {
            if (err) {
                console.log(err);
            } else {
                passport.authenticate('local')(req, res, () => {
                    res.redirect('/secrets');
                });
            }
        });
    });

app.route('/register')
    .get(function (req, res) {
        res.render('register');
    })
    .post(function (req, res) {
        User.register({username: req.body.username, active: true}, req.body.password, function(err, user) {
            if (err) {
                console.log(err);
                res.redirect('/register');
            } else {
                passport.authenticate('local')(req, res, () => {
                    res.redirect('/secrets');
                });
        }});
    });

app.get('/logout', function (req, res) {
    req.logout((err) => {
        if (err) {
            console.log(err);
        }
        res.redirect('/');
    });
});


let port = process.env.PORT;
if (port == null || port == '') {
    port = 3000;
}

app.listen(port, function (req, res) {
    console.log('Server is now running at port ' + port + '.');
});