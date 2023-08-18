const HttpError = require('../models/http-error');
const uuid = require('uuid');
const { validationResult } = require('express-validator');
const getCoordsForAddress = require('../utilities/location');
const Place = require('../models/place');

let DUMMY_PLACES = [
    {
        id: 'p1',
        title: 'Empire State Building',
        description: 'One of the most famous sky scrapers in the world!',
        location: {
            lat: 40.7484474,
            lng: -73.9871516
        },
        address: '20 W 34th St, New York, NY 10001',
        creator: 'u3'
    },
    {
        id: 'p3',
        title: 'Burj Khalifa',
        description: 'One of the most famous sky scrapers in the world!',
        location: {
            lat: 40.7484474,
            lng: -73.9871516
        },
        address: 'Dubai',
        creator: 'u3'
    }
];

const getPlacesByPlaceId = (req, res, next) => {
    const placeId = req.params.pid; // { pid: 'p1' }
    const place = DUMMY_PLACES.find(p => {
        return p.id === placeId;
    });
    if (!place) {
        const err = new HttpError('Could not find any place for provided place id.', 404);
        // err.code = 404;
        throw err;
    }
    res.json({ place }); // => { place } => { place: place }
}

const getPlacesByUserId = (req, res, next) => {
    const userId = req.params.uid;
    const places = DUMMY_PLACES.filter(p =>
        p.creator === userId);
    if (!places || places.length === 0) {
        const err = new HttpError('Could not find any place for provided user id.', 404);
        return next(err);
    }
    res.json({ places });
}

const updateAPlaceByPlaceId = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors);
        const err = new HttpError('Invalid inputs passed. Please check your data.', 422);
        throw err;
    }
    const placeId = req.params.pid;
    const { title, description } = req.body;

    const placeToUpdate = DUMMY_PLACES.find(p =>
        p.id === placeId);
    const placeToUpdateIdx = DUMMY_PLACES.findIndex(p =>
        p.id === placeId);
    placeToUpdate.title = title
    placeToUpdate.description = description
    DUMMY_PLACES[placeToUpdateIdx] = placeToUpdate
    res.status(200).json({ place: placeToUpdate });
}

const deleteAPlaceByPlaceId = (req, res, next) => {
    const placeId = req.params.pid;
    const { title, description } = req.body;
    if (!DUMMY_PLACES.find(p => p.id === placeId)) {
        const err = new HttpError('Could not find a place with that id.', 404);
        throw err;
    }
    DUMMY_PLACES = DUMMY_PLACES.filter(p => p !== placeId)
    res.status(200).json({ message: "Place deleted successfully" });
}


const createPlace = async (req, res, next) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors);
        const err = new HttpError('Invalid inputs passed. Please check your data.', 422);
        throw err;
    }
    const { title, description, address, creator } = req.body;
    // const title = req.body.title;

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
    try {
        createPlace.save();
    } catch (err) {
        const error = new HttpError('Creating place failed, please try again.', 500);
        return next(error);
    }
    res.status(201).json({ place: createdPlace });
};

exports.getPlacesByPlaceId = getPlacesByPlaceId;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updateAPlaceByPlaceId = updateAPlaceByPlaceId;
exports.deleteAPlaceByPlaceId = deleteAPlaceByPlaceId;