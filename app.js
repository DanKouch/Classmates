'use strict';

// Import NPM Modules
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const cookieParser = require('cookie-parser');

const passport = require("passport");
const passportLocal = require('passport-local');

const mongoose = require('mongoose');
const MongoStore = require('connect-mongo')(session);

const flash = require("connect-flash");
const winston = require('winston');

const app = express();
const api = express();

// Set enviroment variables
require("dotenv").config();

// Configure Winston logging
winston.remove(winston.transports.Console);
winston.add(winston.transports.Console, {'timestamp': true, 'colorize': true, 'level': "silly"})

// Configure body parser
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cookieParser(process.env.PASSPORT_SESSION_SECRET));

// Load Database
require("./database.js")

// Load Email Capabilities
var emails = require("./email.js");

// Sessions
app.use(session({
  secret: process.env.PASSPORT_SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({
  	mongooseConnection: mongoose.connection
  })
}));

// Set up passport
app.use(passport.initialize());
app.use(passport.session());
const authentication = require("./authentication.js")
passport.use(new passportLocal.Strategy({session: true}, authentication.authenticate));

// Initialize flash
app.use(flash());

// Public Folder
app.use("/", express.static('./bower_components'));
app.use("/", express.static('./public'));

// App configuration
app.set("view engine", "pug");
app.set('views', './app_server/views');

// Routing
app.use("/", require("./app_server/router.js"));
api.use("/", require("./app_api/router.js"));

// Start HTTP App server
app.set('port', process.env.PORT);
app.listen(app.get('port'), () => {
	winston.info("HTTP App server started on port " + app.get('port'));
});

// Start HTTP API server
api.set('port', process.env.API_PORT);
api.listen(api.get('port'), () => {
  winston.info("HTTP API server started on port " + api.get('port'));
});