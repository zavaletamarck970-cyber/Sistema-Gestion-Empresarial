const { test } = require("node:test");
const assert = require("node:assert/strict");
const { validate, positiveId } = require("./validation");
test("rechaza identificadores inválidos", () => {
  for (const id of [0, -1, "1.5", "abc", null, "9007199254740992"]) assert.equal(positiveId(id), false);
  assert.equal(positiveId("12"), true);
});
test("valida empleados al crear y editar", () => {
  const employee = { nombre: "Ana", edad: 25, pais: "Perú", cargo: "Analista", correo: "ana@empresa.com" };
  assert.equal(validate("empleados", employee), null);
  for (const patch of [{ nombre: "   " }, { edad: 1.5 }, { edad: 121 }, { correo: "correo" }]) assert.ok(validate("empleados", { ...employee, ...patch }));
});
test("valida montos y fechas reales", () => {
  const salary = { empleado_id: 1, monto: "2500.50", fecha_actualizacion: "2024-02-29" };
  assert.equal(validate("salarios", salary), null);
  for (const patch of [{ monto: "" }, { monto: -1 }, { monto: "1.001" }, { monto: "100000000" }, { fecha_actualizacion: "2025-02-29" }, { fecha_actualizacion: "2026-04-31" }]) assert.ok(validate("salarios", { ...salary, ...patch }));
});
test("rechaza proyectos vacíos y asignaciones inválidas", () => {
  assert.ok(validate("proyectos", { nombre_proyecto: " " }));
  assert.equal(validate("proyectos", { nombre_proyecto: "Web" }), null);
  assert.ok(validate("asignaciones", { empleado_id: 1, proyecto_id: "abc" }));
  assert.equal(validate("asignaciones", { empleado_id: 1, proyecto_id: 2 }), null);
});
