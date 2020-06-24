import fs from "fs";
import async from "async";
import Twitter from "twitter";

import { transform } from "lodash";

import differenceInMinutes from "date-fns/differenceInMinutes";

import Block from "./block.model";
import List from "./list.model";
import Log from "../log/log.model";
import Stat from "../stat/stat.model";
import Flag from "./flag.model";
import User from "../user/user.model";
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
    var blocks = [];
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
                            return cb();
                        }

                        let newBlock = new Block({
                            username: profile.screen_name,
                            profile: profile,
                        });

                        newBlock
                            .save()
                            .then((block) => {
                                blocks.push(block);
                                cb();
                            })
                            .catch(() => cb());
                    })
                    .catch(() => cb());
            })
            .catch(() => cb());
    }, (err) => {
        res.status(200).json(blocks);
    });
}

export function count(req, res, next) {
    return Block.count({
        isDeleted: { $ne: true }
    })
        .exec()
        .then(respondWithResult(res))
        .catch(handleError(res));
}

export function resetTask(req, res) {
    const now = new Date();

    Flag.findOne({ "blocking.started": true })
        .exec()
        .then((task) => {
            if (!task) {
                return res.status(404).end();
            }

            if (differenceInMinutes(now, task.blocking.startDate) >= 44) {
                task.blocking.started = false;
                task.blocking.finishDate = now;

                task.save();

                return res.status(204).end();
            }

            return res.status(304).end();
        })
        .catch(handleError);
}

export function index(req, res) {
    var index = +req.query.index || 1;

    return Block.find({
        isDeleted: { $ne: true }
    }, "-salt -password")
        .sort({ _id: -1 })
        .skip(--index * config.dataLimit)
        .limit(config.dataLimit)
        .exec()
        .then(respondWithResult(res))
        .catch(handleError(res));
}

export function random(req, res, next) {
    List.aggregate([
        {
            $match: {
                user: req.user._id,
                type: { $in: [1, 2] }
            }
        },
        { $group: { "_id": "$user", blocks: { $push: "$block" } } }
    ]).exec()
        .then((list) => {
            var blocks = list.length ? list[0].blocks : [];

            Block.findRandom(
                {
                    _id: { $nin: blocks },
                    isDeleted: { $ne: true },
                    isNotFound: { $ne: true },
                    isSuspended: { $ne: true },
                    "profile.description": { $ne: "" },
                    "profile.status": { $exists: true }
                },
                {},
                { limit: config.randomCount }, (err, blocks) => {
                    if (err) {
                        return next(err);
                    }

                    res.json(
                        transform(
                            blocks,
                            (result, block) => result.push(block.profile),
                            []
                        )
                    );
                });
        })
}

export function hide(req, res) {
    Block.findOne({
        "profile.id_str": req.params.id
    })
        .exec()
        .then(handleEntityNotFound(res))
        .then((block) => {
            if (block) {
                let list = new List();

                list.user = req.user._id;
                list.block = block._id;

                if (req.body.blocked) {
                    list.type = 2;
                }

                return list.save()
                    .then(() => {
                        res.json(block.profile);
                    })
                    .catch(handleError(res));
            }

            return null;
        })
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
            if (req.user && profile.id == req.user.profile.id) {
                return res
                    .status(500)
                    .send("Neden kendinizi bloklayasınız ki?");
            }

            Block.findOne({ "profile.id": profile.id })
                .exec()
                .then((block) => {
                    if (block) {
                        if (!block.isDeleted) {
                            return res.status(302).json(block);
                        }

                        Block.findByIdAndDelete(block._id).exec();
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
        .catch((error) => {
            console.log(error);
            res.status(404).send("Kullanıcı bulunamadı!");
        });
}

export function show(req, res, next) {
    const username = req.params.username;
    var index = +req.query.index || 1;

    return Block.find({ username: { $regex: new RegExp(username, "i") } })
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
            block.save();

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
                    })
                    .catch(() => cb());
            })
        }, (err) => {
            res.status(200).end();
        });
    } catch (err) {
        handleError(res)(err);
    }
}

export async function block(req, res) {
    const sessionDate = new Date();

    var failedBlocks = [];

    var success = 0;
    var failed = 0;

    const status = await Flag.findOne({ "blocking.started": true }).exec();

    if (status && status["blocking"]) {
        return res.status(304).end();
    }

    Block.findOne({ isDeleted: { $ne: true } }, "id")
        .sort({ _id: -1 })
        .then((block) => {
            if (!block) {
                return res.status(404).end();
            }

            User.find({
                isLocked: { $ne: true },
                isSuspended: { $ne: true },
                $or: [
                    { lastBlockId: null },
                    { lastBlockId: { $lt: block.id } },
                ]
            })
                .select("username lastBlockId accessToken accessTokenSecret")
                .sort({ lastBlockId: 1 })
                .then((users) => {
                    let outerLimit = 0;

                    Flag.updateOne(
                        { "blocking.started": false },
                        {
                            "blocking.started": true,
                            "blocking.startDate": new Date(),
                            "blocking.finishDate": null
                        }, { upsert: true }
                    ).exec();

                    async.eachSeries(users, (user, cbOuter) => {
                        let twitter = getTwitter(user);

                        Block.find(user.lastBlockId ? {
                            _id: { $gt: user.lastBlockId }
                        } : { isNotFound: { $ne: true } }).then((blocks) => {
                            let innerLimit = 0;
                            let userBlockCounter = 0;

                            async.eachSeries(blocks, (block, cbInner) => {
                                if (
                                    block.isDeleted ||
                                    block.isNotFound ||
                                    failedBlocks.indexOf(block.username) !== -1
                                ) {
                                    userBlockCounter++;
                                    return cbInner();
                                }

                                twitter
                                    .post("blocks/create", { user_id: block.profile.id_str })
                                    .then((blocked) => {
                                        if (!blocked["screen_name"]) {
                                            failed++;
                                            userBlockCounter++;

                                            return cbInner();
                                        }

                                        success++;

                                        block.username = blocked.screen_name
                                        block.profile = blocked;
                                        block.isSuspended = false;

                                        block.save();

                                        user.lastBlockId = block.id;

                                        user.save().then(() => {
                                            let list = new List();

                                            list.user = user.id;
                                            list.block = block.id;
                                            list.type = 3;

                                            list.save();

                                            if (
                                                (++userBlockCounter === blocks.length) ||
                                                (++innerLimit === config.blockLimitPerUser) ||
                                                (outerLimit++ === config.blockLimitPerApp)
                                            ) {
                                                return cbOuter();
                                            }

                                            cbInner();
                                        });
                                    })
                                    .catch((err) => {
                                        failed++;
                                        console.log(user.username, block.username, err);

                                        if (Array.isArray(err)) {
                                            let errCode = err[0]["code"];

                                            if (errCode) {
                                                Log.create({
                                                    username: user.username,
                                                    blockId: block._id,
                                                    error: err[0],
                                                    sessionDate,
                                                });

                                                if (
                                                    errCode == 50 ||
                                                    errCode == 63
                                                ) {
                                                    (errCode == 50) ?
                                                        block.isNotFound = true :
                                                        block.isSuspended = true;

                                                    block.save();
                                                    failedBlocks.push(block.username);
                                                }
                                                else {
                                                    if (
                                                        errCode == 32 ||
                                                        errCode == 64 ||
                                                        errCode == 89 ||
                                                        errCode == 326
                                                    ) {
                                                        if (errCode == 64) {
                                                            user.isSuspended = true;
                                                        }
                                                        else {
                                                            (errCode == 32 || errCode == 89) ?
                                                                user.tokenExpired = true :
                                                                user.isLocked = true;
                                                        }

                                                        user.save();
                                                    }

                                                    return cbOuter();
                                                }
                                            }
                                        }

                                        userBlockCounter++;
                                        cbInner();
                                    });
                            });
                        });

                        if (++outerLimit === config.blockLimitPerApp) {
                            return cbOuter();
                        }
                    }, () => {
                        let stat = new Stat({
                            success,
                            failed,
                            sessionDate
                        });

                        stat.save();

                        Flag.updateOne(
                            { "blocking.started": true },
                            {
                                "blocking.started": false,
                                "blocking.finishDate": new Date()
                            }
                        ).exec();
                    })
                });
        });

    res.status(204).end();
}

export function authCallback(req, res) {
    res.redirect("/");
}
