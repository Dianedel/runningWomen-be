const express = require('express');
const bcrypt = require("bcrypt");
const User = require("../models/user-model.js");
const Mailbox = require("../models/mailbox-model.js");

const router  = express.Router();

/* GET home page */
router.get('/', (req, res, next) => {
  res.render('index');
});

module.exports = router;
