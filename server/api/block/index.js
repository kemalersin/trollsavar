import {Router} from 'express';
import multer from 'multer';

import * as controller from './block.controller';
import * as auth from '../../auth/auth.service';

var upload = multer({ dest: 'upload/' });

var router = Router();

router.get('/', auth.hasRole('member'), controller.index);
router.get('/count', auth.hasRole('member'), controller.count);
router.get('/:username', auth.hasRole('member'), controller.show);
router.delete('/:id', auth.hasRole('member'), controller.destroy);
router.post('/', auth.hasRole('member'), controller.create);

router.post('/upload', auth.hasRole('member'),
    upload.single('list'),
    controller.upload
);

module.exports = router;