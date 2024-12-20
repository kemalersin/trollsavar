import { applyPatch } from "fast-json-patch";

export function validationError(res, statusCode) {
    statusCode = statusCode || 422;
    return function(err) {
        return res.status(statusCode).json(err);
    };
}

export function respondWithResult(res, statusCode) {
    statusCode = statusCode || 200;
    return function (entity) {
        if (entity) {
            return res.status(statusCode).json(entity);
        }
        return null;
    };
}

export function patchUpdates(patches) {
    return function (entity) {
        try {
            applyPatch(entity, patches, /*validate*/ true);
        } catch (err) {
            return Promise.reject(err);
        }

        return entity.save();
    };
}

export function deleteEntity(res) {
    return function (entity) {
        if (entity) {
            entity["isDeleted"] = true;
            
            return entity.save()
                .then(() => res.status(204).end());
        }
    };
}

export function removeEntity(res) {
    return function (entity) {
        if (entity) {           
            return entity.remove()
                .then(() => res.status(204).end());
        }
    };
}

export function handleEntityNotFound(res) {
    return function (entity) {
        if (!entity) {
            res.status(404).end();
            return null;
        }
        return entity;
    };
}

export function handleError(res, statusCode) {
    statusCode = statusCode || 500;

    return function (err) {
        console.log(err);
        res.status(statusCode).send(err);
    };
}