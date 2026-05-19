//archivo de rutas de citas y agendas y demás - Diego

const express = require('express');
const router = express.Router();

const { pool, verificarToken } = require('../index');

const ESTADOS_VALIDOS = ['Pendiente', 'Confirmada', 'Cancelada', 'Completada'];

// GET /api/citas/get/todas
// Lista citas con paciente, doctor y tipo de cita
router.get('/get/todas', verificarToken, async (req, res) => {
  try {
    const query = `
      SELECT
        c.id_cita AS id,
        c.id_paciente,
        c.id_doctor,
        c.id_usuario,
        c.id_tipo_cita,
        c.fecha,
        c.estado,

        p.nombre AS paciente_nombre,
        p.apellido AS paciente_apellido,
        CONCAT(p.nombre, ' ', p.apellido) AS paciente,

        d.nombre AS doctor_nombre,
        d.apellido AS doctor_apellido,
        CONCAT(d.nombre, ' ', d.apellido) AS doctor,

        tc.descripcion AS tipo_cita,

        u.username AS usuario_registro
      FROM citas c
      INNER JOIN pacientes p 
        ON c.id_paciente = p.id_paciente
      INNER JOIN doctores d 
        ON c.id_doctor = d.id_doctor
      INNER JOIN tipos_cita tc 
        ON c.id_tipo_cita = tc.id_tipo_cita
      INNER JOIN usuarios u 
        ON c.id_usuario = u.id_usuario
      ORDER BY c.fecha ASC;
    `;

    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error('Error en GET /api/citas/get/todas:', err.message);
    res.status(500).json({ error: 'Error interno al obtener citas' });
  }
});

// POST /api/citas/crear
// Crea una cita validando paciente, doctor y tipo de cita
router.post('/crear', verificarToken, async (req, res) => {
  try {
    const {
      id_paciente,
      id_doctor,
      id_tipo_cita,
      fecha
    } = req.body;

    const id_usuario = req.usuario.id;

    if (!id_paciente || !id_doctor || !id_tipo_cita || !fecha) {
      return res.status(400).json({
        error: 'id_paciente, id_doctor, id_tipo_cita y fecha son obligatorios'
      });
    }

    const fechaCita = new Date(fecha);

    if (Number.isNaN(fechaCita.getTime())) {
      return res.status(400).json({
        error: 'La fecha enviada no es válida'
      });
    }

    const pacienteExiste = await pool.query(
      'SELECT id_paciente FROM pacientes WHERE id_paciente = $1',
      [id_paciente]
    );

    if (pacienteExiste.rows.length === 0) {
      return res.status(404).json({
        error: 'El paciente seleccionado no existe'
      });
    }

    const doctorExiste = await pool.query(
      'SELECT id_doctor FROM doctores WHERE id_doctor = $1',
      [id_doctor]
    );

    if (doctorExiste.rows.length === 0) {
      return res.status(404).json({
        error: 'El doctor seleccionado no existe'
      });
    }

    const tipoCitaExiste = await pool.query(
      'SELECT id_tipo_cita FROM tipos_cita WHERE id_tipo_cita = $1',
      [id_tipo_cita]
    );

    if (tipoCitaExiste.rows.length === 0) {
      return res.status(404).json({
        error: 'El tipo de cita seleccionado no existe'
      });
    }

    const query = `
      INSERT INTO citas (
        id_paciente,
        id_doctor,
        id_usuario,
        id_tipo_cita,
        fecha,
        estado
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;

    const values = [
      id_paciente,
      id_doctor,
      id_usuario,
      id_tipo_cita,
      fecha,
      'Pendiente'
    ];

    const result = await pool.query(query, values);

    res.status(201).json({
      mensaje: 'Cita creada exitosamente',
      cita: result.rows[0]
    });

  } catch (err) {
    console.error('Error en POST /api/citas/crear:', err.message);

    if (err.code === '23503') {
      return res.status(400).json({
        error: 'Uno de los IDs enviados no existe'
      });
    }

    res.status(500).json({ error: 'Error interno al crear cita' });
  }
});

// PUT /api/citas/actualizar-estado/:id
// Actualiza únicamente el estado de una cita
router.put('/actualizar-estado/:id', verificarToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    if (!estado) {
      return res.status(400).json({
        error: 'El estado es obligatorio'
      });
    }

    if (!ESTADOS_VALIDOS.includes(estado)) {
      return res.status(400).json({
        error: `Estado inválido. Usa uno de estos: ${ESTADOS_VALIDOS.join(', ')}`
      });
    }

    const query = `
      UPDATE citas
      SET estado = $1
      WHERE id_cita = $2
      RETURNING *;
    `;

    const result = await pool.query(query, [estado, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Cita no encontrada'
      });
    }

    res.json({
      mensaje: 'Estado de cita actualizado exitosamente',
      cita: result.rows[0]
    });

  } catch (err) {
    console.error('Error en PUT /api/citas/actualizar-estado/:id:', err.message);
    res.status(500).json({ error: 'Error interno al actualizar estado de cita' });
  }
});

module.exports = router;