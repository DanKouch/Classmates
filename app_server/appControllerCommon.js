const request = require('request');
const config = require("../config.js");

const apiOptions = {
	server : "http://localhost:" + process.env.API_PORT
};

module.exports.isAdministrator = (req) => { return req.isAuthenticated() && req.user.role == "administrator"; }

module.exports.requestCommon = (req, url, method, qs, callback) => {
	const requestOptions = {
		url: apiOptions.server + url,
		method: method,
		json: {},
		qs: qs
	}
	request(requestOptions, (err, response, body) => {
		if(err){
			winston.error("API Request Error: " + err);
		}
		callback(body);
	});
}

module.exports.render = (req, res, page, data) => {
	data = data || {};
	data.user = req.user;
	data.config = config;
	
	data.message = req.query.message
	data.messageType = req.query.messagetype;

	res.render(page, data)
};