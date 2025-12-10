import { useState } from 'react';
import * as mammoth from 'mammoth';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line
} from 'recharts';

// ============================================
// PARSER v4 - COMPLETO CON TODAS LAS 9 ÁREAS
// ============================================
const parseInformeDRAI = (htmlContent, weekNumber) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');
  const text = doc.body.textContent || '';
  
  // Helper: contar actividades (bullets/items) en una sección
  const countActivities = (sectionText) => {
    if (!sectionText) return 0;
    // Contar todos los bullets, no solo los que empiezan con mayúscula
    const matches = sectionText.match(/-\s+\S/g) || [];
    return matches.length;
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
  // 1. APOYO LOGÍSTICO Y VIDEOCONFERENCIA
  // ============================================
  
  // Logístico - contar actividades
  let actividadesLogistico = 0;
  const logisticoMatch = text.match(/Logístico\*?\*?([\s\S]*?)(?=Académico\*?\*?|Infraestructura\*?\*?|$)/i);
  if (logisticoMatch) {
    actividadesLogistico = countActivities(logisticoMatch[1]);
    console.log(`📋 Logístico (Semana ${weekNumber}): ${actividadesLogistico} actividades`);
  } else {
    console.warn(`⚠️ No se encontró sección Logístico en semana ${weekNumber}`);
  }

  // Académico - contar actividades
  let actividadesAcademico = 0;
  const academicoMatch = text.match(/Académico\*?\*?([\s\S]*?)(?=Infraestructura\*?\*?|Videoconferencia\*?\*?|$)/i);
  if (academicoMatch) {
    actividadesAcademico = countActivities(academicoMatch[1]);
    console.log(`🎓 Académico (Semana ${weekNumber}): ${actividadesAcademico} actividades`);
  } else {
    console.warn(`⚠️ No se encontró sección Académico en semana ${weekNumber}`);
  }

  // Infraestructura - contar actividades
  let actividadesInfraestructura = 0;
  const infraMatch = text.match(/(?:Infraestructura|Inf\s*raestructura)\*?\*?([\s\S]*?)(?=Videoconferencia\*?\*?|Video\s*conferencia|$)/i);
  if (infraMatch) {
    actividadesInfraestructura = countActivities(infraMatch[1]);
    console.log(`🏗️ Infraestructura (Semana ${weekNumber}): ${actividadesInfraestructura} actividades`);
  } else {
    console.warn(`⚠️ No se encontró sección Infraestructura en semana ${weekNumber}`);
  }

  // Videoconferencia métricas
  const videoconferencias = extractNumber(/asistencia a\s*(\d+)\s*videoconferencias/i);
  const streamings = extractNumber(/Se realizan?\s*(\d+)\s*transmisiones?\s*de\s*streaming/i);
  const grabaciones = extractNumber(/Se apoyan?\s*(\d+)\s*grabaciones/i);
  const solicitudesVideoconf = extractNumber(/Se reciben\s*(\d+)\s*solicitudes/i);
  const eventosExtension = extractNumber(/(\d+)\s*eventos?\s*en\s*la\s*sala\s*de\s*videoconferencia/i);

  // ============================================
  // 2. GESTIÓN DE SISTEMAS DE INFORMACIÓN
  // ============================================
  
  // Proyectos activos (detectar cuáles tienen contenido)
  const proyectosSistemas = {
    cancelacionSemestre: /Cancelación.*semestre/i.test(text) && !/Sin novedad/i.test(text.substring(text.indexOf('Cancelación'), text.indexOf('Cancelación') + 200)),
    praxisFacultad: /Praxis\s*Facultad/i.test(text) && !/Sin novedad/i.test(text.substring(text.indexOf('Praxis Facultad') || 0, (text.indexOf('Praxis Facultad') || 0) + 200)),
    praxisUniversidad: /Praxis\s*Universidad/i.test(text),
    portafolio: /Portafolio/i.test(text),
    concursoCGR: /Concurso.*CGR|CGR.*méritos/i.test(text),
    concursoMEN: /Concurso.*MEN|MEN.*concurso/i.test(text),
    aplicacionCAI: /Aplicación\s*CAI/i.test(text),
    jupiter: /Júpiter|Jupiter/i.test(text),
    salasInfo: /Salas\s*Info/i.test(text),
    sigac: /SIGAC/i.test(text),
    propuestas: /Propuestas/i.test(text)
  };
  
  const proyectosActivos = Object.values(proyectosSistemas).filter(Boolean).length;
  
  // HUs completadas
  const husCompletadas = (text.match(/Se completa.*HU-?\d+|HU-?\d+.*completa/gi) || []).length;
  const husIniciadas = (text.match(/Se inicia.*HU-?\d+|HU-?\d+.*inicia/gi) || []).length;

  // ============================================
  // 3. SOPORTE TELEMÁTICO
  // ============================================
  
  // Documentación y transferencia
  const tieneDocumentacion = /Documentación.*transferencia|empalme/i.test(text);
  
  // Soporte Técnico - instalaciones y mantenimientos
  const instalacionesSO = (text.match(/instalación de S\.O|instalación de.*W11|Se realiza instalación/gi) || []).length;
  const mantenimientos = (text.match(/mantenimiento correctivo|mantenimiento lógico/gi) || []).length;
  const configuracionesGuacamole = (text.match(/GUACAMOLE/gi) || []).length;
  const equiposConfigurados = instalacionesSO + mantenimientos;

  // Salas de Cómputo - métricas específicas
  const reservasPuntuales = extractNumber(/Reservas Puntuales[^:]*:\s*(\d+)/i);
  const activacionesLicencia = extractNumber(/Activación[^:]*Licencia[^:]*:\s*(\d+)/i);
  const atencionCorreo = extractNumber(/Atención[^:]*(?:Vía|Via)\s*Correo[^:]*:\s*(\d+)/i);
  const actualizacionSoftware = extractNumber(/Actualización Software[^:]*:\s*(\d+)/i);
  const aperturaAVI = extractNumber(/Apertura Y Cierre De AVI[^:]*:\s*(\d+)/i);
  const soporteTalentoTech = extractNumber(/Soporte A Talento Tech[^:]*:\s*(\d+)/i);
  const atencionPresencial = extractNumber(/Atención Presencial[^:]*:\s*(\d+)/i);
  const soporteRequerimientoSalas = extractNumber(/Soporte Requerimiento Salas[^:]*:\s*(\d+)/i);

  // Soporte Aplicativos
  const soporteSsofi = (text.match(/Soporte Ssofi|Ssofi/gi) || []).length;
  const soportePaysa = (text.match(/Paysa/gi) || []).length;

  // ============================================
  // 4. SOPORTE TÉCNICO Y ACADÉMICO INGENI@ - REGIONES
  // ============================================
  
  const soporteTelefonico = /Atención de llamadas/i.test(text);
  let soporteEmailFacultad = extractNumber(/Respuesta.*correos.*?-\s*(\d{1,3})\s/i) ||
                              extractNumber(/correos.*?(\d{1,2})\s*$/im) ||
                              (text.match(/Respuesta a diferentes cuentas de correos/i) ? 1 : 0);

  // Validar rango razonable para soporte email (máximo 200 por semana)
  if (soporteEmailFacultad > 200) {
    console.warn(`⚠️ Soporte email fuera de rango en semana ${weekNumber}: ${soporteEmailFacultad} → 0`);
    soporteEmailFacultad = 0;
  }

  console.log(`📞 Soporte Regiones (Semana ${weekNumber}): Email=${soporteEmailFacultad}`);
  
  // Detectar proyectos activos en esta área
  const proyectosRegiones = {
    talentoTechIU: /Talento\s*Tech.*IU\s*TRAINING/i.test(text),
    linkTechSapiencia: /LinkTech.*Sapiencia/i.test(text),
    procuraduria: /Procurad|Procuraduría/i.test(text),
    ingeniaCampus: /Ingeni@.*Campus|Campus.*Ingeni@/i.test(text)
  };

  // ============================================
  // 5. GESTIÓN DOCUMENTAL CENDOI
  // ============================================
  
  // Usuarios CENDOI
  let usuariosCENDOI = 0;
  const cendoiStart = text.indexOf('Gestión Documental CENDOI');
  const cendoiEnd = text.indexOf('Unidad de Gestión de Proyectos');
  
  if (cendoiStart > -1 && cendoiEnd > -1) {
    const cendoiText = text.substring(cendoiStart, cendoiEnd);
    const usuariosMatch = cendoiText.match(/(?:enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)\s+(\d{2,3})/i);
    if (usuariosMatch) usuariosCENDOI = parseInt(usuariosMatch[1]);
  }
  
  // Fallback
  if (!usuariosCENDOI || usuariosCENDOI > 1000) {
    const fallbackMatch = text.match(/diciembre\s+(\d{3})\s/i) || 
                          text.match(/noviembre\s+(\d{3})\s/i);
    if (fallbackMatch) usuariosCENDOI = parseInt(fallbackMatch[1]);
  }

  // Préstamos - múltiples patrones de búsqueda
  let libros = 0, pcs = 0, diademas = 0, mouse = 0;

  if (cendoiStart > -1 && cendoiEnd > -1) {
    const cendoiText = text.substring(cendoiStart, cendoiEnd);

    // Buscar en tabla: "número número número" (libros pcs diademas)
    const tablaMatch = cendoiText.match(/(\d{1,3})\s+(\d{1,3})\s+(\d{1,3})/);
    if (tablaMatch) {
      libros = parseInt(tablaMatch[1]);
      pcs = parseInt(tablaMatch[2]);
      diademas = parseInt(tablaMatch[3]);
      console.log(`📚 CENDOI Préstamos (Semana ${weekNumber} - tabla): Libros=${libros}, PCs=${pcs}, Diademas=${diademas}`);
    }

    // Fallback: buscar menciones específicas
    if (libros === 0) {
      const librosMatch = cendoiText.match(/libros?[:\s]+(\d+)/i) ||
                          cendoiText.match(/(\d+)\s+libros?/i);
      if (librosMatch) {
        libros = parseInt(librosMatch[1]);
        console.log(`📚 CENDOI Libros (Semana ${weekNumber} - texto): ${libros}`);
      }
    }

    if (pcs === 0) {
      const pcsMatch = cendoiText.match(/(?:PCs?|computador(?:es)?)[:\s]+(\d+)/i) ||
                       cendoiText.match(/(\d+)\s+(?:PCs?|computador(?:es)?)/i);
      if (pcsMatch) {
        pcs = parseInt(pcsMatch[1]);
        console.log(`💻 CENDOI PCs (Semana ${weekNumber} - texto): ${pcs}`);
      }
    }

    if (diademas === 0) {
      const diademasMatch = cendoiText.match(/diademas?[:\s]+(\d+)/i) ||
                            cendoiText.match(/(\d+)\s+diademas?/i);
      if (diademasMatch) {
        diademas = parseInt(diademasMatch[1]);
        console.log(`🎧 CENDOI Diademas (Semana ${weekNumber} - texto): ${diademas}`);
      }
    }

    if (libros === 0 && pcs === 0 && diademas === 0) {
      console.warn(`⚠️ No se encontraron préstamos CENDOI en semana ${weekNumber}`);
    }
  } else {
    console.warn(`⚠️ No se encontró sección CENDOI en semana ${weekNumber}`);
  }

  // Subactividades CENDOI
  const cendoiActividades = {
    usuariosAtendidos: usuariosCENDOI > 0,
    patrimonio: /Patrimonio/i.test(text),
    autoarchivo: /Autoarchivo/i.test(text),
    auxiliarSEA: /Auxiliar.*SEA/i.test(text)
  };

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

  // Métricas Ingeni@ - patrones más específicos para evitar capturar números grandes incorrectos
  const talentoTechMatriculas = extractNumber(/(?:matrículas?|estudiantes?).*Talento Tech[^\d]*(\d{1,4})/i) ||
                                extractNumber(/Talento Tech[^\d]{0,20}(\d{1,4})\s*(?:matrículas?|estudiantes?)/i);
  const pruebasInicio = extractNumber(/pruebas de inicio[^\d]{0,10}(\d{1,3})/i);
  const storiesRedes = extractNumber(/Stories.*redes.*sociales[^\d]{0,10}(\d{1,3})/i);
  const reportesHorasCatedra = extractNumber(/reportes de horas.*cátedra[^\d]{0,10}(\d{1,3})/i);
  const pqrsAtendidas = extractNumber(/(?:Respuesta|Atención).*PQRS[^\d]{0,10}(\d{1,3})/i) ||
                        extractNumber(/PQRS[^\d]{0,10}(\d{1,3})\s*(?:atendidas?|respondidas?)/i);
  const acompInterventoria = extractNumber(/Acompañamiento interventoría[^\d]{0,10}(\d{1,3})/i);

  // Validación de rangos razonables para evitar números absurdos
  const pqrsValidadas = pqrsAtendidas > 0 && pqrsAtendidas < 500 ? pqrsAtendidas : 0;
  const matriculasValidadas = talentoTechMatriculas > 0 && talentoTechMatriculas < 10000 ? talentoTechMatriculas : 0;

  if (pqrsAtendidas !== pqrsValidadas) {
    console.warn(`⚠️ PQRS fuera de rango en semana ${weekNumber}: ${pqrsAtendidas} → 0`);
  }
  if (talentoTechMatriculas !== matriculasValidadas) {
    console.warn(`⚠️ Matrículas fuera de rango en semana ${weekNumber}: ${talentoTechMatriculas} → 0`);
  }

  console.log(`📊 Ingeni@ (Semana ${weekNumber}): PQRS=${pqrsValidadas}, TalentoTech=${matriculasValidadas}, Stories=${storiesRedes}`);

  // ============================================
  // 8. PRODUCCIÓN
  // ============================================
  
  const produccionActividades = {
    facultad: /Producción[\s\S]*?Facultad/i.test(text),
    contraloria: /Producción[\s\S]*?Contraloría/i.test(text),
    especializacion: /Esp.*Analítica|Analítica.*datos/i.test(text),
    talentoTech: /Producción[\s\S]*?Talent/i.test(text)
  };

  const disenosRealizados = (text.match(/[Dd]iseño de|[Dd]iseño y/g) || []).length;
  const diagramaciones = (text.match(/diagramación/gi) || []).length;
  const transmisiones = (text.match(/[Tt]ransmisión/g) || []).length;
  const grabacionesProduccion = (text.match(/[Gg]rabación de/g) || []).length;

  // ============================================
  // 9. GESTIÓN ADMINISTRATIVA
  // ============================================
  
  const adminActividades = {
    contratacion: /Contratación/i.test(text),
    compras: /Compras/i.test(text),
    transferencias: /Transferencia/i.test(text),
    sea: /SEA/i.test(text),
    varios: /Varios/i.test(text)
  };

  const comprasGestionadas = (text.match(/[Ss]olicitud de [Cc]ompra|[Ss]olicitud [Cc]ompra/g) || []).length;
  const contrataciones = (text.match(/[Ee]xoneración|[Cc]reación [Tt]erceros|contratos? (?:cátedra|firmados?)/gi) || []).length;
  const transferencias = (text.match(/[Ss]olicitud.*[Tt]ransferencia|[Tt]ransferencia para/gi) || []).length;
  const avalesPago = (text.match(/[Aa]val para pago|AVAL PARA PAGO/g) || []).length;
  const liberacionPlazas = (text.match(/[Ll]iberación [Pp]laza/g) || []).length;

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
          nombre: 'Videoconferencia', 
          valor: videoconferencias,
          detalles: { streamings, grabaciones, solicitudesVideoconf, eventosExtension }
        }
      },
      totales: { videoconferencias, streamings, grabaciones, solicitudesVideoconf }
    },

    // 2. Gestión de Sistemas de Información
    area2: {
      nombre: 'Gestión de Sistemas de Información',
      subactividades: {
        cancelacionSemestre: { nombre: 'Cancelación de Semestre', activo: proyectosSistemas.cancelacionSemestre },
        praxisFacultad: { nombre: 'Praxis Facultad', activo: proyectosSistemas.praxisFacultad },
        praxisUniversidad: { nombre: 'Praxis Universidad', activo: proyectosSistemas.praxisUniversidad },
        portafolio: { nombre: 'Portafolio Cambio de Imagen', activo: proyectosSistemas.portafolio },
        concursoCGR: { nombre: 'Concurso de méritos CGR', activo: proyectosSistemas.concursoCGR },
        concursoMEN: { nombre: 'Concurso MEN', activo: proyectosSistemas.concursoMEN },
        aplicacionCAI: { nombre: 'Aplicación CAI', activo: proyectosSistemas.aplicacionCAI },
        propuestas: { nombre: 'Propuestas', activo: proyectosSistemas.propuestas },
        jupiter: { nombre: 'Júpiter', activo: proyectosSistemas.jupiter },
        salasInfo: { nombre: 'Salas Info', activo: proyectosSistemas.salasInfo },
        sigac: { nombre: 'SIGAC+', activo: proyectosSistemas.sigac }
      },
      totales: { proyectosActivos, husCompletadas, husIniciadas }
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
      nombre: 'Soporte Técnico y Académico Ingeni@ - Comunicaciones Regiones',
      subactividades: {
        soporteTelefonico: { nombre: 'Soporte telefónico', activo: soporteTelefonico },
        soporteEmailFacultad: { nombre: 'Soporte email-Facultad', valor: soporteEmailFacultad },
        facultadIngenieria: { nombre: 'Facultad de Ingeniería-Ingeni@', activo: true },
        facultadMoodle: { nombre: 'Facultad de Ingeniería-Moodle', activo: true },
        facultadZoom: { nombre: 'Facultad de Ingeniería-ZOOM', activo: true },
        talentoTechIU: { nombre: 'Talento Tech- IU TRAINING', activo: proyectosRegiones.talentoTechIU },
        linkTechSapiencia: { nombre: 'LinkTech-Sapiencia', activo: proyectosRegiones.linkTechSapiencia },
        procuraduria: { nombre: 'Proyecto Procuraduría', activo: proyectosRegiones.procuraduria }
      },
      totales: { soporteEmailFacultad }
    },

    // 5. Gestión Documental CENDOI
    area5: {
      nombre: 'Gestión Documental CENDOI',
      subactividades: {
        usuariosAtendidos: { nombre: 'A. Usuarios Atendidos', valor: usuariosCENDOI },
        patrimonio: { nombre: 'C. Patrimonio', activo: cendoiActividades.patrimonio },
        autoarchivo: { nombre: 'D. Autoarchivo', activo: cendoiActividades.autoarchivo },
        auxiliarSEA: { nombre: 'F. Auxiliar SEA', activo: cendoiActividades.auxiliarSEA }
      },
      totales: { usuariosCENDOI, libros, pcs, diademas }
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
      totales: { talentoTechMatriculas: matriculasValidadas, pruebasInicio, storiesRedes, reportesHorasCatedra, pqrsAtendidas: pqrsValidadas, acompInterventoria }
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
        sea: { nombre: 'SEA', valor: liberacionPlazas },
        varios: { nombre: 'Varios', valor: avalesPago }
      },
      totales: { comprasGestionadas, contrataciones, transferencias, avalesPago, liberacionPlazas }
    },

    // Métricas legacy para compatibilidad
    videoconferencias,
    streamings,
    grabaciones,
    solicitudesVideoconf,
    proyectosActivos,
    equiposConfigurados,
    reservasPuntuales,
    activacionesLicencia,
    atencionCorreo,
    usuariosCENDOI,
    libros,
    pcs,
    diademas,
    reunionesUGP,
    talentoTechMatriculas: matriculasValidadas,
    pqrsAtendidas: pqrsValidadas,
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
    { icon: '🎥', label: 'Videoconferencias', value: data.videoconferencias, color: COLORS.primary },
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
      logistico: inf.area1?.subactividades?.logistico?.valor || 0,
      academico: inf.area1?.subactividades?.academico?.valor || 0,
      infraestructura: inf.area1?.subactividades?.infraestructura?.valor || 0,
      videoconferencias: inf.videoconferencias || 0,
      usuarios: Math.round((inf.usuariosCENDOI || 0) / 10),
      soporte: inf.equiposConfigurados || 0,
      proyectos: inf.proyectosActivos || 0,
      reuniones: inf.reunionesUGP || 0,
      diseños: inf.disenosRealizados || 0,
      compras: inf.comprasGestionadas || 0,
      contrataciones: inf.contrataciones || 0
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
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 32px 32px' }}>
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
              { icon: '📋', value: informes.reduce((s, i) => s + (i.area1?.subactividades?.logistico?.valor || 0), 0), label: 'Act. Logístico', color: '#1B5E20' },
              { icon: '🎓', value: informes.reduce((s, i) => s + (i.area1?.subactividades?.academico?.valor || 0), 0), label: 'Act. Académico', color: '#2E7D32' },
              { icon: '🏗️', value: informes.reduce((s, i) => s + (i.area1?.subactividades?.infraestructura?.valor || 0), 0), label: 'Act. Infraestructura', color: '#4CAF50' },
              { icon: '🎥', value: informes.reduce((s, i) => s + i.videoconferencias, 0), label: 'Total Videoconferencias', color: COLORS.primary },
              { icon: '👥', value: informes.reduce((s, i) => s + i.usuariosCENDOI, 0).toLocaleString(), label: 'Usuarios CENDOI', color: COLORS.purple },
              { icon: '💻', value: informes.reduce((s, i) => s + i.equiposConfigurados, 0), label: 'Equipos Configurados', color: COLORS.blue },
              { icon: '🎯', value: informes.reduce((s, i) => s + i.talentoTechMatriculas, 0), label: 'Talento Tech', color: COLORS.pink },
              { icon: '🛒', value: informes.reduce((s, i) => s + i.comprasGestionadas, 0), label: 'Compras Gestionadas', color: COLORS.orange },
              { icon: '📝', value: informes.reduce((s, i) => s + i.contrataciones, 0), label: 'Contrataciones', color: COLORS.indigo }
            ].map((item, i) => (
              <div key={i} style={{
                background: `linear-gradient(135deg, ${item.color || COLORS.primary}, ${item.color || COLORS.accent})`,
                borderRadius: '16px',
                padding: '24px',
                textAlign: 'center',
                color: 'white',
                boxShadow: '0 4px 16px rgba(27,94,32,0.3)'
              }}>
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
                { l: 'Total actividades Logístico', v: informes.reduce((s, i) => s + (i.area1?.subactividades?.logistico?.valor || 0), 0) },
                { l: 'Total actividades Académico', v: informes.reduce((s, i) => s + (i.area1?.subactividades?.academico?.valor || 0), 0) },
                { l: 'Total actividades Infraestructura', v: informes.reduce((s, i) => s + (i.area1?.subactividades?.infraestructura?.valor || 0), 0) },
                { l: 'Total videoconferencias', v: informes.reduce((s, i) => s + (i.videoconferencias || 0), 0) },
                { l: 'Total streamings', v: informes.reduce((s, i) => s + (i.streamings || 0), 0) },
                { l: 'Total grabaciones', v: informes.reduce((s, i) => s + (i.grabaciones || 0), 0) }
              ]},
              { title: '💻 2. Gestión de Sistemas de Información', icon: AREA_ICONS[1], color: AREA_COLORS[1], stats: [
                { l: 'Total proyectos activos', v: informes.reduce((s, i) => s + (i.proyectosActivos || 0), 0) },
                { l: 'Total HUs completadas', v: informes.reduce((s, i) => s + (i.area2?.totales?.husCompletadas || 0), 0) },
                { l: 'Total HUs iniciadas', v: informes.reduce((s, i) => s + (i.area2?.totales?.husIniciadas || 0), 0) },
                { l: 'Promedio proyectos/semana', v: Math.round(informes.reduce((s, i) => s + (i.proyectosActivos || 0), 0) / informes.length) }
              ]},
              { title: '🔧 3. Soporte Telemático', icon: AREA_ICONS[2], color: AREA_COLORS[2], stats: [
                { l: 'Total equipos configurados', v: informes.reduce((s, i) => s + (i.equiposConfigurados || 0), 0) },
                { l: 'Total reservas puntuales', v: informes.reduce((s, i) => s + (i.reservasPuntuales || 0), 0) },
                { l: 'Total activaciones licencia', v: informes.reduce((s, i) => s + (i.activacionesLicencia || 0), 0) },
                { l: 'Total atención correo', v: informes.reduce((s, i) => s + (i.atencionCorreo || 0), 0) },
                { l: 'Total actualización software', v: informes.reduce((s, i) => s + (i.area3?.subactividades?.salasComputo?.detalles?.actualizacionSoftware || 0), 0) },
                { l: 'Total atención presencial', v: informes.reduce((s, i) => s + (i.area3?.subactividades?.salasComputo?.detalles?.atencionPresencial || 0), 0) }
              ]},
              { title: '📞 4. Soporte Técnico Ingeni@ - Regiones', icon: AREA_ICONS[3], color: AREA_COLORS[3], stats: [
                { l: 'Total soporte email', v: informes.reduce((s, i) => s + (i.area4?.totales?.soporteEmailFacultad || 0), 0) },
                { l: 'Semanas con soporte telefónico', v: informes.filter(i => i.area4?.subactividades?.soporteTelefonico?.activo).length },
                { l: 'Semanas con Talento Tech', v: informes.filter(i => i.area4?.subactividades?.talentoTechIU?.activo).length },
                { l: 'Promedio soporte/semana', v: Math.round(informes.reduce((s, i) => s + (i.area4?.totales?.soporteEmailFacultad || 0), 0) / informes.length) }
              ]},
              { title: '📚 5. Gestión Documental CENDOI', icon: AREA_ICONS[4], color: AREA_COLORS[4], stats: [
                { l: 'Total usuarios atendidos', v: informes.reduce((s, i) => s + (i.usuariosCENDOI || 0), 0).toLocaleString() },
                { l: 'Total préstamos libros', v: informes.reduce((s, i) => s + (i.libros || 0), 0) },
                { l: 'Total préstamos PCs', v: informes.reduce((s, i) => s + (i.pcs || 0), 0) },
                { l: 'Promedio usuarios/semana', v: Math.round(informes.reduce((s, i) => s + (i.usuariosCENDOI || 0), 0) / informes.length) }
              ]},
              { title: '📋 6. Unidad de Gestión de Proyectos', icon: AREA_ICONS[5], color: AREA_COLORS[5], stats: [
                { l: 'Total reuniones', v: informes.reduce((s, i) => s + (i.reunionesUGP || 0), 0) },
                { l: 'Total capacitaciones', v: informes.reduce((s, i) => s + (i.area6?.totales?.capacitacionesUGP || 0), 0) },
                { l: 'Semanas con Plan de Acción', v: informes.filter(i => i.area6?.subactividades?.planAccion?.activo).length },
                { l: 'Promedio reuniones/semana', v: Math.round(informes.reduce((s, i) => s + (i.reunionesUGP || 0), 0) / informes.length) }
              ]},
              { title: '🎓 7. Ingeni@', icon: AREA_ICONS[6], color: AREA_COLORS[6], stats: [
                { l: 'Total Talento Tech matrículas', v: informes.reduce((s, i) => s + (i.talentoTechMatriculas || 0), 0) },
                { l: 'Total PQRS atendidas', v: informes.reduce((s, i) => s + (i.pqrsAtendidas || 0), 0) },
                { l: 'Total stories redes sociales', v: informes.reduce((s, i) => s + (i.area7?.totales?.storiesRedes || 0), 0) },
                { l: 'Semanas administrativo activo', v: informes.filter(i => i.area7?.subactividades?.administrativo?.activo).length }
              ]},
              { title: '🎨 8. Producción', icon: AREA_ICONS[7], color: AREA_COLORS[7], stats: [
                { l: 'Total diseños realizados', v: informes.reduce((s, i) => s + (i.disenosRealizados || 0), 0) },
                { l: 'Total diagramaciones', v: informes.reduce((s, i) => s + (i.area8?.totales?.diagramaciones || 0), 0) },
                { l: 'Total transmisiones', v: informes.reduce((s, i) => s + (i.area8?.totales?.transmisiones || 0), 0) },
                { l: 'Total grabaciones', v: informes.reduce((s, i) => s + (i.area8?.totales?.grabacionesProduccion || 0), 0) }
              ]},
              { title: '📁 9. Gestión Administrativa', icon: AREA_ICONS[8], color: AREA_COLORS[8], stats: [
                { l: 'Total compras gestionadas', v: informes.reduce((s, i) => s + (i.comprasGestionadas || 0), 0) },
                { l: 'Total contrataciones', v: informes.reduce((s, i) => s + (i.contrataciones || 0), 0) },
                { l: 'Total transferencias', v: informes.reduce((s, i) => s + (i.transferencias || 0), 0) },
                { l: 'Total avales pago', v: informes.reduce((s, i) => s + (i.area9?.totales?.avalesPago || 0), 0) }
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
