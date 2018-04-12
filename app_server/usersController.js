const request = require('request');
const winston = require("winston")
const common = require("./appControllerCommon.js");
const email = require("../email.js")

module.exports.getHome = (req, res) => {
	common.render(req, res, "users/home");
}

module.exports.getProfile = (req, res) => {
	common.render(req, res, "users/profile");
}

module.exports.verify = (req, res) => {
	common.requestCommon(req, "/api/user/verify", "POST", {
		emailVerification: req.query.verification,
		userID: req.user.id
	}, (body) => {
		if(body.success){
			res.redirect("/home?messagetype=success&message=Email verification successful.");
		}else{
			res.redirect("/home?messagetype=danger&message=Could not verify email with the supplied verification string.")
		}
	});
}

module.exports.resendVerification = (req, res) => {
	email.sendVerificationMessage(req.user);
	res.redirect("/home?messagetype=info&message=Resent email verification email.");
}