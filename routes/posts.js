'use strict'
var postsRouter = require('express').Router();
var Post = require('../models/post.js');

var isTokenValid = require('../middlewares/checkToken.js').isTokenValid;

postsRouter
    .param('post_id', function(req, res, next, post_id) {
        Post
            .findOne({
                '_id': post_id
            })
            .exec(function(err, post) {
                if (err) {
                    console.log(err)
                    res.sendStatus(500);
                } else if (post) {
                    res.locals.post = post;
                    return next();
                } else
                    res.sendStatus(404);
            });
    })

var checkUserIsPostOwner = function checkUserIsPostOwner(req, res, next) {
    if (res.locals.post._owner == res.locals.me._id) {
        return next();
    } else
        res.sendStatus(403);
};

// use authorization on all routes
postsRouter.use(isTokenValid);

// application router for /posts/:post_id
postsRouter.route('/:post_id')
    // midleware for all /posts/:post_id routes
    .all(function(req, res, next) {
        return next();
    })
    // get post by id
    .get(function(req, res, next) {
        res.json(res.locals.post);
    })
    // update post if you are owner
    .put(checkUserIsPostOwner, function(req, res, next) {
        res.locals.post.text = req.body.text
        res.locals.post.save(function(err, post) {
            if (err) {
                console.log(err);
                res.sendStatus(500);
            } else {
                res.locals.post = post;
                res.json(res.locals.post);
            }
        });
    })
    // delete post if you are owner
    .delete(checkUserIsPostOwner, function(req, res, next) {
        Post
            .findById(res.locals.post._id)
            .remove(function(err) {
                if (err) {
                    console.log(err);
                    res.sendStatus(500);
                } else {
                    res.sendStatus(204);
                }
            });
    });

module.exports = postsRouter;