require('dotenv').config();
const express = require('express');
const pool = require('./db');

const authRouter = require('./routes/auth');
const transaccionesRouter = require('./routes/transacciones');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Rutas Públicas
app.use('/api/auth', authRouter);

// Rutas de Transacciones
app.use('/api/transacciones', transaccionesRouter);

// Health check
app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({
      status: 'OK',
      mensaje: 'Servidor y Neon operativos',
      horaServidor: result.rows[0].now
    });
  } catch (error) {
    res.status(500).json({ status: 'ERROR', error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
});