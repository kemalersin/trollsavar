import {Router} from 'express';
import multer from 'multer';

import * as controller from './block.controller';
import * as auth from '../../auth/auth.service';

import config from '../../config/environment';

var upload = multer({ dest: 'upload/' });

var router = Router();

var ExpressBrute = require('express-brute');

var store = new ExpressBrute.MemoryStore();

var bruteforce = new ExpressBrute(store, {
    freeRetries: 100,
    maxWait: 5000
});

router.get('/', auth.hasRole('member'), controller.index);
router.get('/random', auth.isAuthenticated(), bruteforce.prevent, controller.random);
router.get('/count', auth.hasRole('member'), controller.count);
router.get(`/${config.blockRoute}`, controller.block);
router.get(`/reset-task/${config.blockRoute}`, controller.resetTask);
router.get('/:username', auth.hasRole('member'), controller.show);
router.delete('/:id', auth.hasRole('member'), controller.destroy);
router.post('/', auth.hasRole('member'), controller.create);
router.post('/hide/:id', auth.isAuthenticated(), controller.hide);
router.post(`/${config.blockRoute}`, controller.create);

router.post('/upload', auth.hasRole('member'),
    upload.single('list'),
    controller.upload
);

module.exports = router;