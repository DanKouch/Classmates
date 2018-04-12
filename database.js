'use strict';

// Require modules
const mongoose = require('mongoose')
const winston = require('winston')

const dbURI = (process.env.NODE_ENV === "production") ? process.env.MONGOLAB_URI : 'mongodb://localhost/classmates'

mongoose.connect(dbURI, {useMongoClient: true}).then(
	() => {
		winston.info("Connected to mongodb server at '" + dbURI + "'");
	},
	err => {
		winston.error("Database Error: " + err)
	}
);

mongoose.connection.on("error", (err) => {
	winston.error("Database Error: " + err)
});

mongoose.connection.on("disconnected", () => {
	winston.warn("Disconnected from mongoose database.");	
});

// Load models
require("./app_api/models.js");