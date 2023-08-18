const express = require('express');
const { check } = require('express-validator')
const router = express.Router();

const UsersControllers = require('../controllers/users-controller')

router.get('/', UsersControllers.getUsers);

router.post('/signup', [check('name').not().isEmpty(), check('email').normalizeEmail().isEmail(), check('password').isLength({ min: 6 })], UsersControllers.signUp);

router.post('/login', UsersControllers.login);


module.exports = router;