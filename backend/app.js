const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const HttpError = require('./models/http-error');
const placesRoutes = require('./routes/places-route');
const usersRoute = require('./routes/users-route');
const app = express();

app.use(bodyParser.json());

app.use('/api/places', placesRoutes); // => /api/places/...
app.use('/api/users', usersRoute); // => /api/places/...
app.use((req, res, next) => {
    const err = new HttpError('Could not find this route.', 404);
    throw err;
})
//error handling middleware
app.use((error, req, res, next) => {
    if (res.headersSent) {
        return next(error);
    }
    res.status(error.code || 500);
    res.json({ message: error.message || "Unknown error occured." });

})

mongoose
    .connect('mongodb+srv://dg:E8YnWrNaqqDnP7q@cluster0.ci2i0bz.mongodb.net/?retryWrites=true&w=majority')
    .then(() => {
        app.listen(4000);
    })
    .catch(err => {
        console.log(err);
    });

