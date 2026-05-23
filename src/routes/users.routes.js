import express from 'express';
import { authorize } from '#middleware/authorize.middleware.js';

import {
  fetchAllUsers,
  fetchUserById,
  updateUserById,
  deleteUserById,
} from '#controllers/users.controller.js';

const router = express.Router();

router.get('/', authorize(['admin']), fetchAllUsers);

router.get('/:id', authorize(['admin']), fetchUserById);

router.put('/:id', authorize(['admin']), updateUserById);

router.delete('/:id', authorize(['admin']), deleteUserById);

export default router;
