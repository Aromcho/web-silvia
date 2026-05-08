import UserManager from "../manager/user.manager.js";

export const createUser = async (req, res, next) => {
      try {
        const data = req.body;
        const one = await UserManager.create(data);
        return res.status(201).json({ message: 'User created successfully', user: one });

      } catch (error) {
        return next(error);
      }
    };

export const getUsers = async (req, res, next) => {
    try {
        const { role } = req.query;
        const all = await UserManager.read(role);
        if (all.length > 0) {
          
          return res.status(200).json(all);

        } else {
          return res.status(404).json(error);
        }
      } catch (error) {
        return next(error);
      }

    };

export const getUserById = async (req, res, next) => {
      try {
        const { uid } = req.params;
        const one = await UserManager.readOne(uid);
        if (one) {
          return res.status(200).json(one);
        } else {
          return res.status(404).json(error);
        }
      } catch (error) {
        return next(error);
      }
    };

export const updateUser = async (req, res, next) => {
      try {
        const { uid } = req.params;
        const data = req.body;
        const one = await UserManager.update(uid, data);
        return res.status(200).json(one);
      } catch (error) {
        return next(error);
      }
    };

export const deleteUser = async (req, res, next) => {
      try {
        const { uid } = req.params;
        const one = await UserManager.destroy(uid);
        return res.status(200).json(one);
      } catch (error) {
        return next(error);
      }
    };
  
