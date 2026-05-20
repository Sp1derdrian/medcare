const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt'); // hash y salt
const jwt = require('jsonwebtoken'); // tokens
const { Pool } = require('pg');
const PERMISOS = require('./utils/permisos');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares
app.use(cors());
app.use(express.json());

// Configuración de la base de datos PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT,
});

// Probar la conexión a la base de datos
pool.connect()
  .then(() => console.log('🟢 Conectado exitosamente a la base de datos de MedCare'))
  .catch(err => console.error('🔴 Error de conexión a la base de datos:', err.stack));

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('¡Servidor de MedCare funcionando correctamente!');
});

// Middleware para verificar el Token JWT
const verificarToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(403).json({ error: 'Acceso denegado. Se requiere un token.' });
  }

  try {
    const decodificado = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decodificado; 
    next(); 
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido o expirado.' });
  }
};

// Función helper que valida permisos

const requerirPermiso = (permisosExigidos) => {

  const permisosPermitidos = Array.isArray(permisosExigidos) 
    ? permisosExigidos 
    : [permisosExigidos];

  return async (req, res, next) => {
    try {
      const usuarioId = req.usuario.id;

      // TODOS los permisos que tiene este usuario
      const query = `
        SELECT p.nombre 
        FROM usuarios u
        JOIN usuario_rol ur ON u.id_usuario = ur.id_usuario
        JOIN roles r ON ur.id_rol = r.id_rol
        JOIN rol_permiso rp ON r.id_rol = rp.id_rol
        JOIN permisos p ON rp.id_permiso = p.id_permiso
        WHERE u.id_usuario = $1;
      `;
      const result = await pool.query(query, [usuarioId]);
      
      // Resultado a arreglo
      const permisosDelUsuario = result.rows.map(row => row.nombre);

      // Se verifica si se TIENE AL MENOS UNO de los permisos exigidos
      const tienePermiso = permisosPermitidos.some(permiso => permisosDelUsuario.includes(permiso));

      if (!tienePermiso) {
        return res.status(403).json({ 
          error: `Acceso denegado. Requieres alguno de estos permisos: ${permisosPermitidos.join(', ')}` 
        });
      }

      next(); // Proceder con endpoint
    } catch (err) {
      console.error('Error en requerirPermiso:', err.message);
      res.status(500).json({ error: 'Error verificando permisos' });
    }
  };
};


// ==========================================
// Exportar BD y Token para los compañeros en carpeta routes así como función helper de permisos
// ==========================================
module.exports = { pool, verificarToken, requerirPermiso };
// ==========================================
// Conectar los nuevos archivos de rutas IMPORTANTE AGREGAR LAS RUTAS
// ==========================================
app.use('/api/catalogos', require('./routes/catalogo_procesos'));
app.use('/api/pacientes', require('./routes/pacientes'));
app.use('/api/doctores', require('./routes/doctores'));
app.use('/api/citas', require('./routes/appointments'));
// EJEMPLOS
// app.use('/api/doctores', require('./routes/doctores')); // Cuando César lo haga
// app.use('/api/citas', require('./routes/citas')); // Cuando Diego lo haga

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});


// ==========================================
// ----- RUTAS AUTH -----
// ==========================================

// Usuario Registro
app.post('/api/usuarios/registro', async (req,res) =>{
  try{
    const {username, email, password} = req.body;
    const userExists = await pool.query(
      'SELECT * FROM usuarios WHERE email = $1 OR username = $2',
      [email, username]
    );
    
    if(userExists.rows.length > 0){
      return res.status(400).json({error: 'Usuario o correo ya registrado, favor de registrar con uno nuevo'});
    }

    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);

    // NUEVO: RETURNING id_usuario AS id
    const newUser = await pool.query(
    `INSERT INTO usuarios (username, email, password)
     VALUES($1,$2,$3)
     RETURNING id_usuario AS id, username, email, created_at`,
     [username, email, hashedPassword]
    );
    res.json({
      mensaje: 'Usuario registrado correctamente',
      usuario: newUser.rows[0]
    });
  } catch (err){
    console.error('Error en registro', err.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Usuario Login
app.post('/api/usuarios/login', async (req, res) => {
  try {
    const { email, password } = req.body; 
    
    const userResult = await pool.query(
      'SELECT * FROM usuarios WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
    }

    const usuario = userResult.rows[0];
    const passwordCorrecto = await bcrypt.compare(password, usuario.password);

    if (!passwordCorrecto) {
      return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
    }
    
    
    const token = jwt.sign(
      { id: usuario.id_usuario }, 
      process.env.JWT_SECRET, 
      { expiresIn: '24h' }
    );
    
    res.json({
      mensaje: '¡Login exitoso!',
      token: token,
      usuario: {
        id: usuario.id_usuario, // Lo mandamos al front como "id"
        username: usuario.username,
        email: usuario.email
      }
    });

  } catch (err) {
    console.error('Error en login:', err.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});


// ==========================================
// ----- DASHBOARD -----
// ==========================================

// GET me con token
app.get('/api/me', verificarToken, async (req, res) => {
  try {
    const usuarioId = req.usuario.id; // Viene del token

    // NUEVO: Todas las uniones (JOINs) usan los nuevos nombres de columnas
    const query = `
      SELECT 
        u.username, 
        u.email, 
        COALESCE(array_agg(p.nombre) FILTER (WHERE p.nombre IS NOT NULL), '{}') as permisos
      FROM usuarios u
      LEFT JOIN usuario_rol ur ON u.id_usuario = ur.id_usuario
      LEFT JOIN roles r ON ur.id_rol = r.id_rol
      LEFT JOIN rol_permiso rp ON r.id_rol = rp.id_rol
      LEFT JOIN permisos p ON rp.id_permiso = p.id_permiso
      WHERE u.id_usuario = $1
      GROUP BY u.username, u.email;
    `;

    const result = await pool.query(query, [usuarioId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({
      perfil: result.rows[0]
    });

  } catch (err) {
    console.error('Error en /api/me:', err.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});


// ==========================================
// ---------- ADMIN ---------
// ==========================================

// Get usuarios
app.get('/api/get/usuarios-rol', verificarToken, requerirPermiso([PERMISOS.ADMIN]), async (req,res)=>{
  try{
      const query = `
      SELECT 
        u.id_usuario AS id, 
        u.username, 
        u.email, 
        ur.id_rol AS rol_id
      FROM usuarios u
      LEFT JOIN usuario_rol ur ON u.id_usuario = ur.id_usuario
      ORDER BY u.id_usuario ASC;
      `;
      const result = await pool.query(query);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'No existen usuarios o roles en el sistema' });
      }
      res.json(result.rows);
  }catch(err){
      console.error('Error en GET /api/usuarios:', err.message);
      res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Get roles
app.get('/api/get/roles', verificarToken, async (req,res) => {
  try {
    // NUEVO: id_rol AS id
    const query = `
      SELECT id_rol AS id, nombre
      FROM roles
    `;
    const result = await pool.query(query);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No hay roles en el catálogo de roles' });
    }
    res.json(result.rows);
  } catch (err) {
    console.error('Error en /api/get/roles:', err.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Get rol-permiso
app.get('/api/get/rol-permiso', verificarToken, async (req, res) => {
  try {
    // NUEVO: id_rol AS rol_id, id_permiso AS permiso_id
    const query = `
      SELECT id_rol AS rol_id, id_permiso AS permiso_id 
      FROM rol_permiso;
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error('Error en /api/get/rol-permiso:', err.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET: Obtener TODOS los permisos disponibles
app.get('/api/get/permisos', verificarToken, async (req, res) => {
  try {
    
    const query = `
      SELECT id_permiso AS id, nombre 
      FROM permisos;
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error('Error en /api/get/permisos:', err.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ==========================================
// ----- ENDPOINTS DE ACTUALIZACIÓN (PUT) ---
// ==========================================

// PUT: Actualizar el rol de un usuario
app.put('/api/update/usuario-rol', verificarToken, requerirPermiso([PERMISOS.ADMIN]), async (req, res) => {
  
  const client = await pool.connect(); 
  
  try {
    const { usuario_id, rol_id } = req.body;

    await client.query('BEGIN'); // Iniciamos la transacción

    // 1. Siempre limpiamos el rol anterior del usuario en la tabla intermedia
    await client.query('DELETE FROM usuario_rol WHERE id_usuario = $1', [usuario_id]);

    // 2. Si el frontend nos mandó un rol válido (y no un valor nulo), lo insertamos
    if (rol_id) {
      await client.query(
        'INSERT INTO usuario_rol (id_usuario, id_rol) VALUES ($1, $2)',
        [usuario_id, rol_id]
      );
    }

    await client.query('COMMIT'); // Guardamos los cambios
    res.json({ mensaje: 'Rol de usuario actualizado exitosamente' });

  } catch (err) {
    await client.query('ROLLBACK'); // Si algo falla, deshacemos todo por seguridad
    console.error('Error en PUT /api/update/usuario-rol:', err.message);
    res.status(500).json({ error: 'Error al actualizar el rol del usuario' });
  } finally {
    client.release(); // Liberamos la conexión a la base de datos
  }
});

// PUT: Asignar o quitar un permiso a un rol específico (Toggle)
app.put('/api/update/rol-permiso', verificarToken, requerirPermiso([PERMISOS.ADMIN]), async (req, res) => {
  try {
    const { rol_id, permiso_id, asignar } = req.body;
    
    if (asignar) {
      // Queremos PRENDER el checkbox (INSERT)
      // Usamos ON CONFLICT DO NOTHING gracias a que pusiste la regla UNIQUE en tu table.sql
      // Esto evita que la BD explote si por accidente intentamos dar un permiso que ya tenía.
      const query = `
        INSERT INTO rol_permiso (id_rol, id_permiso) 
        VALUES ($1, $2) 
        ON CONFLICT ("id_rol", "id_permiso") DO NOTHING;
      `;
      await pool.query(query, [rol_id, permiso_id]);
      
    } else {
      // Queremos APAGAR el checkbox (DELETE)
      const query = `
        DELETE FROM rol_permiso 
        WHERE id_rol = $1 AND id_permiso = $2;
      `;
      await pool.query(query, [rol_id, permiso_id]);
    }

    res.json({ mensaje: `Permiso ${asignar ? 'asignado' : 'removido'} exitosamente` });

  } catch (err) {
    console.error('Error en PUT /api/update/rol-permiso:', err.message);
    res.status(500).json({ error: 'Error al actualizar los permisos del rol' });
  }
});

app.get('/api/get/bitacora-last-five', verificarToken, async (req, res) => {
  try {
    
    const query = `
      SELECT b.id_bitacora, u.username, a.descripcion, b.fecha
      FROM bitacora b
      LEFT JOIN usuarios u on b.id_usuario = u.id_usuario
      LEFT JOIN acciones a on b.id_accion = a.id_accion
      ORDER BY fecha desc limit 5;
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error('Error en /api/get/bitacora-last-five', err.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.get(
  '/api/get/departments-stats', 
  verificarToken, 
  async (req, res) => {
    try {

      // Consulta avanzada con subqueries
      const query = `
        SELECT 
          e.nombre AS name,
          COALESCE(d.doc_count, 0) AS doctors,
          COALESCE(p.pat_count, 0) AS patients,
          -- Simulamos la ocupación generando un random entre 40 y 95
          TRUNC(RANDOM() * (95 - 40) + 40) AS occupancy
        FROM especialidades e
        -- Subconsulta 1: Contamos doctores por especialidad
        LEFT JOIN (
          SELECT id_especialidad, COUNT(DISTINCT id_doctor) AS doc_count
          FROM especialidad_doctor
          GROUP BY id_especialidad
        ) d ON e.id_especialidad = d.id_especialidad
        -- Subconsulta 2: Contamos pacientes únicos basándonos en las citas de esos doctores
        LEFT JOIN (
          SELECT ed.id_especialidad, COUNT(DISTINCT c.id_paciente) AS pat_count
          FROM especialidad_doctor ed
          JOIN citas c ON ed.id_doctor = c.id_doctor
          GROUP BY ed.id_especialidad
        ) p ON e.id_especialidad = p.id_especialidad
        ORDER BY patients DESC; -- Ordenamos para que los más ocupados salgan primero
      `;
      
      const result = await pool.query(query);

      // Parseamos los datos para asegurarnos de que el frontend reciba números y no strings
      const formattedData = result.rows.map(row => ({
        name: row.name,
        patients: parseInt(row.patients),
        doctors: parseInt(row.doctors),
        occupancy: parseInt(row.occupancy)
      }));

      res.json(formattedData);
    } catch (err) {
      console.error('Error en /api/get/departments-stats', err.message);
      res.status(500).json({ error: 'Error cargando estadísticas de departamentos' });
    }
});

app.get(
  '/api/get/appointments-today', 
  verificarToken, 
  async (req, res) => {
    try {
      // Filtramos por la fecha del servidor actual y omitimos las canceladas
      const query = `
        SELECT COUNT(*) as total_hoy 
        FROM citas 
        WHERE fecha::date = CURRENT_DATE AND estado != 'Cancelada';
      `;
      const result = await pool.query(query);
      
      res.json({ 
        total: parseInt(result.rows[0].total_hoy) || 0 
      });
    } catch (err) {
      console.error('Error en /api/get/appointments-today:', err.message);
      res.status(500).json({ error: 'Error al obtener el conteo de citas diarias' });
    }
});

app.get(
  '/api/get/available-beds', 
  verificarToken, 
  async (req, res) => {
    try {
      // Asumimos un total de 50 camas en el hospital y restamos las ocupadas actualmente
      const query = `
        SELECT (50 - COUNT(*)) as camas_disponibles 
        FROM hospitalizaciones 
        WHERE fecha_alta IS NULL;
      `;
      const result = await pool.query(query);
      
      // Control de errores: Si por alguna razón hay más de 50 activos, aseguramos que no de números negativos
      const disponibles = Math.max(0, parseInt(result.rows[0].camas_disponibles) || 0);
      
      res.json({ 
        total: disponibles 
      });
    } catch (err) {
      console.error('Error en /api/get/available-beds:', err.message);
      res.status(500).json({ error: 'Error al obtener el conteo de camas disponibles' });
    }
});




