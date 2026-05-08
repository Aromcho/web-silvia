import jwt from 'jsonwebtoken';

const createToken = (data) => {
  const opts = { expiresIn: 60 * 60 * 24 };
  const token = jwt.sign(data, process.env.SECRET_JWT, opts);
  return token;
}

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.SECRET_JWT);
  } catch (error) {
    throw error;
  }
};

export { createToken, verifyToken };
