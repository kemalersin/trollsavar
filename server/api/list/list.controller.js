import endOfDay from "date-fns/endOfDay";
import startOfDay from "date-fns/startOfDay";

import Block from "../block/block.model";
import List from "./list.model";

import config from "../../config/environment";

import {
    handleError,
    handleEntityNotFound,
    respondWithResult,
    removeEntity
} from '../../helpers';

function getToday() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export function count(req, res, next) {
    const startOfToday = getToday();
    const listType = (req.params.listType == "gizlenenler") ? 1 : { $in: [2, 3] };

    console.log(listType);

    return List.count({
        user: req.user.id,
        type: listType,
        createdAt: {
            $gte: startOfDay(startOfToday),
            $lte: endOfDay(startOfToday)
        }
    })
        .exec()
        .then(handleEntityNotFound(res))
        .then(respondWithResult(res))
        .catch(handleError(res));
}

export function index(req, res) {
    const startOfToday = getToday();
    const listType = (req.params.listType == "gizlenenler") ? 1 : { $in: [2, 3] };

    var index = +req.query.index || 1;

    return List.find({
        user: req.user.id,
        type: listType,
        createdAt: {
            $gte: startOfDay(startOfToday),
            $lte: endOfDay(startOfToday)
        }
    })
        .sort({ _id: -1 })
        .skip(--index * config.dataLimit)
        .limit(config.dataLimit)
        .populate("block", "username profile -_id")
        .exec()
        .then(handleEntityNotFound(res))
        .then(respondWithResult(res))
        .catch(handleError(res));
}

export function show(req, res, next) {
    const username = req.params.username;
    const listType = (req.params.listType == "gizlenenler") ? 1 : { $in: [2, 3] };

    return Block.find({ username })
        .exec()
        .then(handleEntityNotFound(res))
        .then((blocks) => {
            if (blocks) {
                return List.find({
                    user: req.user.id,
                    block: { $in: blocks },
                    type: listType
                })
                    .populate("block", "username profile -_id")
                    .exec()
                    .then(respondWithResult(res))
                    .catch(handleError(res));
            }

            return null;
        })
        .catch(handleError(res));
}

export function destroy(req, res) {
    return List.findOne({
        _id: req.params.id,
        user: req.user.id,
    })
        .exec()
        .then(handleEntityNotFound(res))        
        .then(removeEntity(res))
        .catch(handleError(res));
}

export function authCallback(req, res) {
    res.redirect("/");
}
