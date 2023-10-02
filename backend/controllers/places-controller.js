const HttpError = require('../models/http-error');
const uuid = require('uuid');
const { validationResult } = require('express-validator');
const getCoordsForAddress = require('../utilities/location');
const Place = require('../models/place');
const User = require('../models/user');
const mongoose = require('mongoose');

const getPlacesByPlaceId = async (req, res, next) => {
    const placeId = req.params.pid;
    let place;
    try {
        place = await Place.findById(placeId);
    }
    catch (err) {
        const error = new HttpError('Something went wrong, could not find a place.', 500);
        return next(error);
    }
    if (!place) {
        const err = new HttpError('Could not find any place for provided place id.', 404);
        return next(err);
    }
    res.json({ place: place.toObject({ getters: true }) }); // => { place } => { place: place }
}

const getPlacesByUserId = async (req, res, next) => {
    const userId = req.params.uid;
    let places;
    try {
        places = await Place.find({ creator: userId })
    }
    catch (err) {
        const error = new HttpError('Something went wrong, could not find a place.', 500);
        return next(error);
    }
    if (!places || places.length === 0) {
        const err = new HttpError('Could not find any place for provided user id.', 404);
        return next(err);
    }
    res.json({ places: places.map(place => place.toObject({ getters: true })) });
}

const updateAPlaceByPlaceId = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors);
        const err = new HttpError('Invalid inputs passed. Please check your data.', 422);
        return next(err);
    }
    const placeId = req.params.pid;
    const { title, description } = req.body;
    let place;
    try {
        place = await Place.findById(placeId);
    }
    catch (err) {
        const error = new HttpError('Something went wrong, could not update place.', 500);
        return next(error);
    }

    place.title = title
    place.description = description

    try {
        await place.save();
    } catch (err) {
        const error = new HttpError('Something went wrong, could not update place.', 500);
        return next(error);
    }
    res.status(200).json({ place: place.toObject({ getters: true }) });
}

const deleteAPlaceByPlaceId = async (req, res, next) => {
    const placeId = req.params.pid;
    let place;
    try {
        place = await Place.findById(placeId).populate('creator');
    }
    catch (err) {
        const error = new HttpError('Something went wrong, could not delete place.', 500);
        return next(error);
    }

    if (!place) {
        const error = new HttpError('Could not find place for this id!', 404);
        return next(error);
    }
    const sess = await mongoose.startSession();
    sess.startTransaction();
    place.creator.places.pull(place);
    try {
        place.creator.save({ session: sess }).then(_ => console.log("Saving user -- promise fulfilled")).catch(err => {
            console.log(err)
            console.log("Saving user -- promise rejected")
        }
        );
    } catch (err) {
        const error = new HttpError('Deleting place failed, please try again.', 500);
        return next(error);
        //next does not cancel function execution, so return is needed;
        //otherwise both next(error) and res.status(201) will be send, causing error in server;
        //next forwards it to the next middleware in line and since we have forward an error, it will reach the next error handling middleware in line and there we can say we could not find a place for the provided user ID.
    }
    try {
        place.remove({ session: sess }).then(_ => console.log("Removing place -- promise fulfilled")).catch(err => {
            console.log(err)
            console.log("Removing place -- promise rejected")
        }
        );
    } catch (err) {
        const error = new HttpError('Something went wrong, could not delete place.', 500);
        return next(error);
    }
    await sess.commitTransaction();
    res.status(200).json({ message: "Place deleted successfully!" });
}


const createPlace = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors);
        const err = new HttpError('Invalid inputs passed. Please check your data.', 422);
        return next(err);
        // throw err; //throw cancels function execution and returns err as response
    }
    const { title, description, address, creator } = req.body;
    let coordinates = getCoordsForAddress(address)

    const createdPlace = new Place({
        id: uuid.v4(),
        title,
        description,
        address,
        location: coordinates,
        image: 'https://images.unsplash.com/photo-1572364769167-198dcb7b520c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=927&q=80',
        creator
    });
    let user;
    try {
        user = await User.findById(creator);
    } catch (err) {
        const error = new HttpError('Creating place failed, please try again.', 500);
        return next(error);
    }
    if (!user) {
        const error = new HttpError('Could not find user for provided id!', 404);
        return next(error);
    }
    const sess = await mongoose.startSession();
    sess.startTransaction();
    try {
        createdPlace.save(({ session: sess })).then(_ => console.log("Saving place -- promise fulfilled")).catch(err => {
            console.log(err)
            console.log("Saving place -- promise rejected")
        }
        );
    } catch (err) {
        const error = new HttpError('Creating place failed, please try again.', 500);
        return next(error);
    }
    user.places.push(createdPlace);
    try {
        user.save({ session: sess }).then(_ => console.log("Saving user -- promise fulfilled")).catch(err => {
            console.log(err)
            console.log("Saving user -- promise rejected")
        }
        );
    } catch (err) {
        const error = new HttpError('Creating place failed, please try again.', 500);
        return next(error);
    }
    await sess.commitTransaction();
    res.status(201).json({ place: createdPlace });
};

exports.getPlacesByPlaceId = getPlacesByPlaceId;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updateAPlaceByPlaceId = updateAPlaceByPlaceId;
exports.deleteAPlaceByPlaceId = deleteAPlaceByPlaceId;