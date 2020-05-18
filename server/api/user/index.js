import {Router} from 'express';
import * as controller from './user.controller';
import * as auth from '../../auth/auth.service';

var router = Router();

router.get('/', auth.hasRole('admin,member'), controller.index);
router.get('/me', auth.isAuthenticated(), controller.me);
router.get('/count', auth.hasRole('admin,member'), controller.count);
router.get('/:username', auth.hasRole('admin,member'), controller.show);

module.exports = router;
