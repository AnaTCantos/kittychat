import express from 'express';
import bcrypt from 'bcryptjs'; // Para encriptar contraseñas
import jwt from 'jsonwebtoken'; // Para generar tokens de sesión
import User from '../models/User.js'; // Asegúrate de tener un modelo de usuario
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Ruta para el registro
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Verifica si el email ya está registrado
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'El correo electrónico ya está registrado.' });
    }

    // Encripta la contraseña
    const hashedPassword = await bcrypt.hash(password, 12);

    // Crea un nuevo usuario
    const newUser = new User({
      username,
      email,
      password: hashedPassword
    });

    // Guarda el usuario en la base de datos
    await newUser.save();
    res.status(201).json({ message: 'Usuario registrado exitosamente.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al registrar el usuario.' });
  }
});

// Ruta para el login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Busca al usuario por su email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Usuario no encontrado.' });
    }

    // Verifica la contraseña
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Contraseña incorrecta.' });
    }

    // Crea un token JWT
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    
    // Envia el token
    res.status(200).json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al hacer login.' });
  }
});



export default router;

