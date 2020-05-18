
import Block from './block.model';
import config from '../../config/environment';
import Twitter from 'twitter';

function handleError(res, statusCode) {
    statusCode = statusCode || 500;
    return function (err) {
        return res.status(statusCode).send(err);
    };
}

export function count(req, res, next) {
    return Block.count({}).exec()
        .then((count) => {
            res.json(count);
        })
        .catch(err => next(err));
}

export function index(req, res) {
    var index = +req.query.index || 1;

    return Block.find({}, '-salt -password')
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
    var username = req.body.username;

    var twitter = new Twitter({
        consumer_key: config.twitter.clientID,
        consumer_secret: config.twitter.clientSecret,
        access_token_key: req.user.accessToken,
        access_token_secret: req.user.accessTokenSecret
    });

    twitter.get('users/show', { screen_name: username })
        .then((profile) => {
            if (profile.id == req.user.profile.id) {
                return res.status(500).send('Neden kendinizi bloklayasiniz ki?');
            }

            Block.findOne({ 'profile.id': profile.id }).exec()
                .then((block) => {
                    if (block) {
                        return res.status(302).json(block);
                    }

                    var newBlock = new Block({
                        username: profile.screen_name,
                        profile: profile
                    });

                    return newBlock.save()
                        .then((block) =>
                            res.json(block)
                        )
                        .catch(handleError(res));
                })
                .catch(handleError(res));
        })
        .catch((error) => res.status(404).send('Kullanici bulunamadi!'));
}

export function show(req, res, next) {
    var username = req.params.username;
    var index = +req.query.index || 1;

    return Block.find({ username: { $regex: new RegExp(username, 'i') } })
        .skip(--index * config.dataLimit)
        .limit(config.dataLimit)
        .exec()
        .then(block => {
            if (!block) {
                return res.status(404).end();
            }

            res.json(block);
        })
        .catch(err => next(err));
}

export function destroy(req, res) {
    return Block.findByIdAndRemove(req.params.id).exec()
        .then(function () {
            res.status(204).end();
        })
        .catch(handleError(res));
}

export function authCallback(req, res) {
    res.redirect('/');
}
