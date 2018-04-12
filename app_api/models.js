'use strict'

const winston = require('winston');

const mongoose = require('mongoose')
const Schema = mongoose.Schema;

// Sanitation and Validation Modules
const validate = require("mongoose-validate")
const mongooseUniqueValidator = require("mongoose-unique-validator")
const sanitizer = require("mongo-sanitize")
const crypto = require("crypto")

/*
* User Schema
*/
let userSchema = new Schema({
	dateJoined:				{type: Date, default: new Date()},
	password: 				{type: String, required: true, minlength: 6},
	username: 				{type: String, required: true, unique: true, minlength: 5, maxlength:20, validate: [validate.alphanumeric, 'username must be alphanumeric']},
	email: 					{type: String, required: true, unique: true, validate: [validate.email, 'invalid email']},
	emailVerification: 		{type: String, default: (crypto.randomBytes(20).toString("hex"))},
	emailVerified:			{type: Boolean, default: false},
	lastSchoolVisited: 		{type: mongoose.Schema.Types.ObjectId, ref: "School"},
	role: 					{type: String, enum: ["administrator", "user"], default: "user"},
	schools: 				[{
								schoolId: {
									type: mongoose.Schema.Types.ObjectId,
									ref: "School"
								}
							}],
	schoolsConfirmed: 		[{
								schoolId: {
									type: mongoose.Schema.Types.ObjectId,
									ref: "School"
								}
							}]	
});

userSchema.plugin(sanitizer)
userSchema.plugin(mongooseUniqueValidator, {message: "That {PATH} has already been taken."})
mongoose.model("User", userSchema);

/*
* School Schema
*/
let schoolSchema = new Schema({
	dateCreated:			{type: Date, default: new Date()},
	name: 					{type: String, required: true, unique: true},
	location:				{type: String},
	confirmations: 			{type: Number},
	confirmers: 			[String],
	confirmed: 				{type: Boolean, default: false},
	domains: 				[{
								type: String
							}],
	limitSignupsByDomain: 	{type: Boolean, default: true},
	teachers: 				[{
								userId: {
									type: mongoose.Schema.Types.ObjectId,
									ref: "Teacher"
								}
							}],
	classes: 					[{
								userId: {
									type: mongoose.Schema.Types.ObjectId,
									ref: "Class"
								}
							}]	
});

schoolSchema.index({name: 'text'});

schoolSchema.plugin(sanitizer)
schoolSchema.plugin(mongooseUniqueValidator, {message: "That {PATH} has already been taken."})
mongoose.model("School", schoolSchema);

/*
* Teacher Schema
*/
let teacherSchema = new Schema({
	dateCreated:			{type: Date, default: new Date()},
	name: 					{type: String, required: true},
	school: 				{type: mongoose.Schema.Types.ObjectId, ref: "School", required: true},
	classes: 				[{type: mongoose.Schema.Types.ObjectId, ref: "Class"}]
});

teacherSchema.plugin(sanitizer)
mongoose.model("Teacher", teacherSchema);

/*
* Class Schema
*/
let classSchema = new Schema({
	dateCreated:			{type: Date, default: new Date()},
	period: 				{type: Number, required: true},
	subject: 				{type: String, required: true}, 
	teacher: 				{type: mongoose.Schema.Types.ObjectId, ref: "Teacher", required: true},
	school: 				{type: mongoose.Schema.Types.ObjectId, ref: "School", required: true}
});

classSchema.plugin(sanitizer)
mongoose.model("Class", classSchema);