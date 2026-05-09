//este es archivo de Adrian, no tocar gracias

// routes/pacientes.js
const express = require('express');
const router = express.Router();

// Importamos la conexión y el candado directamente desde tu index.js
const { pool, verificarToken } = require('../index'); 

// CRUD
router.get('/get_todos', verificarToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM pacientes');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error interno' });
  }
});

module.exports = router;