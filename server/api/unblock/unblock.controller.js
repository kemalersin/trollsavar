import async from "async";
import Twitter from "twitter";

import Block from "../block/block.model";
import config from "../../config/environment";

import {
    handleError,
    handleEntityNotFound,
    respondWithResult
} from '../../helpers';

function getTwitter(user) {
    return new Twitter({
        consumer_key: config.twitter.clientID,
        consumer_secret: config.twitter.clientSecret,
        access_token_key: user ? user.accessToken : config.twitter.accessToken,
        access_token_secret: user ? user.accessTokenSecret : config.twitter.tokenSecret,
    });
}

function createMultiple(req, res, usernames) {
    var unblocks = [];
    const twitter = getTwitter(req.user);

    async.eachSeries(usernames, (username, cb) => {
        username = username.trim();

        twitter
            .get("users/show", { screen_name: username })
            .then((profile) => {
                if (profile.id == req.user.profile.id) {
                    return cb();
                }

                Block.findOne({ "profile.id": profile.id })
                    .exec()
                    .then((block) => {
                        if (block) {
                            if (!block.isDeleted && block.isUnblocked) {
                                return cb();
                            }
    
                            Block.findByIdAndDelete(block._id).exec();
                        }

                        let newUnblock = new Block({
                            username: profile.screen_name,
                            profile: profile,
                            isUnblocked: true
                        });

                        newUnblock
                            .save()
                            .then((unblock) => {
                                unblocks.push(unblock);
                                cb();
                            })
                            .catch(() => cb());
                    })
                    .catch(() => cb());
            })
            .catch(() => cb());
    }, (err) => {
        res.status(200).json(unblocks);
    });
}

export function count(req, res, next) {
    return Block.count({
        isUnblocked: true,
        isDeleted: { $ne: true }
    })
        .exec()
        .then(handleEntityNotFound(res))
        .then(respondWithResult(res))
        .catch(handleError(res));
}

export function index(req, res) {
    var index = +req.query.index || 1;

    return Block.find({
        isUnblocked: true,
        isDeleted: { $ne: true }
    })
        .sort({ _id: -1 })
        .skip(--index * config.dataLimit)
        .limit(config.dataLimit)
        .exec()
        .then(handleEntityNotFound(res))
        .then(respondWithResult(res))
        .catch(handleError(res));
}

export function create(req, res) {
    const twitter = getTwitter(req.user);

    var username = req.body.username;
    var usernames = username.split(",");

    if (usernames.length > 1) {
        return createMultiple(req, res, usernames);
    }

    username = username.trim();

    twitter
        .get("users/show", { screen_name: username })
        .then((profile) => {
            Block.findOne({ "profile.id": profile.id })
                .exec()
                .then((block) => {
                    if (block) {
                        if (!block.isDeleted && block.isUnblocked) {
                            return res.status(302).json(block);
                        }

                        Block.findByIdAndDelete(block._id).exec();
                    }

                    let newUnblock = new Block({
                        username: profile.screen_name,
                        profile: profile,
                        isUnblocked: true,
                        addedBy: req.user ? req.user._id : null
                    });

                    return newUnblock
                        .save()
                        .then((block) => res.json(block))
                        .catch(handleError(res));
                })
                .catch(handleError(res));
        })
        .catch((error) => {
            console.log(error);
            res.status(404).send("Kullanıcı bulunamadı!");
        });
}

export function show(req, res, next) {
    const username = req.params.username;
    var index = +req.query.index || 1;

    return Block.find({ username: { $regex: new RegExp(username, "i") }, isUnblocked: true })
        .skip(--index * config.dataLimit)
        .limit(config.dataLimit)
        .exec()
        .then(handleEntityNotFound(res))
        .then(respondWithResult(res))
        .catch(handleError(res));
}

export function destroy(req, res) {
    return Block.findById(req.params.id)
        .exec()
        .then(function (block) {
            block.isDeleted = true;
            block.deletedBy = req.user ? req.user._id : null;

            block.save();

            res.status(204).end();
        })
        .catch(handleError(res));
}

export function authCallback(req, res) {
    res.redirect("/");
}
