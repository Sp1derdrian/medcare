const express = require('express');
const router = express.Router();
const { pool, verificarToken } = require('../index');

// 1. GET - Listar pacientes internados (fecha_alta es NULL)
router.get('/activas', verificarToken, async (req, res) => {
  try {
    const query = `
      SELECT h.*, 
             (p.nombre || ' ' || p.apellido) AS paciente_nombre, 
             s.numero AS sala_numero, 
             s.tipo AS sala_tipo
      FROM hospitalizaciones h
      JOIN pacientes p ON h.id_paciente = p.id_paciente
      JOIN salas s ON h.id_sala = s.id_sala
      WHERE h.fecha_alta IS NULL
      ORDER BY h.fecha_ingreso DESC
    `;
    const resultado = await pool.query(query);
    res.json(resultado.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Error al obtener hospitalizaciones activas' });
  }
});

// 2. POST - Registrar un nuevo ingreso
router.post('/ingreso', verificarToken, async (req, res) => {
  try {
    const { id_paciente, id_sala, fecha_ingreso } = req.body;

    if (!id_paciente || !id_sala || !fecha_ingreso) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    const nuevoIngreso = await pool.query(
      'INSERT INTO hospitalizaciones (id_paciente, id_sala, fecha_ingreso) VALUES ($1, $2, $3) RETURNING *',
      [id_paciente, id_sala, fecha_ingreso]
    );
    res.json(nuevoIngreso.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Error al registrar el ingreso' });
  }
});

// 3. POST - Agregar medicamento consumido (Fiel a tus columnas de DBeaver)
router.post('/consumo-medicamento', verificarToken, async (req, res) => {
  try {
    const { id_hospitalizacion, id_medicamento, periodo_administracion, observaciones } = req.body;
    
    if (!id_hospitalizacion || !id_medicamento) {
      return res.status(400).json({ error: 'Hospitalización y Medicamento son obligatorios' });
    }

    const consumo = await pool.query(
      'INSERT INTO hospitalizacion_medicamento (id_hospitalizacion, id_medicamento, periodo_administracion, observaciones) VALUES ($1, $2, $3, $4) RETURNING *',
      [id_hospitalizacion, id_medicamento, periodo_administracion, observaciones]
    );
    res.json(consumo.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Error al registrar consumo de medicamento' });
  }
});

// 4. POST - Agregar procedimiento realizado
router.post('/consumo-procedimiento', verificarToken, async (req, res) => {
  try {
    const { id_hospitalizacion, id_procedimiento } = req.body;

    if (!id_hospitalizacion || !id_procedimiento) {
      return res.status(400).json({ error: 'Hospitalización y Procedimiento son obligatorios' });
    }

    const consumo = await pool.query(
      'INSERT INTO hospitalizacion_procedimiento (id_hospitalizacion, id_procedimiento) VALUES ($1, $2) RETURNING *',
      [id_hospitalizacion, id_procedimiento]
    );
    res.json(consumo.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Error al registrar el procedimiento' });
  }
});

// 5. PUT - Dar de alta al paciente (Registrar fecha_alta)
router.put('/alta/:id', verificarToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { fecha_alta } = req.body;

    if (!fecha_alta) {
      return res.status(400).json({ error: 'La fecha de alta es requerida' });
    }

    const alta = await pool.query(
      'UPDATE hospitalizaciones SET fecha_alta = $1 WHERE id_hospitalizacion = $2 RETURNING *',
      [fecha_alta, id]
    );
    res.json(alta.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Error al registrar el alta médica' });
  }
});

module.exports = router;