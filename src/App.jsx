import { useState } from 'react';
import * as mammoth from 'mammoth';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';

// ============================================
// PARSER MEJORADO PARA INFORMES DRAI
// ============================================
const parseInformeDRAI = (htmlContent, weekNumber) => {
  // Limpiar HTML y obtener texto plano
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');
  const text = doc.body.textContent || '';
  const html = htmlContent;
  
  // Función auxiliar para extraer números con múltiples patrones
  const extractNumber = (patterns, defaultVal = 0) => {
    for (const pattern of patterns) {
      const match = text.match(pattern) || html.match(pattern);
      if (match) {
        const num = parseInt(match[1]) || parseInt(match[2]);
        if (num && num > 0) return num;
      }
    }
    return defaultVal;
  };

  // ============================================
  // 1. APOYO LOGÍSTICO Y VIDEOCONFERENCIA
  // ============================================
  
  // Videoconferencias: "Se da soporte y asistencia a 60 videoconferencias"
  const videoconferencias = extractNumber([
    /asistencia a\s*(\d+)\s*videoconferencias/i,
    /soporte.*?(\d+)\s*videoconferencias/i,
    /(\d+)\s*videoconferencias.*sustentaciones/i
  ]);
  
  // Streamings: "Se realizan 1 transmisiones de streaming"
  const streamings = extractNumber([
    /Se realizan?\s*(\d+)\s*transmisiones?\s*de\s*streaming/i,
    /(\d+)\s*transmisiones?\s*de\s*streaming/i
  ]);
  
  // Grabaciones: "Se apoyan 3 grabaciones"
  const grabaciones = extractNumber([
    /Se apoyan?\s*(\d+)\s*grabaciones/i,
    /apoyan?\s*(\d+)\s*grabaciones/i
  ]);
  
  // Solicitudes de videoconferencia: "Se reciben 63 solicitudes"
  const solicitudesVideoconf = extractNumber([
    /Se reciben\s*(\d+)\s*solicitudes/i,
    /reciben\s*(\d+)\s*solicitudes.*videoconferencia/i
  ]);

  // ============================================
  // 2. GESTIÓN DE SISTEMAS DE INFORMACIÓN
  // ============================================
  
  // Contar proyectos activos mencionados
  const proyectosActivos = [
    /praxis/i, /portafolio/i, /júpiter|jupiter/i, /sigac/i, 
    /concurso.*men/i, /concurso.*cgr/i, /salas info/i
  ].filter(p => p.test(text)).length;

  // ============================================
  // 3. SOPORTE TELEMÁTICO
  // ============================================
  
  // Equipos configurados: contar instalaciones de S.O, mantenimientos, etc.
  const equiposInstalacionSO = (text.match(/instalación de S\.O|instalación de.*W11|instalación de.*Windows/gi) || []).length;
  const equiposMantenimiento = (text.match(/mantenimiento.*equipo|mantenimiento correctivo|mantenimiento lógico/gi) || []).length;
  const equiposConfigurados = Math.max(equiposInstalacionSO + equiposMantenimiento, 
    extractNumber([/instalación.*?(\d+)\s*equipos/i, /(\d+)\s*equipos.*instalación/i]));
  
  // Reservas Puntuales Agendadas
  const reservasPuntuales = extractNumber([
    /Reservas Puntuales.*?(\d+)/i,
    /Reservas Puntuales Agendadas.*?(\d+)/i
  ]);
  
  // Activación de Licencias
  const activacionesLicencia = extractNumber([
    /Activación De Licencia.*?(\d+)/i,
    /Activación.*Licencia.*?(\d+)/i
  ]);
  
  // Atención vía Correo
  const atencionCorreo = extractNumber([
    /Atención Solicitud Vía Correo.*?(\d+)/i,
    /Vía Correo.*?(\d+)/i,
    /correo.*?(\d+)\./i
  ]);

  // ============================================
  // 4. SOPORTE INGENI@ - REGIONES
  // ============================================
  const correosRespondidos = extractNumber([
    /Respuesta.*?(\d+)/i,
    /correos.*respondidos.*?(\d+)/i
  ]);

  // ============================================
  // 5. CENDOI - GESTIÓN DOCUMENTAL
  // ============================================
  
  // Usuarios CENDOI: Buscar en la tabla específica
  // Formato: "Semana del 1 al 6 de diciembre                                    283"
  let usuariosCENDOI = 0;
  
  // Patrón 1: Buscar número después de "Semana del X al Y de mes"
  const cendoiMatch1 = text.match(/Semana del \d+.*?(?:enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)\s+(\d{2,4})/i);
  if (cendoiMatch1) usuariosCENDOI = parseInt(cendoiMatch1[1]);
  
  // Patrón 2: Buscar "Cantidad total de usuarios" seguido de número
  if (!usuariosCENDOI) {
    const cendoiMatch2 = text.match(/Cantidad total de usuarios\s+(\d+)/i);
    if (cendoiMatch2) usuariosCENDOI = parseInt(cendoiMatch2[1]);
  }
  
  // Patrón 3: Buscar número de 3 dígitos después de CENDOI y antes de "Libros"
  if (!usuariosCENDOI) {
    const cendoiSection = text.match(/CENDOI[\s\S]*?(\d{3})[\s\S]*?Libros/i);
    if (cendoiSection) usuariosCENDOI = parseInt(cendoiSection[1]);
  }
  
  // PCs prestados
  const pcs = extractNumber([
    /PC\s+(\d+)/i,
    /\b(\d{2,3})\s*<\/td>.*?Diademas/i
  ]) || extractNumber([/(\d{2})\s+\d{2,3}\s+\d{2}/]);
  
  // Diademas
  const diademas = extractNumber([
    /Diademas.*?(\d+)/i,
    /(\d{2,3}).*?Diademas/i
  ]);
  
  // Libros
  const libros = extractNumber([/Libros.*?(\d+)/i]);

  // ============================================
  // 6. UNIDAD DE GESTIÓN DE PROYECTOS
  // ============================================
  const reunionesUGP = (text.match(/reunión|reuniones/gi) || []).length;

  // ============================================
  // 7. INGENI@
  // ============================================
  
  // Matrículas Talento Tech
  const talentoTechMatriculas = extractNumber([
    /Matrícula.*?Talento Tech.*?(\d+)/i,
    /Talento Tech.*?(\d+)/i,
    /pruebas de inicio.*?(\d+)/i,
    /matrícula.*?(\d+)/i
  ]);
  
  // PQRS Atendidas
  const pqrsAtendidas = extractNumber([
    /PQRS.*?(\d+)/i,
    /Respuesta.*?PQRS.*?(\d+)/i
  ]);

  // ============================================
  // 8. PRODUCCIÓN
  // ============================================
  const disenosRealizados = (text.match(/[Dd]iseño/g) || []).length;
  const cursosProducidos = (text.match(/[Cc]urso/g) || []).length;

  // ============================================
  // 9. GESTIÓN ADMINISTRATIVA
  // ============================================
  const comprasGestionadas = (text.match(/[Cc]ompra|[Ss]olicitud de [Cc]ompra/g) || []).length;
  const contrataciones = (text.match(/[Cc]ontrat|[Ee]xoneración|[Tt]erceros/g) || []).length;
  const transferencias = (text.match(/[Tt]ransferencia/g) || []).length;

  // ============================================
  // RETORNO DE MÉTRICAS
  // ============================================
  return {
    semana: weekNumber,
    fecha: `Semana ${weekNumber}`,
    
    // Área 1: Videoconferencia
    videoconferencias: videoconferencias || 0,
    streamings: streamings || 0,
    grabaciones: grabaciones || 0,
    solicitudesVideoconf: solicitudesVideoconf || 0,
    
    // Área 2: Sistemas
    proyectosActivos: proyectosActivos || 0,
    
    // Área 3: Soporte Telemático
    equiposConfigurados: equiposConfigurados || 0,
    reservasPuntuales: reservasPuntuales || 0,
    activacionesLicencia: activacionesLicencia || 0,
    atencionCorreo: atencionCorreo || 0,
    
    // Área 4: Soporte Regiones
    correosRespondidos: correosRespondidos || 0,
    
    // Área 5: CENDOI
    usuariosCENDOI: usuariosCENDOI || 0,
    libros: libros || 0,
    pcs: pcs || 0,
    diademas: diademas || 0,
    
    // Área 6: UGP
    reunionesUGP: reunionesUGP || 0,
    
    // Área 7: Ingeni@
    talentoTechMatriculas: talentoTechMatriculas || 0,
    pqrsAtendidas: pqrsAtendidas || 0,
    
    // Área 8: Producción
    disenosRealizados: disenosRealizados || 0,
    cursosProducidos: cursosProducidos || 0,
    
    // Área 9: Administrativa
    comprasGestionadas: comprasGestionadas || 0,
    contrataciones: contrataciones || 0,
    transferencias: transferencias || 0
  };
};

// ============================================
// COLORES DEL TEMA UdeA
// ============================================
const COLORS = {
  primary: '#1B5E20',
  secondary: '#FFC107',
  accent: '#2E7D32',
  dark: '#0D3311',
  light: '#E8F5E9',
  white: '#FFFFFF',
  gray: '#607D8B',
  success: '#34A853',
  warning: '#FF9800',
  error: '#EA4335',
  purple: '#9C27B0',
  pink: '#E91E63',
  chartColors: ['#1B5E20', '#FFC107', '#2E7D32', '#4CAF50', '#8BC34A', '#CDDC39', '#FF9800', '#FF5722', '#795548']
};

// ============================================
// COMPONENTE TARJETA MÉTRICA
// ============================================
const MetricCard = ({ title, value, change, icon, color = COLORS.primary }) => {
  const isPositive = change >= 0;
  const hasChange = change !== undefined && change !== null && !isNaN(change);
  
  return (
    <div style={{
      background: 'white',
      borderRadius: '16px',
      padding: '20px',
      boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
      borderLeft: `4px solid ${color}`,
      transition: 'all 0.3s ease',
      cursor: 'default'
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
            fontFamily: "'JetBrains Mono', monospace"
          }}>
            {value}
          </span>
          {hasChange && (
            <span style={{ 
              fontSize: '12px', 
              fontWeight: 600, 
              color: isPositive ? COLORS.success : COLORS.error,
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              {isPositive ? '↑' : '↓'} {Math.abs(change)}% vs semana anterior
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
  const [debugInfo, setDebugInfo] = useState('');

  // Cargar archivo .docx
  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    setLoading(true);
    setDebugInfo('Procesando archivos...');
    
    const newInformes = [];
    
    for (const file of files) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer });
        
        // Extraer número de semana del nombre del archivo
        const weekMatch = file.name.match(/(\d+)/);
        const weekNumber = weekMatch ? parseInt(weekMatch[1]) : informes.length + newInformes.length + 1;
        
        const metrics = parseInformeDRAI(result.value, weekNumber);
        newInformes.push(metrics);
        
        console.log(`Procesado: ${file.name}`, metrics);
      } catch (error) {
        console.error('Error procesando archivo:', file.name, error);
        setDebugInfo(`Error en ${file.name}: ${error.message}`);
      }
    }
    
    const allInformes = [...informes, ...newInformes].sort((a, b) => a.semana - b.semana);
    
    // Eliminar duplicados por número de semana
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
    
    setDebugInfo(`${uniqueInformes.length} informes cargados`);
    setLoading(false);
  };

  // Calcular cambio porcentual
  const calcChange = (current, previous) => {
    if (!previous || previous === 0) return null;
    return Math.round(((current - previous) / previous) * 100);
  };

  // Datos para gráfico de barras comparativo
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

  // Datos para radar de carga laboral
  const getRadarData = () => {
    if (!currentWeek) return [];
    const maxValues = {
      videoconferencias: 80,
      equiposConfigurados: 20,
      usuariosCENDOI: 500,
      talentoTechMatriculas: 100,
      disenosRealizados: 15,
      comprasGestionadas: 20
    };
    
    return [
      { area: 'Videoconferencias', value: Math.min((currentWeek.videoconferencias / maxValues.videoconferencias) * 100, 100) },
      { area: 'Soporte Técnico', value: Math.min((currentWeek.equiposConfigurados / maxValues.equiposConfigurados) * 100, 100) },
      { area: 'CENDOI', value: Math.min((currentWeek.usuariosCENDOI / maxValues.usuariosCENDOI) * 100, 100) },
      { area: 'Ingeni@', value: Math.min((currentWeek.talentoTechMatriculas / maxValues.talentoTechMatriculas) * 100, 100) },
      { area: 'Producción', value: Math.min((currentWeek.disenosRealizados / maxValues.disenosRealizados) * 100, 100) },
      { area: 'Administrativa', value: Math.min((currentWeek.comprasGestionadas / maxValues.comprasGestionadas) * 100, 100) },
    ];
  };

  // Tendencia anual
  const getTrendData = () => {
    return informes.map(inf => ({
      semana: `S${inf.semana}`,
      videoconferencias: inf.videoconferencias,
      usuarios: Math.round(inf.usuariosCENDOI / 10),
      soporte: inf.equiposConfigurados
    }));
  };

  // Exportar como HTML
  const exportHTML = () => {
    const content = document.getElementById('dashboard-content');
    if (!content) return;
    
    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Informe DRAI - Semana ${currentWeek?.semana || ''}</title>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Plus Jakarta Sans', sans-serif; background: #f5f5f5; padding: 20px; color: #1a1a1a; }
    .header { background: linear-gradient(135deg, #1B5E20, #2E7D32); color: white; padding: 30px; border-radius: 16px; margin-bottom: 24px; }
    .header h1 { font-size: 28px; font-weight: 800; }
    .header p { opacity: 0.9; margin-top: 4px; }
    .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px; }
    .metric-card { background: white; padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); border-left: 4px solid #1B5E20; }
    .metric-value { font-size: 36px; font-weight: 800; color: #1B5E20; }
    .metric-title { color: #666; font-size: 14px; margin-bottom: 8px; }
    .section { background: white; padding: 24px; border-radius: 12px; margin-bottom: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .section h3 { font-size: 18px; margin-bottom: 16px; color: #1B5E20; }
  </style>
</head>
<body>
  <div class="header">
    <h1>📊 DRAI Dashboard - Informe Ejecutivo</h1>
    <p>Semana ${currentWeek?.semana || ''} | Departamento de Recursos de Apoyo e Informática</p>
    <p>Facultad de Ingeniería • Universidad de Antioquia</p>
  </div>
  
  <div class="metrics-grid">
    <div class="metric-card">
      <div class="metric-title">🎥 Videoconferencias</div>
      <div class="metric-value">${currentWeek?.videoconferencias || 0}</div>
    </div>
    <div class="metric-card">
      <div class="metric-title">📡 Streamings</div>
      <div class="metric-value">${currentWeek?.streamings || 0}</div>
    </div>
    <div class="metric-card">
      <div class="metric-title">👥 Usuarios CENDOI</div>
      <div class="metric-value">${currentWeek?.usuariosCENDOI || 0}</div>
    </div>
    <div class="metric-card">
      <div class="metric-title">💻 Equipos Configurados</div>
      <div class="metric-value">${currentWeek?.equiposConfigurados || 0}</div>
    </div>
    <div class="metric-card">
      <div class="metric-title">🎓 Matrículas Talento Tech</div>
      <div class="metric-value">${currentWeek?.talentoTechMatriculas || 0}</div>
    </div>
    <div class="metric-card">
      <div class="metric-title">🎨 Diseños Realizados</div>
      <div class="metric-value">${currentWeek?.disenosRealizados || 0}</div>
    </div>
  </div>
  
  <div class="section">
    <h3>📋 Resumen por Áreas</h3>
    <p><strong>Videoconferencia:</strong> ${currentWeek?.videoconferencias || 0} videoconferencias, ${currentWeek?.streamings || 0} streamings, ${currentWeek?.grabaciones || 0} grabaciones</p>
    <p><strong>Soporte Telemático:</strong> ${currentWeek?.equiposConfigurados || 0} equipos, ${currentWeek?.reservasPuntuales || 0} reservas, ${currentWeek?.atencionCorreo || 0} correos</p>
    <p><strong>CENDOI:</strong> ${currentWeek?.usuariosCENDOI || 0} usuarios atendidos</p>
    <p><strong>Gestión Administrativa:</strong> ${currentWeek?.comprasGestionadas || 0} compras, ${currentWeek?.contrataciones || 0} contrataciones</p>
  </div>
  
  <footer style="text-align: center; color: #888; margin-top: 24px; font-size: 12px;">
    Generado por DRAI Dashboard © 2025 | Universidad de Antioquia
  </footer>
</body>
</html>`;
    
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Informe_DRAI_Semana_${currentWeek?.semana || 'X'}.html`;
    a.click();
  };

  // ============================================
  // RENDER
  // ============================================
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#F8FAF8',
      fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif"
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
              fontSize: '28px',
              backdropFilter: 'blur(10px)'
            }}>📊</div>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'white', margin: 0, letterSpacing: '-0.5px' }}>
                DRAI Dashboard
              </h1>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.9)', margin: 0, fontWeight: 500 }}>
                Departamento de Recursos de Apoyo e Informática
              </p>
              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>
                Facultad de Ingeniería • Universidad de Antioquia
              </span>
            </div>
          </div>
          
          <div style={{ 
            display: 'flex', 
            gap: '8px', 
            background: 'rgba(255,255,255,0.15)', 
            padding: '4px', 
            borderRadius: '14px',
            backdropFilter: 'blur(10px)'
          }}>
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
                fontFamily: 'inherit',
                transition: 'all 0.2s ease'
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
                fontFamily: 'inherit',
                transition: 'all 0.2s ease'
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
          cursor: 'pointer',
          transition: 'all 0.3s ease'
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
              fontFamily: 'inherit',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease'
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
              fontFamily: 'inherit',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
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
            {/* Week Header */}
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

            {/* Main Metrics Grid */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
              gap: '16px',
              marginBottom: '24px'
            }}>
              <MetricCard 
                title="Videoconferencias" 
                value={currentWeek.videoconferencias}
                change={calcChange(currentWeek.videoconferencias, previousWeek?.videoconferencias)}
                icon="🎥"
                color={COLORS.primary}
              />
              <MetricCard 
                title="Streamings" 
                value={currentWeek.streamings}
                change={calcChange(currentWeek.streamings, previousWeek?.streamings)}
                icon="📡"
                color={COLORS.secondary}
              />
              <MetricCard 
                title="Usuarios CENDOI" 
                value={currentWeek.usuariosCENDOI}
                change={calcChange(currentWeek.usuariosCENDOI, previousWeek?.usuariosCENDOI)}
                icon="👥"
                color={COLORS.accent}
              />
              <MetricCard 
                title="Equipos Configurados" 
                value={currentWeek.equiposConfigurados}
                change={calcChange(currentWeek.equiposConfigurados, previousWeek?.equiposConfigurados)}
                icon="💻"
                color={COLORS.warning}
              />
              <MetricCard 
                title="Matrículas Talento Tech" 
                value={currentWeek.talentoTechMatriculas}
                change={calcChange(currentWeek.talentoTechMatriculas, previousWeek?.talentoTechMatriculas)}
                icon="🎓"
                color={COLORS.purple}
              />
              <MetricCard 
                title="Diseños Realizados" 
                value={currentWeek.disenosRealizados}
                change={calcChange(currentWeek.disenosRealizados, previousWeek?.disenosRealizados)}
                icon="🎨"
                color={COLORS.pink}
              />
            </div>

            {/* Charts Section */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
              gap: '20px',
              marginBottom: '24px'
            }}>
              {/* Bar Chart */}
              <div style={{ 
                background: 'white', 
                borderRadius: '16px', 
                padding: '24px', 
                boxShadow: '0 2px 12px rgba(0,0,0,0.08)' 
              }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  📊 Comparativa por Área
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={getAreaChartData()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis dataKey="area" tick={{ fill: '#666', fontSize: 12 }} />
                    <YAxis tick={{ fill: '#666', fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ 
                        background: 'white', 
                        border: 'none', 
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                      }} 
                    />
                    <Legend />
                    <Bar dataKey="anterior" name="Semana Anterior" fill="#E0E0E0" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="actual" name="Semana Actual" fill={COLORS.primary} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Radar Chart */}
              <div style={{ 
                background: 'white', 
                borderRadius: '16px', 
                padding: '24px', 
                boxShadow: '0 2px 12px rgba(0,0,0,0.08)' 
              }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  ⚡ Distribución de Carga Laboral
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={getRadarData()}>
                    <PolarGrid stroke="#e0e0e0" />
                    <PolarAngleAxis dataKey="area" tick={{ fill: '#666', fontSize: 11 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#999', fontSize: 10 }} />
                    <Radar 
                      name="Carga %" 
                      dataKey="value" 
                      stroke={COLORS.primary} 
                      fill={COLORS.primary} 
                      fillOpacity={0.5} 
                    />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Detailed Sections */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
              gap: '16px' 
            }}>
              {/* Videoconferencias */}
              <div style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #eee' }}>
                  🎥 Apoyo Logístico y Videoconferencia
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                  <div style={{ textAlign: 'center', padding: '12px', background: '#f8f8f8', borderRadius: '8px' }}>
                    <span style={{ display: 'block', fontSize: '24px', fontWeight: 800, color: COLORS.primary }}>{currentWeek.videoconferencias}</span>
                    <span style={{ fontSize: '11px', color: '#888' }}>Videoconferencias</span>
                  </div>
                  <div style={{ textAlign: 'center', padding: '12px', background: '#f8f8f8', borderRadius: '8px' }}>
                    <span style={{ display: 'block', fontSize: '24px', fontWeight: 800, color: COLORS.primary }}>{currentWeek.streamings}</span>
                    <span style={{ fontSize: '11px', color: '#888' }}>Streamings</span>
                  </div>
                  <div style={{ textAlign: 'center', padding: '12px', background: '#f8f8f8', borderRadius: '8px' }}>
                    <span style={{ display: 'block', fontSize: '24px', fontWeight: 800, color: COLORS.primary }}>{currentWeek.grabaciones}</span>
                    <span style={{ fontSize: '11px', color: '#888' }}>Grabaciones</span>
                  </div>
                  <div style={{ textAlign: 'center', padding: '12px', background: '#f8f8f8', borderRadius: '8px' }}>
                    <span style={{ display: 'block', fontSize: '24px', fontWeight: 800, color: COLORS.primary }}>{currentWeek.solicitudesVideoconf}</span>
                    <span style={{ fontSize: '11px', color: '#888' }}>Solicitudes</span>
                  </div>
                </div>
              </div>

              {/* Soporte Telemático */}
              <div style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #eee' }}>
                  💻 Soporte Telemático
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                  <div style={{ textAlign: 'center', padding: '12px', background: '#f8f8f8', borderRadius: '8px' }}>
                    <span style={{ display: 'block', fontSize: '24px', fontWeight: 800, color: COLORS.primary }}>{currentWeek.equiposConfigurados}</span>
                    <span style={{ fontSize: '11px', color: '#888' }}>Equipos</span>
                  </div>
                  <div style={{ textAlign: 'center', padding: '12px', background: '#f8f8f8', borderRadius: '8px' }}>
                    <span style={{ display: 'block', fontSize: '24px', fontWeight: 800, color: COLORS.primary }}>{currentWeek.reservasPuntuales}</span>
                    <span style={{ fontSize: '11px', color: '#888' }}>Reservas</span>
                  </div>
                  <div style={{ textAlign: 'center', padding: '12px', background: '#f8f8f8', borderRadius: '8px' }}>
                    <span style={{ display: 'block', fontSize: '24px', fontWeight: 800, color: COLORS.primary }}>{currentWeek.activacionesLicencia}</span>
                    <span style={{ fontSize: '11px', color: '#888' }}>Licencias</span>
                  </div>
                  <div style={{ textAlign: 'center', padding: '12px', background: '#f8f8f8', borderRadius: '8px' }}>
                    <span style={{ display: 'block', fontSize: '24px', fontWeight: 800, color: COLORS.primary }}>{currentWeek.atencionCorreo}</span>
                    <span style={{ fontSize: '11px', color: '#888' }}>Correos</span>
                  </div>
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
                  <div style={{ textAlign: 'center', padding: '10px', background: '#f8f8f8', borderRadius: '8px' }}>
                    <span style={{ display: 'block', fontSize: '18px', fontWeight: 700, color: COLORS.primary }}>{currentWeek.pcs}</span>
                    <span style={{ fontSize: '10px', color: '#888' }}>PCs</span>
                  </div>
                  <div style={{ textAlign: 'center', padding: '10px', background: '#f8f8f8', borderRadius: '8px' }}>
                    <span style={{ display: 'block', fontSize: '18px', fontWeight: 700, color: COLORS.primary }}>{currentWeek.diademas}</span>
                    <span style={{ fontSize: '10px', color: '#888' }}>Diademas</span>
                  </div>
                  <div style={{ textAlign: 'center', padding: '10px', background: '#f8f8f8', borderRadius: '8px' }}>
                    <span style={{ display: 'block', fontSize: '18px', fontWeight: 700, color: COLORS.primary }}>{currentWeek.libros}</span>
                    <span style={{ fontSize: '10px', color: '#888' }}>Libros</span>
                  </div>
                </div>
              </div>

              {/* Gestión Administrativa */}
              <div style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #eee' }}>
                  📋 Gestión Administrativa
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                  <div style={{ textAlign: 'center', padding: '12px', background: '#f8f8f8', borderRadius: '8px' }}>
                    <span style={{ display: 'block', fontSize: '24px', fontWeight: 800, color: COLORS.primary }}>{currentWeek.comprasGestionadas}</span>
                    <span style={{ fontSize: '11px', color: '#888' }}>Compras</span>
                  </div>
                  <div style={{ textAlign: 'center', padding: '12px', background: '#f8f8f8', borderRadius: '8px' }}>
                    <span style={{ display: 'block', fontSize: '24px', fontWeight: 800, color: COLORS.primary }}>{currentWeek.contrataciones}</span>
                    <span style={{ fontSize: '11px', color: '#888' }}>Contrataciones</span>
                  </div>
                  <div style={{ textAlign: 'center', padding: '12px', background: '#f8f8f8', borderRadius: '8px' }}>
                    <span style={{ display: 'block', fontSize: '24px', fontWeight: 800, color: COLORS.primary }}>{currentWeek.transferencias}</span>
                    <span style={{ fontSize: '11px', color: '#888' }}>Transferencias</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Vista Anual */}
        {informes.length > 0 && view === 'anual' && (
          <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 32px 32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>
                📈 Consolidado Anual 2025
              </h2>
              <span style={{
                background: 'linear-gradient(135deg, #FFD54F, #FFC107)',
                color: '#1B5E20',
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: 600
              }}>
                {informes.length} semanas analizadas
              </span>
            </div>

            {/* Annual Summary Cards */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '16px',
              marginBottom: '24px'
            }}>
              {[
                { icon: '🎥', value: informes.reduce((sum, inf) => sum + inf.videoconferencias, 0), label: 'Total Videoconferencias' },
                { icon: '👥', value: informes.reduce((sum, inf) => sum + inf.usuariosCENDOI, 0).toLocaleString(), label: 'Usuarios CENDOI Atendidos' },
                { icon: '💻', value: informes.reduce((sum, inf) => sum + inf.equiposConfigurados, 0), label: 'Equipos Configurados' },
                { icon: '🎓', value: informes.reduce((sum, inf) => sum + inf.talentoTechMatriculas, 0), label: 'Matrículas Talento Tech' },
              ].map((item, i) => (
                <div key={i} style={{
                  background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.accent})`,
                  borderRadius: '16px',
                  padding: '24px',
                  textAlign: 'center',
                  color: 'white',
                  boxShadow: '0 4px 16px rgba(27,94,32,0.3)',
                  transition: 'transform 0.3s ease'
                }}>
                  <span style={{ fontSize: '36px', display: 'block', marginBottom: '12px' }}>{item.icon}</span>
                  <span style={{ fontSize: '36px', fontWeight: 800, display: 'block', fontFamily: "'JetBrains Mono', monospace" }}>{item.value}</span>
                  <span style={{ fontSize: '13px', opacity: 0.9, marginTop: '8px', display: 'block' }}>{item.label}</span>
                </div>
              ))}
            </div>

            {/* Trend Chart */}
            <div style={{ 
              background: 'white', 
              borderRadius: '16px', 
              padding: '24px', 
              boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
              marginBottom: '24px'
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px' }}>
                📊 Tendencia Anual de Actividades
              </h3>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={getTrendData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="semana" tick={{ fill: '#666', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#666', fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'white', 
                      border: 'none', 
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                    }} 
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="videoconferencias" 
                    name="Videoconferencias"
                    stroke={COLORS.primary} 
                    fill={COLORS.primary}
                    fillOpacity={0.3}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="usuarios" 
                    name="Usuarios CENDOI (x10)"
                    stroke={COLORS.secondary} 
                    fill={COLORS.secondary}
                    fillOpacity={0.3}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="soporte" 
                    name="Equipos Soporte"
                    stroke={COLORS.accent} 
                    fill={COLORS.accent}
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Statistics Grid */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
              gap: '16px' 
            }}>
              {[
                { 
                  title: '🎥 Videoconferencia', 
                  stats: [
                    { label: 'Promedio semanal', value: Math.round(informes.reduce((sum, inf) => sum + inf.videoconferencias, 0) / informes.length) },
                    { label: 'Máximo', value: Math.max(...informes.map(inf => inf.videoconferencias)) },
                    { label: 'Mínimo', value: Math.min(...informes.map(inf => inf.videoconferencias)) }
                  ]
                },
                { 
                  title: '📚 CENDOI', 
                  stats: [
                    { label: 'Promedio semanal', value: Math.round(informes.reduce((sum, inf) => sum + inf.usuariosCENDOI, 0) / informes.length) },
                    { label: 'Máximo', value: Math.max(...informes.map(inf => inf.usuariosCENDOI)) },
                    { label: 'Mínimo', value: Math.min(...informes.map(inf => inf.usuariosCENDOI)) }
                  ]
                },
                { 
                  title: '💻 Soporte Técnico', 
                  stats: [
                    { label: 'Promedio semanal', value: Math.round(informes.reduce((sum, inf) => sum + inf.equiposConfigurados, 0) / informes.length) },
                    { label: 'Máximo', value: Math.max(...informes.map(inf => inf.equiposConfigurados)) },
                    { label: 'Mínimo', value: Math.min(...informes.map(inf => inf.equiposConfigurados)) }
                  ]
                },
                { 
                  title: '📋 Administrativa', 
                  stats: [
                    { label: 'Compras promedio', value: Math.round(informes.reduce((sum, inf) => sum + inf.comprasGestionadas, 0) / informes.length) },
                    { label: 'Contrataciones totales', value: informes.reduce((sum, inf) => sum + inf.contrataciones, 0) },
                    { label: 'Transferencias totales', value: informes.reduce((sum, inf) => sum + inf.transferencias, 0) }
                  ]
                }
              ].map((section, i) => (
                <div key={i} style={{ 
                  background: 'white', 
                  borderRadius: '16px', 
                  padding: '20px', 
                  boxShadow: '0 2px 12px rgba(0,0,0,0.08)' 
                }}>
                  <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {section.title}
                  </h4>
                  {section.stats.map((stat, j) => (
                    <div key={j} style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      padding: '10px 0',
                      borderBottom: j < section.stats.length - 1 ? '1px solid #eee' : 'none',
                      fontSize: '14px'
                    }}>
                      <span style={{ color: '#666' }}>{stat.label}:</span>
                      <strong style={{ color: COLORS.primary, fontFamily: "'JetBrains Mono', monospace" }}>{stat.value}</strong>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {informes.length === 0 && (
          <div style={{ 
            maxWidth: '500px', 
            margin: '60px auto', 
            textAlign: 'center', 
            padding: '60px 32px',
            background: 'white',
            borderRadius: '24px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
          }}>
            <span style={{ fontSize: '64px', display: 'block', marginBottom: '20px', opacity: 0.5 }}>📂</span>
            <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>No hay informes cargados</h3>
            <p style={{ color: '#666', fontSize: '15px' }}>
              Sube los archivos .docx de los informes semanales para comenzar el análisis
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer style={{ 
        maxWidth: '1400px', 
        margin: '40px auto 0', 
        padding: '24px 32px', 
        textAlign: 'center',
        borderTop: '1px solid #E8E8E8'
      }}>
        <p style={{ fontSize: '13px', color: '#888' }}>
          DRAI Dashboard © 2025 • Facultad de Ingeniería • Universidad de Antioquia
        </p>
      </footer>
    </div>
  );
}
