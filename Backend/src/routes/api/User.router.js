import express from 'express';
import {
    createUser,
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
} from '../../controllers/user.controller.js';

const userRouter = express.Router();

userRouter.post('/', createUser);
userRouter.get('/', getUsers);
userRouter.get('/:uid', getUserById);
userRouter.put('/:uid', updateUser);
userRouter.delete('/:uid', deleteUser);

export default userRouter;
