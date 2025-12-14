import { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
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
      'Actividades Logístico': 6624,
      'Actividades Académico': 10304,
      'Actividades Infraestructura': 30636,
      'Horas Videoconferencia': 59248,
      'Streamings': 4554,
      'Grabaciones': 8188
    }
  },
  
  // 2. Gestión de Sistemas de Información
  area2: {
    nombre: 'Gestión de Sistemas de Información',
    icon: '💻',
    color: '#1976D2',
    datos: {
      promedioProyectos: 10,
      maximoProyectos: 11,
      totalActividades: 74060,
      promedioSemana: 35,
      semanaMayorCarga: 1610
    }
  },
  
  // 3. Soporte Telemático
  area3: {
    nombre: 'Soporte Telemático',
    icon: '🔧',
    color: '#00897B',
    datos: {
      equiposConfigurados: 9016,
      reservasPuntuales: 7498,
      activacionesLicencia: 31740,
      atencionCorreo: 37352,
      actualizacionSoftware: 97244,
      atencionPresencial: 5612
    }
  },
  
  // 4. Soporte Académico Ingeni@ - Regiones
  area4: {
    nombre: 'Soporte Académico Ingeni@ - Regiones',
    icon: '📞',
    color: '#F57C00',
    datos: {
      capacitacionesEstudiantes: 2213,
      capacitacionesDocentes: 47,
      aulasVirtuales: 470,
      soporteMensajes: 2352,
      soporteLlamadas: 93,
      reservaSalaAVI: 48
    }
  },
  
  // 5. Gestión Documental CENDOI
  area5: {
    nombre: 'Gestión Documental CENDOI',
    icon: '📚',
    color: '#9C27B0',
    datos: {
      prestamos: 18435,
      atencionUsuarios: 15678,
      generacionPaysa: 1765,
      alertasOlib: 1665,
      pazSalvos: 1454,
      aprobacionAutoarchivo: 764,
      cartasConfidencialidad: 270,
      ingresosKoha: 15
    }
  },
  
  // 6. Unidad de Gestión de Proyectos
  area6: {
    nombre: 'Unidad de Gestión de Proyectos',
    icon: '📋',
    color: '#3F51B5',
    datos: {
      totalReuniones: 56,
      totalCapacitaciones: 168,
      semanasConPlan: 40
    }
  },
  
  // 7. Ingeni@
  area7: {
    nombre: 'Ingeni@',
    icon: '🎓',
    color: '#E91E63',
    datos: {
      estudiantesTalentoTech: 12814,
      pqrsAtendidas: 19412,
      pruebasInicio: 4173,
      storiesRedes: 152,
      totalActividades: 18
    }
  },
  
  // 8. Producción
  area8: {
    nombre: 'Producción',
    icon: '🎨',
    color: '#FF5722',
    datos: {
      diseñosRealizados: 8987,
      diagramaciones: 12,
      transmisiones: 32,
      grabaciones: 55
    }
  },
  
  // 9. Gestión Administrativa
  area9: {
    nombre: 'Gestión Administrativa',
    icon: '📁',
    color: '#607D8B',
    datos: {
      comprasGestionadas: 2998,
      contrataciones: 3956,
      transferencias: 1196,
      actividadesSEA: 2998,
      actividadesVarios: 1886,
      avalesPago: 13892,
      seguimientoSEA: 0,
      aprobacionesNomina: 1242,
      seguimientoContratos: 4692
    }
  }
};

// FUNCIÓN LEGACY (YA NO SE USA)
const parseInformeDRAI = (htmlContent, weekNumber) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');
  const text = doc.body.textContent || '';

  // Helper: contar actividades (bullets/items) en el DOM HTML
  const countActivitiesInHTML = (htmlFragment) => {
    if (!htmlFragment) return 0;
    const tempDoc = parser.parseFromString(htmlFragment, 'text/html');
    const listItems = tempDoc.querySelectorAll('li');
    return listItems.length;
  };

  // Helper: extraer sección HTML entre dos headers
  const extractHTMLSection = (startText, endText = null) => {
    const htmlLower = htmlContent.toLowerCase();
    const startIdx = htmlLower.indexOf(startText.toLowerCase());
    if (startIdx === -1) return null;

    const endIdx = endText ? htmlLower.indexOf(endText.toLowerCase(), startIdx + 1) : htmlContent.length;
    if (endIdx === -1) return htmlContent.substring(startIdx);

    return htmlContent.substring(startIdx, endIdx);
  };

  // Helper: extraer número de un patrón
  const extractNumber = (pattern, txt = text) => {
    const match = txt.match(pattern);
    return match ? parseInt(match[1]) : 0;
  };

  // ============================================
  // EXTRAER FECHA DEL INFORME
  // ============================================
  let fechaInforme = `Semana ${weekNumber}`;
  const fechaMatch = text.match(/Informe Semana.*?del\s+(\d+)\s+al\s+(\d+)\s+de\s+(\w+)\s*(\d{4})?/i);
  if (fechaMatch) {
    fechaInforme = `${fechaMatch[1]}-${fechaMatch[2]} ${fechaMatch[3]} ${fechaMatch[4] || '2025'}`;
  }

  // ============================================
  // 1. APOYO LOGÍSTICO Y VIDEOCONFERENCIA - VALORES HARDCODEADOS (FIJOS)
  // ============================================
  // Se usan valores fijos independientemente del contenido del informe
  
  const actividadesLogistico = 144;       // Total actividades Logístico
  const actividadesAcademico = 224;       // Total actividades Académico
  const actividadesInfraestructura = 666; // Total actividades Infraestructura
  const horasVideoconferencias = 1288;    // Total horas videoconferencia
  const streamings = 99;                  // Total streamings
  const grabaciones = 178;                // Total grabaciones
  const solicitudesVideoconf = 0;         // Solicitudes videoconferencia
  const eventosExtension = 0;             // Eventos extensión

  console.log(`🎥 Apoyo Logístico y Videoconferencia (Semana ${weekNumber}) - VALORES FIJOS:`);
  console.log(`   - Logístico: ${actividadesLogistico}`);
  console.log(`   - Académico: ${actividadesAcademico}`);
  console.log(`   - Infraestructura: ${actividadesInfraestructura}`);
  console.log(`   - Horas videoconferencia: ${horasVideoconferencias}`);

  // ============================================
  // 2. GESTIÓN DE SISTEMAS DE INFORMACIÓN - VALORES HARDCODEADOS (FIJOS)
  // ============================================
  // Se usan valores fijos independientemente del contenido del informe
  
  const proyectosActivos = 10;           // Promedio proyectos activos
  const maximoProyectos = 11;            // Máximo proyectos simultáneos
  const actividadesSistemas = 1610;      // Total actividades en desarrollo
  const promedioActividadesSemana = 35;  // Promedio actividades/semana
  const semanaMayorCarga = 56;           // Semana con mayor carga

  console.log(`💻 Gestión de Sistemas (Semana ${weekNumber}) - VALORES FIJOS:`);
  console.log(`   - Proyectos activos (promedio): ${proyectosActivos}`);
  console.log(`   - Máximo proyectos: ${maximoProyectos}`);
  console.log(`   - Actividades totales: ${actividadesSistemas}`);

  // ============================================
  // 3. SOPORTE TELEMÁTICO - VALORES HARDCODEADOS (FIJOS)
  // ============================================
  // Se usan valores fijos independientemente del contenido del informe
  
  const equiposConfigurados = 196;        // Total equipos configurados
  const reservasPuntuales = 163;          // Total reservas puntuales
  const activacionesLicencia = 690;       // Total activaciones licencia
  const atencionCorreo = 812;             // Total atención correo
  const actualizacionSoftware = 2114;     // Total actualización software
  const atencionPresencial = 122;         // Total atención presencial
  const tieneDocumentacion = true;        // Documentación y transferencia
  const instalacionesSO = 0;              // Instalaciones SO
  const mantenimientos = 0;               // Mantenimientos
  const configuracionesGuacamole = 0;     // Configuraciones Guacamole
  const aperturaAVI = 0;                  // Apertura AVI
  const soporteTalentoTech = 0;           // Soporte Talento Tech
  const soporteRequerimientoSalas = 0;    // Soporte Requerimiento Salas
  const soporteSsofi = 0;                 // Soporte Ssofi
  const soportePaysa = 0;                 // Soporte Paysa

  console.log(`🔧 Soporte Telemático (Semana ${weekNumber}) - VALORES FIJOS:`);
  console.log(`   - Equipos configurados: ${equiposConfigurados}`);
  console.log(`   - Reservas puntuales: ${reservasPuntuales}`);
  console.log(`   - Activaciones licencia: ${activacionesLicencia}`);
  console.log(`   - Atención correo: ${atencionCorreo}`);

  // ============================================
  // 4. SOPORTE TÉCNICO Y ACADÉMICO INGENI@ - REGIONES - VALORES HARDCODEADOS (FIJOS)
  // ============================================
  // Se usan valores fijos independientemente del contenido del informe
  
  const capacitacionesEstudiantes = 2213;  // Capacitaciones Estudiantes
  const capacitacionesDocentes = 47;        // Capacitaciones Docentes
  const aulasVirtualesActivadas = 470;      // Aulas Virtuales activadas
  const soporteMensajesRespondidos = 2352;  // Soporte Mensajes Respondidos
  const soporteLlamadasRespondidas = 93;    // Soporte llamadas Respondidas
  const reservaSalaAVI = 48;                // Reserva sala AVI

  console.log(`📞 Soporte Regiones (Semana ${weekNumber}) - VALORES FIJOS:`);
  console.log(`   - Capacitaciones Estudiantes: ${capacitacionesEstudiantes}`);
  console.log(`   - Capacitaciones Docentes: ${capacitacionesDocentes}`);
  console.log(`   - Aulas Virtuales: ${aulasVirtualesActivadas}`);
  console.log(`   - Mensajes Respondidos: ${soporteMensajesRespondidos}`);

  // ============================================
  // 5. GESTIÓN DOCUMENTAL CENDOI - VALORES HARDCODEADOS (FIJOS)
  // ============================================
  // Se usan valores fijos independientemente del contenido del informe
  
  const prestamoTotal = 18435;        // Préstamo de PC, libros, diademas, cámaras
  const atencionUsuarios = 15678;     // Atención a usuarios (cantidad)
  const generacionPaysa = 1765;       // Generación de PAYSA
  const alertasOlib = 1665;           // Alertas y notas en el OLIB
  const pazSalvos = 1454;             // Paz y salvos de profesores
  const aprobacionAutoarchivo = 764;  // Aprobación de Autoarchivo
  const cartasConfidencialidad = 270; // Cartas de confidencialidad
  const ingresosKoha = 15;            // Ingresar recursos al catálogo KOHA

  console.log(`� CENDOI (Semana ${weekNumber}) - VALORES FIJOS:`);
  console.log(`   - Préstamos totales: ${prestamoTotal}`);
  console.log(`   - Atención usuarios: ${atencionUsuarios}`);
  console.log(`   - Generación PAYSA: ${generacionPaysa}`);
  console.log(`   - Alertas OLIB: ${alertasOlib}`);

  // ============================================
  // 6. UNIDAD DE GESTIÓN DE PROYECTOS (UGP)
  // ============================================
  
  const reunionesUGP = (text.match(/(?:Se realiza|Se realizó) reunión/gi) || []).length;
  const capacitacionesUGP = (text.match(/capacitación|capacitaciones/gi) || []).length;
  
  const ugpActividades = {
    planAccion: /Plan de Acción|Plan\+/i.test(text),
    reunionesCapacitaciones: reunionesUGP > 0,
    email: /Se revisaron.*correos electrónicos/i.test(text),
    macroproyectos: /Macroproyecto/i.test(text)
  };

  // ============================================
  // 7. INGENI@
  // ============================================
  
  // Subactividades de Ingeni@
  const ingeniaActividades = {
    administrativo: /Ingeni@.*Administrativo/i.test(text),
    academico: /Ingeni@.*Académico/i.test(text),
    comunicaciones: /Ingeni@.*Comunicaciones/i.test(text),
    soporte: /Ingeni@.*Soporte/i.test(text),
    permanenciaTalentoTech: /Permanencia.*Talento|Talento.*Permanencia/i.test(text),
    talentoTechAdmin: /Talento Tech.*Administrativo/i.test(text),
    talentoTechAcademico: /Talento Tech.*Académ/i.test(text),
    proyectoPTIES: /Proyecto.*PTIES|PTIES.*Administrativo/i.test(text),
    proyectoCGR: /Proyecto.*CGR/i.test(text)
  };

  // Helper: sumar todos los números que aparecen en una sección (números después de guión, entre paréntesis, o en formato de números aislados)
  const sumarNumerosEnSeccion = (htmlFragment) => {
    if (!htmlFragment) return 0;

    // Buscar números en múltiples formatos:
    // 1. Números después de guión: -50, -100, etc.
    const numerosGuion = htmlFragment.match(/-(\d{1,5})/g) || [];
    const sumaGuion = numerosGuion.reduce((sum, num) => sum + parseInt(num.substring(1)), 0);

    // 2. Números entre paréntesis: (50), (100), etc.
    const numerosParentesis = htmlFragment.match(/\((\d{1,5})\)/g) || [];
    const sumaParentesis = numerosParentesis.reduce((sum, num) => sum + parseInt(num.slice(1, -1)), 0);

    // 3. Números aislados de 2-4 dígitos (excluir años tipo 2025, 2024, etc.)
    const todoNumeros = htmlFragment.match(/\b(\d{2,4})\b/g) || [];
    const sumaAislados = todoNumeros.reduce((sum, num) => {
      const n = parseInt(num);
      // Incluir números razonables (excluir años y números muy pequeños)
      if ((n >= 10 && n <= 9999 && (n < 2000 || n > 2050))) {
        return sum + n;
      }
      return sum;
    }, 0);

    // Retorna la suma total de todos los métodos
    return sumaGuion + sumaParentesis + sumaAislados;
  };

  // Helper: sumar solo números relacionados con Talento Tech
  const sumarNumerosTalentoTech = (htmlFragment) => {
    if (!htmlFragment) return 0;

    const tempDoc = parser.parseFromString(htmlFragment, 'text/html');
    const listItems = tempDoc.querySelectorAll('li, p, td');

    let suma = 0;

    listItems.forEach(item => {
      const texto = item.textContent || '';
      const textoLower = texto.toLowerCase();

      // Solo procesar si menciona "talento tech"
      if (textoLower.includes('talento tech')) {
        // Buscar números después de guión al final de la línea
        const match = texto.match(/-(\d{1,5})\s*$/);
        if (match) {
          const numero = parseInt(match[1]);
          // Filtrar números absurdos (como años 2026, 2025, etc.)
          if (numero > 0 && numero < 2000) {
            console.log(`  ✓ Talento Tech encontrado (Semana ${weekNumber}): "${texto.substring(0, 60)}..." → ${numero}`);
            suma += numero;
          }
        }
      }
    });

    return suma;
  };

  // ============================================
  // INGENI@ - VALORES HARDCODEADOS (FIJOS)
  // ============================================
  // Se usan valores fijos independientemente del contenido del informe
  
  const talentoTechMatriculas = 12814;  // Total estudiantes Talento Tech (acumulado)
  const pqrsAtendidas = 19412;          // Total PQRS atendidas
  const pruebasInicio = 4173;           // Total pruebas inicio usuarios
  const storiesRedes = 152;             // Total stories redes sociales
  
  // Valores opcionales (se pueden extraer o dejar en 0)
  const reportesHorasCatedra = extractNumber(/reportes de horas.*cátedra[^\d]{0,15}(\d{1,3})/i) ||
                               extractNumber(/horas.*cátedra[^\d]{0,15}(\d{1,3})/i) || 0;
  const acompInterventoria = extractNumber(/Acompañamiento interventoría[^\d]{0,15}(\d{1,3})/i) ||
                             extractNumber(/interventoría[^\d]{0,15}(\d{1,3})/i) || 0;
  
  // ============================================
  // ACTIVIDADES INGENI@ - VALORES HARDCODEADOS (FIJOS)
  // ============================================
  // Total de actividades Ingeni@ fijo
  const ingeniaActivitiesCount = 18; // Total actividades Ingeni@ (valor hardcodeado)
  
  console.log(`📊 Ingeni@ (Semana ${weekNumber}) - VALORES FIJOS:`);
  console.log(`   - Matrículas: ${talentoTechMatriculas}`);
  console.log(`   - PQRS: ${pqrsAtendidas}`);
  console.log(`   - Pruebas inicio: ${pruebasInicio}`);
  console.log(`   - Stories: ${storiesRedes}`);
  console.log(`   - Actividades: ${ingeniaActivitiesCount}`);

  // ============================================
  // 8. PRODUCCIÓN
  // ============================================
  
  const produccionActividades = {
    facultad: /Producción[\s\S]*?Facultad/i.test(text),
    contraloria: /Producción[\s\S]*?Contraloría/i.test(text),
    especializacion: /Esp.*Analítica|Analítica.*datos/i.test(text),
    talentoTech: /Producción[\s\S]*?Talent/i.test(text)
  };

  // Extraer sección de Producción para contar actividades
  const produccionHTML = extractHTMLSection('Producción', 'Gestión Administrativa');

  const disenosRealizados = produccionHTML ? countActivitiesInHTML(produccionHTML) : 0;
  const diagramaciones = text.match(/diagramación/gi) ? (text.match(/diagramación/gi) || []).length : 0;
  const transmisiones = text.match(/[Tt]ransmisión|[Rr]eunión para.*entrega completa/g) ? (text.match(/[Tt]ransmisión|[Rr]eunión para.*entrega completa/g) || []).length : 0;
  const grabacionesProduccion = text.match(/[Gg]rabación de|Se realiza.*grabación/g) ? (text.match(/[Gg]rabación de|Se realiza.*grabación/g) || []).length : 0;

  console.log(`🎨 Producción (Semana ${weekNumber}): Diseños=${disenosRealizados}, Diagramaciones=${diagramaciones}, Transmisiones=${transmisiones}, Grabaciones=${grabacionesProduccion}`);

  // ============================================
  // 9. GESTIÓN ADMINISTRATIVA - VALORES HARDCODEADOS (FIJOS)
  // ============================================
  // Se usan valores fijos independientemente del contenido del informe
  
  const comprasGestionadas = 65;           // Total compras gestionadas
  const contrataciones = 86;               // Total contrataciones
  const transferencias = 26;               // Total transferencias
  const actividadesSEA = 65;               // Total actividades SEA
  const actividadesVarios = 41;            // Total actividades Varios
  const avalesPago = 302;                  // Total avales pago (actualizado)
  const seguimientoReporteSEA = 0;         // Total seguimiento y reporte SEA
  const aprobacionesNominaDepto = 27;      // Total aprobaciones nómina Depto (actualizado)
  const seguimientoContratos = 102;        // Total seguimiento contratos (actualizado)
  const liberacionPlazas = 0;              // Liberación plazas

  console.log(`📁 Gestión Administrativa (Semana ${weekNumber}) - VALORES FIJOS:`);
  console.log(`   - Compras gestionadas: ${comprasGestionadas}`);
  console.log(`   - Contrataciones: ${contrataciones}`);
  console.log(`   - Transferencias: ${transferencias}`);
  console.log(`   - Actividades SEA: ${actividadesSEA}`);

  // ============================================
  // RETORNO COMPLETO
  // ============================================
  return {
    semana: weekNumber,
    fecha: fechaInforme,
    
    // 1. Apoyo Logístico y Videoconferencia
    area1: {
      nombre: 'Apoyo Logístico y Videoconferencia',
      subactividades: {
        logistico: { nombre: 'Logístico', valor: actividadesLogistico, descripcion: 'actividades' },
        academico: { nombre: 'Académico', valor: actividadesAcademico, descripcion: 'actividades' },
        infraestructura: { nombre: 'Infraestructura', valor: actividadesInfraestructura, descripcion: 'actividades' },
        videoconferencia: { 
          nombre: 'Total horas videoconferencia', 
          valor: horasVideoconferencias,
          detalles: { streamings, grabaciones, solicitudesVideoconf, eventosExtension }
        }
      },
      totales: { horasVideoconferencias, streamings, grabaciones, solicitudesVideoconf }
    },

    // 2. Gestión de Sistemas de Información
    area2: {
      nombre: 'Gestión de Sistemas de Información',
      subactividades: {
        promedioProyectos: { nombre: 'Promedio proyectos activos/semana', valor: proyectosActivos },
        maximoProyectos: { nombre: 'Máximo proyectos simultáneos', valor: maximoProyectos },
        actividadesDesarrollo: { nombre: 'Total actividades en desarrollo', valor: actividadesSistemas },
        promedioActividades: { nombre: 'Promedio actividades/semana', valor: promedioActividadesSemana },
        semanaMayorCarga: { nombre: 'Semana con mayor carga (actividades)', valor: semanaMayorCarga }
      },
      totales: { proyectosActivos, actividadesSistemas, maximoProyectos, promedioActividadesSemana, semanaMayorCarga }
    },

    // 3. Soporte Telemático
    area3: {
      nombre: 'Soporte Telemático',
      subactividades: {
        documentacion: { nombre: 'Documentación y transferencia', activo: tieneDocumentacion },
        soporteInfraestructura: { nombre: 'Soporte a Infraestructura', activo: true },
        soporteTecnico: { 
          nombre: 'Soporte Técnico', 
          valor: equiposConfigurados,
          detalles: { instalacionesSO, mantenimientos, configuracionesGuacamole }
        },
        salasComputo: { 
          nombre: 'Salas de Cómputo',
          detalles: { reservasPuntuales, activacionesLicencia, atencionCorreo, actualizacionSoftware, aperturaAVI, atencionPresencial }
        },
        soporteAplicativos: { 
          nombre: 'Soporte Aplicativos',
          detalles: { soporteSsofi, soportePaysa }
        }
      },
      totales: { equiposConfigurados, reservasPuntuales, activacionesLicencia, atencionCorreo }
    },

    // 4. Soporte Técnico y Académico Ingeni@ - Regiones
    area4: {
      nombre: 'Soporte Academico Ingeni@ - Regiones',
      subactividades: {
        capacitacionesEstudiantes: { nombre: 'Capacitaciones Estudiantes', valor: capacitacionesEstudiantes },
        capacitacionesDocentes: { nombre: 'Capacitaciones Docentes', valor: capacitacionesDocentes },
        aulasVirtuales: { nombre: 'Aulas Virtuales activadas', valor: aulasVirtualesActivadas },
        soporteMensajes: { nombre: 'Soporte Mensajes Respondidos', valor: soporteMensajesRespondidos },
        soporteLlamadas: { nombre: 'Soporte llamadas Respondidas', valor: soporteLlamadasRespondidas },
        reservaSalaAVI: { nombre: 'Reserva sala AVI', valor: reservaSalaAVI }
      },
      totales: { 
        capacitacionesEstudiantes, 
        capacitacionesDocentes, 
        aulasVirtualesActivadas, 
        soporteMensajesRespondidos, 
        soporteLlamadasRespondidas, 
        reservaSalaAVI 
      }
    },

    // 5. Gestión Documental CENDOI
    area5: {
      nombre: 'Gestión Documental CENDOI',
      subactividades: {
        prestamos: { nombre: 'Préstamo de PC, libros, diademas, cámaras', valor: prestamoTotal },
        atencionUsuarios: { nombre: 'Atención a usuarios (cantidad)', valor: atencionUsuarios },
        generacionPaysa: { nombre: 'Generación de PAYSA', valor: generacionPaysa },
        alertasOlib: { nombre: 'Alertas y notas en el OLIB', valor: alertasOlib },
        pazSalvos: { nombre: 'Paz y salvos de profesores de la Facultad', valor: pazSalvos },
        aprobacionAutoarchivo: { nombre: 'Aprobación de Autoarchivo', valor: aprobacionAutoarchivo },
        cartasConfidencialidad: { nombre: 'Cartas de confidencialidad', valor: cartasConfidencialidad },
        ingresosKoha: { nombre: 'Ingresar recursos al catálogo KOHA', valor: ingresosKoha }
      },
      totales: { 
        prestamoTotal, 
        atencionUsuarios, 
        generacionPaysa, 
        alertasOlib, 
        pazSalvos, 
        aprobacionAutoarchivo, 
        cartasConfidencialidad, 
        ingresosKoha 
      }
    },

    // 6. Unidad de Gestión de Proyectos
    area6: {
      nombre: 'Unidad de Gestión de Proyectos',
      subactividades: {
        planAccion: { nombre: 'Plan de Acción', activo: ugpActividades.planAccion },
        reunionesCapacitaciones: { nombre: 'Reuniones y Capacitaciones', valor: reunionesUGP },
        email: { nombre: 'Email', activo: ugpActividades.email }
      },
      totales: { reunionesUGP, capacitacionesUGP }
    },

    // 7. Ingeni@
    area7: {
      nombre: 'Ingeni@',
      subactividades: {
        administrativo: { nombre: 'Ingeni@-Administrativo', activo: ingeniaActividades.administrativo },
        academico: { nombre: 'Ingeni@-Académico', activo: ingeniaActividades.academico },
        comunicaciones: { nombre: 'Ingeni@-Comunicaciones', activo: ingeniaActividades.comunicaciones },
        soporte: { nombre: 'Ingeni@-Soporte', activo: ingeniaActividades.soporte },
        permanenciaTT: { nombre: 'Ingeni@-Permanencia-Talento Tech', activo: ingeniaActividades.permanenciaTalentoTech },
        talentoTechAdmin: { nombre: 'Talento Tech-IU TRAINING-Administrativo', activo: ingeniaActividades.talentoTechAdmin },
        talentoTechAcademico: { nombre: 'Talento Tech-IU TRAINING-Académico', activo: ingeniaActividades.talentoTechAcademico },
        proyectoPTIES: { nombre: 'Proyecto PTIES-Administrativo', activo: ingeniaActividades.proyectoPTIES },
        proyectoCGR: { nombre: 'Proyecto CGR-Administrativo', activo: ingeniaActividades.proyectoCGR }
      },
      totales: { 
        talentoTechMatriculas, 
        actividadesTotales: ingeniaActivitiesCount,
        pruebasInicio, 
        storiesRedes, 
        reportesHorasCatedra, 
        pqrsAtendidas, 
        acompInterventoria 
      }
    },

    // 8. Producción
    area8: {
      nombre: 'Producción',
      subactividades: {
        facultad: { nombre: 'Facultad', activo: produccionActividades.facultad },
        contraloria: { nombre: 'Contraloría', activo: produccionActividades.contraloria },
        especializacion: { nombre: 'Esp Analítica y ciencia de datos', activo: produccionActividades.especializacion },
        talentoTech: { nombre: 'Talento Tech', activo: produccionActividades.talentoTech }
      },
      totales: { disenosRealizados, diagramaciones, transmisiones, grabacionesProduccion }
    },

    // 9. Gestión Administrativa
    area9: {
      nombre: 'Gestión Administrativa',
      subactividades: {
        contratacion: { nombre: 'Contratación', valor: contrataciones },
        compras: { nombre: 'Compras', valor: comprasGestionadas },
        transferencias: { nombre: 'Transferencia', valor: transferencias },
        sea: { nombre: 'SEA', valor: actividadesSEA },
        varios: { nombre: 'Varios', valor: actividadesVarios },
        seguimientoReporteSEA: { nombre: 'Seguimiento y reporte SEA', valor: seguimientoReporteSEA },
        aprobacionesNomina: { nombre: 'Aprobaciones nómina Depto', valor: aprobacionesNominaDepto },
        seguimientoContratos: { nombre: 'Seguimiento y reporte de contratos', valor: seguimientoContratos }
      },
      totales: { comprasGestionadas, contrataciones, transferencias, avalesPago, liberacionPlazas, actividadesSEA, actividadesVarios, seguimientoReporteSEA, aprobacionesNominaDepto, seguimientoContratos }
    },

    // Métricas legacy para compatibilidad
    videoconferencias: horasVideoconferencias,
    streamings,
    grabaciones,
    solicitudesVideoconf,
    proyectosActivos,
    equiposConfigurados,
    reservasPuntuales,
    activacionesLicencia,
    atencionCorreo,
    usuariosCENDOI: atencionUsuarios,
    libros: prestamoTotal,
    pcs: generacionPaysa,
    diademas: alertasOlib,
    reunionesUGP,
    talentoTechMatriculas,
    pqrsAtendidas,
    disenosRealizados,
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
  pink: '#E91E63',
  blue: '#1976D2',
  teal: '#00897B',
  orange: '#F57C00',
  indigo: '#3F51B5'
};

const AREA_COLORS = [
  '#1B5E20', // Area 1
  '#1976D2', // Area 2
  '#00897B', // Area 3
  '#F57C00', // Area 4
  '#9C27B0', // Area 5
  '#3F51B5', // Area 6
  '#E91E63', // Area 7
  '#FF5722', // Area 8
  '#607D8B'  // Area 9
];

const AREA_ICONS = ['🎥', '💻', '🔧', '📞', '📚', '📋', '🎓', '🎨', '📁'];

// ============================================
// COMPONENTE: Tarjeta de Área Expandible
// ============================================
const AreaCard = ({ area, index, data, previousData, expanded, onToggle }) => {
  const color = AREA_COLORS[index];
  const icon = AREA_ICONS[index];
  
  const getSubactividadesActivas = () => {
    if (!data?.subactividades) return 0;
    return Object.values(data.subactividades).filter(s => s.activo || s.valor > 0).length;
  };

  return (
    <div style={{
      background: 'white',
      borderRadius: '16px',
      overflow: 'hidden',
      boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
      borderLeft: `4px solid ${color}`,
      transition: 'all 0.3s ease'
    }}>
      {/* Header clickeable */}
      <div 
        onClick={onToggle}
        style={{
          padding: '16px 20px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: expanded ? `${color}10` : 'white',
          transition: 'background 0.2s'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '24px' }}>{icon}</span>
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: 700, margin: 0, color: '#1a1a1a' }}>
              {index + 1}. {area}
            </h3>
            <span style={{ fontSize: '12px', color: '#888' }}>
              {getSubactividadesActivas()} subactividades activas
            </span>
          </div>
        </div>
        <span style={{ 
          fontSize: '20px', 
          transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.3s'
        }}>
          ▼
        </span>
      </div>

      {/* Contenido expandible */}
      {expanded && data && (
        <div style={{ padding: '0 20px 20px' }}>
          {/* Subactividades */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px',
            marginTop: '12px'
          }}>
            {Object.entries(data.subactividades || {}).map(([key, sub]) => (
              <div 
                key={key}
                style={{
                  padding: '12px',
                  background: sub.activo || sub.valor > 0 ? `${color}08` : '#f5f5f5',
                  borderRadius: '8px',
                  borderLeft: `3px solid ${sub.activo || sub.valor > 0 ? color : '#ddd'}`
                }}
              >
                <div style={{ 
                  fontSize: '12px', 
                  fontWeight: 600, 
                  color: sub.activo || sub.valor > 0 ? '#1a1a1a' : '#999',
                  marginBottom: '4px'
                }}>
                  {sub.nombre}
                </div>
                {sub.valor !== undefined && (
                  <div style={{ fontSize: '20px', fontWeight: 800, color }}>
                    {sub.valor}
                  </div>
                )}
                {sub.activo !== undefined && !sub.valor && (
                  <div style={{ 
                    fontSize: '11px', 
                    color: sub.activo ? COLORS.success : '#999',
                    fontWeight: 600
                  }}>
                    {sub.activo ? '✓ Activo' : '○ Sin reporte'}
                  </div>
                )}
                {sub.detalles && (
                  <div style={{ marginTop: '8px', fontSize: '11px', color: '#666' }}>
                    {Object.entries(sub.detalles).map(([k, v]) => (
                      <div key={k} style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>{k}:</span>
                        <strong>{v}</strong>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Totales */}
          {data.totales && Object.keys(data.totales).length > 0 && (
            <div style={{ 
              marginTop: '16px', 
              padding: '12px', 
              background: `linear-gradient(135deg, ${color}, ${color}dd)`,
              borderRadius: '8px',
              color: 'white'
            }}>
              <div style={{ fontSize: '11px', opacity: 0.9, marginBottom: '8px', fontWeight: 600 }}>
                TOTALES DE LA SEMANA
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                {Object.entries(data.totales).map(([key, val]) => (
                  <div key={key} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '20px', fontWeight: 800 }}>{val}</div>
                    <div style={{ fontSize: '10px', opacity: 0.8 }}>{key}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ============================================
// COMPONENTE: Resumen Rápido
// ============================================
const QuickSummary = ({ data }) => {
  if (!data) return null;

  const summaryItems = [
    { icon: '🎥', label: 'Horas videoconferencia', value: data.videoconferencias, color: COLORS.primary },
    { icon: '📡', label: 'Streamings', value: data.streamings, color: COLORS.secondary },
    { icon: '👥', label: 'Usuarios CENDOI', value: data.usuariosCENDOI, color: COLORS.accent },
    { icon: '💻', label: 'Equipos', value: data.equiposConfigurados, color: COLORS.blue },
    { icon: '🎓', label: 'Talento Tech', value: data.talentoTechMatriculas, color: COLORS.purple },
    { icon: '📋', label: 'Proyectos Activos', value: data.proyectosActivos, color: COLORS.teal },
    { icon: '🛒', label: 'Compras', value: data.comprasGestionadas, color: COLORS.orange },
    { icon: '📝', label: 'Contrataciones', value: data.contrataciones, color: COLORS.indigo }
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
      gap: '12px',
      marginBottom: '24px'
    }}>
      {summaryItems.map((item, i) => (
        <div key={i} style={{
          background: 'white',
          borderRadius: '12px',
          padding: '16px',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          borderTop: `3px solid ${item.color}`
        }}>
          <span style={{ fontSize: '24px' }}>{item.icon}</span>
          <div style={{ fontSize: '28px', fontWeight: 800, color: item.color, marginTop: '8px' }}>
            {item.value}
          </div>
          <div style={{ fontSize: '11px', color: '#888', fontWeight: 500 }}>{item.label}</div>
        </div>
      ))}
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
  const [expandedAreas, setExpandedAreas] = useState({});
  const reporteRef = useRef(null);

  const toggleArea = (index) => {
    setExpandedAreas(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const expandAll = () => {
    const all = {};
    for (let i = 0; i < 9; i++) all[i] = true;
    setExpandedAreas(all);
  };

  const collapseAll = () => {
    setExpandedAreas({});
  };

  // ============================================
  // FUNCIONES DE EXPORTACIÓN
  // ============================================

  const exportToImage = async () => {
    if (!reporteRef.current || informes.length === 0) {
      alert('No hay reporte para exportar');
      return;
    }

    try {
      const canvas = await html2canvas(reporteRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
        allowTaint: true,
        useCORS: true
      });

      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `Reporte_DRAI_Anual_${new Date().toISOString().split('T')[0]}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error al exportar imagen:', error);
      alert('Error al generar la imagen');
    }
  };

  const exportToPDF = async () => {
    if (!reporteRef.current || informes.length === 0) {
      alert('No hay reporte para exportar');
      return;
    }

    try {
      const canvas = await html2canvas(reporteRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
        allowTaint: true,
        useCORS: true
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 280;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pdf.internal.pageSize.getHeight();

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pdf.internal.pageSize.getHeight();
      }

      pdf.save(`Reporte_DRAI_Anual_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error al exportar PDF:', error);
      alert('Error al generar el PDF');
    }
  };

  const exportToHTML = () => {
    if (informes.length === 0) {
      alert('No hay informes para exportar');
      return;
    }

    let htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reporte DRAI</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
            background-color: #f5f5f5;
        }
        h1 { color: #1a5276; text-align: center; border-bottom: 3px solid #1a5276; padding-bottom: 10px; }
        h2 { color: #2e7d32; margin-top: 30px; border-left: 4px solid #2e7d32; padding-left: 10px; }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            background-color: white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        th {
            background-color: #1a5276;
            color: white;
            padding: 12px;
            text-align: left;
        }
        td {
            padding: 10px 12px;
            border-bottom: 1px solid #ddd;
        }
        tr:hover { background-color: #f5f5f5; }
        .semana { font-weight: bold; color: #1a5276; }
        .total { background-color: #e3f2fd; font-weight: bold; }
        .section { background-color: #f9f9f9; margin: 20px 0; padding: 15px; border-radius: 5px; }
    </style>
</head>
<body>
    <h1>📊 REPORTE DRAI - INFORMES SEMANALES</h1>
    <p style="text-align: center; color: #666;">Departamento de Recursos de Apoyo e Informática</p>
    <p style="text-align: center; color: #666;">Facultad de Ingeniería • Universidad de Antioquia</p>
    <p style="text-align: center; color: #666;">Generado el: ${new Date().toLocaleString('es-ES')}</p>
`;

    // Tabla resumen
    htmlContent += `<h2>📋 Resumen General</h2>
    <table>
        <thead>
            <tr>
                <th>Semana</th>
                <th>Fecha</th>
                <th>Horas Videoconferencia</th>
                <th>Streamings</th>
                <th>Usuarios CENDOI</th>
                <th>Equipos Configurados</th>
            </tr>
        </thead>
        <tbody>`;

    informes.forEach(inf => {
        htmlContent += `
            <tr>
                <td class="semana">${inf.semana}</td>
                <td>${inf.fecha}</td>
                <td>${inf.videoconferencias || 0}</td>
                <td>${inf.streamings || 0}</td>
                <td>${inf.usuariosCENDOI || 0}</td>
                <td>${inf.equiposConfigurados || 0}</td>
            </tr>`;
    });

    htmlContent += `
        </tbody>
    </table>`;

    // Detalles por semana
    informes.forEach(inf => {
        htmlContent += `
        <div class="section">
            <h2>Semana ${inf.semana} - ${inf.fecha}</h2>
            <h3>Área 1: Apoyo Logístico y Videoconferencia</h3>
            <ul>
                <li>Actividades Logístico: ${inf.area1?.subactividades?.logistico?.valor || 0}</li>
                <li>Actividades Académico: ${inf.area1?.subactividades?.academico?.valor || 0}</li>
                <li>Actividades Infraestructura: ${inf.area1?.subactividades?.infraestructura?.valor || 0}</li>
                <li>Horas Videoconferencia: ${inf.videoconferencias || 0}</li>
                <li>Streamings: ${inf.streamings || 0}</li>
                <li>Grabaciones: ${inf.grabaciones || 0}</li>
            </ul>
        </div>`;
    });

    htmlContent += `
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Reporte_DRAI_${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportToCSV = () => {
    if (informes.length === 0) {
      alert('No hay informes para exportar');
      return;
    }

    let csvContent = 'Semana,Fecha,Horas Videoconferencia,Streamings,Grabaciones,Usuarios CENDOI,Proyectos Activos,Actividades Sistemas,Equipos Configurados\n';

    informes.forEach(inf => {
        csvContent += `${inf.semana},"${inf.fecha}",${inf.videoconferencias || 0},${inf.streamings || 0},${inf.grabaciones || 0},${inf.usuariosCENDOI || 0},${inf.proyectosActivos || 0},${inf.area2?.totales?.actividadesSistemas || 0},${inf.equiposConfigurados || 0}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Reporte_DRAI_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

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

  const getTrendData = () => {
    return informes.map(inf => ({
      semana: `S${inf.semana}`,
      logistico: 144,  // Valor fijo
      academico: 224,  // Valor fijo
      infraestructura: 666,  // Valor fijo
      videoconferencias: 1288,  // Valor fijo
      usuarios: 1567,  // Valor fijo (15678 / 10)
      soporte: 196,  // Valor fijo
      proyectos: 10,  // Valor fijo
      reuniones: inf.reunionesUGP || 0,  // Dinámico (UGP)
      diseños: inf.disenosRealizados || 0,  // Dinámico (Producción)
      compras: 65,  // Valor fijo
      contrataciones: 86  // Valor fijo
    }));
  };

  const getAreasData = () => {
    if (!currentWeek) return [];
    return [
      { area: 'Videoconf.', value: currentWeek.videoconferencias },
      { area: 'Sistemas', value: currentWeek.proyectosActivos },
      { area: 'Soporte', value: currentWeek.equiposConfigurados },
      { area: 'Regiones', value: currentWeek.area4?.totales?.soporteEmailFacultad || 0 },
      { area: 'CENDOI', value: Math.round(currentWeek.usuariosCENDOI / 10) },
      { area: 'UGP', value: currentWeek.reunionesUGP },
      { area: 'Ingeni@', value: currentWeek.talentoTechMatriculas },
      { area: 'Producción', value: currentWeek.disenosRealizados },
      { area: 'Admin.', value: currentWeek.comprasGestionadas + currentWeek.contrataciones }
    ];
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

          {/* Botones de Exportación */}
          {informes.length > 0 && (
            <div style={{ display: 'flex', gap: '8px', background: 'rgba(255,255,255,0.15)', padding: '4px', borderRadius: '14px' }}>
              {view === 'anual' && (
                <>
                  <button
                    onClick={exportToImage}
                    style={{
                      padding: '10px 20px',
                      border: 'none',
                      background: 'rgba(255,255,255,0.25)',
                      color: 'rgba(255,255,255,0.9)',
                      borderRadius: '10px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontFamily: 'inherit',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.35)'}
                    onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.25)'}
                  >🖼️ Imagen</button>
                  <button
                    onClick={exportToPDF}
                    style={{
                      padding: '10px 20px',
                      border: 'none',
                      background: 'rgba(255,255,255,0.25)',
                      color: 'rgba(255,255,255,0.9)',
                      borderRadius: '10px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontFamily: 'inherit',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.35)'}
                    onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.25)'}
                  >📑 PDF</button>
                </>
              )}
              <button
                onClick={exportToHTML}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  background: 'rgba(255,255,255,0.25)',
                  color: 'rgba(255,255,255,0.9)',
                  borderRadius: '10px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.35)'}
                onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.25)'}
              >📄 HTML</button>
              <button
                onClick={exportToCSV}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  background: 'rgba(255,255,255,0.25)',
                  color: 'rgba(255,255,255,0.9)',
                  borderRadius: '10px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.35)'}
                onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.25)'}
              >📊 Excel (CSV)</button>
            </div>
          )}
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
      </section>

      {/* Vista Semanal */}
      {currentWeek && view === 'semanal' && (
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 32px 32px' }}>
          {/* Header de semana */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            gap: '16px', 
            marginBottom: '20px', 
            flexWrap: 'wrap' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>
                📊 Informe Ejecutivo – Semana {currentWeek.semana}
              </h2>
              <span style={{
                background: 'linear-gradient(135deg, #FFD54F, #FFC107)',
                color: '#1B5E20',
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: 600
              }}>
                {currentWeek.fecha}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={expandAll} style={{
                padding: '8px 16px',
                background: COLORS.primary,
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer'
              }}>Expandir todo</button>
              <button onClick={collapseAll} style={{
                padding: '8px 16px',
                background: '#eee',
                color: '#333',
                border: 'none',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer'
              }}>Colapsar todo</button>
            </div>
          </div>

          {/* Resumen rápido */}
          <QuickSummary data={currentWeek} />

          {/* Gráfico de barras por área */}
          <div style={{ 
            background: 'white', 
            borderRadius: '16px', 
            padding: '24px', 
            marginBottom: '24px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px' }}>
              📊 Actividad por Área
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getAreasData()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="area" tick={{ fill: '#666', fontSize: 11 }} />
                <YAxis tick={{ fill: '#666', fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" fill={COLORS.primary} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Las 9 áreas expandibles */}
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>
            📋 Detalle por Áreas (9 áreas)
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { key: 'area1', name: currentWeek.area1?.nombre },
              { key: 'area2', name: currentWeek.area2?.nombre },
              { key: 'area3', name: currentWeek.area3?.nombre },
              { key: 'area4', name: currentWeek.area4?.nombre },
              { key: 'area5', name: currentWeek.area5?.nombre },
              { key: 'area6', name: currentWeek.area6?.nombre },
              { key: 'area7', name: currentWeek.area7?.nombre },
              { key: 'area8', name: currentWeek.area8?.nombre },
              { key: 'area9', name: currentWeek.area9?.nombre }
            ].map((area, index) => (
              <AreaCard
                key={area.key}
                area={area.name}
                index={index}
                data={currentWeek[area.key]}
                previousData={previousWeek?.[area.key]}
                expanded={expandedAreas[index]}
                onToggle={() => toggleArea(index)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Vista Anual */}
      {informes.length > 0 && view === 'anual' && (
        <div ref={reporteRef} style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 32px 32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>📈 Consolidado Anual 2025</h2>
            <span style={{ background: 'linear-gradient(135deg, #FFD54F, #FFC107)', color: '#1B5E20', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 600 }}>
              {informes.length} semanas analizadas
            </span>
          </div>

          {/* Totales del año */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '16px',
            marginBottom: '24px'
          }}>
            {[
              { icon: '📋', value: 6624, label: 'Act. Logístico (Total)', color: '#1B5E20', type: 'fixed' },
              { icon: '🎥', value: 59248, label: 'Horas Videoconferencia (Total)', color: COLORS.primary, type: 'fixed' },
              { icon: '💻', value: 10, label: 'Proyectos (Promedio)', color: COLORS.blue, type: 'fixed' },
              { icon: '🔧', value: 9016, label: 'Soporte Telemático (Total)', color: COLORS.teal, type: 'fixed' },
              { icon: '👥', value: 15678, label: 'Usuarios CENDOI (Total)', color: COLORS.purple, type: 'fixed' },
              { icon: '📊', value: informes.reduce((s, i) => s + (i.reunionesUGP || 0), 0), label: 'Reuniones UGP (Total)', color: AREA_COLORS[5], type: 'sum' },
              { icon: '🎓', value: 19412, label: 'PQRS Ingeni@ (Total)', color: COLORS.pink, type: 'fixed' },
              { icon: '🛒', value: 2998, label: 'Compras Gestión Adm (Total)', color: COLORS.orange, type: 'fixed' }
            ].map((item, i) => (
              <div key={i} style={{
                background: `linear-gradient(135deg, ${item.color || COLORS.primary}, ${item.color || COLORS.accent})`,
                borderRadius: '16px',
                padding: '24px',
                textAlign: 'center',
                color: 'white',
                boxShadow: '0 4px 16px rgba(27,94,32,0.3)',
                position: 'relative'
              }}>
                {item.type === 'avg' && (
                  <div style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    background: 'rgba(255,255,255,0.3)',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '10px',
                    fontWeight: 600
                  }}>PROMEDIO</div>
                )}
                <span style={{ fontSize: '36px', display: 'block', marginBottom: '12px' }}>{item.icon}</span>
                <span style={{ fontSize: '32px', fontWeight: 800, display: 'block', fontFamily: 'monospace' }}>{item.value}</span>
                <span style={{ fontSize: '12px', opacity: 0.9, marginTop: '8px', display: 'block' }}>{item.label}</span>
              </div>
            ))}
          </div>

          {/* Gráfico de tendencias */}
          <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px' }}>📊 Tendencia de Actividades (Todas las Áreas)</h3>
            <ResponsiveContainer width="100%" height={450}>
              <LineChart data={getTrendData()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="semana" tick={{ fill: '#666', fontSize: 10 }} />
                <YAxis tick={{ fill: '#666', fontSize: 12 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Line type="monotone" dataKey="logistico" name="Logístico" stroke="#1B5E20" strokeWidth={2} strokeDasharray="5 5" />
                <Line type="monotone" dataKey="academico" name="Académico" stroke="#2E7D32" strokeWidth={2} strokeDasharray="5 5" />
                <Line type="monotone" dataKey="infraestructura" name="Infraestructura" stroke="#4CAF50" strokeWidth={2} strokeDasharray="5 5" />
                <Line type="monotone" dataKey="videoconferencias" name="Videoconf." stroke={AREA_COLORS[0]} strokeWidth={2.5} />
                <Line type="monotone" dataKey="proyectos" name="Proyectos" stroke={AREA_COLORS[1]} strokeWidth={2} />
                <Line type="monotone" dataKey="soporte" name="Soporte" stroke={AREA_COLORS[2]} strokeWidth={2} />
                <Line type="monotone" dataKey="usuarios" name="Usuarios (x10)" stroke={AREA_COLORS[4]} strokeWidth={2} />
                <Line type="monotone" dataKey="reuniones" name="Reuniones UGP" stroke={AREA_COLORS[5]} strokeWidth={2} />
                <Line type="monotone" dataKey="diseños" name="Diseños" stroke={AREA_COLORS[7]} strokeWidth={2} />
                <Line type="monotone" dataKey="compras" name="Compras" stroke={AREA_COLORS[8]} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Estadísticas por área - TODAS LAS 9 ÁREAS */}
          
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>📋 Estadísticas por Área (9 Áreas Completas)</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
            {[
              { title: '🎥 1. Apoyo Logístico y Videoconferencia', icon: AREA_ICONS[0], color: AREA_COLORS[0], stats: [
                { l: 'Total actividades Logístico', v: 6624 },
                { l: 'Total actividades Académico', v: 10304 },
                { l: 'Total actividades Infraestructura', v: 30636 },
                { l: 'Total horas videoconferencia', v: 59248 },
                { l: 'Total streamings', v: 4554 },
                { l: 'Total grabaciones', v: 8188 }
              ]},
              { title: '💻 2. Gestión de Sistemas de Información', icon: AREA_ICONS[1], color: AREA_COLORS[1], stats: [
                { l: 'Promedio proyectos activos/semana', v: 10 },
                { l: 'Máximo proyectos simultáneos', v: 11 },
                { l: 'Total actividades en desarrollo', v: 74060 },
                { l: 'Promedio actividades/semana', v: 35 },
                { l: 'Semana con mayor carga', v: '1610 actividades' }
              ]},
              { title: '🔧 3. Soporte Telemático', icon: AREA_ICONS[2], color: AREA_COLORS[2], stats: [
                { l: 'Total equipos configurados', v: 9016 },
                { l: 'Total reservas puntuales', v: 7498 },
                { l: 'Total activaciones licencia', v: 31740 },
                { l: 'Total atención correo', v: 37352 },
                { l: 'Total actualización software', v: 97244 },
                { l: 'Total atención presencial', v: 5612 }
              ]},
              { title: '📞 4. Soporte Academico Ingeni@ - Regiones', icon: AREA_ICONS[3], color: AREA_COLORS[3], stats: [
                { l: 'Capacitaciones Estudiantes', v: 2213 },
                { l: 'Capacitaciones Docentes', v: 47 },
                { l: 'Aulas Virtuales activadas', v: 470 },
                { l: 'Soporte Mensajes Respondidos', v: 2352 },
                { l: 'Soporte llamadas Respondidas', v: 93 },
                { l: 'Reserva sala AVI', v: 48 }
              ]},
              { title: '📚 5. Gestión Documental CENDOI', icon: AREA_ICONS[4], color: AREA_COLORS[4], stats: [
                { l: 'Préstamo de PC, libros, diademas, cámaras', v: 18435 },
                { l: 'Atención a usuarios (cantidad)', v: 15678 },
                { l: 'Generación de PAYSA', v: 1765 },
                { l: 'Alertas y notas en el OLIB', v: 1665 },
                { l: 'Paz y salvos de profesores de la Facultad', v: 1454 },
                { l: 'Aprobación de Autoarchivo', v: 764 },
                { l: 'Cartas de confidencialidad', v: 270 },
                { l: 'Ingresar recursos al catálogo KOHA', v: 15 }
              ]},
              { title: '📋 6. Unidad de Gestión de Proyectos', icon: AREA_ICONS[5], color: AREA_COLORS[5], stats: [
                { l: 'Total reuniones', v: informes.reduce((s, i) => s + (i.reunionesUGP || 0), 0) },
                { l: 'Total capacitaciones', v: informes.reduce((s, i) => s + (i.area6?.totales?.capacitacionesUGP || 0), 0) },
                { l: 'Semanas con Plan de Acción', v: informes.filter(i => i.area6?.subactividades?.planAccion?.activo).length }
              ]},
              { title: '🎓 7. Ingeni@', icon: AREA_ICONS[6], color: AREA_COLORS[6], stats: [
                { l: 'Total estudiantes Talento Tech (acumulado)', v: 12814 },
                { l: 'Total PQRS atendidas', v: 19412 },
                { l: 'Total pruebas inicio usuarios', v: 4173 },
                { l: 'Total stories redes sociales', v: 152 },
                { l: 'Total actividades Ingeni@', v: 18 }
              ]},
              { title: '🎨 8. Producción', icon: AREA_ICONS[7], color: AREA_COLORS[7], stats: [
                { l: 'Total diseños realizados', v: informes.reduce((s, i) => s + (i.disenosRealizados || 0), 0) },
                { l: 'Total diagramaciones', v: informes.reduce((s, i) => s + (i.area8?.totales?.diagramaciones || 0), 0) },
                { l: 'Total transmisiones', v: informes.reduce((s, i) => s + (i.area8?.totales?.transmisiones || 0), 0) },
                { l: 'Total grabaciones', v: informes.reduce((s, i) => s + (i.area8?.totales?.grabacionesProduccion || 0), 0) }
              ]},
              { title: '📁 9. Gestión Administrativa', icon: AREA_ICONS[8], color: AREA_COLORS[8], stats: [
                { l: 'Total compras gestionadas', v: 2998 },
                { l: 'Total contrataciones', v: 3956 },
                { l: 'Total transferencias', v: 1196 },
                { l: 'Total actividades SEA', v: 2998 },
                { l: 'Total actividades Varios', v: 1886 },
                { l: 'Total avales pago', v: 13892 },
                { l: 'Total seguimiento y reporte SEA', v: 0 },
                { l: 'Total aprobaciones nómina Depto', v: 1242 },
                { l: 'Total seguimiento contratos', v: 4692 }
              ]}
            ].map((section, i) => (
              <div key={i} style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', borderLeft: `4px solid ${section.color}` }}>
                <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {section.title}
                </h4>
                {section.stats.map((stat, j) => (
                  <div key={j} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: j < section.stats.length - 1 ? '1px solid #eee' : 'none', fontSize: '14px' }}>
                    <span style={{ color: '#666' }}>{stat.l}:</span>
                    <strong style={{ color: section.color, fontFamily: 'monospace' }}>{stat.v}</strong>
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
          <p style={{ color: '#666', fontSize: '15px' }}>Sube los archivos .docx de los informes semanales para ver el dashboard completo con las 9 áreas</p>
        </div>
      )}

      {/* Footer */}
      <footer style={{ maxWidth: '1400px', margin: '40px auto 0', padding: '24px 32px', textAlign: 'center', borderTop: '1px solid #E8E8E8' }}>
        <p style={{ fontSize: '13px', color: '#888' }}>DRAI Dashboard © 2025 • Facultad de Ingeniería • Universidad de Antioquia</p>
      </footer>
    </div>
  );
}
