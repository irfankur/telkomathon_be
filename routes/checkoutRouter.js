const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
var authenticate = require('../authenticate');
const cors = require('./cors');

const Checkin = require('../models/checkin');

const checkoutRouter = express.Router();

checkoutRouter.use(bodyParser.json());

checkoutRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    Checkin.find(req.query)
    .populate('user')
    .then((checkin) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(checkin);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    req.body = {"checkin" : false};
    if (req.body != null) {
        req.body.user = req.user._id;
        Checkin.create(req.body)
        .then((checkin) => {
            Checkin.findById(checkin._id)
            .populate('user')
            .then((checkin) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(checkin);
            })
        }, (err) => next(err))
        .catch((err) => next(err));
    }
    else {
        err = new Error('error body');
        err.status = 404;
        return next(err);
    }

})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /checkin/');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Checkin.remove({})
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));    
});

module.exports = checkoutRouter;