CREATE DATABASE IF NOT EXISTS gestion_empresarial
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE gestion_empresarial;

CREATE TABLE IF NOT EXISTS empleado (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  edad INT NOT NULL,
  pais VARCHAR(100) NOT NULL,
  cargo VARCHAR(100) NOT NULL,
  correo VARCHAR(150) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS proyectos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre_proyecto VARCHAR(100) NOT NULL,
  descripcion TEXT
);

CREATE TABLE IF NOT EXISTS empleado_proyecto (
  empleado_id INT NOT NULL,
  proyecto_id INT NOT NULL,
  PRIMARY KEY (empleado_id, proyecto_id),
  FOREIGN KEY (empleado_id) REFERENCES empleado(id) ON DELETE CASCADE,
  FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS salario (
  id INT AUTO_INCREMENT PRIMARY KEY,
  empleado_id INT NOT NULL,
  monto DECIMAL(10,2) NOT NULL,
  fecha_actualizacion DATE NOT NULL,
  FOREIGN KEY (empleado_id) REFERENCES empleado(id) ON DELETE CASCADE
);

-- Datos iniciales opcionales
INSERT IGNORE INTO empleado (id,nombre,edad,pais,cargo,correo) VALUES
(1,'Juan Pérez',28,'Perú','Desarrollador','juan@empresa.com'),
(2,'María López',32,'México','Analista','maria@empresa.com'),
(3,'Carlos Ruiz',30,'Colombia','Diseñador','carlos@empresa.com');

INSERT IGNORE INTO proyectos (id,nombre_proyecto,descripcion) VALUES
(1,'Desarrollo Web','Desarrollo de la página web empresarial'),
(2,'Marketing Digital','Campaña de marketing digital'),
(3,'Diseño UX/UI','Diseño de experiencia e interfaz de usuario');

INSERT IGNORE INTO empleado_proyecto (empleado_id,proyecto_id) VALUES
(1,1),(2,2),(3,3);

INSERT IGNORE INTO salario (id,empleado_id,monto,fecha_actualizacion) VALUES
(1,1,5000.00,'2026-11-01'),
(2,2,4000.00,'2026-11-01'),
(3,3,3500.00,'2026-11-01');
