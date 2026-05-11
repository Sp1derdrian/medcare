//archivo maestro de catalogos de Diego 

// routes/catalogos.js
const express = require('express');
const router = express.Router();

// Importamos la conexión a PostgreSQL y el middleware de seguridad
const { pool, verificarToken } = require('../index');

// GET /api/catalogos/medicamentos
router.get('/medicamentos', verificarToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id_medicamento AS id,
        nombre
      FROM medicamentos
      ORDER BY nombre ASC;
    `);

    res.json(result.rows);
  } catch (err) {
    console.error('Error en GET /api/catalogos/medicamentos:', err.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/catalogos/procedimientos
router.get('/procedimientos', verificarToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id_procedimiento AS id,
        nombre
      FROM procedimientos
      ORDER BY nombre ASC;
    `);

    res.json(result.rows);
  } catch (err) {
    console.error('Error en GET /api/catalogos/procedimientos:', err.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/catalogos/especialidades
router.get('/especialidades', verificarToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id_especialidad AS id,
        nombre
      FROM especialidades
      ORDER BY nombre ASC;
    `);

    res.json(result.rows);
  } catch (err) {
    console.error('Error en GET /api/catalogos/especialidades:', err.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/catalogos/tipos-cita
router.get('/tipos-cita', verificarToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id_tipo_cita AS id,
        descripcion
      FROM tipos_cita
      ORDER BY descripcion ASC;
    `);

    res.json(result.rows);
  } catch (err) {
    console.error('Error en GET /api/catalogos/tipos-cita:', err.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;