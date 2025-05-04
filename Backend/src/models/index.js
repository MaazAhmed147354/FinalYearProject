"use strict";

const { sequelize } = require('../config/database');
const User = require('./userModel');
const Job = require('./jobModel');
const Email = require('./emailModel');
const Candidate = require('./candidateModel');
const Resume = require('./resumeModel');
const { CriteriaSet, CriteriaSkill, CriteriaKeyword } = require('./criteriaModel');
const { Interview, InterviewParticipant } = require('./interviewModel');
const Report = require('./reportModel');
const ResumeScore = require('./resumeScoreModel');

// Additional models can be added here

// Define all associations
// These associations are already defined in individual models, but we can
// add any additional associations here if needed

const models = {
  User,
  Job,
  Email,
  Candidate,
  Resume,
  CriteriaSet,
  CriteriaSkill,
  CriteriaKeyword,
  Interview,
  InterviewParticipant,
  Report,
  ResumeScore,
  sequelize
};

module.exports = models;