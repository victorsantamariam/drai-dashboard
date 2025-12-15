import { useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

// ============================================
// DATOS ESTÁTICOS HARDCODEADOS - DRAI 2025
// ============================================
const DATOS_DRAI = {
  area1: {
    nombre: 'Apoyo Logístico y Videoconferencia',
    icon: '🎥',
    color: '#1B5E20',
    datos: {
      'Total actividades Logístico': 144,
      'Total actividades Académico': 224,
      'Total actividades Infraestructura': 666,
      'Total horas videoconferencia': 1288,
      'Total streamings': 99,
      'Total grabaciones': 178,
      'Servicios Aulas': 19600
    }
  },
  area2: {
    nombre: 'Gestión de Sistemas de Información',
    icon: '💻',
    color: '#1976D2',
    datos: {
      'Promedio proyectos activos/semana': 14,
      'Máximo proyectos simultáneos': 16,
      'Total actividades en desarrollo': 1610,
      'Promedio actividades/semana': 35,
      'Semana con mayor carga': '56 actividades',
      'Soporte a Estudiantes en Aplicaciones Facultad': 1300
    }
  },
  area3: {
    nombre: 'Soporte Telemático',
    icon: '🔧',
    color: '#00897B',
    datos: {
      'Total equipos configurados': 196,
      'Total reservas puntuales': 163,
      'Total activaciones licencia': 690,
      'Total atención correo': 812,
      'Total actualización software': 2114,
      'Total atención presencial': 122
    }
  },
  area4: {
    nombre: 'Soporte Académico Ingeni@ - Regiones',
    icon: '📞',
    color: '#F57C00',
    datos: {
      'Capacitaciones Estudiantes': 2213,
      'Capacitaciones Docentes': 47,
      'Aulas Virtuales activadas': 470,
      'Soporte Mensajes Respondidos': 2352,
      'Soporte llamadas Respondidas': 93,
      'Reserva sala AVI': 48
    }
  },
  area5: {
    nombre: 'Gestión Documental CENDOI',
    icon: '📚',
    color: '#9C27B0',
    datos: {
      'Préstamo de PC, libros, diademas, cámaras': 18435,
      'Atención a usuarios (cantidad)': 15678,
      'Generación de PAYSA': 1765,
      'Alertas y notas en el OLIB': 1665,
      'Paz y salvos de profesores': 1454,
      'Aprobación de Autoarchivo': 764,
      'Cartas de confidencialidad': 270,
      'Ingresar recursos al catálogo KOHA': 15
    }
  },
  area6: {
    nombre: 'Unidad de Gestión de Proyectos',
    icon: '📋',
    color: '#3F51B5',
    datos: {
      'Total Reuniones': 56,
      'Total Capacitaciones': 168,
      'Semanas con Plan': 40
    }
  },
  area7: {
    nombre: 'Ingeni@',
    icon: '🎓',
    color: '#E91E63',
    datos: {
      'Estudiantes Talento Tech': 12814,
      'PQRS Atendidas': 19412,
      'Pruebas Inicio': 4173,
      'Stories Redes': 152,
      'Total Actividades': 18
    }
  },
  area8: {
    nombre: 'Producción',
    icon: '🎨',
    color: '#FF5722',
    datos: {
      'Videoconferencias Meets + Zooms (3114 horas sesiones)': 1526,
      'Productos realizados (videos y piezas gráficas)': 180,
      'Videos de apoyo comunicación interna redes sociales': 28,
      'Transmisiones en vivo YouTube y Facebook': 59,
      'Acompañamiento virtual visita pares académicos': 1,
      'Streamings y cubrimientos (371 horas transmisión)': 129,
      'Cursos virtualizados Posgrados - Especialización en analítica de datos': 11,
      'Banners': 69,
      'Previews': 14,
      'Gráficos e infográficos': 28,
      'Presentaciones': 3,
      'Lecturas': 34,
      'Videos': 40,
      'Productos proyecto CGR': 4,
      'Libro digital e impreso diagramado (202 páginas)': 1,
      'Curso Apache Spark con Python': 1,
      'Curso MUNDO URI (2 unidades + 150 slides)': 1,
      'Curso MUNDO URI - 38 infográficos': 38,
      'Curso MUNDO URI - 6 videos': 6,
      'Curso MUNDO URI - 14 audios': 14,
      'Caja de herramientas - 4 banners': 4,
      'Caja de herramientas - 3 previews': 3,
      'Caja de herramientas - 9 infografías': 9,
      'Caja de herramientas - 3 videos': 3,
      'Caja de herramientas - 2 lecturas': 2,
      'Acompañamiento pedagógico y metodológico': 1,
      'Simposio Atmoscol - 1 página web': 1,
      'Simposio Atmoscol - 4 páginas web adicionales': 3,
      'Simposio Atmoscol - piezas gráficas': 40,
      'Solicitudes de producción atendidas': 206,
      'Piezas digitales ACOFI y Experiencia TECH': 20
    }
  },
  area9: {
    nombre: 'Gestión Administrativa',
    icon: '📁',
    color: '#607D8B',
    datos: {
      'Total compras gestionadas': 65,
      'Total contrataciones': 86,
      'Total transferencias': 26,
      'Total actividades SEA': 65,
      'Total actividades Varios': 41,
      'Total avales pago': 276,
      'Total seguimiento y reporte SEA': 780,
      'Total aprobaciones nómina Depto': 26,
      'Total seguimiento contratos': 110
    }
  }
};

const COLORS_PALETTE = ['#1B5E20', '#1976D2', '#00897B', '#F57C00', '#9C27B0', '#3F51B5', '#E91E63', '#FF5722', '#607D8B'];

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export default function DRAIDashboard() {
  const [selectedArea, setSelectedArea] = useState(null);
  const [chartType, setChartType] = useState('bar');

  const getChartData = () => {
    const nombresCompletos = [
      'Apoyo Logístico',
      'Sistemas',
      'Soporte Telemático',
      'Soporte Regiones',
      'CENDOI',
      'UGP',
      'Ingeni@',
      'Producción',
      'Gestión Admin.'
    ];
    
    return Object.values(DATOS_DRAI).map((area, idx) => ({
      area: `Área ${idx + 1}`,
      nombre: nombresCompletos[idx],
      total: Object.values(area.datos).reduce((a, b) => {
        return typeof b === 'number' ? a + b : a;
      }, 0),
      color: area.color
    }));
  };

  const getRadarData = () => {
    if (!selectedArea) return [];
    return Object.entries(selectedArea.datos).slice(0, 6).map(([key, val]) => ({
      metric: key.substring(0, 15),
      value: val
    }));
  };

  const getPieData = () => {
    return Object.values(DATOS_DRAI).map((area) => ({
      name: area.nombre.split(' ')[0],
      value: Object.values(area.datos).reduce((a, b) => a + b, 0),
      color: area.color
    }));
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f5f5f5',
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      padding: '0'
    }}>
      {/* Header Institucional UdeA */}
      <header style={{
        background: '#1B5E20',
        padding: window.innerWidth < 768 ? '16px 20px' : '24px 40px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ maxWidth: '1600px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: window.innerWidth < 768 ? '12px' : '16px' }}>
            <div style={{
              width: window.innerWidth < 768 ? '40px' : '50px',
              height: window.innerWidth < 768 ? '40px' : '50px',
              background: 'white',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: window.innerWidth < 768 ? '20px' : '28px'
            }}>📊</div>
            <div>
              <h1 style={{ fontSize: window.innerWidth < 768 ? '18px' : window.innerWidth < 1024 ? '22px' : '26px', fontWeight: 700, margin: 0, color: 'white' }}>
                DRAI Dashboard 2025
              </h1>
              <p style={{ fontSize: window.innerWidth < 768 ? '11px' : '13px', color: 'rgba(255,255,255,0.9)', margin: 0, display: window.innerWidth < 480 ? 'none' : 'block' }}>
                Departamento de Recursos de Apoyo e Informática
              </p>
              <p style={{ fontSize: window.innerWidth < 768 ? '10px' : '12px', color: 'rgba(255,255,255,0.8)', margin: 0, display: window.innerWidth < 640 ? 'none' : 'block' }}>
                Facultad de Ingeniería • Universidad de Antioquia
              </p>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[
              { type: 'bar', icon: '📊', label: 'Barras' },
              { type: 'line', icon: '📈', label: 'Líneas' },
              { type: 'pie', icon: '🎯', label: 'Torta' }
            ].map(({ type, icon, label }) => (
              <button
                key={type}
                onClick={() => setChartType(type)}
                style={{
                  padding: window.innerWidth < 768 ? '8px 12px' : '10px 16px',
                  border: 'none',
                  background: chartType === type ? 'white' : 'rgba(255,255,255,0.2)',
                  color: chartType === type ? '#1B5E20' : 'white',
                  borderRadius: '8px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: window.innerWidth < 768 ? '11px' : '13px',
                  transition: 'all 0.3s'
                }}
              >
                {icon} {window.innerWidth < 640 ? '' : ` ${label}`}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div style={{ maxWidth: window.innerWidth > 1920 ? '1600px' : '1400px', margin: '0 auto', padding: window.innerWidth < 768 ? '20px' : '40px' }}>
        {/* Grandes Proyectos */}
        <div style={{ 
          background: 'white', 
          padding: window.innerWidth < 768 ? '16px' : '20px 24px', 
          borderRadius: '16px', 
          marginBottom: '24px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
        }}>
          <h2 style={{ fontSize: window.innerWidth < 768 ? '16px' : '18px', fontWeight: 700, margin: '0 0 16px 0', color: '#1B5E20' }}>
            🚀 Grandes Proyectos 2025
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: window.innerWidth < 640 ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: window.innerWidth < 768 ? '8px' : '12px'
          }}>
            {[
              { icon: '🎓', name: 'Talento Tech', color: '#E91E63', status: 'Activo' },
              { icon: '🪐', name: 'Jupiter', color: '#FF9800', status: 'Activo' },
              { icon: '📚', name: 'PTIES', color: '#3F51B5', status: 'Activo' },
              { icon: '🏛️', name: 'Concurso CGR', color: '#00897B', status: 'Activo' },
              { icon: '🎯', name: 'Concurso MEN', color: '#1976D2', status: 'Activo' },
              { icon: '💡', name: 'Sapiencia', color: '#9C27B0', status: 'Activo' }
            ].map((proyecto, i) => (
              <div key={i} style={{
                background: `linear-gradient(135deg, ${proyecto.color}15, ${proyecto.color}05)`,
                borderRadius: '12px',
                padding: '16px',
                borderLeft: `4px solid ${proyecto.color}`,
                transition: 'all 0.3s',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
              >
                <div style={{ fontSize: '32px', marginBottom: '8px', textAlign: 'center' }}>
                  {proyecto.icon}
                </div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#333', textAlign: 'center', marginBottom: '4px' }}>
                  {proyecto.name}
                </div>
                <div style={{ 
                  fontSize: '10px', 
                  fontWeight: 600, 
                  color: proyecto.color,
                  textAlign: 'center',
                  background: 'white',
                  padding: '4px 8px',
                  borderRadius: '12px',
                  display: 'inline-block',
                  width: '100%'
                }}>
                  ● {proyecto.status}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gráfico Principal */}
        <div style={{
          background: 'white',
          borderRadius: window.innerWidth < 768 ? '16px' : '24px',
          padding: window.innerWidth < 768 ? '16px' : '32px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
          marginBottom: window.innerWidth < 768 ? '24px' : '40px'
        }}>
          <h2 style={{ fontSize: window.innerWidth < 768 ? '18px' : '24px', fontWeight: 700, marginBottom: window.innerWidth < 768 ? '16px' : '24px', color: '#1a1a1a' }}>
            📈 Análisis Comparativo de Áreas
          </h2>
          
          {chartType === 'bar' || chartType === 'line' ? (
            <ResponsiveContainer width="100%" height={window.innerWidth < 768 ? 300 : window.innerWidth < 1024 ? 350 : 400}>
              {chartType === 'bar' && (
                <BarChart data={getChartData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="nombre" tick={{ fill: '#666', fontSize: 11 }} angle={-15} textAnchor="end" height={80} />
                  <YAxis tick={{ fill: '#666', fontSize: 12 }} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  <Legend />
                  <Bar dataKey="total" name="Total Actividades" fill="#1B5E20" radius={[8, 8, 0, 0]} />
                </BarChart>
              )}
              
              {chartType === 'line' && (
                <LineChart data={getChartData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="nombre" tick={{ fill: '#666', fontSize: 11 }} angle={-15} textAnchor="end" height={80} />
                  <YAxis tick={{ fill: '#666', fontSize: 12 }} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  <Legend />
                  <Line type="monotone" dataKey="total" name="Total Actividades" stroke="#1B5E20" strokeWidth={3} dot={{ fill: '#1B5E20', r: 5 }} />
                </LineChart>
              )}
            </ResponsiveContainer>
          ) : (
            <div style={{ 
              display: 'flex', 
              flexDirection: window.innerWidth < 1100 ? 'column' : 'row',
              alignItems: 'flex-start', 
              justifyContent: 'center',
              gap: '32px', 
              width: '100%',
              paddingTop: '20px'
            }}>
              {/* Gráfico de Torta */}
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <PieChart width={window.innerWidth < 768 ? 300 : 380} height={window.innerWidth < 768 ? 300 : 380}>
                  <Pie
                    data={getChartData()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={false}
                    outerRadius={window.innerWidth < 768 ? 100 : 130}
                    fill="#8884d8"
                    dataKey="total"
                  >
                    {getChartData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS_PALETTE[index]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '12px', 
                      border: 'none', 
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)', 
                      fontSize: '12px',
                      padding: '8px 12px'
                    }}
                    formatter={(value) => [`${value.toLocaleString()} actividades`, '']}
                  />
                </PieChart>
              </div>
              
              {/* Leyenda personalizada */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: window.innerWidth < 640 ? '1fr' : 'repeat(2, 1fr)',
                gap: '10px',
                padding: '20px',
                background: '#f9f9f9',
                borderRadius: '12px',
                maxWidth: '500px',
                width: '100%'
              }}>
                <div style={{ 
                  gridColumn: '1 / -1',
                  fontSize: '15px', 
                  fontWeight: 700, 
                  color: '#1B5E20',
                  marginBottom: '12px',
                  borderBottom: '2px solid #1B5E20',
                  paddingBottom: '8px',
                  textAlign: 'center'
                }}>
                  📊 Todas las Áreas DRAI
                </div>
                {getChartData().map((area, index) => {
                  const total = getChartData().reduce((sum, a) => sum + a.total, 0);
                  const percent = ((area.total / total) * 100).toFixed(1);
                  return (
                    <div key={index} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '10px',
                      padding: '12px',
                      background: 'white',
                      borderRadius: '8px',
                      border: `2px solid ${COLORS_PALETTE[index]}`,
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.02)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                    >
                      <div style={{ 
                        width: '18px', 
                        height: '18px', 
                        background: COLORS_PALETTE[index],
                        borderRadius: '4px',
                        flexShrink: 0
                      }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ 
                          fontSize: '11px', 
                          fontWeight: 600, 
                          color: '#333',
                          marginBottom: '2px'
                        }}>
                          {area.nombre}
                        </div>
                        <div style={{ 
                          fontSize: '10px', 
                          color: '#666'
                        }}>
                          {percent}% ({area.total.toLocaleString()})
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Título de Sección */}
        <div style={{ 
          background: 'white', 
          padding: '16px 24px', 
          borderRadius: '12px', 
          marginBottom: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0, color: '#1B5E20' }}>
              📋 Estadísticas por Área (9 Áreas Completas)
            </h2>
            <p style={{ fontSize: '13px', color: '#666', margin: '4px 0 0' }}>
              Haga clic en cualquier área para ver el detalle completo de todas sus métricas
            </p>
          </div>
          <div style={{
            background: '#FFC107',
            color: '#000',
            padding: '10px 20px',
            borderRadius: '24px',
            fontSize: '14px',
            fontWeight: 700,
            whiteSpace: 'nowrap'
          }}>
            47 semanas analizadas
          </div>
        </div>

        {/* Grid de Áreas - Estilo Minimalista */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: window.innerWidth < 768 ? '1fr' : window.innerWidth < 1024 ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: window.innerWidth < 768 ? '12px' : '16px',
          marginBottom: window.innerWidth < 768 ? '24px' : '32px'
        }}>
          {Object.values(DATOS_DRAI).map((area, index) => (
            <div
              key={index}
              onClick={() => setSelectedArea(selectedArea?.nombre === area.nombre ? null : area)}
              style={{
                background: 'white',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: selectedArea?.nombre === area.nombre ? '0 4px 16px rgba(27,94,32,0.15)' : '0 2px 8px rgba(0,0,0,0.08)',
                cursor: 'pointer',
                transition: 'all 0.3s',
                border: selectedArea?.nombre === area.nombre ? '2px solid #1B5E20' : '2px solid transparent'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <span style={{ fontSize: '32px' }}>{area.icon}</span>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 700, margin: 0, color: '#1B5E20' }}>
                    {index + 1}. {area.nombre}
                  </h3>
                  <p style={{ fontSize: '11px', color: '#888', margin: '2px 0 0' }}>
                    {Object.keys(area.datos).length} métricas disponibles
                  </p>
                </div>
              </div>
              
              <div style={{ 
                padding: '12px', 
                background: '#f0f7f0', 
                borderRadius: '8px',
                borderLeft: '3px solid #1B5E20'
              }}>
                <div style={{ fontSize: '11px', color: '#666', marginBottom: '4px' }}>
                  Métricas principales:
                </div>
                {Object.entries(area.datos).slice(0, 2).map(([key, val]) => (
                  <div key={key} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    padding: '4px 0',
                    fontSize: '12px'
                  }}>
                    <span style={{ color: '#555' }}>{key}:</span>
                    <strong style={{ color: '#1B5E20' }}>{typeof val === 'number' ? val.toLocaleString() : val}</strong>
                  </div>
                ))}
                <div style={{ 
                  marginTop: '8px', 
                  fontSize: '10px', 
                  color: '#1B5E20', 
                  fontWeight: 600,
                  textAlign: 'center'
                }}>
                  {selectedArea?.nombre === area.nombre ? '▲ Ocultar detalles' : '▼ Ver todas las métricas'}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Modal Flotante con Detalles del Área */}
      {selectedArea && (
        <>
          {/* Overlay oscuro de fondo */}
          <div 
            onClick={() => setSelectedArea(null)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(4px)',
              zIndex: 1000,
              animation: 'fadeIn 0.3s ease'
            }}
          />
          
          {/* Modal/Banner Flotante */}
          <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'white',
            borderRadius: window.innerWidth < 768 ? '12px' : '16px',
            padding: '0',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            zIndex: 1001,
            maxWidth: window.innerWidth < 768 ? '95%' : '800px',
            width: '90%',
            maxHeight: window.innerWidth < 768 ? '90vh' : '80vh',
            overflow: 'hidden',
            animation: 'slideUp 0.3s ease'
          }}>
            {/* Header del Modal */}
            <div style={{
              background: 'linear-gradient(135deg, #1B5E20, #2E7D32)',
              padding: window.innerWidth < 768 ? '16px 20px' : '24px 32px',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: window.innerWidth < 480 ? 'wrap' : 'nowrap'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: window.innerWidth < 768 ? '12px' : '16px', flex: 1 }}>
                <span style={{ fontSize: window.innerWidth < 768 ? '36px' : '48px' }}>{selectedArea.icon}</span>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: window.innerWidth < 768 ? '18px' : '24px', fontWeight: 700, margin: 0 }}>
                    {selectedArea.nombre}
                  </h3>
                  <p style={{ fontSize: window.innerWidth < 768 ? '11px' : '13px', opacity: 0.9, margin: '4px 0 0' }}>
                    {Object.keys(selectedArea.datos).length} métricas registradas
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedArea(null)}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  color: 'white',
                  fontSize: '24px',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.3)'}
                onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
              >
                ✕
              </button>
            </div>

            {/* Contenido scrolleable */}
            <div style={{
              padding: '32px',
              maxHeight: 'calc(80vh - 120px)',
              overflowY: 'auto'
            }}>
              {/* Grid de Métricas - Estilo Cards */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '16px'
              }}>
                {Object.entries(selectedArea.datos).map(([key, val], idx) => (
                  <div key={key} style={{
                    background: '#f8f9fa',
                    padding: '20px',
                    borderRadius: '12px',
                    borderLeft: '4px solid #1B5E20',
                    transition: 'all 0.3s',
                    cursor: 'default'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f0f7f0';
                    e.currentTarget.style.transform = 'translateX(4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#f8f9fa';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}
                  >
                    <div style={{
                      fontSize: '13px',
                      color: '#666',
                      marginBottom: '8px',
                      fontWeight: 500
                    }}>
                      {key}
                    </div>
                    <div style={{
                      fontSize: '32px',
                      fontWeight: 800,
                      color: '#1B5E20'
                    }}>
                      {typeof val === 'number' ? val.toLocaleString() : val}
                    </div>
                  </div>
                ))}
              </div>

              {/* Botón de cierre en el footer */}
              <button
                onClick={() => setSelectedArea(null)}
                style={{
                  marginTop: '24px',
                  padding: '14px 32px',
                  background: '#1B5E20',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: 'pointer',
                  width: '100%',
                  transition: 'background 0.3s'
                }}
                onMouseEnter={(e) => e.target.style.background = '#2E7D32'}
                onMouseLeave={(e) => e.target.style.background = '#1B5E20'}
              >
                Cerrar
              </button>
            </div>
          </div>
        </>
      )}

      {/* Footer */}
      <footer style={{
        textAlign: 'center',
        padding: '32px',
        color: '#888',
        fontSize: '14px',
        fontWeight: 500
      }}>
        <p>DRAI Dashboard © 2025 • Facultad de Ingeniería • Universidad de Antioquia</p>
      </footer>
    </div>
  );
}