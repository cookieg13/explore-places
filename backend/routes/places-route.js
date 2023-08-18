const express = require('express');
const { check } = require('express-validator')
const router = express.Router();
const PlacesControllers = require('../controllers/places-controller')

router.get('/:pid', PlacesControllers.getPlacesByPlaceId);

router.patch('/:pid', [check('title').not().isEmpty(), check('description').isLength({ min: 5 })], PlacesControllers.updateAPlaceByPlaceId);

router.delete('/:pid', PlacesControllers.deleteAPlaceByPlaceId);

router.get('/user/:uid', PlacesControllers.getPlacesByUserId);

router.post('/', [check('title').not().isEmpty(), check('description').isLength({ min: 5 }), check('address').not().isEmpty(),], PlacesControllers.createPlace);



module.exports = router;
