const express = require('express');
const router = express.Router();
const { pool, verificarToken } = require('../index');

// GET /api/recetas/citas
// Lista de citas Completadas y Confirmadas para el selector del formulario de recetas
router.get('/citas', verificarToken, async (req, res) => {
  try {
    const query = `
      SELECT
        c.id_cita,
        c.fecha,
        c.estado,
        p.nombre || ' ' || p.apellido AS paciente_nombre,
        d.nombre || ' ' || d.apellido AS doctor_nombre,
        tc.descripcion AS tipo_cita
      FROM citas c
      JOIN pacientes  p  ON c.id_paciente  = p.id_paciente
      JOIN doctores   d  ON c.id_doctor    = d.id_doctor
      JOIN tipos_cita tc ON c.id_tipo_cita = tc.id_tipo_cita
      WHERE c.estado IN ('Completada', 'Confirmada')
      ORDER BY c.fecha DESC;
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error('Error en GET /api/recetas/citas:', err.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/recetas/medicamentos
// Catálogo completo de medicamentos para poblar el formulario del frontend
router.get('/medicamentos', verificarToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id_medicamento, nombre FROM medicamentos ORDER BY nombre ASC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error en GET /api/recetas/medicamentos:', err.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/recetas/cita/:id_cita
// Verifica si una cita ya tiene receta y devuelve su detalle completo con medicamentos
router.get('/cita/:id_cita', verificarToken, async (req, res) => {
  try {
    const { id_cita } = req.params;
    const query = `
      SELECT
        r.id_receta,
        r.id_cita,
        r.fecha,
        COALESCE(
          json_agg(
            json_build_object(
              'id_receta_medicamento', rm.id_receta_medicamento,
              'id_medicamento',        rm.id_medicamento,
              'nombre',                m.nombre,
              'dosis',                 rm.dosis,
              'frecuencia',            rm.frecuencia,
              'periodo_administracion',rm.periodo_administracion,
              'observaciones',         rm.observaciones
            )
          ) FILTER (WHERE rm.id_receta_medicamento IS NOT NULL),
          '[]'
        ) AS medicamentos
      FROM recetas r
      LEFT JOIN receta_medicamento rm ON r.id_receta = rm.id_receta
      LEFT JOIN medicamentos m        ON rm.id_medicamento = m.id_medicamento
      WHERE r.id_cita = $1
      GROUP BY r.id_receta, r.id_cita, r.fecha;
    `;
    const result = await pool.query(query, [id_cita]);

    if (result.rows.length === 0) {
      return res.json({ receta: null });
    }
    res.json({ receta: result.rows[0] });
  } catch (err) {
    console.error('Error en GET /api/recetas/cita/:id_cita:', err.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/recetas/crear
// Crea una receta con múltiples medicamentos usando una transacción atómica
// Body: { id_cita: number, medicamentos: [{ id_medicamento, dosis, frecuencia, periodo_administracion?, observaciones? }] }
router.post('/crear', verificarToken, async (req, res) => {
  const client = await pool.connect();
  try {
    const { id_cita, medicamentos } = req.body;

    if (!id_cita || !Array.isArray(medicamentos) || medicamentos.length === 0) {
      return res.status(400).json({ error: 'id_cita y al menos un medicamento son requeridos' });
    }

    await client.query('BEGIN');

    // 1. Insertar cabecera de la receta y capturar el id generado
    const recetaResult = await client.query(
      `INSERT INTO recetas (id_cita, fecha) VALUES ($1, CURRENT_DATE) RETURNING id_receta`,
      [id_cita]
    );
    const id_receta = recetaResult.rows[0].id_receta;

    // 2. Insertar cada medicamento; si uno falla, el ROLLBACK deshace todo
    for (const med of medicamentos) {
      const { id_medicamento, dosis, frecuencia, periodo_administracion, observaciones } = med;

      if (!id_medicamento || !dosis || !frecuencia) {
        throw new Error('Cada medicamento requiere id_medicamento, dosis y frecuencia');
      }

      await client.query(
        `INSERT INTO receta_medicamento
           (id_receta, id_medicamento, dosis, frecuencia, periodo_administracion, observaciones)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [id_receta, id_medicamento, dosis, frecuencia, periodo_administracion || null, observaciones || null]
      );
    }

    await client.query('COMMIT');

    // 3. Bitácora por nombre para no depender del ID auto-generado
    await pool.query(
      `INSERT INTO bitacora (id_usuario, id_accion, fecha)
       SELECT $1, id_accion, CURRENT_TIMESTAMP
       FROM acciones WHERE descripcion = 'CREACION_RECETA'`,
      [req.usuario.id]
    );

    res.status(201).json({
      mensaje: 'Receta creada exitosamente',
      id_receta,
      total_medicamentos: medicamentos.length,
    });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error en POST /api/recetas/crear:', err.message);
    res.status(500).json({ error: err.message || 'Error interno del servidor' });
  } finally {
    client.release();
  }
});

module.exports = router;
