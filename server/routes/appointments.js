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

router.get('/get/cincoRecientes' ,async (req, res) => {
  try {
    const query = `
    select c.id_cita, c.id_paciente, c.id_doctor, c.fecha, c.estado, p.nombre as paciente_nombre, p.apellido as paciente_apellido, d.nombre as doctor_nombre, d.apellido as doctor_apellido
        from citas c
        left join pacientes p on p.id_paciente=c.id_paciente
        left join doctores d on d.id_doctor=c.id_doctor
        order by c.fecha asc
        limit 5;
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al consultar las 5 citas más recientes' });
  }
});

module.exports = router;