const validateSchema = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const issues = result.error.issues || result.error.errors || [];
    
    const erroresFormateados = issues.map((err) => ({
      campo: err.path.join('.') || 'body',
      mensaje: err.message
    }));

    return res.status(400).json({
      status: 'ERROR_DE_VALIDACION',
      mensaje: 'Los datos enviados no cumplen con la estructura requerida',
      errores: erroresFormateados
    });
  }

  req.body = result.data;
  next();
};

module.exports = { validateSchema };