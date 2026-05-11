//este es archivo de Adrian, no tocar gracias

// routes/pacientes.js
const express = require('express');
const router = express.Router();

// Importamos la conexión y el candado directamente desde tu index.js
const { pool, verificarToken, requerirPermiso } = require('../index'); 
const PERMISOS = require('../utils/permisos');

// --------MIDDLEWARES-----------
// Validación con token a todas las rutas
router.use(verificarToken);
//Se define que todas las rutas pasen por la funcion helper requerirPermiso

// CRUD
router.get('/get/todos', requerirPermiso([
    PERMISOS.PATIENT, 
    PERMISOS.APPOINTMENTS, 
    PERMISOS.HOSPITAL, 
    PERMISOS.DOCTOR, 
    PERMISOS.CLINIC,
    PERMISOS.ADMIN]) ,async (req, res) => {
  try {
    const query = `
    SELECT p.id_paciente, p.nombre, p.apellido, p.telefono, p.email, p.id_sexo, p.id_estado_civil, p.id_grupo_sanguineo, p.fecha_nacimiento,
      s.descripcion as sexo_nombre, 
      g.descripcion as sangre_nombre, 
      e.descripcion as ecivil_nombre
      FROM pacientes p 
      LEFT JOIN sexo s ON p.id_sexo = s.id_sexo
      left join grupo_sanguineo g on p.id_grupo_sanguineo = g.id_grupo_sanguineo
      left join estado_civil e on p.id_estado_civil = e.id_estado_civil
      ORDER BY p.id_paciente ASC;
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error interno' });
  }
});

// Gets de catálogos
router.get('/get/sex', async (req,res) =>{
  try {
    const result = await pool.query('SELECT * FROM sexo');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error en catalogo de sexo' });
  }
});

router.get('/get/civilstate', async (req,res) =>{
  try {
    const result = await pool.query('SELECT * FROM estado_civil');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error en catalogo de estado_civil' });
  }
});
router.get('/get/bloodgroup', async (req,res) =>{
  try {
    const result = await pool.query('SELECT * FROM grupo_sanguineo');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error en catalogo de grupo sanguíneo' });
  }
});

// Post de pacientes
router.post('/crear', requerirPermiso([PERMISOS.PATIENT, PERMISOS.ADMIN]), async (req, res) => {
  try {
    // 1. Extraer los datos del cuerpo de la petición (req.body)
    const { nombre, apellido, email, telefono, fecha_nacimiento, id_sexo, id_estado_civil, id_grupo_sanguineo } = req.body;
    // 2. Definir la consulta INSERT usando marcadores ($1, $2, etc.) por seguridad
    const query = `
      INSERT INTO pacientes (nombre, apellido, email, telefono, fecha_nacimiento, id_sexo, id_estado_civil, id_grupo_sanguineo)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *; -- Esto devuelve el paciente recién creado
    `;

    // 3. Ejecutar la consulta pasando los valores en un arreglo
    const values = [nombre, apellido, email, telefono, fecha_nacimiento, id_sexo, id_estado_civil, id_grupo_sanguineo];
    const result = await pool.query(query, values);

    // 4. Responder al frontend con éxito
    res.status(201).json({
      mensaje: "Paciente creado exitosamente",
      paciente: result.rows[0]
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Error al crear el paciente" });
  }
});

router.put('/actualizar/:id', requerirPermiso([PERMISOS.PATIENT, PERMISOS.ADMIN]), async (req, res) => {
  try {
    // 1. Extraer los datos del cuerpo de la petición (req.body)
    const { id } = req.params;
    const { nombre, apellido, email, telefono, fecha_nacimiento, id_sexo, id_estado_civil, id_grupo_sanguineo } = req.body;
    // Consulta update con $ para seguridad
    const query = `
      UPDATE pacientes 
      SET 
        nombre = $1, 
        apellido = $2, 
        email = $3, 
        telefono = $4, 
        fecha_nacimiento = $5, 
        id_sexo = $6, 
        id_estado_civil = $7, 
        id_grupo_sanguineo = $8
      WHERE id_paciente = $9
      RETURNING *;
    `;
    const values = [
      nombre, 
      apellido, 
      email || null, 
      telefono || null, 
      fecha_nacimiento, 
      id_sexo ? parseInt(id_sexo) : null, 
      id_estado_civil ? parseInt(id_estado_civil) : null, 
      id_grupo_sanguineo ? parseInt(id_grupo_sanguineo) : null, 
      id
    ];
    //Consulta con los values tolerantes a null
    const result = await pool.query(query, values);
    // Verificar si el paciente realmente existía
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Paciente no encontrado" });
    }
    // 4. Responder al frontend con éxito
    res.status(201).json({
      mensaje: "Paciente actualizado exitosamente",
      paciente: result.rows[0]
    });

  } catch (err) {
    console.error("Error al actualizar paciente:", err.message);
    res.status(500).json({ error: "Error interno al actualizar el paciente" });
  }
});

module.exports = router;