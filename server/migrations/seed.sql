-- ==========================================
-- Seeder
-- ==========================================

-- Catálogos base
INSERT INTO "roles" (nombre) VALUES 
('Administrador'), ('Doctor'), ('Enfermero'), ('Recepcionista');

INSERT INTO "permisos" (nombre) VALUES 
('crear_paciente'), ('ver_expediente'), ('crear_receta'), ('asignar_rol'), ('asignar_permisos');
-- se actualizará en base a las necesidades del front
INSERT INTO "sexo" (descripcion) VALUES 
('Masculino'), ('Femenino'), ('Otro');

INSERT INTO "estado_civil" (descripcion) VALUES 
('Soltero/a'), ('Casado/a'), ('Divorciado/a'), ('Viudo/a');

INSERT INTO "grupo_sanguineo" (descripcion) VALUES 
('A+'), ('A-'), ('B+'), ('B-'), ('AB+'), ('AB-'), ('O+'), ('O-');

-- Especialidades
INSERT INTO "especialidades" (nombre) VALUES 
('Medicina General'), ('Pediatría'), ('Cardiología'), ('Dermatología'), ('Ginecología'), 
('Neurología'), ('Traumatología'), ('Psiquiatría'), ('Oftalmología'), ('Otorrinolaringología'), 
('Urología'), ('Oncología');

-- Aseguradoras
INSERT INTO "aseguradoras" (nombre) VALUES 
('GNP Seguros'), ('MetLife'), ('AXA Seguros'), ('Seguros Monterrey'), ('Mapfre'), 
('Inbursa'), ('Allianz'), ('Bupa'), ('Zurich'), ('Qualitas');

INSERT INTO "tipos_seguro" (descripcion) VALUES 
('Gastos Médicos Mayores'), ('Gastos Médicos Menores'), ('Seguro de Vida');

INSERT INTO "tipos_cita" (descripcion) VALUES 
('Consulta General'), ('Especialidad'), ('Urgencia'), ('Revisión de Rutina'), ('Laboratorio');

-- Procedimientos 
INSERT INTO "procedimientos" (nombre) VALUES 
('Toma de presión arterial'), ('Electrocardiograma'), ('Sutura de herida'), ('Extracción de sangre'),
('Radiografía de Tórax'), ('Ecografía Abdominal'), ('Resonancia Magnética'), ('Tomografía Computarizada'),
('Endoscopia'), ('Biopsia'), ('Curación de quemaduras'), ('Aplicación de yeso');

-- Medicamentos 
INSERT INTO "medicamentos" (nombre) VALUES 
('Paracetamol 500mg'), ('Ibuprofeno 400mg'), ('Amoxicilina 500mg'), ('Loratadina 10mg'),
('Omeprazol 20mg'), ('Losartán 50mg'), ('Metformina 850mg'), ('Aspirina 100mg'),
('Diclofenaco 50mg'), ('Ketorolaco 10mg'), ('Ciprofloxacino 500mg'), ('Azitromicina 500mg'),
('Clonazepam 2mg'), ('Diazepam 5mg'), ('Salbutamol Inhalador');

-- Salas
INSERT INTO "salas" (numero, tipo) VALUES 
('101', 'Consultorio'), ('102', 'Consultorio'), ('103', 'Consultorio'), ('104', 'Consultorio'),
('105', 'Consultorio'), ('201', 'Quirófano'), ('202', 'Quirófano'), 
('URG-1', 'Urgencias'), ('URG-2', 'Urgencias'), ('URG-3', 'Urgencias');

-- Acciones bitácora
INSERT INTO "acciones" (descripcion) VALUES 
('INICIO_SESION'), ('CIERRE_SESION'), ('CAMBIO_CONTRASEÑA'), ('EXPORTACION_DATOS'),
('CREACION_PACIENTE'), ('ELIMINAR_PACIENTE'), ('EDICION_PACIENTE'), ('CREAR_HISTORIAL_MEDICO'), ('EDITAR_HISTORIAL_MEDICO'),
('CREACION_CITA'), ('CANCELACION_CITA'), ('COMPLETAR_CITA'), ('EDITAR_CITA'),
('INGRESO_HOSPITALIZACION'), ('ALTA_MEDICA'),
('ASIGNACION_ROL'), ('ACTUALIZACION_PERMISOS'), ('ASIGNAR_CONSULTORIO'),
('CREACION_USUARIO'), ('ACTUALIZACION_USUARIO'), ('ELIMINAR_USUARIO'),
('CREACION_DOCTOR'), ('ACTUALIZACION_DOCTOR'), ('ELIMINAR_DOCTOR'), ('CREACION_RECETA')
;


-- ==========================================
-- Usuarios y doctores
-- Todos tienen admin123 como password
-- ==========================================
INSERT INTO "usuarios" (username, email, password) VALUES 
('Dr. Adrian Ruiz', 'admin@admin', '$2b$10$SeasEoSwnw9l2lLrdiwVee2yW.g5hjy6VOjZIZp6J2mRyc3TpOgG2'),
('Recepcionista Ana', 'ana@medcare.com', '$2b$10$SeasEoSwnw9l2lLrdiwVee2yW.g5hjy6VOjZIZp6J2mRyc3TpOgG2'),
('Dr. Gregory House', 'house@medcare.com', '$2b$10$SeasEoSwnw9l2lLrdiwVee2yW.g5hjy6VOjZIZp6J2mRyc3TpOgG2'),
('Dra. Allison Cameron', 'cameron@medcare.com', '$2b$10$SeasEoSwnw9l2lLrdiwVee2yW.g5hjy6VOjZIZp6J2mRyc3TpOgG2'),
('Enfermera Carla', 'carla@medcare.com', '$2b$10$SeasEoSwnw9l2lLrdiwVee2yW.g5hjy6VOjZIZp6J2mRyc3TpOgG2');

INSERT INTO "doctores" (nombre, apellido, cedula_profesional, telefono) VALUES 
('Adrian', 'Ruiz', 'CED1000001', '3312345601'),
('Gregory', 'House', 'CED1000002', '3312345602'),
('Allison', 'Cameron', 'CED1000003', '3312345603'),
('Robert', 'Chase', 'CED1000004', '3312345604'),
('Eric', 'Foreman', 'CED1000005', '3312345605');

-- Asignar roles a usuarios
INSERT INTO "usuario_rol" (id_usuario, id_rol) VALUES 
(1, 1), (1, 2), -- Adrian (Admin y Doctor)
(2, 4),         -- Ana (Recepcionista)
(3, 2),         -- House (Doctor)
(4, 2),         -- Cameron (Doctor)
(5, 3);         -- Carla (Enfermera)

-- Asignar permisos a roles
INSERT INTO "rol_permiso" (id_rol, id_permiso) VALUES 
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5), -- Admin
(2, 1), (2, 2), (2, 3),                 -- Doctor
(4, 1);                                 -- Recepcionista

-- Especialidades de doctores
INSERT INTO "especialidad_doctor" (id_doctor, id_especialidad) VALUES 
(1, 1), (2, 3), (2, 6), (3, 1), (4, 7), (5, 6);


-- ==========================================
-- Pacientes
-- ==========================================
INSERT INTO "pacientes" (nombre, apellido, fecha_nacimiento, id_sexo, id_estado_civil, id_grupo_sanguineo, id_seguro, telefono, email, direccion) VALUES 
('Carlos', 'Santana', '1980-05-15', 1, 2, 1, NULL, '5588776601', 'carlos@mail.com', 'Calle 1'),
('Maria', 'Felix', '1992-10-20', 2, 1, 3, NULL, '5588776602', 'maria@mail.com', 'Calle 2'),
('Juan', 'Perez', '1975-03-10', 1, 2, 2, NULL, '5588776603', 'juan@mail.com', 'Calle 3'),
('Lucia', 'Mendez', '2000-12-05', 2, 1, 4, NULL, '5588776604', 'lucia@mail.com', 'Calle 4'),
('Pedro', 'Infante', '1950-08-18', 1, 4, 1, NULL, '5588776605', 'pedro@mail.com', 'Calle 5'),
('Sofia', 'Vergara', '1985-07-22', 2, 3, 5, NULL, '5588776606', 'sofia@mail.com', 'Calle 6'),
('Luis', 'Miguel', '1970-04-19', 1, 3, 7, NULL, '5588776607', 'luis@mail.com', 'Calle 7'),
('Salma', 'Hayek', '1966-09-02', 2, 2, 8, NULL, '5588776608', 'salma@mail.com', 'Calle 8'),
('Gael', 'Garcia', '1978-11-30', 1, 1, 1, NULL, '5588776609', 'gael@mail.com', 'Calle 9'),
('Diego', 'Luna', '1979-12-29', 1, 2, 2, NULL, '5588776610', 'diego@mail.com', 'Calle 10');


-- ==========================================
-- TABLAS TRANSACCIONALES 
-- ==========================================

-- Citas 
INSERT INTO "citas" (id_paciente, id_doctor, id_usuario, id_tipo_cita, fecha, estado) VALUES 
(1, 1, 2, 1, '2026-05-01 09:00:00', 'Completada'), (2, 2, 2, 2, '2026-05-01 10:00:00', 'Completada'),
(3, 3, 2, 1, '2026-05-01 11:00:00', 'Completada'), (4, 4, 2, 3, '2026-05-01 12:00:00', 'Completada'),
(5, 5, 2, 2, '2026-05-01 13:00:00', 'Completada'), (6, 1, 2, 4, '2026-05-02 09:00:00', 'Completada'),
(7, 2, 2, 1, '2026-05-02 10:00:00', 'Completada'), (8, 3, 2, 2, '2026-05-02 11:00:00', 'Completada'),
(9, 4, 2, 1, '2026-05-02 12:00:00', 'Cancelada'),  (10, 5, 2, 3, '2026-05-02 13:00:00', 'Completada'),
(1, 2, 2, 2, '2026-05-03 09:00:00', 'Completada'), (2, 3, 2, 1, '2026-05-03 10:00:00', 'Completada'),
(3, 4, 2, 4, '2026-05-03 11:00:00', 'Completada'), (4, 5, 2, 1, '2026-05-03 12:00:00', 'Completada'),
(5, 1, 2, 2, '2026-05-03 13:00:00', 'Cancelada'),  (6, 2, 2, 1, '2026-05-04 09:00:00', 'Completada'),
(7, 3, 2, 3, '2026-05-04 10:00:00', 'Completada'), (8, 4, 2, 1, '2026-05-04 11:00:00', 'Completada'),
(9, 5, 2, 2, '2026-05-04 12:00:00', 'Completada'), (10, 1, 2, 4, '2026-05-04 13:00:00', 'Completada'),
(1, 3, 2, 1, '2026-05-05 09:00:00', 'Completada'), (2, 4, 2, 2, '2026-05-05 10:00:00', 'Confirmada'),
(3, 5, 2, 1, '2026-05-05 11:00:00', 'Confirmada'), (4, 1, 2, 3, '2026-05-05 12:00:00', 'Confirmada'),
(5, 2, 2, 1, '2026-05-05 13:00:00', 'Confirmada'), (6, 3, 2, 4, '2026-05-06 09:00:00', 'Confirmada'),
(7, 4, 2, 2, '2026-05-06 10:00:00', 'Confirmada'), (8, 5, 2, 1, '2026-05-06 11:00:00', 'Confirmada'),
(9, 1, 2, 3, '2026-05-06 12:00:00', 'Pendiente'),  (10, 2, 2, 1, '2026-05-06 13:00:00', 'Pendiente'),
(1, 4, 2, 2, '2026-05-07 09:00:00', 'Pendiente'),  (2, 5, 2, 1, '2026-05-07 10:00:00', 'Pendiente'),
(3, 1, 2, 4, '2026-05-07 11:00:00', 'Pendiente'),  (4, 2, 2, 1, '2026-05-07 12:00:00', 'Pendiente'),
(5, 3, 2, 2, '2026-05-07 13:00:00', 'Pendiente'),  (6, 4, 2, 3, '2026-05-08 09:00:00', 'Pendiente'),
(7, 5, 2, 1, '2026-05-08 10:00:00', 'Pendiente'),  (8, 1, 2, 2, '2026-05-08 11:00:00', 'Pendiente'),
(9, 2, 2, 4, '2026-05-08 12:00:00', 'Pendiente'),  (10, 3, 2, 1, '2026-05-08 13:00:00', 'Pendiente'),
(1, 5, 2, 3, '2026-05-09 09:00:00', 'Pendiente'),  (2, 1, 2, 2, '2026-05-09 10:00:00', 'Pendiente'),
(3, 2, 2, 1, '2026-05-09 11:00:00', 'Pendiente'),  (4, 3, 2, 4, '2026-05-09 12:00:00', 'Pendiente'),
(5, 4, 2, 1, '2026-05-09 13:00:00', 'Pendiente'),  (6, 5, 2, 2, '2026-05-10 09:00:00', 'Pendiente'),
(7, 1, 2, 3, '2026-05-10 10:00:00', 'Pendiente'),  (8, 2, 2, 1, '2026-05-10 11:00:00', 'Pendiente'),
(9, 3, 2, 4, '2026-05-10 12:00:00', 'Pendiente'),  (10, 4, 2, 2, '2026-05-10 13:00:00', 'Pendiente');

-- BITACORA
INSERT INTO "bitacora" (id_usuario, id_accion, fecha) VALUES 
(1, 1, '2026-04-20 08:00:00'), (1, 3, '2026-04-20 08:15:00'), (2, 1, '2026-04-20 08:30:00'), 
(2, 5, '2026-04-20 08:45:00'), (3, 1, '2026-04-20 09:00:00'), (3, 7, '2026-04-20 09:30:00'), 
(3, 8, '2026-04-20 09:40:00'), (2, 5, '2026-04-20 10:00:00'), (4, 1, '2026-04-20 10:15:00'), 
(4, 7, '2026-04-20 10:45:00'), (4, 8, '2026-04-20 10:50:00'), (2, 5, '2026-04-20 11:00:00'), 
(1, 9, '2026-04-20 11:30:00'), (1, 10, '2026-04-20 11:45:00'), (5, 1, '2026-04-20 12:00:00'), 
(2, 6, '2026-04-20 12:15:00'), (3, 7, '2026-04-20 12:45:00'), (3, 8, '2026-04-20 12:55:00'), 
(2, 5, '2026-04-20 13:00:00'), (1, 2, '2026-04-20 13:30:00'), (2, 2, '2026-04-20 14:00:00'), 
(3, 2, '2026-04-20 14:15:00'), (4, 2, '2026-04-20 14:30:00'), (5, 2, '2026-04-20 14:45:00'), 
(1, 1, '2026-04-21 08:00:00'), (2, 1, '2026-04-21 08:15:00'), (2, 5, '2026-04-21 08:30:00'), 
(3, 1, '2026-04-21 09:00:00'), (3, 7, '2026-04-21 09:30:00'), (3, 8, '2026-04-21 09:45:00'), 
(2, 5, '2026-04-21 10:00:00'), (4, 1, '2026-04-21 10:15:00'), (4, 7, '2026-04-21 10:45:00'), 
(4, 8, '2026-04-21 11:00:00'), (2, 5, '2026-04-21 11:15:00'), (1, 4, '2026-04-21 11:30:00'), 
(5, 1, '2026-04-21 12:00:00'), (2, 6, '2026-04-21 12:15:00'), (3, 7, '2026-04-21 12:45:00'), 
(3, 8, '2026-04-21 13:00:00'), (2, 5, '2026-04-21 13:15:00'), (1, 9, '2026-04-21 13:30:00'), 
(1, 10, '2026-04-21 13:45:00'), (2, 3, '2026-04-21 14:00:00'), (2, 4, '2026-04-21 14:15:00'), 
(3, 7, '2026-04-21 14:30:00'), (4, 7, '2026-04-21 14:45:00'), (5, 4, '2026-04-21 15:00:00'), 
(1, 2, '2026-04-21 15:30:00'), (2, 2, '2026-04-21 16:00:00');