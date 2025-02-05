import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization');

  if (!token) {
    return res.status(401).json({ message: 'No hay token, acceso denegado.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next(); // Si el token es válido, pasa al siguiente middleware o ruta
  } catch (err) {
    return res.status(401).json({ message: 'Token no válido.' });
  }
};

export default authMiddleware;

