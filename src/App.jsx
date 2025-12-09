import { useState } from 'react';
import * as mammoth from 'mammoth';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';

// ============================================
// PARSER v3 - CORREGIDO PARA ESTRUCTURA EXACTA
// ============================================
const parseInformeDRAI = (htmlContent, weekNumber) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');
  const text = doc.body.textContent || '';
  const html = htmlContent;
  
  // ============================================
  // 1. APOYO LOGÍSTICO Y VIDEOCONFERENCIA
  // ============================================
  
  // Videoconferencias: "Se da soporte y asistencia a 60 videoconferencias"
  let videoconferencias = 0;
  const videoMatch = text.match(/asistencia a\s*(\d+)\s*videoconferencias/i);
  if (videoMatch) videoconferencias = parseInt(videoMatch[1]);
  
  // Streamings: "Se realizan 1 transmisiones de streaming"
  let streamings = 0;
  const streamMatch = text.match(/Se realizan?\s*(\d+)\s*transmisiones?\s*de\s*streaming/i);
  if (streamMatch) streamings = parseInt(streamMatch[1]);
  
  // Grabaciones: "Se apoyan 3 grabaciones"
  let grabaciones = 0;
  const grabMatch = text.match(/Se apoyan?\s*(\d+)\s*grabaciones/i);
  if (grabMatch) grabaciones = parseInt(grabMatch[1]);
  
  // Solicitudes: "Se reciben 63 solicitudes"
  let solicitudesVideoconf = 0;
  const solicMatch = text.match(/Se reciben\s*(\d+)\s*solicitudes/i);
  if (solicMatch) solicitudesVideoconf = parseInt(solicMatch[1]);

  // ============================================
  // 2. GESTIÓN DE SISTEMAS - Proyectos activos
  // ============================================
  const proyectosActivos = [
    /praxis/i, /portafolio/i, /júpiter|jupiter/i, /sigac/i, 
    /concurso.*men/i, /cgr/i, /salas info/i
  ].filter(p => p.test(text)).length;

  // ============================================
  // 3. SOPORTE TELEMÁTICO
  // ============================================
  
  // Contar instalaciones de S.O y mantenimientos
  const instalacionesSO = (text.match(/instalación de S\.O|instalación de.*W11|Se realiza instalación/gi) || []).length;
  const mantenimientos = (text.match(/mantenimiento correctivo|mantenimiento lógico/gi) || []).length;
  const equiposConfigurados = instalacionesSO + mantenimientos;
  
  // Reservas Puntuales: "Reservas Puntuales Agendadas: 4."
  let reservasPuntuales = 0;
  const reservasMatch = text.match(/Reservas Puntuales[^:]*:\s*(\d+)/i);
  if (reservasMatch) reservasPuntuales = parseInt(reservasMatch[1]);
  
  // Activación de Licencias: "Activación De Licencia: 2."
  let activacionesLicencia = 0;
  const licenciasMatch = text.match(/Activación[^:]*Licencia[^:]*:\s*(\d+)/i);
  if (licenciasMatch) activacionesLicencia = parseInt(licenciasMatch[1]);
  
  // Atención vía Correo: "Atención Solicitud Vía Correo: 17."
  let atencionCorreo = 0;
  const correoMatch = text.match(/Atención[^:]*(?:Vía|Via)\s*Correo[^:]*:\s*(\d+)/i);
  if (correoMatch) atencionCorreo = parseInt(correoMatch[1]);

  // ============================================
  // 5. CENDOI - GESTIÓN DOCUMENTAL
  // ============================================
  
  // Usuarios CENDOI - Buscar el patrón específico:
  // "Semana del X al Y de MES                    NUMERO"
  let usuariosCENDOI = 0;
  
  // Extraer solo la sección CENDOI
  const cendoiStart = text.indexOf('Gestión Documental CENDOI');
  const cendoiEnd = text.indexOf('Unidad de Gestión de Proyectos');
  
  if (cendoiStart > -1 && cendoiEnd > -1) {
    const cendoiText = text.substring(cendoiStart, cendoiEnd);
    
    // Buscar: "Semana del X al Y de mes    NUMERO"
    // El número de usuarios está después del nombre del mes
    const usuariosMatch = cendoiText.match(/(?:enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)\s+(\d{2,3})/i);
    if (usuariosMatch) {
      usuariosCENDOI = parseInt(usuariosMatch[1]);
    }
  }
  
  // Fallback: buscar "Cantidad total de usuarios" seguido de número de 3 dígitos
  if (!usuariosCENDOI || usuariosCENDOI > 1000) {
    const fallbackMatch = text.match(/diciembre\s+(\d{3})\s/i) || 
                          text.match(/noviembre\s+(\d{3})\s/i) ||
                          text.match(/total de usuarios[^\d]*(\d{3})/i);
    if (fallbackMatch) {
      usuariosCENDOI = parseInt(fallbackMatch[1]);
    }
  }
  
  // Libros, PC, Diademas - están en una tabla dentro de CENDOI
  // Formato: "1    77    88    80 usuarios"
  let libros = 0, pcs = 0, diademas = 0;
  
  if (cendoiStart > -1 && cendoiEnd > -1) {
    const cendoiText = text.substring(cendoiStart, cendoiEnd);
    
    // Buscar la fila de la tabla con los números
    // El patrón es: número pequeño (libros), número ~70-100 (PC), número ~80-120 (diademas)
    const tablaMatch = cendoiText.match(/(\d{1,2})\s+(\d{2,3})\s+(\d{2,3})\s+(\d{2,3})/);
    if (tablaMatch) {
      libros = parseInt(tablaMatch[1]);
      pcs = parseInt(tablaMatch[2]);
      diademas = parseInt(tablaMatch[3]);
    }
  }

  // ============================================
  // 6. UGP - Reuniones
  // ============================================
  const reunionesUGP = (text.match(/(?:Se realiza|Se realizó) reunión/gi) || []).length;

  // ============================================
  // 7. INGENI@
  // ============================================
  
  // Matrículas/pruebas Talento Tech: "pruebas de inicio de usuarios del proyecto Talento Tech-10"
  let talentoTechMatriculas = 0;
  const talentoMatch = text.match(/(?:Talento Tech|pruebas de inicio)[^\d]*(\d+)/i);
  if (talentoMatch) talentoTechMatriculas = parseInt(talentoMatch[1]);
  
  // PQRS
  let pqrsAtendidas = 0;
  const pqrsMatch = text.match(/Respuesta[^P]*PQRS[^\d]*(\d+)/i) || text.match(/PQRS[^\d]*(\d+)/i);
  if (pqrsMatch) pqrsAtendidas = parseInt(pqrsMatch[1]);

  // ============================================
  // 8. PRODUCCIÓN
  // ============================================
  const disenosRealizados = (text.match(/[Dd]iseño de|[Dd]iseño y/g) || []).length;

  // ============================================
  // 9. GESTIÓN ADMINISTRATIVA
  // ============================================
  const comprasGestionadas = (text.match(/[Ss]olicitud de [Cc]ompra|[Ss]olicitud [Cc]ompra/g) || []).length;
  const contrataciones = (text.match(/[Ee]xoneración|[Cc]reación [Tt]erceros|contratos? (?:cátedra|firmados?)/gi) || []).length;
  const transferencias = (text.match(/[Ss]olicitud.*[Tt]ransferencia|[Tt]ransferencia para/gi) || []).length;

  // ============================================
  // RETORNO DE MÉTRICAS
  // ============================================
  return {
    semana: weekNumber,
    fecha: `Semana ${weekNumber}`,
    
    // Área 1: Videoconferencia
    videoconferencias,
    streamings,
    grabaciones,
    solicitudesVideoconf,
    
    // Área 2: Sistemas
    proyectosActivos,
    
    // Área 3: Soporte Telemático
    equiposConfigurados,
    reservasPuntuales,
    activacionesLicencia,
    atencionCorreo,
    
    // Área 5: CENDOI
    usuariosCENDOI,
    libros,
    pcs,
    diademas,
    
    // Área 6: UGP
    reunionesUGP,
    
    // Área 7: Ingeni@
    talentoTechMatriculas,
    pqrsAtendidas,
    
    // Área 8: Producción
    disenosRealizados,
    
    // Área 9: Administrativa
    comprasGestionadas,
    contrataciones,
    transferencias
  };
};

// ============================================
// COLORES DEL TEMA UdeA
// ============================================
const COLORS = {
  primary: '#1B5E20',
  secondary: '#FFC107',
  accent: '#2E7D32',
  success: '#34A853',
  warning: '#FF9800',
  error: '#EA4335',
  purple: '#9C27B0',
  pink: '#E91E63'
};

// ============================================
// COMPONENTE TARJETA MÉTRICA
// ============================================
const MetricCard = ({ title, value, change, icon, color = COLORS.primary }) => {
  const isPositive = change >= 0;
  const hasChange = change !== undefined && change !== null && !isNaN(change) && isFinite(change);
  
  return (
    <div style={{
      background: 'white',
      borderRadius: '16px',
      padding: '20px',
      boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
      borderLeft: `4px solid ${color}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
        <div style={{
          width: '48px',
          height: '48px',
          background: `${color}20`,
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          flexShrink: 0
        }}>
          {icon}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: '13px', color: '#666', fontWeight: 500 }}>{title}</span>
          <span style={{ 
            fontSize: '32px', 
            fontWeight: 800, 
            color: '#1a1a1a', 
            lineHeight: 1,
            fontFamily: "monospace"
          }}>
            {value}
          </span>
          {hasChange && (
            <span style={{ 
              fontSize: '12px', 
              fontWeight: 600, 
              color: isPositive ? COLORS.success : COLORS.error
            }}>
              {isPositive ? '↑' : '↓'} {Math.abs(change)}% vs anterior
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export default function DRAIDashboard() {
  const [informes, setInformes] = useState([]);
  const [currentWeek, setCurrentWeek] = useState(null);
  const [previousWeek, setPreviousWeek] = useState(null);
  const [view, setView] = useState('semanal');
  const [loading, setLoading] = useState(false);

  // Cargar archivo .docx
  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    setLoading(true);
    
    const newInformes = [];
    
    for (const file of files) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer });
        
        const weekMatch = file.name.match(/(\d+)/);
        const weekNumber = weekMatch ? parseInt(weekMatch[1]) : informes.length + newInformes.length + 1;
        
        const metrics = parseInformeDRAI(result.value, weekNumber);
        newInformes.push(metrics);
        
        console.log(`✅ Procesado: ${file.name}`, metrics);
      } catch (error) {
        console.error('❌ Error:', file.name, error);
      }
    }
    
    const allInformes = [...informes, ...newInformes].sort((a, b) => a.semana - b.semana);
    
    // Eliminar duplicados
    const uniqueInformes = allInformes.reduce((acc, curr) => {
      const existing = acc.find(i => i.semana === curr.semana);
      if (!existing) acc.push(curr);
      return acc;
    }, []);
    
    setInformes(uniqueInformes);
    
    if (uniqueInformes.length > 0) {
      setCurrentWeek(uniqueInformes[uniqueInformes.length - 1]);
      if (uniqueInformes.length > 1) {
        setPreviousWeek(uniqueInformes[uniqueInformes.length - 2]);
      }
    }
    
    setLoading(false);
  };

  const calcChange = (current, previous) => {
    if (!previous || previous === 0) return null;
    return Math.round(((current - previous) / previous) * 100);
  };

  const getAreaChartData = () => {
    if (!currentWeek) return [];
    return [
      { area: 'Videoconf.', actual: currentWeek.videoconferencias, anterior: previousWeek?.videoconferencias || 0 },
      { area: 'Soporte', actual: currentWeek.equiposConfigurados, anterior: previousWeek?.equiposConfigurados || 0 },
      { area: 'CENDOI', actual: Math.round(currentWeek.usuariosCENDOI / 10), anterior: Math.round((previousWeek?.usuariosCENDOI || 0) / 10) },
      { area: 'Ingeni@', actual: currentWeek.talentoTechMatriculas, anterior: previousWeek?.talentoTechMatriculas || 0 },
      { area: 'Producción', actual: currentWeek.disenosRealizados, anterior: previousWeek?.disenosRealizados || 0 },
      { area: 'Admin.', actual: currentWeek.comprasGestionadas, anterior: previousWeek?.comprasGestionadas || 0 },
    ];
  };

  const getRadarData = () => {
    if (!currentWeek) return [];
    return [
      { area: 'Videoconferencias', value: Math.min((currentWeek.videoconferencias / 80) * 100, 100) },
      { area: 'Soporte Técnico', value: Math.min((currentWeek.equiposConfigurados / 15) * 100, 100) },
      { area: 'CENDOI', value: Math.min((currentWeek.usuariosCENDOI / 400) * 100, 100) },
      { area: 'Ingeni@', value: Math.min((currentWeek.talentoTechMatriculas / 80) * 100, 100) },
      { area: 'Producción', value: Math.min((currentWeek.disenosRealizados / 10) * 100, 100) },
      { area: 'Administrativa', value: Math.min((currentWeek.comprasGestionadas / 15) * 100, 100) },
    ];
  };

  const getTrendData = () => {
    return informes.map(inf => ({
      semana: `S${inf.semana}`,
      videoconferencias: inf.videoconferencias,
      usuarios: Math.round(inf.usuariosCENDOI / 10),
      soporte: inf.equiposConfigurados
    }));
  };

  const exportHTML = () => {
    if (!currentWeek) return;
    
    const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Informe DRAI - Semana ${currentWeek.semana}</title>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Plus Jakarta Sans', sans-serif; background: #f5f5f5; padding: 24px; color: #1a1a1a; }
    .header { background: linear-gradient(135deg, #1B5E20, #2E7D32); color: white; padding: 32px; border-radius: 16px; margin-bottom: 24px; }
    .header h1 { font-size: 28px; font-weight: 800; margin-bottom: 8px; }
    .header p { opacity: 0.9; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-bottom: 24px; }
    .card { background: white; padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); border-left: 4px solid #1B5E20; }
    .card-title { font-size: 13px; color: #666; margin-bottom: 8px; }
    .card-value { font-size: 32px; font-weight: 800; color: #1B5E20; }
    .section { background: white; padding: 24px; border-radius: 12px; margin-bottom: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .section h3 { font-size: 16px; color: #1B5E20; margin-bottom: 16px; border-bottom: 2px solid #E8F5E9; padding-bottom: 12px; }
    .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
    .row:last-child { border-bottom: none; }
    footer { text-align: center; color: #888; margin-top: 32px; font-size: 12px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>📊 Informe Ejecutivo DRAI - Semana ${currentWeek.semana}</h1>
    <p>Departamento de Recursos de Apoyo e Informática</p>
    <p>Facultad de Ingeniería • Universidad de Antioquia</p>
  </div>
  
  <div class="grid">
    <div class="card">
      <div class="card-title">🎥 Videoconferencias</div>
      <div class="card-value">${currentWeek.videoconferencias}</div>
    </div>
    <div class="card">
      <div class="card-title">📡 Streamings</div>
      <div class="card-value">${currentWeek.streamings}</div>
    </div>
    <div class="card">
      <div class="card-title">👥 Usuarios CENDOI</div>
      <div class="card-value">${currentWeek.usuariosCENDOI}</div>
    </div>
    <div class="card">
      <div class="card-title">💻 Equipos Configurados</div>
      <div class="card-value">${currentWeek.equiposConfigurados}</div>
    </div>
    <div class="card">
      <div class="card-title">🎓 Talento Tech</div>
      <div class="card-value">${currentWeek.talentoTechMatriculas}</div>
    </div>
    <div class="card">
      <div class="card-title">🎨 Diseños</div>
      <div class="card-value">${currentWeek.disenosRealizados}</div>
    </div>
  </div>
  
  <div class="section">
    <h3>📋 Detalle por Áreas</h3>
    <div class="row"><span>Videoconferencias realizadas</span><strong>${currentWeek.videoconferencias}</strong></div>
    <div class="row"><span>Transmisiones streaming</span><strong>${currentWeek.streamings}</strong></div>
    <div class="row"><span>Grabaciones</span><strong>${currentWeek.grabaciones}</strong></div>
    <div class="row"><span>Solicitudes procesadas</span><strong>${currentWeek.solicitudesVideoconf}</strong></div>
    <div class="row"><span>Equipos configurados/mantenimiento</span><strong>${currentWeek.equiposConfigurados}</strong></div>
    <div class="row"><span>Reservas puntuales</span><strong>${currentWeek.reservasPuntuales}</strong></div>
    <div class="row"><span>Activaciones de licencia</span><strong>${currentWeek.activacionesLicencia}</strong></div>
    <div class="row"><span>Atención vía correo</span><strong>${currentWeek.atencionCorreo}</strong></div>
    <div class="row"><span>Usuarios CENDOI atendidos</span><strong>${currentWeek.usuariosCENDOI}</strong></div>
    <div class="row"><span>PCs prestados</span><strong>${currentWeek.pcs}</strong></div>
    <div class="row"><span>Diademas prestadas</span><strong>${currentWeek.diademas}</strong></div>
    <div class="row"><span>Compras gestionadas</span><strong>${currentWeek.comprasGestionadas}</strong></div>
    <div class="row"><span>Procesos de contratación</span><strong>${currentWeek.contrataciones}</strong></div>
  </div>
  
  <footer>
    Generado por DRAI Dashboard © 2025 | Facultad de Ingeniería - Universidad de Antioquia
  </footer>
</body>
</html>`;
    
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Informe_DRAI_Semana_${currentWeek.semana}.html`;
    a.click();
  };

  // ============================================
  // RENDER
  // ============================================
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#F8FAF8',
      fontFamily: "'Segoe UI', -apple-system, sans-serif"
    }}>
      {/* Header */}
      <header style={{
        background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 50%, #1B5E20 100%)',
        padding: '20px 32px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
      }}>
        <div style={{ 
          maxWidth: '1400px', 
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '56px',
              height: '56px',
              background: 'rgba(255,255,255,0.15)',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px'
            }}>📊</div>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'white', margin: 0 }}>
                DRAI Dashboard
              </h1>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.9)', margin: 0 }}>
                Departamento de Recursos de Apoyo e Informática
              </p>
              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>
                Facultad de Ingeniería • Universidad de Antioquia
              </span>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '8px', background: 'rgba(255,255,255,0.15)', padding: '4px', borderRadius: '14px' }}>
            <button
              onClick={() => setView('semanal')}
              style={{
                padding: '10px 20px',
                border: 'none',
                background: view === 'semanal' ? 'white' : 'transparent',
                color: view === 'semanal' ? COLORS.primary : 'rgba(255,255,255,0.8)',
                borderRadius: '10px',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '14px',
                fontFamily: 'inherit'
              }}
            >📅 Semanal</button>
            <button
              onClick={() => setView('anual')}
              style={{
                padding: '10px 20px',
                border: 'none',
                background: view === 'anual' ? 'white' : 'transparent',
                color: view === 'anual' ? COLORS.primary : 'rgba(255,255,255,0.8)',
                borderRadius: '10px',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '14px',
                fontFamily: 'inherit'
              }}
            >📈 Anual</button>
          </div>
        </div>
      </header>

      {/* Upload Section */}
      <section style={{ 
        maxWidth: '1400px', 
        margin: '0 auto', 
        padding: '24px 32px',
        display: 'flex',
        gap: '16px',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        <label style={{
          flex: 1,
          minWidth: '300px',
          background: 'white',
          border: '2px dashed #E0E0E0',
          borderRadius: '16px',
          padding: '24px',
          cursor: 'pointer'
        }}>
          <input 
            type="file" 
            accept=".docx" 
            multiple 
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '32px' }}>📤</span>
            <div>
              <span style={{ fontWeight: 600, color: '#1a1a1a', fontSize: '15px', display: 'block' }}>
                {loading ? 'Procesando...' : 'Subir informes semanales (.docx)'}
              </span>
              <span style={{ fontSize: '13px', color: '#888' }}>
                {informes.length > 0 ? `${informes.length} informes cargados` : 'Arrastra o haz clic para seleccionar'}
              </span>
            </div>
          </div>
        </label>
        
        {informes.length > 0 && (
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={exportHTML} style={{
              padding: '14px 24px',
              background: COLORS.primary,
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontWeight: 600,
              fontSize: '14px',
              cursor: 'pointer',
              fontFamily: 'inherit'
            }}>
              📧 Exportar HTML para correo
            </button>
            <button onClick={() => window.print()} style={{
              padding: '14px 24px',
              background: 'white',
              color: '#1a1a1a',
              border: '1px solid #E0E0E0',
              borderRadius: '12px',
              fontWeight: 600,
              fontSize: '14px',
              cursor: 'pointer',
              fontFamily: 'inherit'
            }}>
              📄 Exportar PDF
            </button>
          </div>
        )}
      </section>

      {/* Dashboard Content */}
      <div id="dashboard-content">
        {/* Vista Semanal */}
        {currentWeek && view === 'semanal' && (
          <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 32px 32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>
                📊 Informe Ejecutivo – Semana {currentWeek.semana}
              </h2>
              {previousWeek && (
                <span style={{
                  background: 'linear-gradient(135deg, #FFD54F, #FFC107)',
                  color: '#1B5E20',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '13px',
                  fontWeight: 600
                }}>
                  Comparado con Semana {previousWeek.semana}
                </span>
              )}
            </div>

            {/* Main Metrics */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '16px',
              marginBottom: '24px'
            }}>
              <MetricCard title="Videoconferencias" value={currentWeek.videoconferencias} change={calcChange(currentWeek.videoconferencias, previousWeek?.videoconferencias)} icon="🎥" color={COLORS.primary} />
              <MetricCard title="Streamings" value={currentWeek.streamings} change={calcChange(currentWeek.streamings, previousWeek?.streamings)} icon="📡" color={COLORS.secondary} />
              <MetricCard title="Usuarios CENDOI" value={currentWeek.usuariosCENDOI} change={calcChange(currentWeek.usuariosCENDOI, previousWeek?.usuariosCENDOI)} icon="👥" color={COLORS.accent} />
              <MetricCard title="Equipos Configurados" value={currentWeek.equiposConfigurados} change={calcChange(currentWeek.equiposConfigurados, previousWeek?.equiposConfigurados)} icon="💻" color={COLORS.warning} />
              <MetricCard title="Talento Tech" value={currentWeek.talentoTechMatriculas} change={calcChange(currentWeek.talentoTechMatriculas, previousWeek?.talentoTechMatriculas)} icon="🎓" color={COLORS.purple} />
              <MetricCard title="Diseños" value={currentWeek.disenosRealizados} change={calcChange(currentWeek.disenosRealizados, previousWeek?.disenosRealizados)} icon="🎨" color={COLORS.pink} />
            </div>

            {/* Charts */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px', marginBottom: '24px' }}>
              <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px' }}>📊 Comparativa por Área</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={getAreaChartData()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis dataKey="area" tick={{ fill: '#666', fontSize: 12 }} />
                    <YAxis tick={{ fill: '#666', fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="anterior" name="Semana Anterior" fill="#E0E0E0" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="actual" name="Semana Actual" fill={COLORS.primary} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px' }}>⚡ Distribución de Carga Laboral</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={getRadarData()}>
                    <PolarGrid stroke="#e0e0e0" />
                    <PolarAngleAxis dataKey="area" tick={{ fill: '#666', fontSize: 11 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#999', fontSize: 10 }} />
                    <Radar name="Carga %" dataKey="value" stroke={COLORS.primary} fill={COLORS.primary} fillOpacity={0.5} />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Detail Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              {/* Videoconferencia */}
              <div style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #eee' }}>
                  🎥 Apoyo Logístico y Videoconferencia
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                  {[
                    { v: currentWeek.videoconferencias, l: 'Videoconferencias' },
                    { v: currentWeek.streamings, l: 'Streamings' },
                    { v: currentWeek.grabaciones, l: 'Grabaciones' },
                    { v: currentWeek.solicitudesVideoconf, l: 'Solicitudes' }
                  ].map((item, i) => (
                    <div key={i} style={{ textAlign: 'center', padding: '12px', background: '#f8f8f8', borderRadius: '8px' }}>
                      <span style={{ display: 'block', fontSize: '24px', fontWeight: 800, color: COLORS.primary }}>{item.v}</span>
                      <span style={{ fontSize: '11px', color: '#888' }}>{item.l}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Soporte */}
              <div style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #eee' }}>
                  💻 Soporte Telemático
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                  {[
                    { v: currentWeek.equiposConfigurados, l: 'Equipos' },
                    { v: currentWeek.reservasPuntuales, l: 'Reservas' },
                    { v: currentWeek.activacionesLicencia, l: 'Licencias' },
                    { v: currentWeek.atencionCorreo, l: 'Correos' }
                  ].map((item, i) => (
                    <div key={i} style={{ textAlign: 'center', padding: '12px', background: '#f8f8f8', borderRadius: '8px' }}>
                      <span style={{ display: 'block', fontSize: '24px', fontWeight: 800, color: COLORS.primary }}>{item.v}</span>
                      <span style={{ fontSize: '11px', color: '#888' }}>{item.l}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CENDOI */}
              <div style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #eee' }}>
                  📚 Gestión Documental CENDOI
                </h3>
                <div style={{ 
                  textAlign: 'center', 
                  padding: '20px', 
                  background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.accent})`, 
                  borderRadius: '12px',
                  color: 'white',
                  marginBottom: '12px'
                }}>
                  <span style={{ display: 'block', fontSize: '36px', fontWeight: 800 }}>{currentWeek.usuariosCENDOI}</span>
                  <span style={{ fontSize: '13px', opacity: 0.9 }}>Usuarios Atendidos</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  {[
                    { v: currentWeek.pcs, l: 'PCs' },
                    { v: currentWeek.diademas, l: 'Diademas' },
                    { v: currentWeek.libros, l: 'Libros' }
                  ].map((item, i) => (
                    <div key={i} style={{ textAlign: 'center', padding: '10px', background: '#f8f8f8', borderRadius: '8px' }}>
                      <span style={{ display: 'block', fontSize: '18px', fontWeight: 700, color: COLORS.primary }}>{item.v}</span>
                      <span style={{ fontSize: '10px', color: '#888' }}>{item.l}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Administrativa */}
              <div style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #eee' }}>
                  📋 Gestión Administrativa
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                  {[
                    { v: currentWeek.comprasGestionadas, l: 'Compras' },
                    { v: currentWeek.contrataciones, l: 'Contrataciones' },
                    { v: currentWeek.transferencias, l: 'Transferencias' }
                  ].map((item, i) => (
                    <div key={i} style={{ textAlign: 'center', padding: '12px', background: '#f8f8f8', borderRadius: '8px' }}>
                      <span style={{ display: 'block', fontSize: '24px', fontWeight: 800, color: COLORS.primary }}>{item.v}</span>
                      <span style={{ fontSize: '11px', color: '#888' }}>{item.l}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Vista Anual */}
        {informes.length > 0 && view === 'anual' && (
          <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 32px 32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>📈 Consolidado Anual 2025</h2>
              <span style={{ background: 'linear-gradient(135deg, #FFD54F, #FFC107)', color: '#1B5E20', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 600 }}>
                {informes.length} semanas analizadas
              </span>
            </div>

            {/* Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              {[
                { icon: '🎥', value: informes.reduce((s, i) => s + i.videoconferencias, 0), label: 'Total Videoconferencias' },
                { icon: '👥', value: informes.reduce((s, i) => s + i.usuariosCENDOI, 0).toLocaleString(), label: 'Usuarios CENDOI' },
                { icon: '💻', value: informes.reduce((s, i) => s + i.equiposConfigurados, 0), label: 'Equipos Configurados' },
                { icon: '🎓', value: informes.reduce((s, i) => s + i.talentoTechMatriculas, 0), label: 'Talento Tech' },
              ].map((item, i) => (
                <div key={i} style={{
                  background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.accent})`,
                  borderRadius: '16px',
                  padding: '24px',
                  textAlign: 'center',
                  color: 'white',
                  boxShadow: '0 4px 16px rgba(27,94,32,0.3)'
                }}>
                  <span style={{ fontSize: '36px', display: 'block', marginBottom: '12px' }}>{item.icon}</span>
                  <span style={{ fontSize: '36px', fontWeight: 800, display: 'block', fontFamily: 'monospace' }}>{item.value}</span>
                  <span style={{ fontSize: '13px', opacity: 0.9, marginTop: '8px', display: 'block' }}>{item.label}</span>
                </div>
              ))}
            </div>

            {/* Trend */}
            <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px' }}>📊 Tendencia de Actividades</h3>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={getTrendData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="semana" tick={{ fill: '#666', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#666', fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="videoconferencias" name="Videoconferencias" stroke={COLORS.primary} fill={COLORS.primary} fillOpacity={0.3} />
                  <Area type="monotone" dataKey="usuarios" name="Usuarios CENDOI (x10)" stroke={COLORS.secondary} fill={COLORS.secondary} fillOpacity={0.3} />
                  <Area type="monotone" dataKey="soporte" name="Equipos Soporte" stroke={COLORS.accent} fill={COLORS.accent} fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              {[
                { title: '🎥 Videoconferencia', stats: [
                  { l: 'Promedio semanal', v: Math.round(informes.reduce((s, i) => s + i.videoconferencias, 0) / informes.length) },
                  { l: 'Máximo', v: Math.max(...informes.map(i => i.videoconferencias)) },
                  { l: 'Mínimo', v: Math.min(...informes.map(i => i.videoconferencias)) }
                ]},
                { title: '📚 CENDOI', stats: [
                  { l: 'Promedio semanal', v: Math.round(informes.reduce((s, i) => s + i.usuariosCENDOI, 0) / informes.length) },
                  { l: 'Máximo', v: Math.max(...informes.map(i => i.usuariosCENDOI)) },
                  { l: 'Mínimo', v: Math.min(...informes.map(i => i.usuariosCENDOI)) }
                ]},
                { title: '💻 Soporte', stats: [
                  { l: 'Promedio semanal', v: Math.round(informes.reduce((s, i) => s + i.equiposConfigurados, 0) / informes.length) },
                  { l: 'Máximo', v: Math.max(...informes.map(i => i.equiposConfigurados)) },
                  { l: 'Mínimo', v: Math.min(...informes.map(i => i.equiposConfigurados)) }
                ]},
                { title: '📋 Administrativa', stats: [
                  { l: 'Compras promedio', v: Math.round(informes.reduce((s, i) => s + i.comprasGestionadas, 0) / informes.length) },
                  { l: 'Contrataciones totales', v: informes.reduce((s, i) => s + i.contrataciones, 0) },
                  { l: 'Transferencias totales', v: informes.reduce((s, i) => s + i.transferencias, 0) }
                ]}
              ].map((section, i) => (
                <div key={i} style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
                  <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px' }}>{section.title}</h4>
                  {section.stats.map((stat, j) => (
                    <div key={j} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: j < section.stats.length - 1 ? '1px solid #eee' : 'none', fontSize: '14px' }}>
                      <span style={{ color: '#666' }}>{stat.l}:</span>
                      <strong style={{ color: COLORS.primary, fontFamily: 'monospace' }}>{stat.v}</strong>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {informes.length === 0 && (
          <div style={{ maxWidth: '500px', margin: '60px auto', textAlign: 'center', padding: '60px 32px', background: 'white', borderRadius: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
            <span style={{ fontSize: '64px', display: 'block', marginBottom: '20px', opacity: 0.5 }}>📂</span>
            <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>No hay informes cargados</h3>
            <p style={{ color: '#666', fontSize: '15px' }}>Sube los archivos .docx de los informes semanales</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer style={{ maxWidth: '1400px', margin: '40px auto 0', padding: '24px 32px', textAlign: 'center', borderTop: '1px solid #E8E8E8' }}>
        <p style={{ fontSize: '13px', color: '#888' }}>DRAI Dashboard © 2025 • Facultad de Ingeniería • Universidad de Antioquia</p>
      </footer>
    </div>
  );
}
