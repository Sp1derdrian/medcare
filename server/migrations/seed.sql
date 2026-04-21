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

INSERT INTO "especialidades" (nombre) VALUES 
('Medicina General'), ('Pediatría'), ('Cardiología'), ('Dermatología'), ('Ginecología');

INSERT INTO "aseguradoras" (nombre) VALUES 
('GNP Seguros'), ('MetLife'), ('AXA Seguros'), ('Seguros Monterrey');

INSERT INTO "tipos_seguro" (descripcion) VALUES 
('Gastos Médicos Mayores'), ('Gastos Médicos Menores'), ('Seguro de Vida');

INSERT INTO "tipos_cita" (descripcion) VALUES 
('Consulta General'), ('Especialidad'), ('Urgencia'), ('Revisión de Rutina');

INSERT INTO "procedimientos" (nombre) VALUES 
('Toma de presión arterial'), ('Electrocardiograma'), ('Sutura de herida'), ('Extracción de sangre');

INSERT INTO "medicamentos" (nombre) VALUES 
('Paracetamol 500mg'), ('Ibuprofeno 400mg'), ('Amoxicilina 500mg'), ('Loratadina 10mg');

INSERT INTO "salas" (numero, tipo) VALUES 
('101', 'Consultorio'), ('102', 'Consultorio'), ('201', 'Quirófano'), ('URG-1', 'Urgencias');

INSERT INTO "acciones" (descripcion) VALUES 
('INICIO_SESION'), ('CREACION_PACIENTE'), ('CANCELACION_CITA'), ('ACTUALIZACION_EXPEDIENTE');

-- Users y Doctores
INSERT INTO "usuarios" (username, email, password) VALUES 
('Dr. Adrian Ruiz', 'admin@admin', '$2b$10$SeasEoSwnw9l2lLrdiwVee2yW.g5hjy6VOjZIZp6J2mRyc3TpOgG2'),
('Recepcionista Ana', 'recepcion@medcare.com', '$2b$10$SeasEoSwnw9l2lLrdiwVee2yW.g5hjy6VOjZIZp6J2mRyc3TpOgG2'),
('Enfermero Juan', 'enfermeria@medcare.com', '$2b$10$SeasEoSwnw9l2lLrdiwVee2yW.g5hjy6VOjZIZp6J2mRyc3TpOgG2');

INSERT INTO "doctores" (nombre, apellido, cedula_profesional, telefono) VALUES 
('Adrian', 'Ruiz', 'CED1234567', '3312345678'),
('Gregory', 'House', 'CED9876543', '5512345678');

-- Roles a usuarios
INSERT INTO "usuario_rol" (id_usuario, id_rol) VALUES 
(1, 1), -- Adrian es Admin
(1, 2), -- Adrian también es Doctor
(2, 4), -- Ana es Recepcionista
(3, 3); -- Juan es Enfermero

-- Asignar permisos a roles
INSERT INTO "rol_permiso" (id_rol, id_permiso) VALUES 
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5),
(2, 1), (2, 2), (2, 3), -- Doctor puede crear pacientes, ver exp y crear receta
(4, 1); -- Recepcionista solo crea pacientes

-- Asignar especialidades a doctores
INSERT INTO "especialidad_doctor" (id_doctor, id_especialidad) VALUES 
(1, 1), -- Adrian es General
(2, 3); -- House es Cardiólogo

-- Seguros
INSERT INTO "seguros" (id_aseguradora, id_tipo_seguro, numero_poliza) VALUES 
(1, 1, 'POL-GNP-001'),
(2, 1, 'POL-MET-002');

-- Registro en bitácora
INSERT INTO "bitacora" (id_usuario, id_accion, fecha) VALUES 
(1, 1, CURRENT_TIMESTAMP);

-- Paciente
INSERT INTO "pacientes" (nombre, apellido, fecha_nacimiento, id_sexo, id_estado_civil, id_grupo_sanguineo, id_seguro, telefono, email, direccion) VALUES 
('Lebron', 'James', '1980-05-15', 1, 2, 1, 1, '5588776655', 'lebron@paciente.com', 'Av. Siempre Viva 123'),
('Maria', 'Felix', '1992-10-20', 2, 1, 3, NULL, '3344556677', 'maria@paciente.com', 'Calle Luna 456');

-- Citas
INSERT INTO "citas" (id_paciente, id_doctor, id_usuario, id_tipo_cita, fecha, estado) VALUES 
(1, 1, 2, 1, '2026-05-01 10:00:00', 'Confirmada'),
(2, 2, 2, 2, '2026-05-02 11:30:00', 'Pendiente');

-- Historial Médico
INSERT INTO "historial_medico" (id_paciente, descripcion, fecha) VALUES 
(1, 'Paciente reporta dolor de cabeza constante en la última semana.', CURRENT_TIMESTAMP);

-- Tratamientos
INSERT INTO "tratamientos" (id_paciente, descripcion, fecha_inicio, fecha_fin) VALUES 
(1, 'Tratamiento para control de hipertensión', '2026-04-01', '2026-05-01');

-- Hospitalizaciones
INSERT INTO "hospitalizaciones" (id_paciente, id_sala, fecha_ingreso, fecha_alta) VALUES 
(2, 4, '2026-04-18', NULL); -- Aún internada en Urgencias

-- Citas con procedimientos
INSERT INTO "cita_procedimiento" (id_cita, id_procedimiento) VALUES 
(1, 1); -- A la cita 1 se le tomó la presión

-- Tratamientos con procedimientos
INSERT INTO "tratamiento_procedimiento" (id_tratamiento, id_procedimiento) VALUES 
(1, 2); -- El tratamiento de hipertensión incluyó un electrocardiograma

-- Recetas
INSERT INTO "recetas" (id_cita, fecha) VALUES 
(1, '2026-05-01');

-- Medicamentos recetados
INSERT INTO "receta_medicamento" (id_receta, id_medicamento, dosis, frecuencia, periodo_administracion, observaciones) VALUES 
(1, 1, '1 tableta', 'Cada 8 horas', '3 días', 'Tomar después de los alimentos');

-- Procedimientos y medicamentos en hospitalización
INSERT INTO "hospitalizacion_procedimiento" (id_hospitalizacion, id_procedimiento) VALUES 
(1, 4); -- Extracción de sangre a Maria en urgencias

INSERT INTO "hospitalizacion_medicamento" (id_hospitalizacion, id_medicamento, periodo_administracion, observaciones) VALUES 
(1, 2, 'Dosis única', 'Administrado vía intravenosa por dolor crónico');