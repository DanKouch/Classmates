'use strict';

const nodemailer = require("nodemailer");
const winston = require("winston");
const pug = require("pug");
const path = require("path");
const config = require("./config");

module.exports.transporter = nodemailer.createTransport(process.env.EMAIL_CONNECTION_STRING);
var sender = process.env.EMAIL_SENDER;

module.exports.sendWelcomeMessage = (user) => {
	module.exports.transporter.sendMail({
		from: sender,
		to: user.email,
		subject: "Welcome to classmates!",
		html: pug.renderFile("./app_server/views/emails/welcome.pug", {user: user, config: config})
	}, (err, info) => {
		if(err){
			winston.error(err);
			winston.error("Could not send welcome message to " + user.username + ".");
		}else{
			winston.info(info);
		}
	})
}

module.exports.sendVerificationMessage = (user) => {
	module.exports.transporter.sendMail({
		from: sender,
		to: user.email,
		subject: "Welcome to classmates!",
		html: pug.renderFile("./app_server/views/emails/verification.pug", {user: user, config: config})
	}, (err, info) => {
		if(err){
			winston.error(err);
			winston.error("Could not send verification message to " + user.username + ".");
		}else{
			winston.info(info);
		}
	})
}

module.exports.sendRegistrationCompleteMessage = (user) => {
	module.exports.transporter.sendMail({
		from: sender,
		to: user.email,
		subject: "Registration Complete",
		html: pug.renderFile("./app_server/views/emails/registrationComplete.pug", {user: user, config: config})
	}, (err, info) => {
		if(err){
			winston.error(err);
			winston.error("Could not send registration complete message to " + user.username + ".");
		}else{
			winston.info(info);
		}
	})
}