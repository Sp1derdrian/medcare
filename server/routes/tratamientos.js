const express = require('express');
const router = express.Router();
const { pool, verificarToken } = require('../index');

// GET /api/tratamientos/paciente/:id_paciente
// Lista de tratamientos activos y pasados de un paciente
router.get('/paciente/:id_paciente', verificarToken, async (req, res) => {
  try {
    const { id_paciente } = req.params;
    const query = `
      SELECT
        t.id_tratamiento,
        t.descripcion,
        t.fecha_inicio,
        t.fecha_fin,
        COALESCE(
          json_agg(
            json_build_object(
              'id_procedimiento', p.id_procedimiento,
              'nombre',           p.nombre
            )
          ) FILTER (WHERE p.id_procedimiento IS NOT NULL),
          '[]'
        ) AS procedimientos
      FROM tratamientos t
      LEFT JOIN tratamiento_procedimiento tp ON t.id_tratamiento = tp.id_tratamiento
      LEFT JOIN procedimientos p             ON tp.id_procedimiento = p.id_procedimiento
      WHERE t.id_paciente = $1
      GROUP BY t.id_tratamiento, t.descripcion, t.fecha_inicio, t.fecha_fin
      ORDER BY t.fecha_inicio DESC;
    `;
    const result = await pool.query(query, [id_paciente]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error en GET /api/tratamientos/paciente/:id_paciente:', err.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/tratamientos/crear
// Crea un tratamiento con sus procedimientos usando una transacción atómica
// Body: { id_paciente, descripcion, fecha_inicio, fecha_fin?, procedimientos: [id_procedimiento, ...] }
router.post('/crear', verificarToken, async (req, res) => {
  const client = await pool.connect();
  try {
    const { id_paciente, descripcion, fecha_inicio, fecha_fin, procedimientos } = req.body;

    if (!id_paciente || !descripcion || !fecha_inicio) {
      return res.status(400).json({ error: 'id_paciente, descripcion y fecha_inicio son requeridos' });
    }

    if (fecha_fin && new Date(fecha_fin) < new Date(fecha_inicio)) {
      return res.status(400).json({ error: 'La fecha de fin no puede ser anterior a la fecha de inicio' });
    }

    await client.query('BEGIN');

    const tratamientoResult = await client.query(
      `INSERT INTO tratamientos (id_paciente, descripcion, fecha_inicio, fecha_fin)
       VALUES ($1, $2, $3, $4)
       RETURNING id_tratamiento`,
      [id_paciente, descripcion, fecha_inicio, fecha_fin || null]
    );
    const id_tratamiento = tratamientoResult.rows[0].id_tratamiento;

    if (Array.isArray(procedimientos) && procedimientos.length > 0) {
      for (const id_procedimiento of procedimientos) {
        await client.query(
          `INSERT INTO tratamiento_procedimiento (id_tratamiento, id_procedimiento)
           VALUES ($1, $2)
           ON CONFLICT (id_tratamiento, id_procedimiento) DO NOTHING`,
          [id_tratamiento, id_procedimiento]
        );
      }
    }

    await client.query('COMMIT');

    await pool.query(
      `INSERT INTO bitacora (id_usuario, id_accion, fecha)
       SELECT $1, id_accion, CURRENT_TIMESTAMP
       FROM acciones WHERE descripcion = 'CREACION_TRATAMIENTO'`,
      [req.usuario.id]
    );

    res.status(201).json({
      mensaje: 'Tratamiento creado exitosamente',
      id_tratamiento,
      total_procedimientos: Array.isArray(procedimientos) ? procedimientos.length : 0,
    });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error en POST /api/tratamientos/crear:', err.message);
    res.status(500).json({ error: err.message || 'Error interno del servidor' });
  } finally {
    client.release();
  }
});

module.exports = router;
