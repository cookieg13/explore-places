const uuid = require('uuid');
const HttpError = require('../models/http-error');
const { validationResult } = require('express-validator');
const User = require('../models/user')

const getUsers = async (req, res, next) => {
    let users;
    try {
        users = await User.find({}, '-password')
    } catch (err) {
        const error = new HttpError('Fetching users failed, please try again later.', 500);
        return next(error);
    }
    res.status(200).json({ users: users.map(user => user.toObject({ getters: true })) });
}

const signUp = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors);
        const err = new HttpError('Invalid inputs passed. Please check your data.', 422);
        //throw err;// error can originate by throwing inside of an async function
        return next(err);
    }
    const { name, email, password } = req.body;
    let existingUser;
    try {
        existingUser = await User.findOne({ name: name, email: email, password: password })
    }
    catch (err) {
        const error = new HttpError('Signing up failed, please try again later', 500);
        return next(error);
    }
    if (existingUser) {
        const error = new HttpError('User exists already, please login instead.', 422);
        return next(error);
    }
    const createdUser = new User({
        name,
        email,
        image: 'https://www.freepik.com/free-psd/3d-illustration-person-with-sunglasses-green-hair_27470346.htm#query=avatar&position=16&from_view=keyword&track=sph',
        password,
        places: [],
    })
    try {
        createdUser.save().then(function (err) {
            if (!err) {
                res.send("Successfully Added to th DataBase.");
            } else {
                res.send(err);
            }
        });
    } catch (err) {
        const error = new HttpError('Signing up failed, please try again later.', 500);
        return next(error); //stop code exec
    }
    res.status(201).json({ user: createdUser.toObject({ getters: true }) });
}

const login = async (req, res, next) => {
    const { email, password } = req.body;
    const placeId = req.params.pid; // { pid: 'p1' }
    let existingUser;
    try {
        existingUser = await User.findOne({ email: email })
    }
    catch (err) {
        const error = new HttpError('Logging in failed, please try again later.', 500);
        return next(error);
    }
    if (!existingUser || existingUser.password !== password) {
        const error = new HttpError('Invalid credentials, could not log you in.', 401);
        return next(error);
    }
    res.status(200).json({ message: "Login successful!" })
}

exports.getUsers = getUsers;
exports.signUp = signUp;
exports.login = login;
