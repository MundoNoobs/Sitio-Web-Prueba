const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { isValidEmail, validarRut } = require('../utils/validators');

router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, rut, address, email, password } = req.body;
    if (!firstName || !lastName || !rut || !email || !password) return res.status(400).json({ msg: 'Faltan campos' });
    if (!isValidEmail(email)) return res.status(400).json({ msg: 'Email inválido' });
    if (!validarRut(rut)) return res.status(400).json({ msg: 'RUT inválido' });
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ msg: 'Usuario ya existe' });
    const user = new User({ firstName, lastName, rut, address, email, password });
    await user.save();
    res.json({ msg: 'Usuario registrado', userId: user._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error servidor' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Usuario no encontrado' });
    const match = await user.comparePassword(password);
    if (!match) return res.status(400).json({ msg: 'Contraseña incorrecta' });
    res.json({ msg: 'OK', user: { id: user._id, firstName: user.firstName, email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error servidor' });
  }
});

module.exports = router;
