const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

// Configuramos la conexión usando tu .env
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT,
});

async function setupDatabase() {
  try {
    console.log('⏳ Conectando a la base de datos...');

    // 1. Leer el archivo de estructura (Tablas)
    const tablesPath = path.join(__dirname, 'migrations', 'table.sql');
    const tablesSql = fs.readFileSync(tablesPath, 'utf8');
    
    console.log('🛠️ Creando estructura y tablas...');
    await pool.query(tablesSql);

    // 2. Leer el archivo de datos (Catálogos)
    const seedPath = path.join(__dirname, 'migrations', 'seed.sql');
    const seedSql = fs.readFileSync(seedPath, 'utf8');
    
    console.log('🌱 Insertando datos iniciales...');
    await pool.query(seedSql);

    console.log('✅ ¡Base de datos de MedCare configurada exitosamente!');
  } catch (error) {
    console.error('❌ Error configurando la base de datos:', error.message);
  } finally {
    // Cerramos la conexión para que el script termine correctamente
    await pool.end();
  }
}

// Ejecutamos la función
setupDatabase();