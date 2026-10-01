const { z } = require('zod');

const sincronizarTransaccionSchema = z.object({
  id: z.string().uuid({ message: "El id debe ser un UUID v4 válido" }),
  usuario_id: z.string().uuid({ message: "El usuario_id debe ser un UUID v4 válido" }),
  comercio_id: z.string().uuid({ message: "El comercio_id debe ser un UUID v4 válido" }),
  reserva_id: z.string().uuid({ message: "El reserva_id debe ser un UUID v4 válido" }).optional().nullable(),
  monto_total: z.number({
    required_error: "El monto_total es obligatorio",
    invalid_type_error: "El monto_total debe ser un número"
  }).positive({ message: "El monto_total debe ser mayor a 0" }),
  estado: z.string().default('PENDIENTE'),
  idempotency_key: z.string({
    required_error: "La clave de idempotencia es obligatoria"
  }).min(5, { message: "La idempotency_key debe tener al menos 5 caracteres" })
});

module.exports = {
  sincronizarTransaccionSchema
};