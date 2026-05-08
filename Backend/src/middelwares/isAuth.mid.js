import { verifyToken } from "../utils/token.util.js";

const isAuth = (req, res, next) => {
  const token = req.signedCookies['jwt'];
  if (!token) {
    return res.status(401).json({ message: 'No se proporcionó token' });
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Token inválido' });
  }
};

export default isAuth;
