const accountControllers = require("./accountsController");
const common = require("./apiControllersCommon");

const mongoose = require('mongoose');
const winston = require('winston');
const bcrypt = require("bcrypt")
const util = require("util");
const passport = require("passport");
const config = require("../config.js")

const User = mongoose.model("User");
const School = mongoose.model("School");
const Teacher = mongoose.model("Teacher");
const Class = mongoose.model("Class");

var ObjectId = require('mongoose').Types.ObjectId;

// Find by ID
module.exports.findSchoolById = (req, res) => {
	common.ensureQueryParameters(res, [req.query.id], () => {
		common.findAndSendDocumentInModel(res, School, {'_id': req.query.id}, (doc) => {});
	});
}

module.exports.findTeacherById = (req, res) => {
	common.ensureQueryParameters(res, [req.query.id], () => {
		common.findAndSendDocumentInModel(res, Teacher, {'_id': req.query.id}, (doc) => {});
	});
}

module.exports.findClassById = (req, res) => {
	common.ensureQueryParameters(res, [req.query.id], () => {
		common.findAndSendDocumentInModel(res, Class, {'_id': req.query.id}, (doc) => {});
	});
}

// TO-DO USER SCHOOL MEMBERSHIP
// module.exports.confirmSchool = (req, res) => {
// 	common.ensureQueryParameters(res, [req.query.id, req.query.username], () => {
// 		common.findDocumentAndSendErrorsInModel(res, School, {"_id": req.query.id}, (school) => {
// 		common.findDocumentAndSendErrorsInModel(res, User, {'_id': req.query.userID}, (doc) => {
// 			winston.error(school)
// 			if(school){
// 				if(school.confirmers.includes(req.query.username)){
// 					module.exports.jsonResponse(res, module.exports.statusCodes.SERVER_ERROR, {
// 						success: false,
// 						err: {
// 							server: "This user has already confirmed this school."
// 						}
// 					});
// 					return;
// 				}

// 				school.confirmers.push(req.query.username);
// 				school.confirmations ++;
// 				school.confirmed = school.confirmations >= config.requiredConfirmationsForSchools;
// 				school.save();

// 				console.log(school)
// 			}
// 		});
// 	});
// }


// Find by search
module.exports.findSchoolsBySearch = (req, res) => {
	common.ensureQueryParameters(res, [req.query.query], () => {
		common.findAndSendDocumentsInModel(res, School, {"$text":{"$search": req.query.query}}, 50, (doc) => {});
	});
}

// Find by other schema
module.exports.findTeachersBySchool = (req, res) => {
	winston.error(req.query)
	common.ensureQueryParameters(res, [req.query.schoolID], () => {
		common.findAndSendDocumentsInModel(res, Teacher, {"school":{"_id": new ObjectId(req.query.schoolID)}}, 50, (doc) => {});
	});
}

module.exports.findClassesBySchool = (req, res) => {
	common.ensureQueryParameters(res, [req.query.schoolID], () => {
		common.findAndSendDocumentsInModel(res, Class, {"school":{"_id": new ObjectId(req.query.schoolID)}}, 50, (doc) => {});
	});
}

module.exports.findClassesByTeacher = (req, res) => {
	common.ensureQueryParameters(res, [req.query.teacherID], () => {
		common.findAndSendDocumentsInModel(res, Class, {"teacher":{"_id": new ObjectId(req.query.teacherID)}}, 50, (doc) => {});
	});
}


// Generators
module.exports.createSchool = (req, res) => {
	common.ensureQueryParameters(res, [req.query.name, req.query.domains], () => {
		var domains = req.query.domains.split(",").map((domain) => domain.trim());
		common.createAndSendDocumentInModel(res, School, {
			name: req.query.name,
			location: req.query.location,
			domains: domains,
			confirmations: req.query.confirmations,
			confirmed: req.query.confirmations >= config.requiredConfirmationsForSchools,
			limitSignupsByDomain: req.query.limitSignupsByDomain,
		}, (doc) => {
			
			if(doc){
				winston.info("New school '" + doc.name + "' created");
			}
		});
	})
}

module.exports.createTeacher = (req, res) => {
	common.ensureQueryParameters(res, [req.query.name, req.query.schoolID], () => {
		var id = new ObjectId(req.query.schoolID);
		School.findOne({_id: id}).exec((err, school) => {
			if(!school){
				module.exports.jsonResponse(res, module.exports.statusCodes.DOES_NOT_EXIST, {
					success: false,
					err: {
						server: "School ID does does not exist."
					}
				});
				return;
			}
			if(err){
				module.exports.jsonResponse(res, module.exports.statusCodes.SERVER_ERROR, {
					success: false,
					err: {
						server: "Server error. Please contact the system administrator."
					}
				});
				winston.error("Database Error: " + err);
				return;
			}
			
			// Found school
			common.createAndSendDocumentInModel(res, Teacher, {
				name: req.query.name,
				school: school
			}, (doc) => {
				school.teachers.push(doc);
				school.save();
				if(doc){
					winston.info("New teacher '" + doc.name + "' added to " + school.name + ".");
				}
			});
		});	
	})
}

module.exports.createClass = (req, res) => {
	common.ensureQueryParameters(res, [req.query.subject, req.query.period, req.query.schoolID, req.query.teacherID], () => {
		var actualSchoolID = new ObjectId(req.query.schoolID);
		School.findOne({_id: actualSchoolID}).exec((err, school) => {
			if(!school){
				module.exports.jsonResponse(res, module.exports.statusCodes.DOES_NOT_EXIST, {
					success: false,
					err: {
						server: "School ID does does not exist."
					}
				});
				return;
			}
			if(err){
				module.exports.jsonResponse(res, module.exports.statusCodes.SERVER_ERROR, {
					success: false,
					err: {
						server: "Server error. Please contact the system administrator."
					}
				});
				winston.error("Database Error: " + err);
				return;
			}

			var actualTeacherID = new ObjectId(req.query.teacherID);
			Teacher.findOne({_id: actualTeacherID}).exec((err, teacher) => {
				if(!school){
					module.exports.jsonResponse(res, module.exports.statusCodes.DOES_NOT_EXIST, {
						success: false,
						err: {
							server: "School ID does does not exist."
						}
					});
					return;
				}
				if(err){
					module.exports.jsonResponse(res, module.exports.statusCodes.SERVER_ERROR, {
						success: false,
						err: {
							server: "Server error. Please contact the system administrator."
						}
					});
					winston.error("Database Error: " + err);
					return;
				}

				// Found both
				common.createAndSendDocumentInModel(res, Class, {
					subject: req.query.subject,
					period: req.query.period,
					school: school,
					teacher: teacher
				}, (doc) => {
					school.classes.push(doc);
					school.save();
					teacher.classes.push(doc);
					teacher.save();
					if(doc){
						winston.info("New class added to " + school.name + ".");
					}
				});

			});
		});	
	})
}
