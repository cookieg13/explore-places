const uuid = require('uuid');
const HttpError = require('../models/http-error');
const { validationResult } = require('express-validator');

let DUMMY_USERS = [
    {
        id: 'u1',
        name: 'Debarati Ghatak',
        email: 'test@test',
        password: 'test',
    },
    {
        id: 'u3',
        name: 'DebayanGhatak',
        email: 'test1@test',
        password: 'test',
    }
];

const getUsers = (req, res, next) => {
    res.status(200).json({ users: DUMMY_USERS })

}

const signUp = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors);
        const err = new HttpError('Invalid inputs passed. Please check your data.', 422);
        throw err;
    }
    const { name, email, password } = req.body;
    const createdUser = {
        id: uuid.v4(),
        name: name,
        email: email,
        password: password
    }
    DUMMY_USERS.push(createdUser)
    res.status(201).json({ user: createdUser })
}

const login = (req, res, next) => {
    const { email, password } = req.body;
    let identifiedUser = DUMMY_USERS.find(u =>
        u.email == email)
    if (!identifiedUser || identifiedUser.password !== password) {
        const err = new HttpError('Incorrect email or password', 401);
        throw err;
    }
    res.status(200).json({ message: "Login successful!" })
}

exports.getUsers = getUsers;
exports.signUp = signUp;
exports.login = login;
