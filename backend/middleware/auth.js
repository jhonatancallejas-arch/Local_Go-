const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Formato: "Bearer <TOKEN>"

  if (!token) {
    return res.status(401).json({
      status: 'ERROR',
      mensaje: 'Acceso denegado. No se proporcionó un token de autenticación.'
    });
  }

  try {
    const usuarioDecodificado = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = usuarioDecodificado; // Guardamos los datos del usuario en el request
    next();
  } catch (error) {
    return res.status(403).json({
      status: 'ERROR',
      mensaje: 'Token inválido o expirado.'
    });
  }
};

module.exports = { verificarToken };