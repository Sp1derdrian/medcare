-- ==========================================
-- 1. LIMPIEZA DE TABLAS (DROP)
-- ==========================================
DROP TABLE IF EXISTS "usuarios" CASCADE;
DROP TABLE IF EXISTS "roles" CASCADE;
DROP TABLE IF EXISTS "permisos" CASCADE;
DROP TABLE IF EXISTS "rol_permiso" CASCADE;
DROP TABLE IF EXISTS "usuario_rol" CASCADE;
DROP TABLE IF EXISTS "pacientes" CASCADE;
DROP TABLE IF EXISTS "doctores" CASCADE;
DROP TABLE IF EXISTS "especialidad_doctor" CASCADE;
DROP TABLE IF EXISTS "especialidades" CASCADE;
DROP TABLE IF EXISTS "sexo" CASCADE;
DROP TABLE IF EXISTS "estado_civil" CASCADE;
DROP TABLE IF EXISTS "grupo_sanguineo" CASCADE;
DROP TABLE IF EXISTS "aseguradoras" CASCADE;
DROP TABLE IF EXISTS "seguros" CASCADE;
DROP TABLE IF EXISTS "tipos_seguro" CASCADE;
DROP TABLE IF EXISTS "citas" CASCADE;
DROP TABLE IF EXISTS "tipos_cita" CASCADE;
DROP TABLE IF EXISTS "procedimientos" CASCADE;
DROP TABLE IF EXISTS "cita_procedimiento" CASCADE;
DROP TABLE IF EXISTS "historial_medico" CASCADE;
DROP TABLE IF EXISTS "tratamientos" CASCADE;
DROP TABLE IF EXISTS "tratamiento_procedimiento" CASCADE;
DROP TABLE IF EXISTS "recetas" CASCADE;
DROP TABLE IF EXISTS "medicamentos" CASCADE;
DROP TABLE IF EXISTS "receta_medicamento" CASCADE;
DROP TABLE IF EXISTS "hospitalizaciones" CASCADE;
DROP TABLE IF EXISTS "salas" CASCADE;
DROP TABLE IF EXISTS "hospitalizacion_procedimiento" CASCADE;
DROP TABLE IF EXISTS "hospitalizacion_medicamento" CASCADE;
DROP TABLE IF EXISTS "bitacora" CASCADE;
DROP TABLE IF EXISTS "acciones" CASCADE;

-- ==========================================
-- 2. CREACIÓN DE TABLAS (CREATE)
-- ==========================================
CREATE TABLE "usuarios" (
  "id" SERIAL PRIMARY KEY,
  "username" varchar(50) UNIQUE NOT NULL,
  "password" varchar(255) NOT NULL,
  "email" varchar(100) UNIQUE NOT NULL,
  "created_at" timestamp DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "roles" (
  "id" SERIAL PRIMARY KEY,
  "nombre" varchar
);

CREATE TABLE "permisos" (
  "id" SERIAL PRIMARY KEY,
  "nombre" varchar
);

CREATE TABLE "rol_permiso" (
  "id" SERIAL PRIMARY KEY,
  "rol_id" integer,
  "permiso_id" integer
);

CREATE TABLE "usuario_rol" (
  "id" SERIAL PRIMARY KEY,
  "usuario_id" integer,
  "rol_id" integer
);

CREATE TABLE "pacientes" (
  "id" SERIAL PRIMARY KEY,
  "nombre" varchar,
  "apellido" varchar,
  "fecha_nacimiento" date,
  "sexo_id" integer,
  "estado_civil_id" integer,
  "grupo_sanguineo_id" integer,
  "seguro_id" integer,
  "telefono" varchar(10),       
  "email" varchar,          
  "direccion" text          
);

CREATE TABLE "doctores" (
  "id" SERIAL PRIMARY KEY,
  "nombre" varchar,
  "apellido" varchar,
  "cedula_profesional" varchar, 
  "telefono" varchar(10)            
);

CREATE TABLE "especialidad_doctor" (
  "id" SERIAL PRIMARY KEY,
  "doctor" integer,
  "especialidad" integer
);

CREATE TABLE "especialidades" (
  "id" SERIAL PRIMARY KEY,
  "nombre" varchar
);

CREATE TABLE "sexo" (
  "id" SERIAL PRIMARY KEY,
  "descripcion" varchar
);

CREATE TABLE "estado_civil" (
  "id" SERIAL PRIMARY KEY,
  "descripcion" varchar
);

CREATE TABLE "grupo_sanguineo" (
  "id" SERIAL PRIMARY KEY,
  "descripcion" varchar
);

CREATE TABLE "aseguradoras" (
  "id" SERIAL PRIMARY KEY,
  "nombre" varchar
);

CREATE TABLE "seguros" (
  "id" SERIAL PRIMARY KEY,
  "aseguradora_id" integer,
  "tipo_seguro_id" integer,
  "numero_poliza" varchar
);

CREATE TABLE "tipos_seguro" (
  "id" SERIAL PRIMARY KEY,
  "descripcion" varchar
);

CREATE TABLE "citas" (
  "id" SERIAL PRIMARY KEY,
  "paciente_id" integer,
  "doctor_id" integer,
  "usuario_id" integer,
  "tipo_cita_id" integer,
  "fecha" timestamp,
  "estado" varchar          
);

CREATE TABLE "tipos_cita" (
  "id" SERIAL PRIMARY KEY,
  "descripcion" varchar
);

CREATE TABLE "procedimientos" (
  "id" SERIAL PRIMARY KEY,
  "nombre" varchar
);

CREATE TABLE "cita_procedimiento" (
  "id" SERIAL PRIMARY KEY,
  "cita_id" integer,
  "procedimiento_id" integer
);

CREATE TABLE "historial_medico" (
  "id" SERIAL PRIMARY KEY,
  "paciente_id" integer,
  "descripcion" text,
  "fecha" timestamp
);

CREATE TABLE "tratamientos" (
  "id" SERIAL PRIMARY KEY,
  "paciente_id" integer,
  "descripcion" text,
  "fecha_inicio" date,
  "fecha_fin" date
);

CREATE TABLE "tratamiento_procedimiento" (
  "id" SERIAL PRIMARY KEY,
  "tratamiento_id" integer,
  "procedimiento_id" integer
);

CREATE TABLE "recetas" (
  "id" SERIAL PRIMARY KEY,
  "cita_id" integer,
  "paciente_id" integer,
  "doctor_id" integer,
  "fecha" date
);

CREATE TABLE "medicamentos" (
  "id" SERIAL PRIMARY KEY,
  "nombre" varchar
);

CREATE TABLE "receta_medicamento" (
  "id" SERIAL PRIMARY KEY,
  "receta_id" integer,
  "medicamento_id" integer,
  "dosis" varchar,
  "frecuencia" varchar
);

CREATE TABLE "hospitalizaciones" (
  "id" SERIAL PRIMARY KEY,
  "paciente_id" integer,
  "sala_id" integer,
  "fecha_ingreso" date,
  "fecha_alta" date
);

CREATE TABLE "salas" (
  "id" SERIAL PRIMARY KEY,
  "numero" varchar,
  "tipo" varchar
);

CREATE TABLE "hospitalizacion_procedimiento" (
  "id" SERIAL PRIMARY KEY,
  "hospitalizacion_id" integer,
  "procedimiento_id" integer
);

CREATE TABLE "hospitalizacion_medicamento" (
  "id" SERIAL PRIMARY KEY,
  "hospitalizacion_id" integer,
  "medicamento_id" integer
);

CREATE TABLE "bitacora" (
  "id" SERIAL PRIMARY KEY,
  "usuario_id" integer,
  "accion" integer,
  "fecha" timestamp
);

CREATE TABLE "acciones" (
  "id" SERIAL PRIMARY KEY,
  "descripcion" varchar
);

-- ==========================================
-- 3. LLAVES FORÁNEAS (ALTER TABLE)
-- ==========================================
ALTER TABLE "rol_permiso" ADD FOREIGN KEY ("rol_id") REFERENCES "roles" ("id");
ALTER TABLE "rol_permiso" ADD FOREIGN KEY ("permiso_id") REFERENCES "permisos" ("id");
ALTER TABLE "usuario_rol" ADD FOREIGN KEY ("usuario_id") REFERENCES "usuarios" ("id");
ALTER TABLE "usuario_rol" ADD FOREIGN KEY ("rol_id") REFERENCES "roles" ("id");
ALTER TABLE "pacientes" ADD FOREIGN KEY ("sexo_id") REFERENCES "sexo" ("id");
ALTER TABLE "pacientes" ADD FOREIGN KEY ("estado_civil_id") REFERENCES "estado_civil" ("id");
ALTER TABLE "pacientes" ADD FOREIGN KEY ("grupo_sanguineo_id") REFERENCES "grupo_sanguineo" ("id");
ALTER TABLE "pacientes" ADD FOREIGN KEY ("seguro_id") REFERENCES "seguros" ("id");
ALTER TABLE "especialidad_doctor" ADD FOREIGN KEY ("doctor") REFERENCES "doctores" ("id");
ALTER TABLE "especialidad_doctor" ADD FOREIGN KEY ("especialidad") REFERENCES "especialidades" ("id");
ALTER TABLE "seguros" ADD FOREIGN KEY ("aseguradora_id") REFERENCES "aseguradoras" ("id");
ALTER TABLE "seguros" ADD FOREIGN KEY ("tipo_seguro_id") REFERENCES "tipos_seguro" ("id");
ALTER TABLE "citas" ADD FOREIGN KEY ("paciente_id") REFERENCES "pacientes" ("id");
ALTER TABLE "citas" ADD FOREIGN KEY ("doctor_id") REFERENCES "doctores" ("id");
ALTER TABLE "citas" ADD FOREIGN KEY ("usuario_id") REFERENCES "usuarios" ("id");
ALTER TABLE "citas" ADD FOREIGN KEY ("tipo_cita_id") REFERENCES "tipos_cita" ("id");
ALTER TABLE "cita_procedimiento" ADD FOREIGN KEY ("cita_id") REFERENCES "citas" ("id");
ALTER TABLE "cita_procedimiento" ADD FOREIGN KEY ("procedimiento_id") REFERENCES "procedimientos" ("id");
ALTER TABLE "historial_medico" ADD FOREIGN KEY ("paciente_id") REFERENCES "pacientes" ("id");
ALTER TABLE "tratamientos" ADD FOREIGN KEY ("paciente_id") REFERENCES "pacientes" ("id");
ALTER TABLE "tratamiento_procedimiento" ADD FOREIGN KEY ("tratamiento_id") REFERENCES "tratamientos" ("id");
ALTER TABLE "tratamiento_procedimiento" ADD FOREIGN KEY ("procedimiento_id") REFERENCES "procedimientos" ("id");
ALTER TABLE "recetas" ADD FOREIGN KEY ("cita_id") REFERENCES "citas" ("id");
ALTER TABLE "recetas" ADD FOREIGN KEY ("paciente_id") REFERENCES "pacientes" ("id");
ALTER TABLE "recetas" ADD FOREIGN KEY ("doctor_id") REFERENCES "doctores" ("id");
ALTER TABLE "receta_medicamento" ADD FOREIGN KEY ("receta_id") REFERENCES "recetas" ("id");
ALTER TABLE "receta_medicamento" ADD FOREIGN KEY ("medicamento_id") REFERENCES "medicamentos" ("id");
ALTER TABLE "hospitalizaciones" ADD FOREIGN KEY ("paciente_id") REFERENCES "pacientes" ("id");
ALTER TABLE "hospitalizaciones" ADD FOREIGN KEY ("sala_id") REFERENCES "salas" ("id");
ALTER TABLE "hospitalizacion_procedimiento" ADD FOREIGN KEY ("hospitalizacion_id") REFERENCES "hospitalizaciones" ("id");
ALTER TABLE "hospitalizacion_procedimiento" ADD FOREIGN KEY ("procedimiento_id") REFERENCES "procedimientos" ("id");
ALTER TABLE "hospitalizacion_medicamento" ADD FOREIGN KEY ("hospitalizacion_id") REFERENCES "hospitalizaciones" ("id");
ALTER TABLE "hospitalizacion_medicamento" ADD FOREIGN KEY ("medicamento_id") REFERENCES "medicamentos" ("id");
ALTER TABLE "bitacora" ADD FOREIGN KEY ("usuario_id") REFERENCES "usuarios" ("id");
ALTER TABLE "bitacora" ADD FOREIGN KEY ("accion") REFERENCES "acciones" ("id");