'use strict';

// Modules to setup
const express = require("express");
const passport = require("passport");
const winston = require("winston");
const flash = require("connect-flash");
var router = express.Router();

// Controllers
const accountsController = require("./accountsController");
const usersController = require("./usersController");
const hierarchyController = require("./hierarchyController");

const ensureLoggedIn = (req, res, next) => { req.isAuthenticated() ? next() : res.redirect("/login"); }
const ensureAdministrator = (req, res, next) => { req.isAuthenticated() && req.user.role == "administrator" ? next() : res.redirect("/login"); }

// Base
router.get("/", accountsController.getBase);

// Accounts
router.get("/login", accountsController.getLogin);
router.post("/login", accountsController.postLogin);
router.get("/register", accountsController.getRegister);
router.post("/register", accountsController.postRegister);
router.get("/logout", accountsController.getLogout);
router.get("/account/delete", (req, res) => {}); // TO-DO
router.post("/account/delete", (req, res) => {}); // TO-DO

router.get("/home", ensureLoggedIn, usersController.getHome);
router.get("/profile", ensureLoggedIn, usersController.getProfile); // TO-DO
router.get("/verify", ensureLoggedIn, usersController.verify);
router.get("/resend-verification", ensureLoggedIn, usersController.resendVerification);

// Heigharchy - Schools
router.get("/school", ensureLoggedIn, hierarchyController.getSchool);
//router.get("/school/confirm", ensureLoggedIn, hierarchyController.confirmSchool);
router.get("/schools", ensureLoggedIn, hierarchyController.getSchools);
router.get("/school/new", ensureLoggedIn, hierarchyController.getSchoolNew)
router.post("/school/new", ensureAdministrator, hierarchyController.postSchoolNew)
router.get("/school/request", ensureLoggedIn, hierarchyController.getSchoolRequest)
router.post("/school/request", ensureLoggedIn, hierarchyController.postSchoolRequest)

// Heigharchy - Teachers
router.get("/teacher/new", ensureLoggedIn, hierarchyController.getNewTeacher);
router.post("/teacher/new", ensureLoggedIn, hierarchyController.postNewTeacher);
router.get("/teacher", ensureLoggedIn, hierarchyController.getTeacher);

// Heigharchy - Classes
router.get("/class/new", ensureLoggedIn, hierarchyController.getNewClass);
router.post("/class/new", ensureLoggedIn, hierarchyController.postNewClass);
router.get("/class", ensureLoggedIn, hierarchyController.getClass);


module.exports = router;