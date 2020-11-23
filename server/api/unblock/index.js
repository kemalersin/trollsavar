import {Router} from 'express';

import * as controller from './unblock.controller';
import * as auth from '../../auth/auth.service';

var router = Router();

router.get('/', auth.hasRole('member'), controller.index);
router.get('/count', auth.hasRole('member'), controller.count);
router.get('/:username', auth.hasRole('member'), controller.show);
router.delete('/:id', auth.hasRole('member'), controller.destroy);
router.post('/', auth.hasRole('member'), controller.create);

module.exports = router;