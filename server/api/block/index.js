import {Router} from 'express';
import * as controller from './block.controller';
import * as auth from '../../auth/auth.service';

var router = Router();

router.get('/', auth.hasRole('admin,member'), controller.index);
router.get('/count', auth.hasRole('admin,member'), controller.count);
router.get('/:username', auth.hasRole('admin,member'), controller.show);
router.delete('/:id', auth.hasRole('admin,member'), controller.destroy);
router.post('/', auth.hasRole('admin,member'), controller.create);

module.exports = router;