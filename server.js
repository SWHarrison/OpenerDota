//https://www.makeschool.com/academy/track/reddit-clone-in-node-js/tutorial/sign-up-and-login

require('dotenv').config();
var mongoose = require('mongoose');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const bcrypt = require('bcryptjs');
var cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');

const express = require('express')
const app = express()

// Use Body Parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Add after body parser initialization!
app.use(expressValidator());

require('./data/dota-db');

const route = require('./controllers/routes.js');

var exphbs = require('express-handlebars');

app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

module.exports = app

var checkAuth = (req, res, next) => {
  console.log("Checking authentication");
  if (typeof req.cookies.nToken === "undefined" || req.cookies.nToken === null) {
    req.user = null;
  } else {
    var token = req.cookies.nToken;
    var decodedToken = jwt.decode(token, { complete: true }) || {};
    req.user = decodedToken.payload;
  }

  next();
};

app.use(checkAuth);

route(app)

app.listen(process.env.PORT || '3000', () => {
    console.log(`App listening on port 3000!`)
})
