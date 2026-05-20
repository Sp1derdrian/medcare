const express = require('express');
const router = express.Router();

// Importamos la conexión y el middleware de seguridad desde el index principal
const { pool, verificarToken } = require('../index');

// GET: Listar todas las salas
// Ruta final: /api/salas/todos
router.get('/todos', verificarToken, async (req, res) => {
  try {
    const query = `
        SELECT id_sala, numero, tipo 
        FROM salas 
        ORDER BY id_sala ASC;
    `;
    const result = await pool.query(query);
    
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener las salas:", error);
    res.status(500).json({ error: "Error interno del servidor al obtener salas" });
  }
});

// POST: Crear una nueva sala
// Ruta final: /api/salas/crear
router.post('/crear', verificarToken, async (req, res) => {
  const { numero, tipo } = req.body;

  if (!numero || !tipo) {
    return res.status(400).json({ error: "El número y tipo de sala son obligatorios" });
  }

  try {
    const query = `
      INSERT INTO salas (numero, tipo) 
      VALUES ($1, $2) 
      RETURNING *;
    `;
    const result = await pool.query(query, [numero, tipo]);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error al crear la sala:", error);
    res.status(500).json({ error: "Error al guardar la sala en la base de datos" });
  }
});

module.exports = router;