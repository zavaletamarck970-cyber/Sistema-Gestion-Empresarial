import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FaUsers, FaFolder, FaLink, FaMoneyBillWave, FaHome, FaArrowRight,
  FaList, FaPlus, FaEdit, FaTrash, FaSave, FaInfoCircle
} from "react-icons/fa";

const API = process.env.REACT_APP_API_URL || "http://localhost:3001/api";
const emptyEmployee = { nombre: "", edad: "", pais: "", cargo: "", correo: "" };
const emptyProject = { nombre_proyecto: "", descripcion: "" };
const emptySalary = { empleado_id: "", monto: "", fecha_actualizacion: new Date().toISOString().slice(0, 10) };

export default function App() {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [page, setPage] = useState("inicio");
  const [summary, setSummary] = useState({ conteos: {}, registros: [] });
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [salaries, setSalaries] = useState([]);
  const [form, setForm] = useState(emptyEmployee);
  const [editing, setEditing] = useState(null);
  const [notice, setNotice] = useState("");
  const [assignment, setAssignment] = useState({ empleado_id: "", proyecto_id: "" });
  const [salaryForm, setSalaryForm] = useState(emptySalary);
  const [salaryEditing, setSalaryEditing] = useState(null);
  const [projectForm, setProjectForm] = useState(emptyProject);
  const [projectEditing, setProjectEditing] = useState(null);

  const loadAll = async () => {
    setLoading(true);
    setLoadError("");
    try {
      const [s, e, p, a, sal] = await Promise.all([
        axios.get(`${API}/resumen`), axios.get(`${API}/empleados`),
        axios.get(`${API}/proyectos`), axios.get(`${API}/asignaciones`),
        axios.get(`${API}/salarios`)
      ]);
      setSummary(s.data); setEmployees(e.data); setProjects(p.data);
      setAssignments(a.data); setSalaries(sal.data);
    } catch (error) {
      setLoadError(error.response?.data?.message || "No se pudo conectar con el servidor. Verifica que Node.js y MySQL estén activos.");
    } finally { setLoading(false); }
  };

  useEffect(() => { loadAll(); }, []);
  const message = (text) => { setNotice(text); window.setTimeout(() => setNotice(""), 3500); };
  const changePage = (value) => { setPage(value); setSearch(""); setNotice(""); };

  const saveEmployee = async (e) => {
    e.preventDefault();
    try {
      if (editing) await axios.put(`${API}/empleados/${editing}`, form);
      else await axios.post(`${API}/empleados`, form);
      setForm(emptyEmployee); setEditing(null); await loadAll(); message(editing ? "Empleado actualizado." : "Empleado registrado.");
    } catch (err) { message(err.response?.data?.message || "No se pudo guardar el empleado."); }
  };
  const editEmployee = (row) => {
    setForm({ nombre: row.nombre, edad: row.edad, pais: row.pais, cargo: row.cargo, correo: row.correo });
    setEditing(row.id); window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const deleteEmployee = async (id) => {
    if (!window.confirm("¿Deseas eliminar este empleado? También se eliminarán sus asignaciones y salarios.")) return;
    try { await axios.delete(`${API}/empleados/${id}`); await loadAll(); message("Empleado eliminado."); }
    catch (err) { message(err.response?.data?.message || "No se pudo eliminar."); }
  };

  const saveProject = async (e) => {
    e.preventDefault();
    try {
      if (projectEditing) await axios.put(`${API}/proyectos/${projectEditing}`, projectForm);
      else await axios.post(`${API}/proyectos`, projectForm);
      setProjectForm(emptyProject); setProjectEditing(null); await loadAll(); message("Proyecto guardado correctamente.");
    } catch (err) { message(err.response?.data?.message || "No se pudo guardar el proyecto."); }
  };
  const editProject = (row) => { setProjectForm({ nombre_proyecto: row.nombre_proyecto, descripcion: row.descripcion || "" }); setProjectEditing(row.id); };
  const deleteProject = async (id) => {
    if (!window.confirm("¿Deseas eliminar este proyecto y sus asignaciones?")) return;
    try { await axios.delete(`${API}/proyectos/${id}`); await loadAll(); message("Proyecto eliminado."); }
    catch (err) { message(err.response?.data?.message || "No se pudo eliminar."); }
  };

  const saveAssignment = async (e) => {
    e.preventDefault();
    try { await axios.post(`${API}/asignaciones`, assignment); setAssignment({ empleado_id: "", proyecto_id: "" }); await loadAll(); message("Asignación registrada."); }
    catch (err) { message(err.response?.data?.message || "No se pudo registrar. Puede que la asignación ya exista."); }
  };
  const deleteAssignment = async (row) => {
    if (!window.confirm("¿Eliminar esta asignación?")) return;
    try { await axios.delete(`${API}/asignaciones/${row.empleado_id}/${row.proyecto_id}`); await loadAll(); message("Asignación eliminada."); }
    catch (err) { message("No se pudo eliminar la asignación."); }
  };

  const saveSalary = async (e) => {
    e.preventDefault();
    try {
      if (salaryEditing) await axios.put(`${API}/salarios/${salaryEditing}`, salaryForm);
      else await axios.post(`${API}/salarios`, salaryForm);
      setSalaryForm(emptySalary); setSalaryEditing(null); await loadAll(); message("Salario guardado correctamente.");
    } catch (err) { message(err.response?.data?.message || "No se pudo guardar el salario."); }
  };
  const editSalary = (row) => { setSalaryForm({ empleado_id: row.empleado_id, monto: row.monto, fecha_actualizacion: String(row.fecha_actualizacion).slice(0,10) }); setSalaryEditing(row.id); };
  const deleteSalary = async (id) => {
    if (!window.confirm("¿Deseas eliminar este salario?")) return;
    try { await axios.delete(`${API}/salarios/${id}`); await loadAll(); message("Salario eliminado."); }
    catch (err) { message("No se pudo eliminar el salario."); }
  };

  const filterRows = (rows) => rows.filter(row => Object.values(row).some(value =>
    value != null && String(value).toLocaleLowerCase("es").includes(search.trim().toLocaleLowerCase("es"))));

  const nav = [
    ["empleados", <FaUsers />, "Empleados"],
    ["proyectos", <FaFolder />, "Proyectos"],
    ["asignaciones", <FaLink />, "Asignaciones"],
    ["salarios", <FaMoneyBillWave />, "Salarios"],
    ["inicio", <FaHome />, "Inicio"]
  ];

  const Table = ({ headers, children }) => (
    <div className="table-responsive"><table className="table data-table mb-0"><thead><tr>{headers.map(h => <th key={h}>{h}</th>)}</tr></thead><tbody>{children}</tbody></table></div>
  );
  const Actions = ({ onEdit, onDelete }) => (
    <div className="actions">
      {onEdit && <button className="icon-btn edit" aria-label="Editar" title="Editar" onClick={onEdit}><FaEdit /></button>}
      <button className="icon-btn delete" aria-label="Eliminar" title="Eliminar" onClick={onDelete}><FaTrash /></button>
    </div>
  );

  return (
    <div className="app-shell">
      <header className="top-header">
        <div className="brand-icon"><FaUsers /></div>
        <div><h1>Sistema de Gestión Empresarial</h1><p>Administración de empleados, proyectos y salarios</p></div>
      </header>

      <main className="main-content">
        {notice && <div role="status" className="alert alert-info notice">{notice}</div>}

        {loading && <p role="status">Cargando información…</p>}
        {loadError && <div role="alert" className="alert alert-danger">{loadError} <button type="button" className="secondary-btn" disabled={loading} onClick={loadAll}>Reintentar</button></div>}
        <div className="search-bar">
          <label htmlFor="record-search">Buscar en {page === "inicio" ? "el resumen" : page}</label>
          <input id="record-search" type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Nombre, correo, proyecto…" />
          {search && <button type="button" className="secondary-btn" onClick={() => setSearch("")}>Limpiar búsqueda</button>}
        </div>
        {page === "inicio" && <section className="main-card">
          <div className="section-heading"><h2>Datos del Sistema</h2><p>Información de empleados, sus proyectos y salarios.</p></div>
          <div className="summary-cards">
            <article className="summary-card employees-card"><FaUsers className="summary-icon" /><h3>Empleados</h3><p>Gestiona la información<br/>de los empleados.</p><strong>{summary.conteos.empleados ?? 0} registrados</strong><button onClick={() => changePage("empleados")}> <FaArrowRight /> Ver Empleados</button></article>
            <article className="summary-card projects-card"><FaFolder className="summary-icon" /><h3>Proyectos</h3><p>Administra los proyectos<br/>de la empresa.</p><strong>{summary.conteos.proyectos ?? 0} registrados</strong><button onClick={() => changePage("proyectos")}><FaArrowRight /> Ver Proyectos</button></article>
            <article className="summary-card salaries-card"><FaMoneyBillWave className="summary-icon" /><h3>Salarios</h3><p>Consulta y gestiona los<br/>salarios de los empleados.</p><strong>{summary.conteos.salarios ?? 0} registrados</strong><button onClick={() => changePage("salarios")}><FaArrowRight /> Ver Salarios</button></article>
          </div>
          <div className="table-panel">
            <div className="panel-title"><FaList /> Resumen de Información</div>
            <Table headers={["ID Empleado","Nombre","Edad","País","Cargo","Correo","Proyecto Asignado","Salario"]}>
              {summary.registros.map((r,i) => <tr key={`${r.id}-${i}`}><td>{r.id}</td><td>{r.nombre}</td><td>{r.edad}</td><td>{r.pais}</td><td>{r.cargo}</td><td>{r.correo}</td><td>{r.proyecto || "Sin asignar"}</td><td>{r.salario == null ? "Sin registrar" : `S/ ${Number(r.salario).toLocaleString("es-PE")}`}</td></tr>)}
              {!filterRows(summary.registros).length && <tr><td colSpan="8" className="empty">No hay registros que coincidan.</td></tr>}
            </Table>
          </div>
          <div className="info-note"><FaInfoCircle /> Este módulo permite administrar la relación entre empleados, proyectos y salarios de la empresa.</div>
        </section>}

        {page === "empleados" && <section className="main-card">
          <div className="section-heading"><h2>Gestión de Empleados</h2><p>Registra y administra los datos de los empleados.</p></div>
          <form className="form-grid" onSubmit={saveEmployee}>
            <label>Nombre<input required value={form.nombre} onChange={e=>setForm({...form,nombre:e.target.value})} placeholder="Ingrese nombre"/></label>
            <label>Edad<input required type="number" min="1" value={form.edad} onChange={e=>setForm({...form,edad:e.target.value})} placeholder="Ingrese edad"/></label>
            <label>País<input required value={form.pais} onChange={e=>setForm({...form,pais:e.target.value})} placeholder="Ingrese país"/></label>
            <label>Cargo<input required value={form.cargo} onChange={e=>setForm({...form,cargo:e.target.value})} placeholder="Ingrese cargo"/></label>
            <label className="wide-field">Correo<input required type="email" value={form.correo} onChange={e=>setForm({...form,correo:e.target.value})} placeholder="Ingrese correo"/></label>
            <div className="form-buttons"><button className="primary-btn"><FaSave/> {editing ? "Actualizar" : "Agregar"}</button><button type="button" className="secondary-btn" onClick={()=>{setForm(emptyEmployee);setEditing(null);}}>Limpiar</button></div>
          </form>
          <div className="panel-title"><FaList/> Lista de Empleados</div>
          <div className="employees-table-wrapper">
            <Table headers={["ID","Nombre","Edad","País","Cargo","Correo","Acciones"]}>
              {filterRows(employees).map(r=><tr key={r.id}><td>{r.id}</td><td>{r.nombre}</td><td>{r.edad}</td><td>{r.pais}</td><td>{r.cargo}</td><td>{r.correo}</td><td><Actions onEdit={()=>editEmployee(r)} onDelete={()=>deleteEmployee(r.id)}/></td></tr>)}
              {!filterRows(employees).length && <tr><td colSpan="7" className="empty">No hay empleados que coincidan.</td></tr>}
            </Table>
          </div>
          <div className="employees-cards">
            {filterRows(employees).map(r=><article key={r.id} className="employee-card"><div className="badge">#{r.id}</div><div className="kv"><span className="label">Nombre</span><span className="value">{r.nombre}</span></div><div className="kv"><span className="label">Edad</span><span className="value">{r.edad}</span></div><div className="kv"><span className="label">País</span><span className="value">{r.pais}</span></div><div className="kv"><span className="label">Cargo</span><span className="value">{r.cargo}</span></div><div className="kv"><span className="label">Correo</span><span className="value">{r.correo}</span></div><Actions onEdit={()=>editEmployee(r)} onDelete={()=>deleteEmployee(r.id)}/></article>)}
            {!filterRows(employees).length && <div className="empty">No hay empleados que coincidan.</div>}
          </div>
        </section>}

        {page === "proyectos" && <section className="main-card">
          <div className="section-heading"><h2>Gestión de Proyectos</h2><p>Administración de los proyectos de la empresa.</p></div>
          <form className="form-grid project-form" onSubmit={saveProject}>
            <label>Nombre del proyecto<input required value={projectForm.nombre_proyecto} onChange={e=>setProjectForm({...projectForm,nombre_proyecto:e.target.value})} placeholder="Ingrese nombre del proyecto"/></label>
            <label>Descripción<textarea value={projectForm.descripcion} onChange={e=>setProjectForm({...projectForm,descripcion:e.target.value})} placeholder="Describa el proyecto"/></label>
            <div className="form-buttons"><button className="primary-btn"><FaSave/> {projectEditing ? "Actualizar" : "Agregar"}</button><button type="button" className="secondary-btn" onClick={()=>{setProjectForm(emptyProject);setProjectEditing(null);}}>Limpiar</button></div>
          </form>
          <div className="panel-title"><FaList/> Lista de Proyectos</div>
          <Table headers={["ID","Nombre del proyecto","Descripción","Acciones"]}>
            {filterRows(projects).map(r=><tr key={r.id}><td>{r.id}</td><td>{r.nombre_proyecto}</td><td>{r.descripcion}</td><td><Actions onEdit={()=>editProject(r)} onDelete={()=>deleteProject(r.id)}/></td></tr>)}
            {!filterRows(projects).length && <tr><td colSpan="4" className="empty">No hay proyectos que coincidan.</td></tr>}
          </Table>
        </section>}

        {page === "asignaciones" && <section className="main-card">
          <div className="section-heading"><h2>Asignación de Empleados a Proyectos</h2><p>Relaciona empleados con los proyectos de la empresa.</p></div>
          <form className="form-grid assignment-form" onSubmit={saveAssignment}>
            <label>Empleado<select required value={assignment.empleado_id} onChange={e=>setAssignment({...assignment,empleado_id:e.target.value})}><option value="">Seleccione empleado</option>{employees.map(e=><option key={e.id} value={e.id}>{e.nombre}</option>)}</select></label>
            <label>Proyecto<select required value={assignment.proyecto_id} onChange={e=>setAssignment({...assignment,proyecto_id:e.target.value})}><option value="">Seleccione proyecto</option>{projects.map(p=><option key={p.id} value={p.id}>{p.nombre_proyecto}</option>)}</select></label>
            <div className="form-buttons"><button className="primary-btn"><FaPlus/> Asignar</button></div>
          </form>
          <div className="panel-title"><FaList/> Empleados Asignados</div>
          <Table headers={["ID Empleado","Empleado","ID Proyecto","Proyecto","Acciones"]}>
            {filterRows(assignments).map(r=><tr key={`${r.empleado_id}-${r.proyecto_id}`}><td>{r.empleado_id}</td><td>{r.empleado}</td><td>{r.proyecto_id}</td><td>{r.proyecto}</td><td><Actions onDelete={()=>deleteAssignment(r)}/></td></tr>)}
            {!filterRows(assignments).length && <tr><td colSpan="5" className="empty">No hay asignaciones que coincidan.</td></tr>}
          </Table>
        </section>}

        {page === "salarios" && <section className="main-card">
          <div className="section-heading"><h2>Gestión de Salarios</h2><p>Administración de la información salarial de los empleados.</p></div>
          <form className="form-grid salary-form" onSubmit={saveSalary}>
            <label>Empleado<select required value={salaryForm.empleado_id} onChange={e=>setSalaryForm({...salaryForm,empleado_id:e.target.value})}><option value="">Seleccione empleado</option>{employees.map(e=><option key={e.id} value={e.id}>{e.nombre}</option>)}</select></label>
            <label>Monto (S/)<input required type="number" min="0" step="0.01" value={salaryForm.monto} onChange={e=>setSalaryForm({...salaryForm,monto:e.target.value})} placeholder="Ej. 3500.00"/></label>
            <label>Fecha de actualización<input required type="date" value={salaryForm.fecha_actualizacion} onChange={e=>setSalaryForm({...salaryForm,fecha_actualizacion:e.target.value})}/></label>
            <div className="form-buttons"><button className="primary-btn"><FaSave/> {salaryEditing ? "Actualizar" : "Agregar"}</button><button type="button" className="secondary-btn" onClick={()=>{setSalaryForm(emptySalary);setSalaryEditing(null);}}>Limpiar</button></div>
          </form>
          <div className="panel-title"><FaList/> Lista de Salarios</div>
          <Table headers={["ID","Empleado","Monto","Fecha de actualización","Acciones"]}>
            {filterRows(salaries).map(r=><tr key={r.id}><td>{r.id}</td><td>{r.empleado}</td><td>S/ {Number(r.monto).toLocaleString("es-PE",{minimumFractionDigits:2})}</td><td>{String(r.fecha_actualizacion).slice(0,10)}</td><td><Actions onEdit={()=>editSalary(r)} onDelete={()=>deleteSalary(r.id)}/></td></tr>)}
            {!filterRows(salaries).length && <tr><td colSpan="5" className="empty">No hay salarios que coincidan.</td></tr>}
          </Table>
        </section>}
      </main>

      <nav className="bottom-nav">
        {nav.map(([id,icon,label])=><button key={id} aria-label={label} aria-current={page===id ? "page" : undefined} className={page===id?"active":""} onClick={()=>changePage(id)}>{icon}<span>{label}</span></button>)}
      </nav>
    </div>
  );
}
