const accountControllers = require("./accountsController");
const common = require("./apiControllersCommon");

const mongoose = require('mongoose');
const winston = require('winston');
const bcrypt = require("bcrypt")
const util = require("util");
const passport = require("passport");
const email = require("../email.js")

const User = mongoose.model("User");
const School = mongoose.model("School");
var ObjectId = require('mongoose').Types.ObjectId;

module.exports.findUserByUsername = (req, res) => {
	common.ensureQueryParameters(res, [req.query.username], () => {
		common.findAndSendDocumentInModel(res, User, {'username': req.query.username}, (doc) => {});
	});
}

module.exports.registerUser = (req, res) => {
	common.ensureQueryParameters(res, [req.query.username, req.query.password, req.query.email], () => {
		common.hashPasswordWithResponse(res, req.query.password, (hashedPassword) => {
			common.createAndSendDocumentInModel(res, User, {
				username: req.query.username,
				password: hashedPassword,
				email: req.query.email.toLowerCase()
			}, (doc) => {
				if(doc){
					winston.info("New user '" + doc.username + "' created");
					// Send email
					email.sendWelcomeMessage(doc);
				}
			});
		});
	});
}

module.exports.verify = (req, res) => {
	common.ensureQueryParameters(res, [req.query.emailVerification, req.query.userID], () => {
		common.findDocumentAndSendErrorsInModel(res, User, {'_id': req.query.userID}, (doc) => {
			if(doc.emailVerification == req.query.emailVerification){
				doc.emailVerified = true;
				doc.save();
				winston.info("User " + doc.username + " has verified their account.");
				email.sendRegistrationCompleteMessage(doc);
				common.jsonResponse(res, common.statusCodes.OK, {
					success: true
				});
			}else{
				common.jsonResponse(res, common.statusCodes.OK, {
					success: false
				});
			}
		});
	});
}

module.exports.updateLastSchool = (req, res) => {
	common.ensureQueryParameters(res, [req.query.username, req.query.schoolID], () => {
		common.findDocumentAndSendErrorsInModel(res, User, {'username': req.query.username}, (user) => {
			common.findAndSendDocumentsInModel(res, School, {"_id": new ObjectId(req.query.schoolID)}, 50, (school) => {
				user.lastSchoolVisited = school;
				user.save();
				winston.info("hubub")
			});
		});
	});
}