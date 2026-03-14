-- Insertar Roles
INSERT INTO "roles" (nombre) VALUES 
('Administrador'), ('Doctor'), ('Enfermero'), ('Recepcionista');
INSERT INTO "usuarios" (username, email, password) 
VALUES (
  'Dr. Adrian Ruiz', 
  'admin@admin',
  '$2b$10$SeasEoSwnw9l2lLrdiwVee2yW.g5hjy6VOjZIZp6J2mRyc3TpOgG2'
);
--putos todos
INSERT INTO "permisos" (nombre) VALUES ('crear_paciente'), ('ver_expediente'), ('crear_receta'),('asignar_rol'),('asignar_permisos');

INSERT INTO "usuario_rol" (usuario_id, rol_id) VALUES (1,1);

-- 3. Los conectamos (Ej: Al Doctor (Rol 2) le damos permiso de ver expediente (Permiso 2) y crear receta (Permiso 3))
INSERT INTO "rol_permiso" (rol_id, permiso_id) VALUES 
(2, 2), 
(2, 3),
(1, 4),
(1, 5);

-- Insertar Sexo
INSERT INTO "sexo" (descripcion) VALUES 
('Masculino'), ('Femenino');

-- Insertar Estado Civil
INSERT INTO "estado_civil" (descripcion) VALUES 
('Soltero/a'), ('Casado/a'), ('Divorciado/a'), ('Viudo/a');

-- Insertar Grupos Sanguíneos
INSERT INTO "grupo_sanguineo" (descripcion) VALUES 
('A+'), ('A-'), ('B+'), ('B-'), ('AB+'), ('AB-'), ('O+'), ('O-');

-- Insertar Especialidades
INSERT INTO "especialidades" (nombre) VALUES 
('Medicina General'), ('Pediatría'), ('Cardiología'), ('Dermatología'), ('Ginecología');

-- Insertar un Doctor de prueba
INSERT INTO "doctores" (nombre, apellido, cedula_profesional, telefono) VALUES 
('Dr', 'House', 'CED1234567', '3312345678');