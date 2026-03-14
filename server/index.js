const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt'); //hash y salt
const jwt = require('jsonwebtoken'); //tokens
const { Pool } = require('pg');
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
  // El token suele enviarse en los headers como "Bearer <token>"
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Extraemos solo el token

  if (!token) {
    return res.status(403).json({ error: 'Acceso denegado. Se requiere un token.' });
  }

  try {
    // Verificamos si el token es válido usando nuestro secreto
    const decodificado = jwt.verify(token, process.env.JWT_SECRET);
    // Guardamos los datos decodificados (que incluye el id) en "req.usuario"
    req.usuario = decodificado; 
    next(); // Todo está bien, le damos pase a la ruta
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido o expirado.' });
  }
};

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});

// ----- RUTAS AUTH -----

//Usuario Registro
app.post('/api/usuarios/registro', async (req,res) =>{
  try{
    const {username, email, password} = req.body;
    const userExists = await pool.query(
      'SELECT * FROM usuarios WHERE email = $1 OR username = $2',
      [email, username]
    );
    if(userExists.rows.length>0){
      return res.status(400).json({error: 'Usuario o correo ya registrado, favor de registrar con uno nuevo'});
    }
    //-------Security-------

    //Salt (ruido único en cada pass)
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    //Hash (encriptación mezclada con Salt)
    const hashedPassword = await bcrypt.hash(password,salt);

    const newUser = await pool.query(
    `INSERT INTO usuarios (username, email, password)
     VALUES($1,$2,$3)
     RETURNING id, username, email, created_at`,
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
      // Por seguridad, siempre damos el mismo mensaje genérico
      return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
    }

    const usuario = userResult.rows[0];

    //Comparamos el texto plano con el Hash de la BD
    const passwordCorrecto = await bcrypt.compare(password, usuario.password);

    if (!passwordCorrecto) {
      return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
    }
    const token = jwt.sign(
      { id: usuario.id }, 
      process.env.JWT_SECRET, 
      { expiresIn: '24h' }
    );
    //Res de éxito
    res.json({
      mensaje: '¡Login exitoso!',
      token: token,
      usuario: {
        id: usuario.id,
        username: usuario.username,
        email: usuario.email
      }
    });

  } catch (err) {
    console.error('Error en login:', err.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

//-----Dashboard------
// GET me con token
app.get('/api/me', verificarToken, async (req, res) => {
  try {
    const usuarioId = req.usuario.id; 

    const query = `
      SELECT 
        u.username, 
        u.email, 
        COALESCE(array_agg(p.nombre) FILTER (WHERE p.nombre IS NOT NULL), '{}') as permisos
      FROM usuarios u
      LEFT JOIN usuario_rol ur ON u.id = ur.usuario_id
      LEFT JOIN roles r ON ur.rol_id = r.id
      LEFT JOIN rol_permiso rp ON r.id = rp.rol_id
      LEFT JOIN permisos p ON rp.permiso_id = p.id
      WHERE u.id = $1
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

//----------Admin---------
//Get usuarios
app.get('/api/get/usuarios-rol',verificarToken, async (req,res)=>{
  try{
      const query = `
      SELECT usuarios.id, usuarios.username, usuarios.email, usuario_rol.rol_id
      FROM usuarios
      LEFT JOIN usuario_rol ON usuarios.id = usuario_rol.usuario_id
      ORDER BY usuarios.id ASC;
        
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

app.get('/api/get/roles', verificarToken, async (req,res) => {
  try {

    const query = `
      SELECT id, nombre
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

app.get('/api/get/rol-permiso', verificarToken, async (req, res) => {
  try {
    const query = `SELECT rol_id, permiso_id FROM rol_permiso;`;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error('Error en /api/get/rol-permiso:', err.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET: Obtener TODOS los permisos disponibles (Para los checkboxes)
app.get('/api/get/permisos', verificarToken, async (req, res) => {
  try {
    const query = `SELECT id, nombre FROM permisos;`;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error('Error en /api/get/permisos:', err.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

