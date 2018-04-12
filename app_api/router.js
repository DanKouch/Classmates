'use strict';

// Modules to setup
const express = require('express');
const path = require('path');

const accountController = require("./accountsController");
const heigharchyController = require("./heigharchyController");
var router = express.Router();

// Users
router.post("/api/user", accountController.registerUser);
router.get("/api/user/:username", accountController.findUserByUsername);
router.post("/api/user/verify", accountController.verify);
router.put("/api/user/update-last-school", accountController.updateLastSchool);

// Schools
router.post("/api/school", heigharchyController.createSchool);
//router.put("/api/school/confirm", heigharchyController.confirmSchool);
router.get("/api/school", heigharchyController.findSchoolById);
router.get("/api/schools", heigharchyController.findSchoolsBySearch);

// // Teacher
router.post("/api/teacher", heigharchyController.createTeacher);
router.get("/api/teacher", heigharchyController.findTeacherById);
router.get("/api/teachers", heigharchyController.findTeachersBySchool);

// // Class
router.post("/api/class", heigharchyController.createClass);
router.get("/api/class", heigharchyController.findClassById);
router.get("/api/classes", heigharchyController.findClassesBySchool)
router.get("/api/classes/teacher", heigharchyController.findClassesByTeacher)

module.exports = router;