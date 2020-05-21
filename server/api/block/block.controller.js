import fs from "fs";
import async from "async";
import Twitter from "twitter";

import Block from "./block.model";
import User from "../user/user.model";
import config from "../../config/environment";

function handleError(res, statusCode) {
    statusCode = statusCode || 500;
    return function (err) {
        return res.status(statusCode).send(err);
    };
}

function getTwitter(user) {
    return new Twitter({
        consumer_key: config.twitter.clientID,
        consumer_secret: config.twitter.clientSecret,
        access_token_key: user.accessToken,
        access_token_secret: user.accessTokenSecret,
    });
}

export function count(req, res, next) {
    return Block.count({})
        .exec()
        .then((count) => {
            res.json(count);
        })
        .catch((err) => next(err));
}

export function index(req, res) {
    var index = +req.query.index || 1;

    return Block.find({}, "-salt -password")
        .sort({ _id: -1 })
        .skip(--index * config.dataLimit)
        .limit(config.dataLimit)
        .exec()
        .then((blocks) => {
            res.status(200).json(blocks);
        })
        .catch(handleError(res));
}

export function create(req, res) {
    const username = req.body.username;
    const twitter = getTwitter(req.user);

    twitter
        .get("users/show", { screen_name: username })
        .then((profile) => {
            if (profile.id == req.user.profile.id) {
                return res
                    .status(500)
                    .send("Neden kendinizi bloklayasınız ki?");
            }

            Block.findOne({ "profile.id": profile.id })
                .exec()
                .then((block) => {
                    if (block) {
                        return res.status(302).json(block);
                    }

                    let newBlock = new Block({
                        username: profile.screen_name,
                        profile: profile,
                    });

                    return newBlock
                        .save()
                        .then((block) => res.json(block))
                        .catch(handleError(res));
                })
                .catch(handleError(res));
        })
        .catch((error) => res.status(404).send("Kullanıcı bulunamadı!"));
}

export function show(req, res, next) {
    const username = req.params.username;
    var index = +req.query.index || 1;

    return Block.find({ username: { $regex: new RegExp(username, "i") } })
        .skip(--index * config.dataLimit)
        .limit(config.dataLimit)
        .exec()
        .then((block) => {
            if (!block) {
                return res.status(404).end();
            }

            res.json(block);
        })
        .catch((err) => next(err));
}

export function destroy(req, res) {
    return Block.findByIdAndRemove(req.params.id)
        .exec()
        .then(function () {
            res.status(204).end();
        })
        .catch(handleError(res));
}

export function upload(req, res) {
    const twitter = getTwitter(req.user);

    try {
        const data = fs.readFileSync(req.file.path, "UTF-8");
        const ids = data.split(/\r?\n/);

        fs.unlink(req.file.path, (err) => {
            if (err) throw err;
        });

        async.eachSeries(ids, (id, cb) => {
            if (id == req.user.profile.id) {
                return cb();
            }

            Block.findOne({ "profile.id": +id }).then((block) => {
                if (block) {
                    return cb();
                }

                twitter
                    .get("users/show", { id })
                    .then((profile) => {
                        if (!profile["screen_name"]) {
                            return cb();
                        }

                        let newBlock = new Block({
                            username: profile.screen_name,
                            profile: profile,
                        });

                        newBlock.save()
                            .then(() => cb())
                            .catch(() => cb());
                    });
            })
        }, (err) => {
            res.status(200).end();
        });
    } catch (err) {
        handleError(res)(err);
    }
}

export function block(req, res) {
    Block.findOne({}, "id")
        .sort({ _id: -1 })
        .then((block) => {
            if (!block) {
                return res.status(404).end();
            }

            User.find({
                $or: [
                    { lastBlockId: null },
                    { lastBlockId: { $lt: block.id } },
                ]
            })
                .select("username lastBlockId accessToken accessTokenSecret")
                .sort({ lastBlockId: 1 })
                .then((users) => {
                    let outerLimit = 0;

                    async.eachSeries(users, (user, cbOuter) => {
                        let twitter = getTwitter(user);

                        Block.find(user.lastBlockId ? {
                            _id: { $gt: user.lastBlockId }
                        } : {}).then((blocks) => {
                            let index = 0;
                            let innerLimit = 0;

                            async.eachSeries(blocks, (block, cbInner) => {
                                twitter
                                    .post("blocks/create", { screen_name: block.username })
                                    .then((blocked) => {
                                        if (blocked["screen_name"]) {
                                            user.lastBlockId = block.id;
                                            
                                            user.save().then(() => {
                                                if (
                                                    (++index === blocks.length) ||
                                                    (++innerLimit === config.blockLimitPerUser) ||
                                                    (outerLimit++ === config.blockLimitPerApp)
                                                ) {
                                                    return cbOuter();
                                                }

                                                cbInner();
                                            });
                                        }
                                    });
                            });
                        });

                        if (++outerLimit === config.blockLimitPerApp) {
                            return cbOuter();
                        }
                    })
                });
        });

    res.status(204).end();
}

export function authCallback(req, res) {
    res.redirect("/");
}
