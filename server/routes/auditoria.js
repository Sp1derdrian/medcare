const { pool } = require('../index');


const registrarEnBitacora = async (idUsuario, idAccion) => {
  await pool.query(
    'INSERT INTO bitacora (id_usuario, id_accion, fecha) VALUES ($1, $2, CURRENT_TIMESTAMP)',
    [idUsuario, idAccion]
  );
};


module.exports = { registrarEnBitacora }