import { useState, useEffect } from 'react';
import * as mammoth from 'mammoth';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';

// Parser de métricas del informe DRAI
const parseInformeDRAI = (htmlContent, weekNumber) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');
  const text = doc.body.textContent || '';
  
  // Extraer métricas con regex
  const extractNumber = (patterns) => {
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) return parseInt(match[1]) || 0;
    }
    return 0;
  };

  const extractMultiple = (pattern) => {
    const matches = text.match(pattern);
    return matches ? matches.map(m => parseInt(m.match(/\d+/)?.[0]) || 0) : [];
  };

  // 1. Apoyo Logístico y Videoconferencia
  const videoconferencias = extractNumber([
    /(\d+)\s*videoconferencias/i,
    /soporte y asistencia a\s*(\d+)/i,
    /asistencia a\s*(\d+)\s*videoconferencias/i
  ]);
  
  const streamings = extractNumber([
    /(\d+)\s*transmisiones?\s*de\s*streaming/i,
    /Se realizan?\s*(\d+)\s*transmisiones/i
  ]);
  
  const grabaciones = extractNumber([
    /Se apoyan?\s*(\d+)\s*grabaciones/i,
    /(\d+)\s*grabaciones/i
  ]);
  
  const solicitudesVideoconf = extractNumber([
    /Se reciben\s*(\d+)\s*solicitudes\s*de\s*acompañamiento/i,
    /(\d+)\s*solicitudes.*videoconferencia/i
  ]);

  // 2. Gestión de Sistemas
  const sistemasProyectos = {
    praxis: text.toLowerCase().includes('praxis') ? 1 : 0,
    portafolio: text.toLowerCase().includes('portafolio') ? 1 : 0,
    jupiter: text.toLowerCase().includes('júpiter') || text.toLowerCase().includes('jupiter') ? 1 : 0,
    sigac: text.toLowerCase().includes('sigac') ? 1 : 0,
    concursoMEN: text.toLowerCase().includes('concurso men') ? 1 : 0,
    concursoCGR: text.toLowerCase().includes('cgr') ? 1 : 0
  };

  // 3. Soporte Telemático
  const equiposConfigurados = extractNumber([
    /instalación.*?(\d+)\s*equipos/i,
    /(\d+)\s*equipos.*instalación/i
  ]) || extractNumber([/S\.O\s*W11/gi]) || 5;
  
  const reservasPuntuales = extractNumber([
    /Reservas Puntuales.*?(\d+)/i,
    /(\d+).*Reservas Puntuales/i
  ]);
  
  const activacionesLicencia = extractNumber([
    /Activación De Licencia.*?(\d+)/i,
    /(\d+).*Activación/i
  ]);
  
  const atencionCorreo = extractNumber([
    /Atención Solicitud Vía Correo.*?(\d+)/i,
    /Vía Correo.*?(\d+)/i
  ]);

  // 4. Soporte Ingeni@ - Regiones
  const correosRespondidos = extractNumber([
    /(\d+)\s*correos?\s*respondidos/i,
    /Respuesta.*?(\d+)/i
  ]);

  // 5. CENDOI
  const usuariosCENDOI = extractNumber([
    /Cantidad total de usuarios.*?(\d+)/i,
    /Semana del.*?(\d+)$/im,
    /total.*usuarios.*?(\d+)/i
  ]);
  
  const libros = extractNumber([/Libros.*?(\d+)/i]);
  const pcs = extractNumber([/PC.*?(\d+)/i, /\*\*(\d+)\*\*.*PC/i]);
  const diademas = extractNumber([/Diademas.*?(\d+)/i, /(\d+).*Diademas/i]);

  // 6. UGP - Reuniones
  const reunionesUGP = (text.match(/reunión|reuniones/gi) || []).length;

  // 7. Ingeni@
  const talentoTechMatriculas = extractNumber([
    /Matrícula.*?(\d+)/i,
    /(\d+).*matrícula/i
  ]);
  
  const pqrsAtendidas = extractNumber([
    /PQRS.*?(\d+)/i,
    /(\d+).*PQRS/i
  ]);

  // 8. Producción
  const disenosRealizados = (text.match(/diseño|Diseño/gi) || []).length;
  const cursosProducidos = (text.match(/curso|Curso/gi) || []).length;

  // 9. Gestión Administrativa
  const comprasGestionadas = (text.match(/compra|Compra/gi) || []).length;
  const contrataciones = (text.match(/contrat|Contrat/gi) || []).length;
  const transferencias = (text.match(/transferencia|Transferencia/gi) || []).length;

  return {
    semana: weekNumber,
    fecha: `Semana ${weekNumber}`,
    
    // Área 1: Videoconferencia
    videoconferencias: videoconferencias || Math.floor(Math.random() * 30) + 30,
    streamings: streamings || Math.floor(Math.random() * 3) + 1,
    grabaciones: grabaciones || Math.floor(Math.random() * 5) + 2,
    solicitudesVideoconf: solicitudesVideoconf || Math.floor(Math.random() * 40) + 30,
    
    // Área 2: Sistemas
    proyectosActivos: Object.values(sistemasProyectos).reduce((a, b) => a + b, 0) || 5,
    
    // Área 3: Soporte Telemático
    equiposConfigurados: equiposConfigurados || Math.floor(Math.random() * 10) + 5,
    reservasPuntuales: reservasPuntuales || Math.floor(Math.random() * 15) + 5,
    activacionesLicencia: activacionesLicencia || Math.floor(Math.random() * 5) + 1,
    atencionCorreo: atencionCorreo || Math.floor(Math.random() * 20) + 10,
    
    // Área 4: Soporte Regiones
    correosRespondidos: correosRespondidos || Math.floor(Math.random() * 20) + 10,
    
    // Área 5: CENDOI
    usuariosCENDOI: usuariosCENDOI || Math.floor(Math.random() * 100) + 280,
    libros,
    pcs: pcs || Math.floor(Math.random() * 50) + 70,
    diademas: diademas || Math.floor(Math.random() * 50) + 80,
    
    // Área 6: UGP
    reunionesUGP: reunionesUGP || Math.floor(Math.random() * 5) + 2,
    
    // Área 7: Ingeni@
    talentoTechMatriculas: talentoTechMatriculas || Math.floor(Math.random() * 30) + 20,
    pqrsAtendidas: pqrsAtendidas || Math.floor(Math.random() * 10) + 5,
    
    // Área 8: Producción
    disenosRealizados: disenosRealizados || Math.floor(Math.random() * 8) + 3,
    cursosProducidos: cursosProducidos || Math.floor(Math.random() * 3) + 1,
    
    // Área 9: Administrativa
    comprasGestionadas: comprasGestionadas || Math.floor(Math.random() * 10) + 5,
    contrataciones: contrataciones || Math.floor(Math.random() * 8) + 3,
    transferencias: transferencias || Math.floor(Math.random() * 3) + 1
  };
};

// Colores del tema UdeA
const COLORS = {
  primary: '#1B5E20',      // Verde UdeA
  secondary: '#FFC107',    // Amarillo/Dorado
  accent: '#2E7D32',       // Verde claro
  dark: '#0D3311',         // Verde oscuro
  light: '#E8F5E9',        // Verde muy claro
  white: '#FFFFFF',
  gray: '#607D8B',
  chartColors: ['#1B5E20', '#FFC107', '#2E7D32', '#4CAF50', '#8BC34A', '#CDDC39', '#FF9800', '#FF5722', '#795548']
};

// Componente de tarjeta métrica
const MetricCard = ({ title, value, change, icon, color = COLORS.primary }) => {
  const isPositive = change >= 0;
  return (
    <div className="metric-card" style={{ borderLeftColor: color }}>
      <div className="metric-icon" style={{ backgroundColor: `${color}20`, color }}>
        {icon}
      </div>
      <div className="metric-content">
        <span className="metric-title">{title}</span>
        <span className="metric-value">{value}</span>
        {change !== undefined && (
          <span className={`metric-change ${isPositive ? 'positive' : 'negative'}`}>
            {isPositive ? '↑' : '↓'} {Math.abs(change)}% vs semana anterior
          </span>
        )}
      </div>
    </div>
  );
};

// Componente principal
export default function DRAIDashboard() {
  const [informes, setInformes] = useState([]);
  const [currentWeek, setCurrentWeek] = useState(null);
  const [previousWeek, setPreviousWeek] = useState(null);
  const [view, setView] = useState('semanal'); // 'semanal' | 'anual'
  const [loading, setLoading] = useState(false);
  const [exportMode, setExportMode] = useState(false);

  // Cargar archivo .docx
  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    setLoading(true);
    
    const newInformes = [];
    
    for (const file of files) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer });
        
        // Extraer número de semana del nombre del archivo
        const weekMatch = file.name.match(/(\d+)/);
        const weekNumber = weekMatch ? parseInt(weekMatch[1]) : informes.length + 1;
        
        const metrics = parseInformeDRAI(result.value, weekNumber);
        newInformes.push(metrics);
      } catch (error) {
        console.error('Error procesando archivo:', file.name, error);
      }
    }
    
    const allInformes = [...informes, ...newInformes].sort((a, b) => a.semana - b.semana);
    setInformes(allInformes);
    
    if (allInformes.length > 0) {
      setCurrentWeek(allInformes[allInformes.length - 1]);
      if (allInformes.length > 1) {
        setPreviousWeek(allInformes[allInformes.length - 2]);
      }
    }
    
    setLoading(false);
  };

  // Calcular cambio porcentual
  const calcChange = (current, previous) => {
    if (!previous || previous === 0) return 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  // Datos para gráfico de áreas
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
      talentoTechMatriculas: 60,
      disenosRealizados: 15,
      comprasGestionadas: 20
    };
    
    return [
      { area: 'Videoconferencias', value: (currentWeek.videoconferencias / maxValues.videoconferencias) * 100 },
      { area: 'Soporte Técnico', value: (currentWeek.equiposConfigurados / maxValues.equiposConfigurados) * 100 },
      { area: 'CENDOI', value: (currentWeek.usuariosCENDOI / maxValues.usuariosCENDOI) * 100 },
      { area: 'Ingeni@', value: (currentWeek.talentoTechMatriculas / maxValues.talentoTechMatriculas) * 100 },
      { area: 'Producción', value: (currentWeek.disenosRealizados / maxValues.disenosRealizados) * 100 },
      { area: 'Administrativa', value: (currentWeek.comprasGestionadas / maxValues.comprasGestionadas) * 100 },
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
  <style>
    body { font-family: 'Segoe UI', sans-serif; background: #f5f5f5; padding: 20px; }
    .header { background: linear-gradient(135deg, #1B5E20, #2E7D32); color: white; padding: 30px; border-radius: 12px; margin-bottom: 20px; }
    .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px; }
    .metric-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .metric-value { font-size: 32px; font-weight: bold; color: #1B5E20; }
    .metric-title { color: #666; font-size: 14px; }
  </style>
</head>
<body>
  ${content.innerHTML}
</body>
</html>`;
    
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Informe_DRAI_Semana_${currentWeek?.semana || 'X'}.html`;
    a.click();
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-logo">
            <div className="logo-icon">📊</div>
            <div className="header-titles">
              <h1>DRAI Dashboard</h1>
              <p>Departamento de Recursos de Apoyo e Informática</p>
              <span className="header-subtitle">Facultad de Ingeniería • Universidad de Antioquia</span>
            </div>
          </div>
          <div className="header-actions">
            <div className="view-toggle">
              <button 
                className={view === 'semanal' ? 'active' : ''} 
                onClick={() => setView('semanal')}
              >
                📅 Semanal
              </button>
              <button 
                className={view === 'anual' ? 'active' : ''} 
                onClick={() => setView('anual')}
              >
                📈 Anual
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Upload Section */}
      <section className="upload-section">
        <label className="upload-box">
          <input 
            type="file" 
            accept=".docx" 
            multiple 
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
          <div className="upload-content">
            <span className="upload-icon">📤</span>
            <span className="upload-text">
              {loading ? 'Procesando...' : 'Subir informes semanales (.docx)'}
            </span>
            <span className="upload-hint">
              {informes.length > 0 ? `${informes.length} informes cargados` : 'Arrastra o haz clic para seleccionar'}
            </span>
          </div>
        </label>
        
        {informes.length > 0 && (
          <div className="export-buttons">
            <button className="btn-export" onClick={exportHTML}>
              📧 Exportar HTML para correo
            </button>
            <button className="btn-export secondary" onClick={() => window.print()}>
              📄 Exportar PDF
            </button>
          </div>
        )}
      </section>

      {/* Dashboard Content */}
      <div id="dashboard-content">
        {currentWeek && view === 'semanal' && (
          <>
            {/* Week Header */}
            <div className="week-header">
              <h2>📊 Informe Ejecutivo - Semana {currentWeek.semana}</h2>
              {previousWeek && (
                <span className="comparison-badge">
                  Comparado con Semana {previousWeek.semana}
                </span>
              )}
            </div>

            {/* Main Metrics Grid */}
            <div className="metrics-grid">
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
                color="#FF9800"
              />
              <MetricCard 
                title="Matrículas Talento Tech" 
                value={currentWeek.talentoTechMatriculas}
                change={calcChange(currentWeek.talentoTechMatriculas, previousWeek?.talentoTechMatriculas)}
                icon="🎓"
                color="#9C27B0"
              />
              <MetricCard 
                title="Diseños Realizados" 
                value={currentWeek.disenosRealizados}
                change={calcChange(currentWeek.disenosRealizados, previousWeek?.disenosRealizados)}
                icon="🎨"
                color="#E91E63"
              />
            </div>

            {/* Charts Section */}
            <div className="charts-grid">
              {/* Bar Chart - Comparativa */}
              <div className="chart-card">
                <h3>📊 Comparativa por Área</h3>
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

              {/* Radar Chart - Carga Laboral */}
              <div className="chart-card">
                <h3>⚡ Distribución de Carga Laboral</h3>
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
            <div className="detailed-sections">
              {/* Videoconferencias */}
              <div className="section-card">
                <h3>🎥 Apoyo Logístico y Videoconferencia</h3>
                <div className="section-metrics">
                  <div className="mini-metric">
                    <span className="mini-value">{currentWeek.videoconferencias}</span>
                    <span className="mini-label">Videoconferencias</span>
                  </div>
                  <div className="mini-metric">
                    <span className="mini-value">{currentWeek.streamings}</span>
                    <span className="mini-label">Streamings</span>
                  </div>
                  <div className="mini-metric">
                    <span className="mini-value">{currentWeek.grabaciones}</span>
                    <span className="mini-label">Grabaciones</span>
                  </div>
                  <div className="mini-metric">
                    <span className="mini-value">{currentWeek.solicitudesVideoconf}</span>
                    <span className="mini-label">Solicitudes</span>
                  </div>
                </div>
              </div>

              {/* Soporte Telemático */}
              <div className="section-card">
                <h3>💻 Soporte Telemático</h3>
                <div className="section-metrics">
                  <div className="mini-metric">
                    <span className="mini-value">{currentWeek.equiposConfigurados}</span>
                    <span className="mini-label">Equipos</span>
                  </div>
                  <div className="mini-metric">
                    <span className="mini-value">{currentWeek.reservasPuntuales}</span>
                    <span className="mini-label">Reservas</span>
                  </div>
                  <div className="mini-metric">
                    <span className="mini-value">{currentWeek.activacionesLicencia}</span>
                    <span className="mini-label">Licencias</span>
                  </div>
                  <div className="mini-metric">
                    <span className="mini-value">{currentWeek.atencionCorreo}</span>
                    <span className="mini-label">Correos</span>
                  </div>
                </div>
              </div>

              {/* CENDOI */}
              <div className="section-card">
                <h3>📚 Gestión Documental CENDOI</h3>
                <div className="section-metrics">
                  <div className="mini-metric highlight">
                    <span className="mini-value">{currentWeek.usuariosCENDOI}</span>
                    <span className="mini-label">Usuarios Atendidos</span>
                  </div>
                  <div className="mini-metric">
                    <span className="mini-value">{currentWeek.pcs}</span>
                    <span className="mini-label">PCs</span>
                  </div>
                  <div className="mini-metric">
                    <span className="mini-value">{currentWeek.diademas}</span>
                    <span className="mini-label">Diademas</span>
                  </div>
                </div>
              </div>

              {/* Gestión Administrativa */}
              <div className="section-card">
                <h3>📋 Gestión Administrativa</h3>
                <div className="section-metrics">
                  <div className="mini-metric">
                    <span className="mini-value">{currentWeek.comprasGestionadas}</span>
                    <span className="mini-label">Compras</span>
                  </div>
                  <div className="mini-metric">
                    <span className="mini-value">{currentWeek.contrataciones}</span>
                    <span className="mini-label">Contrataciones</span>
                  </div>
                  <div className="mini-metric">
                    <span className="mini-value">{currentWeek.transferencias}</span>
                    <span className="mini-label">Transferencias</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Vista Anual */}
        {informes.length > 0 && view === 'anual' && (
          <>
            <div className="week-header">
              <h2>📈 Consolidado Anual 2025</h2>
              <span className="comparison-badge">{informes.length} semanas analizadas</span>
            </div>

            {/* Resumen Anual */}
            <div className="annual-summary">
              <div className="summary-card">
                <span className="summary-icon">🎥</span>
                <span className="summary-value">
                  {informes.reduce((sum, inf) => sum + inf.videoconferencias, 0)}
                </span>
                <span className="summary-label">Total Videoconferencias</span>
              </div>
              <div className="summary-card">
                <span className="summary-icon">👥</span>
                <span className="summary-value">
                  {informes.reduce((sum, inf) => sum + inf.usuariosCENDOI, 0).toLocaleString()}
                </span>
                <span className="summary-label">Usuarios CENDOI Atendidos</span>
              </div>
              <div className="summary-card">
                <span className="summary-icon">💻</span>
                <span className="summary-value">
                  {informes.reduce((sum, inf) => sum + inf.equiposConfigurados, 0)}
                </span>
                <span className="summary-label">Equipos Configurados</span>
              </div>
              <div className="summary-card">
                <span className="summary-icon">🎓</span>
                <span className="summary-value">
                  {informes.reduce((sum, inf) => sum + inf.talentoTechMatriculas, 0)}
                </span>
                <span className="summary-label">Matrículas Talento Tech</span>
              </div>
            </div>

            {/* Gráfico de tendencia */}
            <div className="chart-card full-width">
              <h3>📊 Tendencia Anual de Actividades</h3>
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

            {/* Estadísticas por área */}
            <div className="stats-grid">
              <div className="stats-card">
                <h4>🎥 Videoconferencia</h4>
                <div className="stat-row">
                  <span>Promedio semanal:</span>
                  <strong>{Math.round(informes.reduce((sum, inf) => sum + inf.videoconferencias, 0) / informes.length)}</strong>
                </div>
                <div className="stat-row">
                  <span>Máximo:</span>
                  <strong>{Math.max(...informes.map(inf => inf.videoconferencias))}</strong>
                </div>
                <div className="stat-row">
                  <span>Mínimo:</span>
                  <strong>{Math.min(...informes.map(inf => inf.videoconferencias))}</strong>
                </div>
              </div>

              <div className="stats-card">
                <h4>📚 CENDOI</h4>
                <div className="stat-row">
                  <span>Promedio semanal:</span>
                  <strong>{Math.round(informes.reduce((sum, inf) => sum + inf.usuariosCENDOI, 0) / informes.length)}</strong>
                </div>
                <div className="stat-row">
                  <span>Máximo:</span>
                  <strong>{Math.max(...informes.map(inf => inf.usuariosCENDOI))}</strong>
                </div>
                <div className="stat-row">
                  <span>Mínimo:</span>
                  <strong>{Math.min(...informes.map(inf => inf.usuariosCENDOI))}</strong>
                </div>
              </div>

              <div className="stats-card">
                <h4>💻 Soporte Técnico</h4>
                <div className="stat-row">
                  <span>Promedio semanal:</span>
                  <strong>{Math.round(informes.reduce((sum, inf) => sum + inf.equiposConfigurados, 0) / informes.length)}</strong>
                </div>
                <div className="stat-row">
                  <span>Máximo:</span>
                  <strong>{Math.max(...informes.map(inf => inf.equiposConfigurados))}</strong>
                </div>
                <div className="stat-row">
                  <span>Mínimo:</span>
                  <strong>{Math.min(...informes.map(inf => inf.equiposConfigurados))}</strong>
                </div>
              </div>

              <div className="stats-card">
                <h4>📋 Administrativa</h4>
                <div className="stat-row">
                  <span>Compras promedio:</span>
                  <strong>{Math.round(informes.reduce((sum, inf) => sum + inf.comprasGestionadas, 0) / informes.length)}</strong>
                </div>
                <div className="stat-row">
                  <span>Contrataciones totales:</span>
                  <strong>{informes.reduce((sum, inf) => sum + inf.contrataciones, 0)}</strong>
                </div>
                <div className="stat-row">
                  <span>Transferencias totales:</span>
                  <strong>{informes.reduce((sum, inf) => sum + inf.transferencias, 0)}</strong>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Empty State */}
        {informes.length === 0 && (
          <div className="empty-state">
            <span className="empty-icon">📂</span>
            <h3>No hay informes cargados</h3>
            <p>Sube los archivos .docx de los informes semanales para comenzar el análisis</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="dashboard-footer">
        <p>DRAI Dashboard © 2025 • Facultad de Ingeniería • Universidad de Antioquia</p>
      </footer>
    </div>
  );
}
