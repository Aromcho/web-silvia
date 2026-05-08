// middleware para comprovar si el email existe
import User from "../data/mongo/models/user.model.js";

 const isValidEmail = async (req, res, next) => {
    const { email } = req.body;
    try {
        const userExist = await User.findOne({ email: email });
        if (userExist) {
            return res.status(400).json({ message: "Email already exists" });
        }
        next();
    } catch (error) {
        next(error);
        res.status(500).send({ error: 'Error al comprobar el email.' });
      }
    }
export default isValidEmail;