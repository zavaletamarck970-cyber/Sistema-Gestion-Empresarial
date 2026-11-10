const express = require("express");
const cors = require("cors");
const db = require("./config/database");

const app = express();
app.use(cors());
app.use(express.json());

const asyncRoute = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Inicio: datos para el panel principal
app.get("/api/resumen", asyncRoute(async (req, res) => {
  const [[{ empleados }]] = await db.query("SELECT COUNT(*) AS empleados FROM empleado");
  const [[{ proyectos }]] = await db.query("SELECT COUNT(*) AS proyectos FROM proyectos");
  const [[{ salarios }]] = await db.query("SELECT COUNT(*) AS salarios FROM salario");
  const [rows] = await db.query(`
    SELECT e.id, e.nombre, e.edad, e.pais, e.cargo, e.correo,
           p.nombre_proyecto AS proyecto,
           s.monto AS salario
    FROM empleado e
    LEFT JOIN empleado_proyecto ep ON ep.empleado_id = e.id
    LEFT JOIN proyectos p ON p.id = ep.proyecto_id
    LEFT JOIN salario s ON s.empleado_id = e.id
    ORDER BY e.id
  `);
  res.json({ conteos: { empleados, proyectos, salarios }, registros: rows });
}));

// EMPLEADOS
app.get("/api/empleados", asyncRoute(async (req, res) => {
  const [rows] = await db.query("SELECT * FROM empleado ORDER BY id DESC");
  res.json(rows);
}));
app.post("/api/empleados", asyncRoute(async (req, res) => {
  const { nombre, edad, pais, cargo, correo } = req.body;
  if (!nombre || !edad || !pais || !cargo || !correo) return res.status(400).json({ message: "Completa todos los campos." });
  const [r] = await db.query(
    "INSERT INTO empleado (nombre,edad,pais,cargo,correo) VALUES (?,?,?,?,?)",
    [nombre, Number(edad), pais, cargo, correo]
  );
  res.status(201).json({ id: r.insertId, message: "Empleado registrado." });
}));
app.put("/api/empleados/:id", asyncRoute(async (req, res) => {
  const { nombre, edad, pais, cargo, correo } = req.body;
  await db.query(
    "UPDATE empleado SET nombre=?,edad=?,pais=?,cargo=?,correo=? WHERE id=?",
    [nombre, Number(edad), pais, cargo, correo, req.params.id]
  );
  res.json({ message: "Empleado actualizado." });
}));
app.delete("/api/empleados/:id", asyncRoute(async (req, res) => {
  await db.query("DELETE FROM empleado WHERE id=?", [req.params.id]);
  res.json({ message: "Empleado eliminado." });
}));

// PROYECTOS
app.get("/api/proyectos", asyncRoute(async (req, res) => {
  const [rows] = await db.query("SELECT * FROM proyectos ORDER BY id DESC");
  res.json(rows);
}));
app.post("/api/proyectos", asyncRoute(async (req, res) => {
  const { nombre_proyecto, descripcion } = req.body;
  if (!nombre_proyecto) return res.status(400).json({ message: "Escribe el nombre del proyecto." });
  const [r] = await db.query("INSERT INTO proyectos (nombre_proyecto,descripcion) VALUES (?,?)", [nombre_proyecto, descripcion || ""]);
  res.status(201).json({ id: r.insertId, message: "Proyecto registrado." });
}));
app.put("/api/proyectos/:id", asyncRoute(async (req, res) => {
  const { nombre_proyecto, descripcion } = req.body;
  await db.query("UPDATE proyectos SET nombre_proyecto=?, descripcion=? WHERE id=?", [nombre_proyecto, descripcion || "", req.params.id]);
  res.json({ message: "Proyecto actualizado." });
}));
app.delete("/api/proyectos/:id", asyncRoute(async (req, res) => {
  await db.query("DELETE FROM proyectos WHERE id=?", [req.params.id]);
  res.json({ message: "Proyecto eliminado." });
}));

// ASIGNACIONES
app.get("/api/asignaciones", asyncRoute(async (req, res) => {
  const [rows] = await db.query(`
    SELECT ep.empleado_id, ep.proyecto_id, e.nombre AS empleado,
           p.nombre_proyecto AS proyecto
    FROM empleado_proyecto ep
    JOIN empleado e ON e.id=ep.empleado_id
    JOIN proyectos p ON p.id=ep.proyecto_id
    ORDER BY e.nombre
  `);
  res.json(rows);
}));
app.post("/api/asignaciones", asyncRoute(async (req, res) => {
  const { empleado_id, proyecto_id } = req.body;
  if (!empleado_id || !proyecto_id) return res.status(400).json({ message: "Selecciona empleado y proyecto." });
  await db.query("INSERT INTO empleado_proyecto (empleado_id,proyecto_id) VALUES (?,?)", [empleado_id, proyecto_id]);
  res.status(201).json({ message: "Asignación registrada." });
}));
app.delete("/api/asignaciones/:empleadoId/:proyectoId", asyncRoute(async (req, res) => {
  await db.query("DELETE FROM empleado_proyecto WHERE empleado_id=? AND proyecto_id=?", [req.params.empleadoId, req.params.proyectoId]);
  res.json({ message: "Asignación eliminada." });
}));

// SALARIOS
app.get("/api/salarios", asyncRoute(async (req, res) => {
  const [rows] = await db.query(`
    SELECT s.*, e.nombre AS empleado
    FROM salario s JOIN empleado e ON e.id=s.empleado_id
    ORDER BY s.id DESC
  `);
  res.json(rows);
}));
app.post("/api/salarios", asyncRoute(async (req, res) => {
  const { empleado_id, monto, fecha_actualizacion } = req.body;
  if (!empleado_id || monto === undefined || !fecha_actualizacion) return res.status(400).json({ message: "Completa todos los campos." });
  const [r] = await db.query("INSERT INTO salario (empleado_id,monto,fecha_actualizacion) VALUES (?,?,?)", [empleado_id, Number(monto), fecha_actualizacion]);
  res.status(201).json({ id: r.insertId, message: "Salario registrado." });
}));
app.put("/api/salarios/:id", asyncRoute(async (req, res) => {
  const { empleado_id, monto, fecha_actualizacion } = req.body;
  await db.query("UPDATE salario SET empleado_id=?,monto=?,fecha_actualizacion=? WHERE id=?", [empleado_id, Number(monto), fecha_actualizacion, req.params.id]);
  res.json({ message: "Salario actualizado." });
}));
app.delete("/api/salarios/:id", asyncRoute(async (req, res) => {
  await db.query("DELETE FROM salario WHERE id=?", [req.params.id]);
  res.json({ message: "Salario eliminado." });
}));

app.use((err, req, res, next) => {
  console.error(err);
  if (err.code === "ER_DUP_ENTRY") return res.status(409).json({ message: "Ese registro ya existe." });
  if (err.code === "ER_NO_REFERENCED_ROW_2") return res.status(400).json({ message: "El empleado o proyecto seleccionado no existe." });
  res.status(500).json({ message: "Error interno del servidor." });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Servidor activo en http://localhost:${PORT}`));
