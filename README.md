# Sistema de Gestión Empresarial

Proyecto React + Node.js/Express + MySQL para administrar empleados, proyectos, asignaciones y salarios.

## 1. Base de datos
1. Inicia Apache y MySQL en XAMPP.
2. Abre phpMyAdmin.
3. Importa `database.sql`.

## 2. Backend
```bash
cd backend
npm install
```
Configura `backend/.env` con los datos de tu MySQL y ejecuta:
```bash
npm run dev
```
El servidor funciona en http://localhost:3001.

## 3. Frontend
En otra terminal:
```bash
cd frontend
npm install
npm start
```
Abre http://localhost:3000.

## Módulos
- Inicio: resumen de empleados, proyectos y salarios.
- Empleados: CRUD completo.
- Proyectos: CRUD completo.
- Asignaciones: relaciona un empleado con un proyecto.
- Salarios: CRUD completo.

Nota: los datos de ejemplo del panel se cargan desde MySQL; no son registros fijos.

## Búsqueda y validación
Las listas y el resumen permiten buscar por los valores visibles. La API valida los formularios tanto al crear como al editar.

Para usar otro servidor, configura `REACT_APP_API_URL` en `frontend/.env` (por ejemplo, `http://localhost:3001/api`) antes de iniciar o compilar.

Verificaciones: `npm --prefix backend test` y `npm --prefix frontend run build`.
