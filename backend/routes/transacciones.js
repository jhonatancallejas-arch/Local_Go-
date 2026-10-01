const express = require('express');
const router = express.Router();
const pool = require('../db');

// Middlewares
const { validateSchema } = require('../middleware/validator');
const { verificarToken } = require('../middleware/auth'); // Importamos la autenticación

// Esquema Zod
const { sincronizarTransaccionSchema } = require('../schemas/transaccion.schema');

// Protegemos la ruta con verificarToken ANTES de validar el esquema
router.post('/sincronizar', verificarToken, validateSchema(sincronizarTransaccionSchema), async (req, res) => {
  const { id, usuario_id, comercio_id, reserva_id, monto_total, estado, idempotency_key } = req.body;

  try {
    // 1. Verificar idempotencia
    const checkExist = await pool.query(
      'SELECT * FROM transacciones WHERE idempotency_key = $1',
      [idempotency_key]
    );

    if (checkExist.rows.length > 0) {
      return res.status(200).json({
        message: 'Transacción ya procesada anteriormente (Respuesta Idempotente)',
        data: checkExist.rows[0]
      });
    }

    // 2. Insertar nueva transacción
    const insertQuery = `
      INSERT INTO transacciones (id, usuario_id, comercio_id, monto_total, estado, idempotency_key)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;

    const newTransaction = await pool.query(insertQuery, [
      id,
      usuario_id,
      comercio_id,
      monto_total,
      estado || 'PENDIENTE',
      idempotency_key
    ]);

    return res.status(201).json({
      message: 'Transacción sincronizada exitosamente en Neon',
      data: newTransaction.rows[0]
    });

  } catch (error) {
    console.error('Error durante la sincronización:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor al sincronizar',
      detalle: error.message,
      codigo: error.code
    });
  }
});

module.exports = router;