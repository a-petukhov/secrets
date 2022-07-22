//jshint esversion:8
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));

mongoose.connect('mongodb://localhost:27017/secretsDB');

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

const secret = 'This is our little secret.';
userSchema.plugin(encrypt, {secret: secret, encryptedFields: ['password']});

const User = new mongoose.model('User', userSchema);

app.get('/', (req, res) => {
    res.render('home');
});

app.route('/login')
    .get((req, res) => {
        res.render('login');
    })
    .post((req, res) => {
        User.findOne({email: req.body.username}, (err, result) => {
            if (err) {console.log(err);}
            else {
                if (result) {
                    if (result.password == req.body.password) {
                        res.render('secrets');}
                    else {
                        console.log('Password doesn\'t match.');
                        res.redirect('/login');
                    }
                } else {
                    console.log('User not found.');
                        res.redirect('/login');
                }
                }});
});


app.route('/register')
    .get((req, res) => {
        res.render('register');
    })
    .post((req, res) => {
        const newUser = new User ({
            email: req.body.username,
            password: req.body.password
        });

        newUser.save((err) => {
            if (err) {console.log(err);}
            else {res.render('secrets');}
        });
});

let port = process.env.PORT;
if (port == null || port == '') {
    port = 3000;
}

app.listen(port, (req, res) => {
    console.log('Server is now running at port ' + port +'.');
});