const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');

// POST /api/auth/registro
router.post('/registro', async (req, res) => {
  const { nombre, email, password, telefono, rol_id } = req.body;

  if (!nombre || !email || !password) {
    return res.status(400).json({ error: 'Nombre, email y contraseña son obligatorios' });
  }

  try {
    // 1. Verificar si el email ya existe
    const userExist = await pool.query('SELECT id FROM usuarios WHERE email = $1', [email]);
    if (userExist.rows.length > 0) {
      return res.status(400).json({ error: 'El correo electrónico ya está registrado.' });
    }

    // 2. Encriptar la contraseña
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 3. Asignar rol por defecto (CLIENTE = 1) si no se provee
    const rol = rol_id || 1;

    // 4. Insertar nuevo usuario
    const insertQuery = `
      INSERT INTO usuarios (nombre, email, password_hash, telefono, rol_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, nombre, email, rol_id, fecha_registro;
    `;
    const result = await pool.query(insertQuery, [nombre, email, passwordHash, telefono || null, rol]);
    const usuarioCreado = result.rows[0];

    // 5. Generar Token JWT
    const token = jwt.sign(
      { id: usuarioCreado.id, email: usuarioCreado.email, rol_id: usuarioCreado.rol_id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      mensaje: 'Usuario registrado exitosamente',
      usuario: usuarioCreado,
      token
    });

  } catch (error) {
    console.error('Error en registro:', error);
    return res.status(500).json({ error: 'Error interno del servidor al registrar usuario' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña son requeridos' });
  }

  try {
    // 1. Buscar usuario por email
    const result = await pool.query('SELECT * FROM usuarios WHERE email = $1 AND activo = true', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const usuario = result.rows[0];

    // 2. Verificar contraseña
    const passwordValido = await bcrypt.compare(password, usuario.password_hash);
    if (!passwordValido) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // 3. Generar Token JWT
    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, rol_id: usuario.rol_id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      mensaje: 'Inicio de sesión exitoso',
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol_id: usuario.rol_id
      },
      token
    });

  } catch (error) {
    console.error('Error en login:', error);
    return res.status(500).json({ error: 'Error interno del servidor al iniciar sesión' });
  }
});

module.exports = router;