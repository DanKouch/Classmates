const mongoose = require("mongoose");
const User = mongoose.model("User");
const bcrypt = require("bcrypt");
const appApiCommon = require("./app_api/apiControllersCommon.js");
const winston = require("winston");
const passport = require("passport");

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});


module.exports.authenticate = function(username, password, done) {
	User.findOne({ username: username }, function (err, user) {
		if (err) {
			return done(err); 
		}
		if (!user) {
			return done(null, false);
		}
		appApiCommon.comparePassword(password, user.password, (bcryptError, result) => {
			if(bcryptError){
				return done(err);
			}
			if(result){
				return done(null, user);
			}else{
				return done(null, false);
			}
		});
	});
};