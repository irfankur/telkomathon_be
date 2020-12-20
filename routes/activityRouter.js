const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
var authenticate = require('../authenticate');
const cors = require('./cors');

const Activity = require('../models/activity');

const activityRouter = express.Router();

activityRouter.use(bodyParser.json());

activityRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, authenticate.verifyUser, (req,res,next) => {
    Activity.findOne({user: req.user._id})
    .populate('user')
    .exec((err, activities) => {
        if (err) return next(err);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(activities);
    });
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    if (req.body != null) {
        req.body.user = req.user._id;
        Activity.create(req.body)
        .then((activity) => {
            Activity.findById(activity._id)
            .populate('user')
            .then((activity) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(activity);
            })
        }, (err) => next(err))
        .catch((err) => next(err));
    }
    else {
        err = new Error('Activity not found in request body');
        err.status = 404;
        return next(err);
    }

})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /activity/');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Activity.remove({})
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));    
});

activityRouter.route('/:activityId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, authenticate.verifyUser, (req,res,next) => {
    Activity.findOne({user: req.user._id})
    .then((activities) => {
        if (!activities) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            return res.json({"exists": false, "activities": activities});
        }
        else {
            if (activities.indexOf(req.params.activityId) < 0) {
                res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            return res.json({"exists": false, "activities": activities});
            }
            else {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                return res.json({"exists": true, "activities": activities});
            }
        }
        
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /activity/'+ req.params.commentId);
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Activity.findById(req.params.activityId)
    .then((activity) => {
        if (activity != null) {
            if (!activity.user.equals(req.user._id)) {
                var err = new Error('You are not authorized to update this activity!');
                err.status = 403;
                return next(err);
            }
            req.body.user = req.user._id;
            Activity.findByIdAndUpdate(req.params.activityId, {
                $set: req.body
            }, { new: true })
            .then((activity) => {
                Activity.findById(activity._id)
                .populate('user')
                .then((activity) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(activity); 
                })               
            }, (err) => next(err));
        }
        else {
            err = new Error('Activity ' + req.params.commentId + ' not found');
            err.status = 404;
            return next(err);            
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Activity.findById(req.params.activityId)
    .then((activity) => {
        if (activity != null) {
            if (!activity.user.equals(req.user._id)) {
                var err = new Error('You are not authorized to delete this activity!');
                err.status = 403;
                return next(err);
            }
            Activity.findByIdAndRemove(req.params.activityId)
            .then((resp) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(resp); 
            }, (err) => next(err))
            .catch((err) => next(err));
        }
        else {
            err = new Error('Activity ' + req.params.activityId + ' not found');
            err.status = 404;
            return next(err);            
        }
    }, (err) => next(err))
    .catch((err) => next(err));
});

module.exports = activityRouter;