import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import UserManager from '../manager/user.manager.js';


  const register = async (req, res, next) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required!' });
      }

      const userExists = await UserManager.readByEmail(email);
      if (userExists) {
        return res.status(400).json({ message: 'User already exists!' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await UserManager.create({ email, password: hashedPassword });
      res.status(201).json({ message: 'User registered successfully!' });
    } catch (error) {
      next(error);
    }
  }

  const login = async (req, res, next) => {
    try {
      const { email, password } = req.body;
  
      const user = await UserManager.readByEmail(email);
      if (!user) {
        return res.status(400).json({ message: 'User not found!' });
      }
  
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(400).json({ message: 'Incorrect password!' });
      }
  
      const token = jwt.sign({ email: user.email, role: user.role, id: user._id }, process.env.SECRET, { expiresIn: '1h' });
  
      // Crear una cookie con el token JWT
      res.cookie('jwt', token, { httpOnly: true, signed: true });
  
      res.json({ message: 'Login successful!', token , email: user });
    } catch (error) {
        return res.status(400).json({ error});
      next(error);
    }
  }

  const online = async (req, res, next) => {
    try {
      const token = req.signedCookies.jwt;
      if (!token) {
        return res.status(401).json({ message: 'Unauthorized', online: false });
      }
  
      jwt.verify(token, process.env.SECRET, async (error, decoded) => {
        if (error) {
          return res.status(401).json({ message: 'Unauthorized' });
        }
  
        // Busca al usuario por su ID para obtener más detalles
        const user = await UserManager.readByEmail(decoded.email);
        if (!user) {
          return res.status(404).json({ message: 'User not found!' });
        }
  
        // Excluye campos sensibles como la contraseña
        const { email, role, name, age, createdAt, updatedAt } = user;
  
        // Devuelve los detalles del usuario
        res.json({
          message: 'User is online!',
          online: true,
          user: {
            email,
            role,
            name,
            age,
            createdAt,
            updatedAt
          }
        });
      });
    } catch (error) {
      next(error);
    }
  };
  

  const logout = (req, res, next) => {
    try {
      res.clearCookie('jwt'); 
      return res.status(200).json({ message: 'Logged out successfully!'});
    } catch (error) {
        console.log(error);
      next(error);
    }
  }

export {
    register,
    login,
    online,
    logout,
}