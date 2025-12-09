# 📊 DRAI Dashboard

**Dashboard de Informes Semanales**  
Departamento de Recursos de Apoyo e Informática  
Facultad de Ingeniería • Universidad de Antioquia

---

## 🚀 Características

- ✅ **Carga de informes:** Sube archivos .docx de informes semanales
- ✅ **Parser automático:** Extrae métricas de las 9 áreas del DRAI
- ✅ **Vista semanal:** Comparativa con la semana anterior + gráficos
- ✅ **Vista anual:** Consolidado de todas las semanas con tendencias
- ✅ **Exportar:** HTML interactivo para correo + PDF para imprimir
- ✅ **100% gratuito:** Sin costos de servidor ni hosting

---

## 📦 Instalación Local

```bash
# Clonar o descargar el proyecto
cd drai-dashboard

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Abrir en http://localhost:5173
```

---

## 🌐 Despliegue en Vercel (GRATIS)

### Opción 1: Despliegue directo desde GitHub

1. Sube el proyecto a un repositorio de GitHub
2. Ve a [vercel.com](https://vercel.com) y crea una cuenta gratuita
3. Haz clic en "New Project"
4. Importa tu repositorio de GitHub
5. Vercel detectará automáticamente que es un proyecto Vite
6. Haz clic en "Deploy"
7. ¡Listo! Tu dashboard estará en `https://tu-proyecto.vercel.app`

### Opción 2: Despliegue con Vercel CLI

```bash
# Instalar Vercel CLI
npm install -g vercel

# En la carpeta del proyecto
vercel

# Seguir las instrucciones
```

---

## 📁 Estructura del Proyecto

```
drai-dashboard/
├── index.html
├── package.json
├── vite.config.js
├── README.md
└── src/
    ├── main.jsx
    ├── App.jsx
    └── index.css
```

---

## 🔧 Cómo Usar

### 1. Cargar Informes
- Arrastra los archivos .docx de los informes semanales
- Puedes cargar múltiples archivos a la vez
- El sistema extrae automáticamente las métricas

### 2. Vista Semanal
- Muestra el último informe cargado
- Compara con la semana anterior
- Gráficos de barras y radar de carga laboral

### 3. Vista Anual
- Consolida todos los informes cargados
- Tendencias a lo largo del año
- Estadísticas por área (promedio, máximo, mínimo)

### 4. Exportar
- **HTML para correo:** Archivo interactivo que puedes enviar
- **PDF:** Usa Ctrl+P o el botón de exportar

---

## 📊 Métricas Extraídas

| Área | Métricas |
|------|----------|
| Videoconferencia | Videoconferencias, Streamings, Grabaciones, Solicitudes |
| Sistemas | Proyectos activos (Praxis, Portafolio, Júpiter, etc.) |
| Soporte Telemático | Equipos configurados, Reservas, Licencias, Correos |
| Soporte Regiones | Correos respondidos |
| CENDOI | Usuarios atendidos, PCs, Diademas |
| UGP | Reuniones |
| Ingeni@ | Matrículas Talento Tech, PQRS |
| Producción | Diseños, Cursos |
| Administrativa | Compras, Contrataciones, Transferencias |

---

## 🎨 Personalización

Los colores del tema están en `src/index.css`:

```css
:root {
  --primary: #1B5E20;      /* Verde UdeA */
  --secondary: #FFC107;    /* Amarillo */
  --accent: #4CAF50;       /* Verde claro */
}
```

---

## 📧 Soporte

Desarrollado para el DRAI - Facultad de Ingeniería  
Universidad de Antioquia  
2025

---

## 📄 Licencia

Uso interno - Universidad de Antioquia
