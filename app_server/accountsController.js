const winston = require("winston");
const passport = require("passport");
const common = require("./appControllerCommon.js");

module.exports.getBase = (req, res) => {
	if(req.isAuthenticated) {
		res.redirect("/home");
	}else{
		common.render(req, res, "index");
	}
}

// Login
module.exports.getLogin = (req, res) => {
	if(req.isAuthenticated()){
		res.redirect("/");
	}else{
		common.render(req, res, "accounts/login", {
			errorMessages: {
				login: req.flash('error')
			}
		});
	}
}

module.exports.postLogin = passport.authenticate('local', { successRedirect: '/home', failureRedirect: '/login', failureFlash: "Invalid username/password."});

// Register
module.exports.getRegister = (req, res) => {
	common.render(req, res, "accounts/register");
}

module.exports.postRegister = (req, res) => {
	common.requestCommon(req, "/api/user", "POST", {
		username: req.body.username,
		password: req.body.password,
		email: req.body.email
	}, (body) => {
		if(body.success){
			winston.verbose("New user '" + req.body.username + "' has registered.");
			res.redirect("/home");
		}else{
			common.render(req, res, "accounts/register", {
				errorMessages: body.err
			})
		}
	});
}

// Logout
module.exports.getLogout = (req, res) => {
	req.logout();
	res.redirect('/login');
}
