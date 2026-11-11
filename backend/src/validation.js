const positiveId = value => /^\d+$/.test(String(value)) && Number.isSafeInteger(Number(value)) && Number(value) > 0;
const text = (value, max) => typeof value === "string" && value.trim().length > 0 && value.trim().length <= max;
function validate(resource, body) {
  if (!body || typeof body !== "object") return "Envía los datos del formulario.";
  if (resource === "empleados") {
    if (!text(body.nombre, 100) || !text(body.pais, 100) || !text(body.cargo, 100)) return "Nombre, país y cargo son obligatorios (máximo 100 caracteres).";
    if (!positiveId(body.edad) || Number(body.edad) > 120) return "La edad debe ser un entero entre 1 y 120.";
    if (!text(body.correo, 150) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.correo.trim())) return "Ingresa un correo válido (máximo 150 caracteres).";
  }
  if (resource === "proyectos") {
    if (!text(body.nombre_proyecto, 100)) return "Escribe el nombre del proyecto (máximo 100 caracteres).";
    if (body.descripcion != null && typeof body.descripcion !== "string") return "La descripción debe ser texto.";
  }
  if (resource === "asignaciones" && (!positiveId(body.empleado_id) || !positiveId(body.proyecto_id))) return "Selecciona un empleado y un proyecto válidos.";
  if (resource === "salarios") {
    if (!positiveId(body.empleado_id)) return "Selecciona un empleado válido.";
    if (!/^(0|[1-9]\d{0,7})(\.\d{1,2})?$/.test(String(body.monto))) return "El monto debe ser positivo o cero y tener hasta dos decimales.";
    const date = body.fecha_actualizacion;
    if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date) || date < "1000-01-01" || !Number.isFinite(Date.parse(date)) || new Date(date).toISOString().slice(0, 10) !== date) return "Ingresa una fecha válida.";
  }
  return null;
}
module.exports = { validate, positiveId };
