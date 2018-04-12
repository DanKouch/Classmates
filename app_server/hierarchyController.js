const request = require('request');
const winston = require("winston")
const common = require("./appControllerCommon.js");
const config = require("../config.js")

// Schools
module.exports.getSchoolNew = (req, res) => {
	common.render(req, res, "hierarchy/newSchool");
}

module.exports.postSchoolNew = (req, res) => {
	common.requestCommon(req, "/api/school/", "POST", {
		name: req.body.name,
		location: req.body.location,
		domains: req.body.domains,
		limitSignupsByDomain: req.body.limitSignupsByDomain,
		confirmations: 10 // As this is a locked endpoint, give full confirmation
	}, (body) => {
		if(body.success){
			winston.verbose("New school '" + req.body.name + "' has been registered by an administrator");
			res.redirect("/home");
		}else{
			common.render(req, res, "hierarchy/newSchool", {
				errorMessages: body.err
			})
		}
	});
}

module.exports.getSchool = (req, res) => {
	common.requestCommon(req, "/api/user/update-last-school", "PUT", {
		username: req.user.username,
		schoolID: req.query.id
	}, (a)=>{})
	common.requestCommon(req, "/api/school", "GET", {
		id: req.query.id
	}, (bodyOne) => {
		common.requestCommon(req, "/api/teachers", "GET", {
			schoolID: bodyOne.document._id
		}, (bodyTwo) => {
			common.requestCommon(req, "/api/classes", "GET", {
				schoolID: bodyOne.document._id
			}, (bodyThree) => {
			common.render(req, res, "hierarchy/school", {
				school: bodyOne.document,
				teachers: bodyTwo.document,
				classes: bodyThree.document.map((clas) => {
					for(var i = 0; i < bodyTwo.document.length; i++){
						if(bodyTwo.document[i]._id == clas.teacher){
							clas.teacher = bodyTwo.document[i];
							continue;
						}
					}
					return clas
				}),
				errorMessages: bodyTwo.err,
				isMemeber: true,
			});
			})
		});
	});
}

module.exports.getSchools = (req, res) => {
	if(req.query.query){
		common.requestCommon(req, "/api/schools/", "GET", {
			query: req.query.query
		}, (body) => {
			if(body.success){
				common.render(req, res, "hierarchy/schools", {
					errorMessages: body.err,
					schools: body.document
				})
			}else{
				common.render(req, res, "hierarchy/schools", {
					errorMessages: body.err
				})
			}
		});
	}else{
		common.render(req, res, "hierarchy/schools");
	}
}

module.exports.getSchoolRequest = (req, res) => {
	common.render(req, res, "hierarchy/requestSchool");
}

module.exports.postSchoolRequest = (req, res) => {
	common.requestCommon(req, "/api/school/", "POST", {
		name: req.body.name,
		location: req.body.location,
		domains: req.body.domains,
		limitSignupsByDomain: req.body.limitSignupsByDomain,
		confirmations: 1
	}, (body) => {
		if(body.success){
			winston.verbose("School '" + req.body.name + "' has been requested by " + (common.isAdministrator(req) ? "a user" : "an administrator") + ".");
			res.redirect("/home");
		}else{
			common.render(req, res, "hierarchy/requestSchool", {
				errorMessages: body.err
			})
		}
	});
}


// module.exports.confirmSchool = (req, res) => {
// 	common.requestCommon(req, "/api/school/confirm", "PUT", {
// 		username: req.user.username,
// 		id: req.user.id
// 	}, (body) => {
// 		if(body.success){
// 			winston.verbose("School '" + req.body.name + "' has been confirmed by " + (common.isAdministrator(req) ? "a user" : "an administrator") + ".");
// 			res.redirect(req.originalURL);
// 		}else{
// 			common.render(req, res, "hierarchy/schools", {
// 				errorMessages: body.err
// 			})
// 		}
// 	});
// }


// Teachers

module.exports.getNewTeacher = (req, res) => {
	common.requestCommon(req, "/api/school", "GET", {
		id: req.query.schoolID
	}, (body) => {
		common.render(req, res, "hierarchy/newTeacher", {
			school: body.document,
			errorMessages: body.err
		})
	});
}

module.exports.postNewTeacher = (req, res) => {
	common.requestCommon(req, "/api/teacher/", "POST", {
		schoolID: req.query.schoolID,
		name: req.body.name
	}, (body) => {
		if(body.success){
			res.redirect("/school?id="+req.query.schoolID+"&message=Successfully added teacher.&messagetype=success");
		}else{
			res.redirect("/school?id="+req.query.schoolID+"&message=Could not add teacher.&messagetype=danger");
		}
	
	});
}

module.exports.getTeacher = (req, res) => {
	common.requestCommon(req, "/api/teacher", "GET", {
		id: req.query.id
	}, (bodyOne) => {
		common.requestCommon(req, "/api/classes/teacher", "GET", {
			teacherID: req.query.id
		}, (bodyTwo) => {
			common.requestCommon(req, "/api/school", "GET", {
				id: bodyOne.document.school
			}, (bodyThree) => {
				common.render(req, res, "hierarchy/teacher", {
					school: bodyThree.document,
					teacher: bodyOne.document,
					classes: bodyTwo.document,
					errorMessages: bodyTwo.err
				});
			});
		});
	});
}


// Classes

module.exports.getNewClass = (req, res) => {
	common.requestCommon(req, "/api/school", "GET", {
		id: req.query.schoolID
	}, (bodyOne) => {
		common.requestCommon(req, "/api/teachers", "GET", {
			schoolID: bodyOne.document._id
		}, (bodyTwo) => {
			common.render(req, res, "hierarchy/newClass", {
				school: bodyOne.document,
				teachers: bodyTwo.document,
				errorMessages: bodyTwo.err,
				isMemeber: true,
			})
		});
	});
}

module.exports.postNewClass = (req, res) => {
	common.requestCommon(req, "/api/class/", "POST", {
		schoolID: req.query.schoolID,
		teacherID: req.body.teacherID,
		subject: req.body.subject,
		period: req.body.period
	}, (body) => {
		if(body.success){
			res.redirect("/school?id="+req.query.schoolID+"&message=Successfully added class.&messagetype=success");
		}else{
			res.redirect("/school?id="+req.query.schoolID+"&message=Could not add class.&messagetype=danger");
		}
	
	});
}

module.exports.getClass = (req, res) => {
	common.requestCommon(req, "/api/class", "GET", {
		id: req.query.id
	}, (bodyOne) => {
		common.requestCommon(req, "/api/teacher", "GET", {
			id: bodyOne.document.teacher
		}, (bodyTwo) => {
			common.requestCommon(req, "/api/school", "GET", {
				id: bodyOne.document.school
			}, (bodyThree) => {
				common.render(req, res, "hierarchy/class", {
					clas: bodyOne.document,
					teacher: bodyTwo.document,
					school: bodyThree.document,
					errorMessages: bodyTwo.err
				});
			});
		});
	});
}

