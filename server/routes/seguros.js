const express = require('express');
const router = express.Router();

// Importamos la conexión y el middleware tal como lo descubrimos antes
const { pool, verificarToken } = require('../index');

// 1. GET - Listar catálogo de aseguradoras
router.get('/aseguradoras', verificarToken, async (req, res) => {
  try {
    const resultado = await pool.query('SELECT * FROM aseguradoras ORDER BY nombre ASC');
    res.json(resultado.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Error al obtener el catálogo de aseguradoras' });
  }
});

// 2. POST - Agregar una nueva aseguradora
router.post('/aseguradoras', verificarToken, async (req, res) => {
  try {
    const { nombre } = req.body;
    if (!nombre) {
      return res.status(400).json({ error: 'El nombre de la aseguradora es requerido' });
    }
    const nueva = await pool.query(
      'INSERT INTO aseguradoras (nombre) VALUES ($1) RETURNING *',
      [nombre]
    );
    res.json(nueva.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Error al registrar la aseguradora' });
  }
});

// 3. GET - Listar tipos de seguro (Catálogo)
router.get('/tipos', verificarToken, async (req, res) => {
  try {
    const resultado = await pool.query('SELECT * FROM tipos_seguro ORDER BY descripcion ASC');
    res.json(resultado.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Error al obtener los tipos de seguro' });
  }
});

// 4. POST - Crear la póliza en la tabla 'seguros'
router.post('/poliza', verificarToken, async (req, res) => {
  try {
    const { id_aseguradora, id_tipo_seguro, numero_poliza } = req.body;
    
    if (!id_aseguradora || !id_tipo_seguro || !numero_poliza) {
      return res.status(400).json({ error: 'Todos los datos de la póliza son obligatorios' });
    }

    const nuevaPoliza = await pool.query(
      'INSERT INTO seguros (id_aseguradora, id_tipo_seguro, numero_poliza) VALUES ($1, $2, $3) RETURNING *',
      [id_aseguradora, id_tipo_seguro, numero_poliza]
    );
    // Retornamos la póliza creada, que incluye el valioso id_seguro
    res.json(nuevaPoliza.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Error al registrar la póliza' });
  }
});

// 5. PUT - Vincular el seguro creado con el paciente (La tarea colaborativa)
router.put('/vincular-paciente', verificarToken, async (req, res) => {
  try {
    const { id_paciente, id_seguro } = req.body;

    if (!id_paciente || !id_seguro) {
      return res.status(400).json({ error: 'Se requiere el paciente y el seguro para vincularlos' });
    }

    const updatePaciente = await pool.query(
      'UPDATE pacientes SET id_seguro = $1 WHERE id_paciente = $2 RETURNING *',
      [id_seguro, id_paciente]
    );
    
    res.json(updatePaciente.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Error al vincular la póliza con el paciente' });
  }
});

// 6. GET - Obtener los detalles de una póliza específica por su ID
router.get('/poliza/:id', verificarToken, async (req, res) => {
  try {
    const { id } = req.params;
    const resultado = await pool.query('SELECT * FROM seguros WHERE id_seguro = $1', [id]);
    res.json(resultado.rows[0] || null);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Error al obtener la póliza' });
  }
});

// 7. PUT - Actualizar los datos de una póliza existente
router.put('/poliza/:id', verificarToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { id_aseguradora, id_tipo_seguro, numero_poliza } = req.body;
    
    const resultado = await pool.query(
      'UPDATE seguros SET id_aseguradora = $1, id_tipo_seguro = $2, numero_poliza = $3 WHERE id_seguro = $4 RETURNING *',
      [id_aseguradora, id_tipo_seguro, numero_poliza, id]
    );
    res.json(resultado.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Error al actualizar la póliza' });
  }
});

module.exports = router;