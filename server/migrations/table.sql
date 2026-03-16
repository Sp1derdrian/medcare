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
  "id_usuario" SERIAL PRIMARY KEY,
  "username" varchar(50) UNIQUE NOT NULL,
  "password" varchar(255) NOT NULL,
  "email" varchar(100) UNIQUE NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "roles" (
  "id_rol" SERIAL PRIMARY KEY,
  "nombre" varchar(50) UNIQUE NOT NULL
);

CREATE TABLE "permisos" (
  "id_permiso" SERIAL PRIMARY KEY,
  "nombre" varchar(100) UNIQUE NOT NULL
);

CREATE TABLE "rol_permiso" (
  "id_rol_permiso" SERIAL PRIMARY KEY,
  "id_rol" integer NOT NULL,
  "id_permiso" integer NOT NULL,
  UNIQUE ("id_rol", "id_permiso")
);

CREATE TABLE "usuario_rol" (
  "id_usuario_rol" SERIAL PRIMARY KEY,
  "id_usuario" integer NOT NULL,
  "id_rol" integer NOT NULL,
  UNIQUE ("id_usuario", "id_rol")
);

CREATE TABLE "pacientes" (
  "id_paciente" SERIAL PRIMARY KEY,
  "nombre" varchar(100) NOT NULL,
  "apellido" varchar(100) NOT NULL,
  "fecha_nacimiento" date NOT NULL,
  "id_sexo" integer NOT NULL,
  "id_estado_civil" integer,
  "id_grupo_sanguineo" integer,
  "id_seguro" integer,
  "telefono" varchar(10),
  "email" varchar(100),
  "direccion" text
);

CREATE TABLE "doctores" (
  "id_doctor" SERIAL PRIMARY KEY,
  "nombre" varchar(100) NOT NULL,
  "apellido" varchar(100) NOT NULL,
  "cedula_profesional" varchar(30) UNIQUE NOT NULL,
  "telefono" varchar(10)
);

CREATE TABLE "especialidad_doctor" (
  "id_especialidad_doctor" SERIAL PRIMARY KEY,
  "id_doctor" integer NOT NULL,
  "id_especialidad" integer NOT NULL,
  UNIQUE ("id_doctor", "id_especialidad")
);

CREATE TABLE "especialidades" (
  "id_especialidad" SERIAL PRIMARY KEY,
  "nombre" varchar(100) UNIQUE NOT NULL
);

CREATE TABLE "sexo" (
  "id_sexo" SERIAL PRIMARY KEY,
  "descripcion" varchar(30) UNIQUE NOT NULL
);

CREATE TABLE "estado_civil" (
  "id_estado_civil" SERIAL PRIMARY KEY,
  "descripcion" varchar(50) UNIQUE NOT NULL
);

CREATE TABLE "grupo_sanguineo" (
  "id_grupo_sanguineo" SERIAL PRIMARY KEY,
  "descripcion" varchar(10) UNIQUE NOT NULL
);

CREATE TABLE "aseguradoras" (
  "id_aseguradora" SERIAL PRIMARY KEY,
  "nombre" varchar(100) UNIQUE NOT NULL
);

CREATE TABLE "seguros" (
  "id_seguro" SERIAL PRIMARY KEY,
  "id_aseguradora" integer NOT NULL,
  "id_tipo_seguro" integer NOT NULL,
  "numero_poliza" varchar(50) NOT NULL
);

CREATE TABLE "tipos_seguro" (
  "id_tipo_seguro" SERIAL PRIMARY KEY,
  "descripcion" varchar(100) UNIQUE NOT NULL
);

CREATE TABLE "citas" (
  "id_cita" SERIAL PRIMARY KEY,
  "id_paciente" integer NOT NULL,
  "id_doctor" integer NOT NULL,
  "id_usuario" integer NOT NULL,
  "id_tipo_cita" integer NOT NULL,
  "fecha" timestamp NOT NULL,
  "estado" varchar(20) NOT NULL,
  CHECK ("estado" IN ('Pendiente', 'Confirmada', 'Cancelada', 'Completada'))
);

CREATE TABLE "tipos_cita" (
  "id_tipo_cita" SERIAL PRIMARY KEY,
  "descripcion" varchar(100) UNIQUE NOT NULL
);

CREATE TABLE "procedimientos" (
  "id_procedimiento" SERIAL PRIMARY KEY,
  "nombre" varchar(100) NOT NULL
);

CREATE TABLE "cita_procedimiento" (
  "id_cita_procedimiento" SERIAL PRIMARY KEY,
  "id_cita" integer NOT NULL,
  "id_procedimiento" integer NOT NULL,
  UNIQUE ("id_cita", "id_procedimiento")
);

CREATE TABLE "historial_medico" (
  "id_historial_medico" SERIAL PRIMARY KEY,
  "id_paciente" integer NOT NULL,
  "descripcion" text NOT NULL,
  "fecha" timestamp NOT NULL
);

CREATE TABLE "tratamientos" (
  "id_tratamiento" SERIAL PRIMARY KEY,
  "id_paciente" integer NOT NULL,
  "descripcion" text NOT NULL,
  "fecha_inicio" date NOT NULL,
  "fecha_fin" date,
  CHECK ("fecha_fin" IS NULL OR "fecha_fin" >= "fecha_inicio")
);

CREATE TABLE "tratamiento_procedimiento" (
  "id_tratamiento_procedimiento" SERIAL PRIMARY KEY,
  "id_tratamiento" integer NOT NULL,
  "id_procedimiento" integer NOT NULL,
  UNIQUE ("id_tratamiento", "id_procedimiento")
);

CREATE TABLE "recetas" (
  "id_receta" SERIAL PRIMARY KEY,
  "id_cita" integer NOT NULL,
  "fecha" date NOT NULL
);

CREATE TABLE "medicamentos" (
  "id_medicamento" SERIAL PRIMARY KEY,
  "nombre" varchar(100) UNIQUE NOT NULL
);

CREATE TABLE "receta_medicamento" (
  "id_receta_medicamento" SERIAL PRIMARY KEY,
  "id_receta" integer NOT NULL,
  "id_medicamento" integer NOT NULL,
  "dosis" varchar(100) NOT NULL,
  "frecuencia" varchar(100) NOT NULL,
  "periodo_administracion" varchar(100),
  "observaciones" text,
  UNIQUE ("id_receta", "id_medicamento")
);

CREATE TABLE "hospitalizaciones" (
  "id_hospitalizacion" SERIAL PRIMARY KEY,
  "id_paciente" integer NOT NULL,
  "id_sala" integer NOT NULL,
  "fecha_ingreso" date NOT NULL,
  "fecha_alta" date,
  CHECK ("fecha_alta" IS NULL OR "fecha_alta" >= "fecha_ingreso")
);

CREATE TABLE "salas" (
  "id_sala" SERIAL PRIMARY KEY,
  "numero" varchar(20) NOT NULL,
  "tipo" varchar(50) NOT NULL
);

CREATE TABLE "hospitalizacion_procedimiento" (
  "id_hospitalizacion_procedimiento" SERIAL PRIMARY KEY,
  "id_hospitalizacion" integer NOT NULL,
  "id_procedimiento" integer NOT NULL,
  UNIQUE ("id_hospitalizacion", "id_procedimiento")
);

CREATE TABLE "hospitalizacion_medicamento" (
  "id_hospitalizacion_medicamento" SERIAL PRIMARY KEY,
  "id_hospitalizacion" integer NOT NULL,
  "id_medicamento" integer NOT NULL,
  "periodo_administracion" varchar(100),
  "observaciones" text,
  UNIQUE ("id_hospitalizacion", "id_medicamento")
);

CREATE TABLE "bitacora" (
  "id_bitacora" SERIAL PRIMARY KEY,
  "id_usuario" integer NOT NULL,
  "id_accion" integer NOT NULL,
  "fecha" timestamp NOT NULL
);

CREATE TABLE "acciones" (
  "id_accion" SERIAL PRIMARY KEY,
  "descripcion" varchar(100) UNIQUE NOT NULL
);

-- ==========================================
-- 3. LLAVES FORÁNEAS (ALTER TABLE)
-- ==========================================
ALTER TABLE "rol_permiso" ADD FOREIGN KEY ("id_rol") REFERENCES "roles" ("id_rol");
ALTER TABLE "rol_permiso" ADD FOREIGN KEY ("id_permiso") REFERENCES "permisos" ("id_permiso");
ALTER TABLE "usuario_rol" ADD FOREIGN KEY ("id_usuario") REFERENCES "usuarios" ("id_usuario");
ALTER TABLE "usuario_rol" ADD FOREIGN KEY ("id_rol") REFERENCES "roles" ("id_rol");
ALTER TABLE "pacientes" ADD FOREIGN KEY ("id_sexo") REFERENCES "sexo" ("id_sexo");
ALTER TABLE "pacientes" ADD FOREIGN KEY ("id_estado_civil") REFERENCES "estado_civil" ("id_estado_civil");
ALTER TABLE "pacientes" ADD FOREIGN KEY ("id_grupo_sanguineo") REFERENCES "grupo_sanguineo" ("id_grupo_sanguineo");
ALTER TABLE "pacientes" ADD FOREIGN KEY ("id_seguro") REFERENCES "seguros" ("id_seguro");
ALTER TABLE "especialidad_doctor" ADD FOREIGN KEY ("id_doctor") REFERENCES "doctores" ("id_doctor");
ALTER TABLE "especialidad_doctor" ADD FOREIGN KEY ("id_especialidad") REFERENCES "especialidades" ("id_especialidad");
ALTER TABLE "seguros" ADD FOREIGN KEY ("id_aseguradora") REFERENCES "aseguradoras" ("id_aseguradora");
ALTER TABLE "seguros" ADD FOREIGN KEY ("id_tipo_seguro") REFERENCES "tipos_seguro" ("id_tipo_seguro");
ALTER TABLE "citas" ADD FOREIGN KEY ("id_paciente") REFERENCES "pacientes" ("id_paciente");
ALTER TABLE "citas" ADD FOREIGN KEY ("id_doctor") REFERENCES "doctores" ("id_doctor");
ALTER TABLE "citas" ADD FOREIGN KEY ("id_usuario") REFERENCES "usuarios" ("id_usuario");
ALTER TABLE "citas" ADD FOREIGN KEY ("id_tipo_cita") REFERENCES "tipos_cita" ("id_tipo_cita");
ALTER TABLE "cita_procedimiento" ADD FOREIGN KEY ("id_cita") REFERENCES "citas" ("id_cita");
ALTER TABLE "cita_procedimiento" ADD FOREIGN KEY ("id_procedimiento") REFERENCES "procedimientos" ("id_procedimiento");
ALTER TABLE "historial_medico" ADD FOREIGN KEY ("id_paciente") REFERENCES "pacientes" ("id_paciente");
ALTER TABLE "tratamientos" ADD FOREIGN KEY ("id_paciente") REFERENCES "pacientes" ("id_paciente");
ALTER TABLE "tratamiento_procedimiento" ADD FOREIGN KEY ("id_tratamiento") REFERENCES "tratamientos" ("id_tratamiento");
ALTER TABLE "tratamiento_procedimiento" ADD FOREIGN KEY ("id_procedimiento") REFERENCES "procedimientos" ("id_procedimiento");
ALTER TABLE "recetas" ADD FOREIGN KEY ("id_cita") REFERENCES "citas" ("id_cita");
ALTER TABLE "receta_medicamento" ADD FOREIGN KEY ("id_receta") REFERENCES "recetas" ("id_receta");
ALTER TABLE "receta_medicamento" ADD FOREIGN KEY ("id_medicamento") REFERENCES "medicamentos" ("id_medicamento");
ALTER TABLE "hospitalizaciones" ADD FOREIGN KEY ("id_paciente") REFERENCES "pacientes" ("id_paciente");
ALTER TABLE "hospitalizaciones" ADD FOREIGN KEY ("id_sala") REFERENCES "salas" ("id_sala");
ALTER TABLE "hospitalizacion_procedimiento" ADD FOREIGN KEY ("id_hospitalizacion") REFERENCES "hospitalizaciones" ("id_hospitalizacion");
ALTER TABLE "hospitalizacion_procedimiento" ADD FOREIGN KEY ("id_procedimiento") REFERENCES "procedimientos" ("id_procedimiento");
ALTER TABLE "hospitalizacion_medicamento" ADD FOREIGN KEY ("id_hospitalizacion") REFERENCES "hospitalizaciones" ("id_hospitalizacion");
ALTER TABLE "hospitalizacion_medicamento" ADD FOREIGN KEY ("id_medicamento") REFERENCES "medicamentos" ("id_medicamento");
ALTER TABLE "bitacora" ADD FOREIGN KEY ("id_usuario") REFERENCES "usuarios" ("id_usuario");
ALTER TABLE "bitacora" ADD FOREIGN KEY ("id_accion") REFERENCES "acciones" ("id_accion");