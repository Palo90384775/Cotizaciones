# Cotizador - Redes Colombia Ingeniería S.A.S

## Instalación y uso

### Requisitos
- Node.js 16 o superior (https://nodejs.org)

### Pasos para iniciar

1. Abre la terminal en esta carpeta
2. Instala las dependencias:
   ```
   npm install
   ```
3. Inicia la aplicación:
   ```
   npm start
   ```
4. Se abrirá automáticamente en tu navegador en http://localhost:3000

### Para compilar (producción)
```
npm run build
```
Genera una carpeta `build/` lista para subir a cualquier servidor.

---

## Funcionalidades

- **Nueva cotización**: Llena los datos del cliente, agrega ítems del catálogo o manualmente. Las fórmulas (Administración, Imprevistos, Utilidad, IVA) se calculan automáticamente.
- **Exportar Word**: Genera un archivo .docx con el diseño de Redes Colombia listo para enviar.
- **Guardadas**: Todas las cotizaciones guardadas durante la sesión.
- **Mis productos**: Catálogo de productos reutilizable. Viene precargado con los productos del ejemplo.
