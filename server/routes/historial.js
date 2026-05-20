const express = require('express');
const router = express.Router();
const { pool, verificarToken } = require('../index');
const { registrarEnBitacora } = require('./auditoria');

const verificarAccesoExpediente = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT p.nombre AS permiso, r.nombre AS rol
       FROM usuario_rol ur
       JOIN roles r ON ur.id_rol = r.id_rol
       LEFT JOIN rol_permiso rp ON r.id_rol = rp.id_rol
       LEFT JOIN permisos p ON rp.id_permiso = p.id_permiso
       WHERE ur.id_usuario = $1`,
      [req.usuario.id]
    );
    const tienePermiso = rows.some(row => row.permiso === 'ver_expediente');
    const esAdmin      = rows.some(row => row.rol    === 'Administrador');
    if (!tienePermiso && !esAdmin) {
      return res.status(403).json({ error: 'No tienes permiso para acceder al historial clínico.' });
    }
    next();
  } catch (err) {
    console.error('Error verificando permisos de historial:', err.message);
    res.status(500).json({ error: 'Error interno al verificar permisos.' });
  }
};

// GET /api/historial/:id_paciente
// Obtiene todas las notas de un paciente, de más reciente a más antigua
router.get('/:id_paciente', verificarToken, verificarAccesoExpediente, async (req, res) => {
  try {
    const { id_paciente } = req.params;
    const query = `
      SELECT id_historial_medico, id_paciente, descripcion, fecha
      FROM historial_medico
      WHERE id_paciente = $1
      ORDER BY fecha DESC;
    `;
    const result = await pool.query(query, [id_paciente]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error en GET /api/historial/:id_paciente:', err.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/historial/crear
// Guarda una nueva nota clínica para un paciente usando la fecha actual
router.post('/crear', verificarToken, verificarAccesoExpediente, async (req, res) => {
  try {
    const { id_paciente, descripcion } = req.body;

    if (!id_paciente || !descripcion) {
      return res.status(400).json({ error: 'id_paciente y descripcion son requeridos' });
    }

    const query = `
      INSERT INTO historial_medico (id_paciente, descripcion, fecha)
      VALUES ($1, $2, CURRENT_TIMESTAMP)
      RETURNING *;
    `;
    const result = await pool.query(query, [id_paciente, descripcion]);

    // Lookup por nombre en lugar de ID hardcodeado, por si la BD fue
    // inicializada antes de que se añadiera esta acción al seed
    await pool.query(
      `INSERT INTO bitacora (id_usuario, id_accion, fecha)
       SELECT $1, id_accion, CURRENT_TIMESTAMP
       FROM acciones WHERE descripcion = 'CREAR_HISTORIAL_MEDICO'`,
      [req.usuario.id]
    );

    res.status(201).json({
      mensaje: 'Nota clínica creada exitosamente',
      historial: result.rows[0]
    });
  } catch (err) {
    console.error('Error en POST /api/historial/crear:', err.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
