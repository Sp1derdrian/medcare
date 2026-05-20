//archivo de rutas de doctores - Diego

const express = require('express');
const router = express.Router();

const { pool, verificarToken } = require('../index');
const PERMISOS = require('../utils/permisos');
// GET /api/doctores/get/todos
// Lista doctores con sus especialidades
router.get('/get/todos', verificarToken, async (req, res) => {
  try {
    const query = `
      SELECT 
        d.id_doctor AS id,
        d.nombre,
        d.apellido,
        d.cedula_profesional,
        d.telefono,
        COALESCE(
          json_agg(
            json_build_object(
              'id', e.id_especialidad,
              'nombre', e.nombre
            )
          ) FILTER (WHERE e.id_especialidad IS NOT NULL),
          '[]'
        ) AS especialidades
      FROM doctores d
      LEFT JOIN especialidad_doctor ed 
        ON d.id_doctor = ed.id_doctor
      LEFT JOIN especialidades e 
        ON ed.id_especialidad = e.id_especialidad
      GROUP BY 
        d.id_doctor,
        d.nombre,
        d.apellido,
        d.cedula_profesional,
        d.telefono
      ORDER BY d.id_doctor ASC;
    `;

    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error('Error en GET /api/doctores/get/todos:', err.message);
    res.status(500).json({ error: 'Error interno al obtener doctores' });
  }
});

// POST /api/doctores/crear
// Crea doctor y asigna múltiples especialidades
router.post('/crear', verificarToken, async (req, res) => {
  const client = await pool.connect();

  try {
    const {
      nombre,
      apellido,
      cedula_profesional,
      telefono,
      especialidades
    } = req.body;

    if (!nombre || !apellido || !cedula_profesional) {
      return res.status(400).json({
        error: 'nombre, apellido y cedula_profesional son obligatorios'
      });
    }

    if (!Array.isArray(especialidades) || especialidades.length === 0) {
      return res.status(400).json({
        error: 'Debe seleccionar al menos una especialidad'
      });
    }

    await client.query('BEGIN');

    const insertDoctorQuery = `
      INSERT INTO doctores (
        nombre,
        apellido,
        cedula_profesional,
        telefono
      )
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;

    const doctorResult = await client.query(insertDoctorQuery, [
      nombre,
      apellido,
      cedula_profesional,
      telefono || null
    ]);

    const doctorCreado = doctorResult.rows[0];

    for (const idEspecialidad of especialidades) {
      await client.query(
        `
          INSERT INTO especialidad_doctor (
            id_doctor,
            id_especialidad
          )
          VALUES ($1, $2);
        `,
        [doctorCreado.id_doctor, idEspecialidad]
      );
    }

    await client.query('COMMIT');

    res.status(201).json({
      mensaje: 'Doctor creado exitosamente',
      doctor: doctorCreado
    });

  } catch (err) {
    await client.query('ROLLBACK');

    console.error('Error en POST /api/doctores/crear:', err.message);

    if (err.code === '23505') {
      return res.status(400).json({
        error: 'Ya existe un doctor con esa cédula profesional'
      });
    }

    if (err.code === '23503') {
      return res.status(400).json({
        error: 'Una de las especialidades enviadas no existe'
      });
    }

    res.status(500).json({ error: 'Error interno al crear doctor' });
  } finally {
    client.release();
  }
});

// PUT /api/doctores/actualizar/:id
// Actualiza doctor y reemplaza sus especialidades
router.put('/actualizar/:id', verificarToken, async (req, res) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;

    const {
      nombre,
      apellido,
      cedula_profesional,
      telefono,
      especialidades
    } = req.body;

    if (!nombre || !apellido || !cedula_profesional) {
      return res.status(400).json({
        error: 'nombre, apellido y cedula_profesional son obligatorios'
      });
    }

    if (!Array.isArray(especialidades) || especialidades.length === 0) {
      return res.status(400).json({
        error: 'Debe seleccionar al menos una especialidad'
      });
    }

    await client.query('BEGIN');

    const updateDoctorQuery = `
      UPDATE doctores
      SET
        nombre = $1,
        apellido = $2,
        cedula_profesional = $3,
        telefono = $4
      WHERE id_doctor = $5
      RETURNING *;
    `;

    const doctorResult = await client.query(updateDoctorQuery, [
      nombre,
      apellido,
      cedula_profesional,
      telefono || null,
      id
    ]);

    if (doctorResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        error: 'Doctor no encontrado'
      });
    }

    const doctorActualizado = doctorResult.rows[0];

    await client.query(
      'DELETE FROM especialidad_doctor WHERE id_doctor = $1;',
      [id]
    );

    for (const idEspecialidad of especialidades) {
      await client.query(
        `
          INSERT INTO especialidad_doctor (
            id_doctor,
            id_especialidad
          )
          VALUES ($1, $2);
        `,
        [id, idEspecialidad]
      );
    }

    await client.query('COMMIT');

    res.json({
      mensaje: 'Doctor actualizado exitosamente',
      doctor: doctorActualizado
    });

  } catch (err) {
    await client.query('ROLLBACK');

    console.error('Error en PUT /api/doctores/actualizar/:id:', err.message);

    if (err.code === '23505') {
      return res.status(400).json({
        error: 'Ya existe otro doctor con esa cédula profesional'
      });
    }

    if (err.code === '23503') {
      return res.status(400).json({
        error: 'Una de las especialidades enviadas no existe'
      });
    }

    res.status(500).json({ error: 'Error interno al actualizar doctor' });
  } finally {
    client.release();
  }
});

router.get('/get/number', async (req,res) =>{
  try {
    const result = await pool.query('SELECT COUNT(id_doctor) as total_doctores FROM doctores');
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error en conteo de doctores' });
  }
});

module.exports = router;
