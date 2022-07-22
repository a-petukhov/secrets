//jshint esversion:8
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.render('home');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/register', (req, res) => {
    res.render('register');
});

let port = process.env.PORT;
if (port == null || port == '') {
    port = 3000;
}

app.listen(port, (req, res) => {
    console.log('Server is now running at port ' + port +'.');
});