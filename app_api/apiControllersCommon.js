const bcrypt = require("bcrypt")
var ObjectId = require('mongoose').Types.ObjectId;
const winston = require("winston")

module.exports.statusCodes = {
	OK: 			200,
	DOES_NOT_EXIST: 400,
	SERVER_ERROR: 	200,
	CLIENT_ERROR: 	400
}

module.exports.jsonResponse = (res, statusCode, content) => {
	res.status(statusCode);
	res.json(content);
}

module.exports.comparePassword = (password, hash, callback) => {
	bcrypt.compare(password, hash, callback);
}

module.exports.generateValidatorErrorObject = (error) => {
	var errorObject = {field: error.path};
	if(error.kind == "minlength"){
		errorObject.message =  "Your " + error.path + " is not long enough."
	}
	if(error.kind == "maxlength"){
		errorObject.message =  "Your " + error.path + " is too long."
	}
	if(error.kind == "unique"){
		errorObject.message = "That " + error.path + " is already in use. Please select another."
	}
	if(error.kind == "required"){
		errorObject.message = "Missing field '" + error.path + "'."
	}
	if(!errorObject.message){
		winston.error("Unrecognized API database error: " + JSON.stringify(error))
	}
	return errorObject;
}

// 
module.exports.hashPasswordWithResponse = (res, password, callback) => {
	bcrypt.hash(password, 512, (bcryptError, hashedPassword) => {
		if(bcryptError || !hashedPassword){
			module.exports.jsonResponse(res, module.exports.statusCodes.SERVER_ERROR, {
				success: false,
				err: "A server error has occoured."
			})
			winston.error("Bcrypt Error: " + bcryptError);
			return;
		}
		callback(hashedPassword);
	});
}

module.exports.createAndSendDocumentInModel = (res, model, documentContents, callback) => {
	model.create(documentContents, (err, doc) => {
		if(err){
			var errorObjects = Object.values(err.errors).map((err) => {
				return (module.exports.generateValidatorErrorObject(err));
			});



			var errorObject = errorObjects.reduce((acc, cur, i) => {
				acc[cur.field] = cur.message;
				return acc
			}, {});

			if(errorObjects.length > 0){
				module.exports.jsonResponse(res, module.exports.statusCodes.CLIENT_ERROR, {
					success: false,
					err: errorObject
				})
			}else{
				module.exports.jsonResponse(res, module.exports.statusCodes.SERVER_ERROR, {
					success: false,
					err: {
						server: "A database error has occoured."
					}
				})
				winston.error("Database Error: " + err);
			}
			callback(null);
		}else{
			module.exports.jsonResponse(res, module.exports.statusCodes.OK, {
				success: true,
				document: doc
			});
			callback(doc);
		}
	});
}

module.exports.findAndSendDocumentInModel = (res, model, query, callback) => {
	if(query._id){
			query._id = new ObjectId(query._id);
	}
	model.findOne(query).exec((err, doc) => {
		if(!doc){
			module.exports.jsonResponse(res, module.exports.statusCodes.DOES_NOT_EXIST, {
				success: false,
				err: {
					server: "The requested document does not exist."
				}
			});
			callback(null);
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
			callback(null);
			return;
		}
		module.exports.jsonResponse(res, module.exports.statusCodes.OK, {
			success: true,
			document: doc
		});
		callback(doc);
	});
}


module.exports.findDocumentAndSendErrorsInModel = (res, model, query, callback) => {
	if(query._id){
			query._id = new ObjectId(query._id);
	}
	model.findOne(query).exec((err, doc) => {
		if(!doc){
			module.exports.jsonResponse(res, module.exports.statusCodes.DOES_NOT_EXIST, {
				success: false,
				err: {
					server: "The requested document does not exist."
				}
			});
			callback(null);
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
			callback(null);
			return;
		}
		callback(doc);
	});
}

module.exports.findAndSendDocumentsInModel = (res, model, query, limit, callback) => {
	if(query._id){
			query._id = new ObjectId(query._id);
	}
	model.find(query, (err, docs) => {
		if(err){
			module.exports.jsonResponse(res, module.exports.statusCodes.SERVER_ERROR, {
				success: false,
				err: {
					server: "Server error. Please contact the system administrator."
				}
			});
			winston.error("Database Error: " + err);
			callback(null);
			return;
		}
		module.exports.jsonResponse(res, module.exports.statusCodes.OK, {
			success: true,
			document: docs
		});
		callback(docs);
	});
}

module.exports.ensureQueryParameters = (res, parameters, callback) => {
	for (var i = 0; i <= parameters.length; i++) {
		if(i == parameters.length){
			callback();
			return;
		}
		if(!(parameters[i])){
			break;
		}
	}
	module.exports.jsonResponse(res, module.exports.statusCodes.CLIENT_ERROR, {
		success: false,
		err: {
			server: "Invalid request parameters."
		}
	});
	return;
}