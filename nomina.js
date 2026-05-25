//  MÓDULO NÓMINA

// Convierte número serial de Excel a fecha legible (ej: 46054 → "15/01/2024")
function excelFechaToStr(val) {
    if (!val && val !== 0) return '—';
    // Si ya es string con formato fecha, devolverlo limpio
    if (typeof val === 'string' && val.match(/\d{4}-\d{2}-\d{2}/)) {
        const [y,m,d] = val.split('-');
        return `${d}/${m}/${y}`;
    }
    if (typeof val === 'string' && val.match(/\d{1,2}\/\d{1,2}\/\d{4}/)) return val;
    // Si es objeto Date (openpyxl lo convierte)
    if (val instanceof Date) {
        return val.toLocaleDateString('es-CO');
    }
    // Si es número serial de Excel
    const n = parseFloat(val);
    if (!isNaN(n) && n > 40000 && n < 60000) {
        // Excel serial: días desde 1900-01-01 (con bug de año bisiesto 1900)
        const msPerDay = 86400000;
        const excelEpoch = new Date(1899, 11, 30).getTime();
        const date = new Date(excelEpoch + n * msPerDay);
        if (!isNaN(date.getTime())) {
            const d = String(date.getDate()).padStart(2,'0');
            const m = String(date.getMonth()+1).padStart(2,'0');
            const y = date.getFullYear();
            return `${d}/${m}/${y}`;
        }
    }
    return String(val);
}
// ══════════════════════════════════════════════════════════════════
const NOMINA_KEY = 'datos_nomina_usd';

function procesarNomina(input) {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
        const MESES_NOM = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
        // Convertir serial Excel → "NombreMes Año" (ej: 46143 → "Enero 2026")
        function serialToMesAnio(n) {
            const msPerDay = 86400000;
            const excelEpoch = new Date(Date.UTC(1899, 11, 30)).getTime();
            const date = new Date(excelEpoch + n * msPerDay);
            if (isNaN(date.getTime())) return String(n);
            return `${MESES_NOM[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
        }
        // Helper: convierte cualquier valor de fecha/periodo a texto legible
        function normalizarPeriodo(val) {
            if (!val && val !== 0) return '';
            // Ya es string con nombre de mes → normalizar capitalización y devolver
            if (typeof val === 'string') {
                const trimmed = val.trim();
                const found = MESES_NOM.find(m => trimmed.toLowerCase().includes(m.toLowerCase()));
                if (found) return trimmed.replace(new RegExp(found, 'gi'), found);
                // String tipo ISO date: "2026-05-01T00:00:00.000Z" o "2026-05-01"
                const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
                if (isoMatch) {
                    const anio = parseInt(isoMatch[1]);
                    const mesIdx = parseInt(isoMatch[2]) - 1;
                    if (mesIdx >= 0 && mesIdx <= 11) return `${MESES_NOM[mesIdx]} ${anio}`;
                }
            }
            // Es objeto Date (SheetJS con cellDates)
            if (val instanceof Date && !isNaN(val.getTime())) {
                return `${MESES_NOM[val.getMonth()]} ${val.getFullYear()}`;
            }
            // Es número serial de Excel (rango fechas reales 2010-2035)
            const n = parseFloat(val);
            if (!isNaN(n) && n > 40000 && n < 62000) return serialToMesAnio(n);
            return String(val);
        }
        const wb = XLSX.read(new Uint8Array(ev.target.result), { type: 'array', cellDates: true });
        // Buscar hoja Nómina por nombre, si no existe usar la primera
        const _sheetNomina = wb.SheetNames.find(n => n.toLowerCase().replace(/[^a-z]/g,'').includes('nomina')) || wb.SheetNames[0];
        const wb2 = XLSX.read(new Uint8Array(ev.target.result), { type: 'array', cellDates: false });
        const raw = XLSX.utils.sheet_to_json(wb2.Sheets[wb2.SheetNames.find(n => n.toLowerCase().replace(/[^a-z]/g,'').includes('nomina')) || wb2.SheetNames[0]], { defval: '' });
        // Normalizar claves + convertir campos de periodo/fecha a texto
        const CAMPOS_PERIODO = ['periodo','período','mes','period'];
        const CAMPOS_PAGADO  = ['pagado','estado_pago','pago','payment_status','estado pago','paid'];
        const datos = raw.map(r => {
            const norm = {};
            Object.keys(r).forEach(k => {
                const clave = k.toLowerCase().trim().replace(/\s+/g, '_');
                let val = r[k];
                // Si la clave es de periodo, convertir a texto de mes
                if (CAMPOS_PERIODO.includes(clave)) {
                    val = normalizarPeriodo(val);
                }
                // Normalizar campo pagado: aceptar variantes en español e inglés
                if (CAMPOS_PAGADO.includes(clave) && val !== undefined && val !== null) {
                    const v = String(val).toLowerCase().trim();
                    if (['pagado','si','sí','yes','1','true'].includes(v))       val = 'Pagado';
                    else if (['pendiente','no','0','false',''].includes(v))      val = 'Pendiente';
                    else                                                          val = String(val);
                    // siempre guardar bajo la clave 'pagado'
                    norm['pagado'] = val;
                }
                // Si es fecha_ingreso y viene como Date, convertir a DD/MM/YYYY
                if (clave === 'fecha_ingreso' && val instanceof Date) {
                    const d = String(val.getDate()).padStart(2,'0');
                    const m = String(val.getMonth()+1).padStart(2,'0');
                    val = `${d}/${m}/${val.getFullYear()}`;
                }
                norm[clave] = val;
            });
            return norm;
        });
        localStorage.setItem(NOMINA_KEY, JSON.stringify(datos));
        if (window._fbGuardar) {
            try { window._fbGuardar(NOMINA_KEY, datos); } catch(e) {}
        }
        renderNomina();
        toast('Nómina cargada correctamente.', 'success');
    };
    reader.readAsArrayBuffer(file);
}

function renderNomina() {
    const cont = document.getElementById('nominaContenido');
    if (!cont) return;

    const raw = localStorage.getItem(NOMINA_KEY);
    if (!raw) {
        if (userLogueado && userLogueado.rol === 'asesor') {
            cont.innerHTML = '<div style="text-align:center;padding:40px 20px;"><div style="font-size:40px;margin-bottom:12px;">💵</div><p style="color:var(--textMuted);font-size:14px;">Tu información de nómina aún no ha sido cargada.<br>Consulta con tu administrador.</p></div>';
        } else {
            cont.innerHTML = '<p style="color:var(--textMuted);text-align:center;padding:30px;">Carga el archivo Excel de nómina para ver los datos.</p>';
        }
        return;
    }

    let datos = [];
    try {
        const parsed = JSON.parse(raw);
        // Firebase convierte arrays a objetos indexados {0:{...},1:{...}} — reconvertir
        if (Array.isArray(parsed)) {
            datos = parsed;
        } else if (parsed && typeof parsed === 'object') {
            datos = Object.values(parsed);
        }
    } catch(e) { return; }
    if (!datos.length) {
        cont.innerHTML = '<p style="color:var(--textMuted);text-align:center;padding:30px;">El archivo de nómina está vacío.</p>';
        return;
    }

    // ── Normalizar claves SIEMPRE al leer: soporta datos viejos y nuevos ──
    const _MESES_NOM = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
    function _serialToMesAnio(n) {
        const d = new Date(new Date(Date.UTC(1899,11,30)).getTime() + n * 86400000);
        return isNaN(d.getTime()) ? String(n) : `${_MESES_NOM[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
    }
    function _normPeriodo(val) {
        if (!val && val !== 0) return '';
        if (typeof val === 'string') {
            const trimmed = val.trim();
            const found = _MESES_NOM.find(m => trimmed.toLowerCase().includes(m.toLowerCase()));
            if (found) return trimmed.replace(new RegExp(found, 'gi'), found);
            // String tipo ISO date: "2026-05-01T00:00:00.000Z" o "2026-05-01"
            const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
            if (isoMatch) {
                const anio = parseInt(isoMatch[1]);
                const mesIdx = parseInt(isoMatch[2]) - 1;
                if (mesIdx >= 0 && mesIdx <= 11) return `${_MESES_NOM[mesIdx]} ${anio}`;
            }
        }
        if (val instanceof Date && !isNaN(val.getTime())) return `${_MESES_NOM[val.getMonth()]} ${val.getFullYear()}`;
        const n = parseFloat(val);
        if (!isNaN(n) && n > 40000 && n < 62000) return _serialToMesAnio(n);
        return String(val);
    }
    const _CAMPOS_PER = ['periodo','período','mes','period'];
    datos = datos.map(r => {
        const norm = {};
        Object.keys(r).forEach(k => {
            const clave = k.toLowerCase().trim().replace(/\s+/g, '_');
            let val = r[k];
            if (_CAMPOS_PER.includes(clave)) val = _normPeriodo(val);
            if (norm[clave] === undefined || norm[clave] === '') norm[clave] = val;
            else if (norm[clave] !== undefined) norm[clave] = val || norm[clave];
        });
        return norm;
    });

    // Filtrar por jornada si es supervisor1/supervisor2
    datos = filtrarPorJornada(datos, 'jornada');

    // NOTA: el filtro de quincena para supervisores se hace en el bloque de vista supervisor
    // con botones interactivos (Q1 / Q2), por eso no se pre-filtra aquí.

    // Filtrar por usuario si es asesor — búsqueda flexible por login, nombre o documento
    let filas = datos;
    if (userLogueado && userLogueado.rol === 'asesor') {
        const miLogin    = (userLogueado.usuario || '').toLowerCase().trim();
        const miNombre   = (userLogueado.nombre  || '').toLowerCase().trim();
        const miDoc      = (userLogueado.documento || userLogueado.cedula || '').toString().trim();

        // Normaliza un string: quita tildes, espacios múltiples y pasa a minúsculas
        function _norm(s) {
            return (s || '').toString().toLowerCase().trim()
                .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                .replace(/\s+/g, ' ');
        }

        filas = datos.filter(r => {
            // Todas las claves ya están normalizadas a minúsculas con _ gracias a procesarNomina/procesarExcel
            const rLogin  = _norm(r['login'] || r['usuario'] || '');
            const rNombre = _norm(r['nombres'] || r['nombre'] || '');
            const rDoc    = (r['documento'] || r['cedula'] || '').toString().trim();

            // 1) Por login exacto
            if (rLogin && rLogin === _norm(miLogin)) return true;
            // 2) Login construido como nombre.apellido desde el nombre completo del Excel
            const loginDesdeNombre = rNombre.replace(/\s+/g, '.');
            if (loginDesdeNombre && loginDesdeNombre === _norm(miLogin)) return true;
            // 3) Nombre completo normalizado: al menos 2 palabras deben coincidir
            if (rNombre && _norm(miNombre)) {
                const palabrasAsesor = _norm(miNombre).split(' ').filter(p => p.length > 2);
                const palabrasExcel  = rNombre.split(' ').filter(p => p.length > 2);
                const coincidencias  = palabrasAsesor.filter(p => palabrasExcel.includes(p));
                if (coincidencias.length >= 2) return true;
                if (palabrasAsesor.length > 0 && palabrasExcel.length > 0 && _norm(miNombre).includes(rNombre)) return true;
            }
            // 4) Por número de documento como respaldo
            if (miDoc && rDoc && rDoc === miDoc) return true;
            return false;
        });

        if (!filas.length) {
            cont.innerHTML = '<p style="color:var(--textMuted);text-align:center;padding:30px;">No se encontraron datos de nómina para tu usuario.<br><small style="font-size:11px;opacity:0.7;">Verifica que el Excel tenga tu nombre completo, login (<strong>' + miLogin + '</strong>) o documento en las columnas correctas.</small></p>';
            return;
        }
    }

    const cols = [
        { key: 'documento',         label: '🪪 Documento'          },
        { key: 'nombres',           label: '👤 Nombres'            },
        { key: 'jornada',           label: '🕐 Jornada'            },
        { key: 'fecha_ingreso',     label: '📅 Fecha Ingreso'      },
        { key: 'grupo',             label: '👥 Grupo'              },
        { key: 'adelantos',         label: '💳 Adelanto del 20'    },
        { key: 'bono_semanal',      label: '📆 Bono Semanal'       },
        { key: 'bono_mensual',      label: '📅 Bono Mensual'       },
        { key: 'bono_adicional',    label: '🎁 Bono Adicional'     },
        { key: 'salario_basico',    label: '💼 Salario Básico'     },
        { key: 'salario_puntos',    label: '⭐ Salario Puntos'     },
        { key: '_saldo_neto',       label: '✅ Saldo a Pagar'      },
        { key: '_estado',           label: '📌 Estado'             },
        { key: '_pagado',           label: '💰 Pagado'             },
    ];
    // Columnas extendidas (con Otras Deducciones para tabla admin)
    const colsExt = [
        { key: 'documento',         label: '🪪 Documento'          },
        { key: 'nombres',           label: '👤 Nombres'            },
        { key: 'jornada',           label: '🕐 Jornada'            },
        { key: 'fecha_ingreso',     label: '📅 Fecha Ingreso'      },
        { key: 'grupo',             label: '👥 Grupo'              },
        { key: 'adelantos',         label: '💳 Adelanto del 20'    },
        { key: 'otras_deducciones', label: '➖ Otras Deducciones'  },
        { key: 'bono_semanal',      label: '📆 Bono Semanal'       },
        { key: 'bono_mensual',      label: '📅 Bono Mensual'       },
        { key: 'bono_adicional',    label: '🎁 Bono Adicional'     },
        { key: 'salario_basico',    label: '💼 Salario Básico'     },
        { key: 'salario_puntos',    label: '⭐ Salario Puntos'     },
        { key: '_saldo_neto',       label: '✅ Saldo a Pagar'      },
        { key: '_estado',           label: '📌 Estado'             },
        { key: '_pagado',           label: '💰 Pagado'             },
    ];

    // Función para formatear valores numéricos
    function fmt(val) {
        const n = parseFloat(String(val).replace(/[^0-9.-]/g, ''));
        if (isNaN(n) || val === '') return val || '—';
        return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);
    }
    const moneyCols = ['adelantos','otras_deducciones','bono_semanal','bono_mensual','bono_adicional','salario_basico','salario_puntos'];

    // Header de tabla extendida
    const headerColsExt = colsExt.map(c => {
        const isNeto  = c.key === '_saldo_neto';
        const isAdel  = c.key === 'adelantos';
        const isOtras = c.key === 'otras_deducciones';
        const style   = isNeto ? 'color:#27ae60;' : isAdel ? 'color:#3498db;' : isOtras ? 'color:#e74c3c;' : '';
        return `<th style="${style}">${c.label}</th>`;
    }).join('');

    // Para asesor: mostrar tarjetas (una por fila / período)
    if (userLogueado && userLogueado.rol === 'asesor') {
        const platCfg = getPlatConfig(userLogueado.plataforma || '');
        const color = platCfg.color || 'var(--accent)';
        const foto = userLogueado.foto || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png';

        cont.innerHTML = filas.map(r => {
            // Helper: leer campo con múltiples variantes de nombre (ya normalizadas a minúsculas con _)
            const campo = (...keys) => { for (const k of keys) { if (r[k] !== undefined && r[k] !== '') return r[k]; } return ''; };

            const nombre  = campo('nombres','nombre') || aNombrePropio(userLogueado.nombre);
            const jornada = (campo('jornada') || userLogueado.jornada || '').toUpperCase();
            const grupo   = campo('grupo') || userLogueado.grupo || '';
            const jColor  = {'TARDE':'#3498db','MAÑANA':'#27ae60','MADRUGADA':'#9b59b6','ÚNICA':'#e67e22','MADRUGADA':'#e74c3c'}[jornada] || '#888';
            const jIcon   = {'TARDE':'🌆','MAÑANA':'🌅','MADRUGADA':'🌙','ÚNICA':'⭐','MADRUGADA':'🌃'}[jornada] || '🕐';
            // Salario a pagar: el mayor entre salario_puntos y salario_basico (o salario_a_pagar si no hay los otros)
            const _sBasico = parseFloat(String(campo('salario_basico','salario basico','salario_básico')||'0').replace(/[^0-9.-]/g,'')) || 0;
            const _sPuntos = parseFloat(String(campo('salario_puntos','salario puntos')||'0').replace(/[^0-9.-]/g,'')) || 0;
            const _sAPagar = parseFloat(String(campo('salario_a_pagar','salario a pagar')||'0').replace(/[^0-9.-]/g,'')) || 0;
            const salario = (_sBasico > 0 || _sPuntos > 0) ? Math.max(_sBasico, _sPuntos) : _sAPagar;
            const _sAdelanto = parseFloat(String(campo('adelantos','Adelantos')||'0').replace(/[^0-9.-]/g,'')) || 0;
            const _sOtras  = parseFloat(String(campo('otras_deducciones','otras deducciones','otras')||'0').replace(/[^0-9.-]/g,'')) || 0;
            const saldoNeto = salario - _sAdelanto - _sOtras;
            const moneyFields = [
                { label: '💳 Adelantos',      val: campo('adelantos') },
                { label: '➖ Otras deduc.', val: campo('otras_deducciones','otras deducciones','otras') },
                { label: '📆 Bono Semanal',   val: campo('bono_semanal','bono semanal') },
                { label: '📅 Bono Mensual',   val: campo('bono_mensual','bono mensual') },
                { label: '🎁 Bono Adicional', val: campo('bono_adicional','bono adicional') },
                { label: '💼 Salario Básico', val: campo('salario_basico','salario basico','salario_básico') },
                { label: '⭐ Salario Puntos', val: campo('salario_puntos','salario puntos') },
            ];
            const fieldsHTML = moneyFields.map(f => `
                <div style="background:rgba(255,255,255,0.03);padding:14px;border-radius:12px;border:1px solid rgba(255,255,255,0.07);">
                    <div style="font-size:10px;color:${color};text-transform:uppercase;font-weight:800;letter-spacing:1px;margin-bottom:6px;">${f.label}</div>
                    <div style="font-size:14px;font-weight:700;color:#fff;">${fmt(f.val)}</div>
                </div>`).join('');
            return `
            <div style="max-width:560px;margin:0 auto 20px;">
                <div style="background:var(--panelBg);border-radius:18px;border:1px solid rgba(255,255,255,0.1);overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.25);">
                    <!-- Header estilo tarjeta asistencia/puntos -->
                    <div style="background:linear-gradient(135deg,${color}20,${color}42);border-bottom:3px solid ${color};padding:20px 22px;display:flex;align-items:center;gap:14px;">
                        <img src="${foto}" onerror="this.src='https://cdn-icons-png.flaticon.com/512/3135/3135715.png'" style="width:58px;height:58px;border-radius:50%;object-fit:cover;border:3px solid ${color};flex-shrink:0;">
                        <div style="flex:1;">
                            <div style="font-size:16px;font-weight:900;">${aNombrePropio(nombre)}</div>
                            <div style="display:flex;gap:5px;margin-top:5px;flex-wrap:wrap;">
                                ${jornada ? `<span style="background:${jColor}22;color:${jColor};border:1px solid ${jColor}55;border-radius:10px;padding:2px 9px;font-size:10px;font-weight:700;">${jIcon} ${jornada}</span>` : ''}
                                ${grupo   ? `<span style="background:rgba(255,255,255,0.07);color:var(--textMuted);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:2px 9px;font-size:10px;font-weight:700;">👥 ${grupo}</span>` : ''}
                            </div>
                        </div>
                    </div>
                    <!-- Salario a pagar destacado -->
                    <div style="padding:18px 22px;text-align:center;border-bottom:1px solid rgba(255,255,255,0.07);">
                        <div style="font-size:11px;color:var(--textMuted);text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">✅ Saldo a Pagar</div>
                        <div style="font-size:52px;font-weight:900;color:${color};line-height:1;">${fmt(saldoNeto)}</div>
                    </div>
                    <!-- Grid de conceptos -->
                    <div style="padding:18px 22px;">
                        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;">${fieldsHTML}</div>
                    </div>
                    <!-- Datos extra -->
                    <div style="padding:0 22px 18px;display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;">
                        ${campo('documento','cedula') ? `<div style="background:rgba(255,255,255,0.03);padding:14px;border-radius:12px;border:1px solid rgba(255,255,255,0.07);"><div style="font-size:10px;color:${color};text-transform:uppercase;font-weight:800;letter-spacing:1px;margin-bottom:6px;">🪪 Documento</div><div style="font-size:14px;font-weight:700;">${campo('documento','cedula')}</div></div>` : ''}
                        ${campo('fecha_ingreso','fecha ingreso') ? `<div style="background:rgba(255,255,255,0.03);padding:14px;border-radius:12px;border:1px solid rgba(255,255,255,0.07);"><div style="font-size:10px;color:${color};text-transform:uppercase;font-weight:800;letter-spacing:1px;margin-bottom:6px;">📅 Fecha Ingreso</div><div style="font-size:14px;font-weight:700;">${excelFechaToStr(campo('fecha_ingreso','fecha ingreso'))}</div></div>` : ''}
                    </div>
                </div>
            </div>`;
        }).join('');
        return;
    }

    // ── SUPERVISOR: solo lista de asesores + botones filtro mes / Q ──────────
    const _esSupervisor = userLogueado && (userLogueado.rol === 'supervisor1' || userLogueado.rol === 'supervisor2');
    if (_esSupervisor) {
        const _qSup = userLogueado.rol === 'supervisor1' ? '1' : '2';
        const filtroMesSup  = window._nominaFiltroMesSup  || '';
        const filtroQSup    = window._nominaFiltroQSup    || '';

        // Meses disponibles en los datos
        const _mesesDisp = [...new Set(filas.map(r => r['periodo']||r['mes']||'').filter(Boolean))];

        // Aplicar filtros
        let filasVista = filas;
        if (filtroMesSup)  filasVista = filasVista.filter(r => String(r['periodo']||r['mes']||'').toLowerCase().includes(filtroMesSup.toLowerCase()));
        if (filtroQSup)    filasVista = filasVista.filter(r => String(r['quincena_num']||r['quincena']||'').trim() === filtroQSup);

        // Botones de meses
        const btsMes = _mesesDisp.map(m => {
            const activo = filtroMesSup === m;
            return `<button onclick="window._nominaFiltroMesSup=${activo?'\'\'':JSON.stringify(m)};window._nominaPagSup=0;renderNomina();"
                style="padding:6px 14px;border-radius:20px;border:1px solid rgba(255,255,255,${activo?'0.4':'0.15'});cursor:pointer;font-size:11px;font-weight:700;
                background:${activo?'rgba(255,255,255,0.15)':'rgba(255,255,255,0.04)'};color:${activo?'#fff':'rgba(255,255,255,0.6)'};transition:all .2s;">${m}</button>`;
        }).join('');

        // Botones de Q
        const btsQ = ['1','2'].map(q => {
            const activo = filtroQSup === q;
            return `<button onclick="window._nominaFiltroQSup=${activo?'\'\'':JSON.stringify(q)};window._nominaPagSup=0;renderNomina();"
                style="padding:6px 14px;border-radius:20px;border:1px solid ${activo?'rgba(255,45,85,0.5)':'rgba(255,255,255,0.15)'};cursor:pointer;font-size:11px;font-weight:700;
                background:${activo?'rgba(255,45,85,0.2)':'rgba(255,255,255,0.04)'};color:${activo?'var(--accent)':'rgba(255,255,255,0.6)'};transition:all .2s;">Q${q}</button>`;
        }).join('');

        // Limpiar filtros si hay alguno activo
        const btnLimpiar = (filtroMesSup||filtroQSup)
            ? `<button onclick="window._nominaFiltroMesSup='';window._nominaFiltroQSup='';renderNomina();"
                style="padding:6px 12px;border-radius:20px;border:1px solid rgba(255,45,85,0.3);cursor:pointer;font-size:11px;font-weight:700;
                background:rgba(255,45,85,0.1);color:var(--accent);">✕ Limpiar</button>`
            : '';

        // Lista de asesores con paginación (máx 10 por página)
        const _SUP_POR_PAG = 10;
        const _supPagActual = window._nominaPagSup || 0;
        const _supTotalPags = Math.max(1, Math.ceil(filasVista.length / _SUP_POR_PAG));
        // Resetear página si está fuera de rango
        if (_supPagActual >= _supTotalPags) window._nominaPagSup = 0;
        const _supPag = Math.min(_supPagActual, _supTotalPags - 1);
        const filasPagina = filasVista.slice(_supPag * _SUP_POR_PAG, (_supPag + 1) * _SUP_POR_PAG);

        const listaHTML = filasPagina.length
            ? filasPagina.map(r => {
                const nombre  = r['nombres'] || r['nombre'] || '—';
                const doc     = r['documento'] || r['cedula'] || '';
                const grupo   = r['grupo'] || '';
                const jornada = (r['jornada'] || '').toUpperCase();
                const _sb = parseFloat(String(r['salario_basico']||'0').replace(/[^0-9.-]/g,''))||0;
                const _sp = parseFloat(String(r['salario_puntos']||'0').replace(/[^0-9.-]/g,''))||0;
                const _sa = parseFloat(String(r['salario_a_pagar']||'0').replace(/[^0-9.-]/g,''))||0;
                const sal = (_sb>0||_sp>0) ? Math.max(_sb,_sp) : _sa;
                const adel = parseFloat(String(r['adelantos']||'0').replace(/[^0-9.-]/g,''))||0;
                const otras = parseFloat(String(r['otras_deducciones']||r['otras']||'0').replace(/[^0-9.-]/g,''))||0;
                const neto = sal - adel - otras;
                const q = String(r['quincena_num']||r['quincena']||'').trim();
                const per = r['periodo'] || r['mes'] || '';
                const qLabel = q==='1'?'Q1':q==='2'?'Q2':'';
                const fR2 = n => new Intl.NumberFormat('es-CO',{style:'currency',currency:'COP',maximumFractionDigits:0}).format(n);
                // Badge de estado de pago
                const rawPagSup = (r['pagado'] || r['estado_pago'] || r['pago'] || '').toString().toLowerCase().trim();
                const esPagSup  = ['pagado','si','sí','yes','1','true'].includes(rawPagSup);
                const esPendSup = ['pendiente','no','0','false'].includes(rawPagSup);
                const badgePagoSup = esPagSup
                    ? `<span style="background:rgba(39,174,96,0.15);color:#27ae60;border:1px solid rgba(39,174,96,0.35);border-radius:10px;padding:2px 8px;font-size:9px;font-weight:800;">✅ Pagado</span>`
                    : esPendSup
                    ? `<span style="background:rgba(231,76,60,0.15);color:#e74c3c;border:1px solid rgba(231,76,60,0.35);border-radius:10px;padding:2px 8px;font-size:9px;font-weight:800;">⏳ Pendiente</span>`
                    : '';
                return `
                <div style="display:flex;align-items:center;gap:12px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:12px 16px;">
                    <div style="width:36px;height:36px;border-radius:50%;background:rgba(39,174,96,0.2);border:2px solid rgba(39,174,96,0.4);display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0;">👤</div>
                    <div style="flex:1;min-width:0;">
                        <div style="font-size:13px;font-weight:800;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${_usdNombrePropio ? _usdNombrePropio(nombre) : nombre}</div>
                        <div style="font-size:10px;color:rgba(255,255,255,0.45);margin-top:2px;display:flex;gap:6px;flex-wrap:wrap;align-items:center;">
                            ${doc?`🪪 ${doc}`:''}${grupo?`&nbsp;👥 ${grupo}`:''}${per?`&nbsp;📅 ${per}`:''}
                            ${qLabel?`<span style="background:rgba(255,45,85,0.15);color:var(--accent);border-radius:6px;padding:1px 6px;font-weight:700;">${qLabel}</span>`:''}
                            ${badgePagoSup}
                        </div>
                    </div>
                    <div style="text-align:right;flex-shrink:0;">
                        <div style="font-size:13px;font-weight:900;color:#27ae60;">${fR2(neto)}</div>
                        <div style="font-size:9px;color:rgba(255,255,255,0.3);margin-top:1px;">Neto</div>
                    </div>
                </div>`;
            }).join('')
            : '<p style="color:rgba(255,255,255,0.35);text-align:center;padding:30px;font-size:13px;">Sin registros para este filtro.</p>';

        // Controles de paginación supervisor
        const _supPagHTML = _supTotalPags > 1 ? `
            <div style="display:flex;align-items:center;justify-content:center;gap:6px;padding:6px 0;flex-wrap:wrap;">
                <button onclick="window._nominaPagSup=Math.max(0,(window._nominaPagSup||0)-1);renderNomina();"
                    style="padding:5px 12px;border-radius:18px;border:1px solid rgba(255,255,255,0.15);cursor:pointer;font-size:11px;font-weight:700;background:rgba(255,255,255,0.05);color:${_supPag===0?'rgba(255,255,255,0.2)':'#fff'};"
                    ${_supPag===0?'disabled':''}>◀ Ant</button>
                ${Array.from({length:_supTotalPags},(_,i)=>`<button onclick="window._nominaPagSup=${i};renderNomina();"
                    style="padding:5px 11px;border-radius:18px;border:1px solid ${i===_supPag?'var(--accent)':'rgba(255,255,255,0.12)'};cursor:pointer;font-size:11px;font-weight:700;
                    background:${i===_supPag?'rgba(255,45,85,0.2)':'rgba(255,255,255,0.04)'};color:${i===_supPag?'var(--accent)':'rgba(255,255,255,0.55)'};">${i+1}</button>`).join('')}
                <button onclick="window._nominaPagSup=Math.min(${_supTotalPags-1},(window._nominaPagSup||0)+1);renderNomina();"
                    style="padding:5px 12px;border-radius:18px;border:1px solid rgba(255,255,255,0.15);cursor:pointer;font-size:11px;font-weight:700;background:rgba(255,255,255,0.05);color:${_supPag===_supTotalPags-1?'rgba(255,255,255,0.2)':'#fff'};"
                    ${_supPag===_supTotalPags-1?'disabled':''}>Sig ▶</button>
            </div>
            <div style="text-align:center;font-size:10px;color:rgba(255,255,255,0.3);">Página ${_supPag+1} de ${_supTotalPags} · ${filasVista.length} registros en total</div>` : '';

        cont.innerHTML = `
            <div style="display:flex;flex-direction:column;gap:12px;">
                <!-- Filtro por Mes -->
                <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:12px 16px;">
                    <div style="font-size:10px;color:var(--textMuted);font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">📅 Filtrar por Mes</div>
                    <div style="display:flex;flex-wrap:wrap;gap:6px;">${btsMes || '<span style="font-size:11px;color:rgba(255,255,255,0.3);">Sin meses disponibles</span>'}</div>
                </div>
                <!-- Filtro por Quincena -->
                <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:12px 16px;">
                    <div style="font-size:10px;color:var(--textMuted);font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">🗓️ Filtrar por Quincena</div>
                    <div style="display:flex;gap:6px;flex-wrap:wrap;">${btsQ} ${btnLimpiar}</div>
                </div>
                <!-- Contador -->
                <div style="font-size:11px;color:rgba(255,255,255,0.4);padding:0 4px;">${filasVista.length} asesor${filasVista.length!==1?'es':''} ${(filtroMesSup||filtroQSup)?'filtrados':'en total'}</div>
                <!-- Lista -->
                <div style="display:flex;flex-direction:column;gap:8px;">${listaHTML}</div>
                <!-- Paginación -->
                ${_supPagHTML}
            </div>`;
        return;
    }

    // Admin / Supervisor: tabla completa
    const headerCols = cols.map(c => {
        const isNeto  = c.key === '_saldo_neto';
        const isAdel  = c.key === 'adelantos';
        const style   = isNeto ? 'color:#27ae60;' : isAdel ? 'color:#3498db;' : '';
        return `<th style="${style}">${c.label}</th>`;
    }).join('');
    // rowsHTML removido — ahora se usa rowsHTMLFiltered con colsExt

    const fR = n => new Intl.NumberFormat('es-CO',{style:'currency',currency:'COP',maximumFractionDigits:0}).format(n);

    // ── Filtros de mes y período (persist en window para re-render) ──
    const mesesOpciones = [...new Set(filas.map(r => r['periodo']||r['mes']||'').filter(Boolean))];
    const quinceOpciones = ['1','2'];
    const filtroMesActual  = window._nominaFiltroMes  || '';
    const filtroPeriActual = window._nominaFiltroPer  || '';

    // Aplicar filtros a filas para la tabla
    let filasFiltradas = filas;
    if (filtroMesActual)  filasFiltradas = filasFiltradas.filter(r => {
        const mes = String(r['periodo']||r['mes']||'').toLowerCase();
        return mes.includes(filtroMesActual.toLowerCase());
    });
    if (filtroPeriActual) filasFiltradas = filasFiltradas.filter(r => {
        const q = String(r['quincena_num']||r['quincena']||'').trim();
        return q === filtroPeriActual;
    });

    // ── Resumen estadístico calculado sobre filasFiltradas ──
    const totalSalarios = filasFiltradas.reduce((acc, r) => {
        const _sb = parseFloat(String(r['salario_basico']||r['Salario Básico']||r['salario_básico']||'0').replace(/[^0-9.-]/g,''))||0;
        const _sp = parseFloat(String(r['salario_puntos']||r['Salario Puntos']||'0').replace(/[^0-9.-]/g,''))||0;
        const _sa = parseFloat(String(r['salario_a_pagar']||r['Salario a Pagar']||'0').replace(/[^0-9.-]/g,''))||0;
        const sal = (_sb > 0 || _sp > 0) ? Math.max(_sb, _sp) : _sa;
        return acc + sal;
    }, 0);
    const totalAdelantos    = filasFiltradas.reduce((acc, r) => acc + (parseFloat(String(r['adelantos']||r['Adelantos']||'0').replace(/[^0-9.-]/g,''))||0), 0);
    const totalBonoMensual  = filasFiltradas.reduce((acc, r) => acc + (parseFloat(String(r['bono_mensual']||r['Bono Mensual']||'0').replace(/[^0-9.-]/g,''))||0), 0);
    const totalBonoSemanal  = filasFiltradas.reduce((acc, r) => acc + (parseFloat(String(r['bono_semanal']||r['Bono Semanal']||'0').replace(/[^0-9.-]/g,''))||0), 0);
    const totalBonoAdicional= filasFiltradas.reduce((acc, r) => acc + (parseFloat(String(r['bono_adicional']||r['Bono Adicional']||'0').replace(/[^0-9.-]/g,''))||0), 0);
    const totalOtras        = filasFiltradas.reduce((acc, r) => acc + (parseFloat(String(r['otras_deducciones']||r['otras deducciones']||r['otras']||'0').replace(/[^0-9.-]/g,''))||0), 0);
    const totalSaldoNeto    = totalSalarios - totalAdelantos;
    const totalDeducciones  = totalAdelantos + totalOtras;
    const totalNetoReal     = totalSalarios - totalDeducciones;

    // Recalcular filas filtradas para tabla — con paginación (máx 10 por página)
    const _ADM_POR_PAG = 10;
    const _admPagActual = window._nominaPagAdm || 0;
    const _admTotalPags = Math.max(1, Math.ceil(filasFiltradas.length / _ADM_POR_PAG));
    if (_admPagActual >= _admTotalPags) window._nominaPagAdm = 0;
    const _admPag = Math.min(_admPagActual, _admTotalPags - 1);
    const filasPagAdmin = filasFiltradas.slice(_admPag * _ADM_POR_PAG, (_admPag + 1) * _ADM_POR_PAG);

    const rowsHTMLFiltered = filasPagAdmin.map(r => {
        const _adelFila = parseFloat(String(r['adelantos']||r['Adelantos']||'0').replace(/[^0-9.-]/g,''))||0;
        const _otrasFila= parseFloat(String(r['otras_deducciones']||r['otras']||'0').replace(/[^0-9.-]/g,''))||0;
        const _sbFila   = parseFloat(String(r['salario_basico']||r['Salario Básico']||r['salario_básico']||'0').replace(/[^0-9.-]/g,''))||0;
        const _spFila   = parseFloat(String(r['salario_puntos']||r['Salario Puntos']||'0').replace(/[^0-9.-]/g,''))||0;
        const _saFila   = parseFloat(String(r['salario_a_pagar']||r['Salario a Pagar']||'0').replace(/[^0-9.-]/g,''))||0;
        const salFila   = (_sbFila > 0 || _spFila > 0) ? Math.max(_sbFila, _spFila) : _saFila;
        const totalDedFila = _adelFila + _otrasFila;
        const saldoNeto = salFila - totalDedFila;
        const cells = colsExt.map(c => {
            const rawVal = r[c.key] || r[Object.keys(r).find(k => k.toLowerCase().replace(/\s/g,'_') === c.key) || ''] || '';
            const dateCols = ['fecha_ingreso'];
            let disp;
            if (c.key === '_saldo_neto') {
                return `<td style="color:#27ae60;font-weight:900;font-size:13px;">${fmt(saldoNeto)}</td>`;
            } else if (c.key === '_estado') {
                const tieneAdel = _adelFila > 0 || _otrasFila > 0;
                const badge = tieneAdel
                    ? `<span style="background:rgba(52,152,219,0.15);color:#3498db;border:1px solid rgba(52,152,219,0.4);border-radius:20px;padding:3px 10px;font-size:10px;font-weight:800;white-space:nowrap;">💳 Con deducción</span>`
                    : `<span style="background:rgba(39,174,96,0.15);color:#27ae60;border:1px solid rgba(39,174,96,0.4);border-radius:20px;padding:3px 10px;font-size:10px;font-weight:800;white-space:nowrap;">✅ Sin deducción</span>`;
                return `<td>${badge}</td>`;
            } else if (c.key === '_pagado') {
                const rawPag = (r['pagado'] || r['estado_pago'] || r['pago'] || '').toString().toLowerCase().trim();
                const esPag = ['pagado','si','sí','yes','1','true'].includes(rawPag);
                const esPend = ['pendiente','no','0','false'].includes(rawPag);
                let badgePago;
                if (esPag) {
                    badgePago = `<span style="background:rgba(39,174,96,0.15);color:#27ae60;border:1px solid rgba(39,174,96,0.4);border-radius:20px;padding:3px 10px;font-size:10px;font-weight:800;white-space:nowrap;">✅ Pagado</span>`;
                } else if (esPend) {
                    badgePago = `<span style="background:rgba(231,76,60,0.15);color:#e74c3c;border:1px solid rgba(231,76,60,0.4);border-radius:20px;padding:3px 10px;font-size:10px;font-weight:800;white-space:nowrap;">⏳ Pendiente</span>`;
                } else {
                    badgePago = `<span style="background:rgba(255,255,255,0.06);color:rgba(255,255,255,0.35);border:1px solid rgba(255,255,255,0.12);border-radius:20px;padding:3px 10px;font-size:10px;font-weight:800;white-space:nowrap;">— Sin info</span>`;
                }
                return `<td>${badgePago}</td>`;
            } else if (c.key === 'adelantos') {
                const adelVal = parseFloat(String(rawVal||'0').replace(/[^0-9.-]/g,''))||0;
                disp = adelVal > 0 ? fmt(adelVal) : '—';
                return `<td style="${adelVal > 0 ? 'color:#3498db;font-weight:800;' : 'color:rgba(255,255,255,0.3);'}">${disp}</td>`;
            } else if (c.key === 'otras_deducciones') {
                const otrasVal = parseFloat(String(rawVal||'0').replace(/[^0-9.-]/g,''))||0;
                disp = otrasVal > 0 ? fmt(otrasVal) : '—';
                return `<td style="${otrasVal > 0 ? 'color:#e74c3c;font-weight:800;' : 'color:rgba(255,255,255,0.3);'}">${disp}</td>`;
            } else {
                disp = moneyCols.includes(c.key) ? fmt(rawVal) : dateCols.includes(c.key) ? excelFechaToStr(rawVal) : (rawVal || '—');
            }
            return `<td>${disp}</td>`;
        }).join('');
        return `<tr>${cells}</tr>`;
    }).join('');

    cont.innerHTML = `
        <!-- ── FILTROS ── -->
        <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-bottom:16px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:12px 16px;">
            <span style="font-size:11px;color:var(--textMuted);font-weight:700;text-transform:uppercase;letter-spacing:1px;">🔍 Filtros:</span>
            <select onchange="window._nominaFiltroMes=this.value;window._nominaPagAdm=0;renderNomina();" style="background:#1e1e2e;border:1px solid rgba(255,255,255,0.15);color:#fff;padding:6px 12px;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;outline:none;">
                <option value="">📅 Todos los meses</option>
                ${[...new Set(filas.map(r=>r['periodo']||r['mes']||'').filter(Boolean))].map(m=>`<option value="${m}" ${filtroMesActual===m?'selected':''}>${m}</option>`).join('')}
            </select>
            <select onchange="window._nominaFiltroPer=this.value;window._nominaPagAdm=0;renderNomina();" style="background:#1e1e2e;border:1px solid rgba(255,255,255,0.15);color:#fff;padding:6px 12px;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;outline:none;">
                <option value="">🗓️ Todas las quincenas</option>
                <option value="1" ${filtroPeriActual==='1'?'selected':''}>Quincena 1 (1 al 15)</option>
                <option value="2" ${filtroPeriActual==='2'?'selected':''}>Quincena 2 (16 al 30)</option>
            </select>
            ${(filtroMesActual||filtroPeriActual)?`<button onclick="window._nominaFiltroMes='';window._nominaFiltroPer='';window._nominaPagAdm=0;renderNomina();" style="background:rgba(255,45,85,0.15);border:1px solid rgba(255,45,85,0.3);color:var(--accent);padding:6px 12px;border-radius:8px;font-size:11px;font-weight:700;cursor:pointer;">✕ Limpiar</button>`:''}
            <span style="margin-left:auto;font-size:11px;color:var(--textMuted);">${filasFiltradas.length} registro${filasFiltradas.length!==1?'s':''} ${(filtroMesActual||filtroPeriActual)?'filtrados':'totales'}</span>
        </div>

        <!-- ── SECCIÓN INGRESOS ── -->
        <div style="margin-bottom:8px;padding:6px 4px;"><span style="font-size:10px;color:#27ae60;font-weight:900;text-transform:uppercase;letter-spacing:2px;">📈 Ingresos</span></div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:10px;margin-bottom:18px;">
            <div style="background:linear-gradient(135deg,rgba(39,174,96,0.15),rgba(39,174,96,0.05));border:1px solid rgba(39,174,96,0.3);border-radius:14px;padding:14px;">
                <div style="font-size:9px;color:#27ae60;text-transform:uppercase;font-weight:800;letter-spacing:1px;margin-bottom:5px;">👥 Empleados</div>
                <div style="font-size:26px;font-weight:900;color:#fff;">${filasFiltradas.length}</div>
            </div>
            <div style="background:linear-gradient(135deg,rgba(241,196,15,0.15),rgba(241,196,15,0.05));border:1px solid rgba(241,196,15,0.4);border-radius:14px;padding:14px;">
                <div style="font-size:9px;color:#f1c40f;text-transform:uppercase;font-weight:800;letter-spacing:1px;margin-bottom:5px;">💰 INGRESO PUNTOS</div>
                <div style="font-size:14px;font-weight:900;color:#f1c40f;" id="nominaIngresoPuntosCard">${(()=>{try{const ie=JSON.parse(localStorage.getItem('usd_ingresos_egresos')||'[]');if(ie&&ie.length){const _fm=filtroMesActual?filtroMesActual.toLowerCase():'';const match=_fm?ie.slice().reverse().find(p=>String(p.mes||p.label||'').toLowerCase().includes(_fm)):ie[ie.length-1];const p=match||ie[ie.length-1];const v=p.ing_puntos||p.ingPuntos||p['ingresos por puntos']||0;return fR(v);}return '$0';}catch(e){return '$0';}})()}</div>
                <div style="font-size:9px;color:rgba(255,255,255,0.4);margin-top:3px;">Resumen Contable · Mes vigente</div>
            </div>
            <div style="background:linear-gradient(135deg,rgba(241,196,15,0.15),rgba(241,196,15,0.05));border:1px solid rgba(241,196,15,0.3);border-radius:14px;padding:14px;">
                <div style="font-size:9px;color:#f1c40f;text-transform:uppercase;font-weight:800;letter-spacing:1px;margin-bottom:5px;">📅 Bono Mensual</div>
                <div style="font-size:14px;font-weight:900;color:#fff;">${fR(totalBonoMensual)}</div>
            </div>
            <div style="background:linear-gradient(135deg,rgba(155,89,182,0.15),rgba(155,89,182,0.05));border:1px solid rgba(155,89,182,0.3);border-radius:14px;padding:14px;">
                <div style="font-size:9px;color:#9b59b6;text-transform:uppercase;font-weight:800;letter-spacing:1px;margin-bottom:5px;">📆 Bono Semanal</div>
                <div style="font-size:14px;font-weight:900;color:#fff;">${fR(totalBonoSemanal)}</div>
            </div>
            <div style="background:linear-gradient(135deg,rgba(230,126,34,0.15),rgba(230,126,34,0.05));border:1px solid rgba(230,126,34,0.3);border-radius:14px;padding:14px;">
                <div style="font-size:9px;color:#e67e22;text-transform:uppercase;font-weight:800;letter-spacing:1px;margin-bottom:5px;">🎁 Bono Extra</div>
                <div style="font-size:14px;font-weight:900;color:#fff;">${fR(totalBonoAdicional)}</div>
            </div>
        </div>

        <!-- ── SECCIÓN DEDUCCIONES ── -->
        <div style="margin-bottom:8px;padding:6px 4px;"><span style="font-size:10px;color:#e74c3c;font-weight:900;text-transform:uppercase;letter-spacing:2px;">📉 Deducciones</span></div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:10px;margin-bottom:18px;">
            <div style="background:linear-gradient(135deg,rgba(52,152,219,0.15),rgba(52,152,219,0.05));border:1px solid rgba(52,152,219,0.3);border-radius:14px;padding:14px;">
                <div style="font-size:9px;color:#3498db;text-transform:uppercase;font-weight:800;letter-spacing:1px;margin-bottom:5px;">💳 Adelantos del 20</div>
                <div style="font-size:14px;font-weight:900;color:#3498db;">${fR(totalAdelantos)}</div>
            </div>
            <div style="background:linear-gradient(135deg,rgba(231,76,60,0.15),rgba(231,76,60,0.05));border:1px solid rgba(231,76,60,0.3);border-radius:14px;padding:14px;">
                <div style="font-size:9px;color:#e74c3c;text-transform:uppercase;font-weight:800;letter-spacing:1px;margin-bottom:5px;">➖ Otras Deducciones</div>
                <div style="font-size:14px;font-weight:900;color:#e74c3c;">${fR(totalOtras)}</div>
            </div>
            <div style="background:linear-gradient(135deg,rgba(231,76,60,0.2),rgba(231,76,60,0.08));border:2px solid rgba(231,76,60,0.4);border-radius:14px;padding:14px;">
                <div style="font-size:9px;color:#e74c3c;text-transform:uppercase;font-weight:800;letter-spacing:1px;margin-bottom:5px;">⛔ Total Deducciones</div>
                <div style="font-size:14px;font-weight:900;color:#e74c3c;">${fR(totalDeducciones)}</div>
                <div style="font-size:9px;color:rgba(255,255,255,0.4);margin-top:3px;">Adelantos + Otras</div>
            </div>
        </div>

        <!-- ── SECCIÓN TOTALES ── -->
        <div style="margin-bottom:8px;padding:6px 4px;"><span style="font-size:10px;color:#f1c40f;font-weight:900;text-transform:uppercase;letter-spacing:2px;">🏁 Totales</span></div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px;margin-bottom:22px;">
            <div style="background:linear-gradient(135deg,rgba(39,174,96,0.2),rgba(39,174,96,0.07));border:2px solid rgba(39,174,96,0.5);border-radius:14px;padding:16px;">
                <div style="font-size:9px;color:#27ae60;text-transform:uppercase;font-weight:800;letter-spacing:1px;margin-bottom:4px;">✅ Neto a Pagar</div>
                <div style="font-size:20px;font-weight:900;color:#27ae60;">${fR(totalNetoReal)}</div>
                <div style="font-size:9px;color:rgba(255,255,255,0.4);margin-top:3px;">Salarios − Deducciones</div>
            </div>
            <div style="background:linear-gradient(135deg,rgba(241,196,15,0.15),rgba(241,196,15,0.05));border:1px solid rgba(241,196,15,0.3);border-radius:14px;padding:16px;">
                <div style="font-size:9px;color:#f1c40f;text-transform:uppercase;font-weight:800;letter-spacing:1px;margin-bottom:4px;">💰 Total Nómina Bruta</div>
                <div style="font-size:20px;font-weight:900;color:#f1c40f;">${fR(totalSalarios + totalBonoMensual + totalBonoSemanal + totalBonoAdicional)}</div>
                <div style="font-size:9px;color:rgba(255,255,255,0.4);margin-top:3px;">Salarios + Todos los bonos</div>
            </div>
        </div>

        <!-- ── TABLA ── -->
        <div style="overflow-x:auto;border-radius:14px;border:1px solid rgba(255,255,255,0.08);overflow:hidden;">
            <table style="margin-top:0;">
                <thead style="background:rgba(255,255,255,0.04);"><tr>${headerColsExt}</tr></thead>
                <tbody>${rowsHTMLFiltered}</tbody>
            </table>
        </div>
        ${_admTotalPags > 1 ? `
        <!-- ── PAGINACIÓN TABLA ── -->
        <div style="display:flex;align-items:center;justify-content:center;gap:6px;padding:14px 0 4px;flex-wrap:wrap;">
            <button onclick="window._nominaPagAdm=Math.max(0,(window._nominaPagAdm||0)-1);renderNomina();"
                style="padding:6px 14px;border-radius:20px;border:1px solid rgba(255,255,255,0.15);cursor:pointer;font-size:12px;font-weight:700;background:rgba(255,255,255,0.05);color:${_admPag===0?'rgba(255,255,255,0.2)':'#fff'};"
                ${_admPag===0?'disabled':''}>◀ Anterior</button>
            ${Array.from({length:_admTotalPags},(_,i)=>`<button onclick="window._nominaPagAdm=${i};renderNomina();"
                style="padding:6px 13px;border-radius:20px;border:1px solid ${i===_admPag?'var(--accent)':'rgba(255,255,255,0.12)'};cursor:pointer;font-size:12px;font-weight:700;
                background:${i===_admPag?'rgba(255,45,85,0.2)':'rgba(255,255,255,0.04)'};color:${i===_admPag?'var(--accent)':'rgba(255,255,255,0.55)'};">${i+1}</button>`).join('')}
            <button onclick="window._nominaPagAdm=Math.min(${_admTotalPags-1},(window._nominaPagAdm||0)+1);renderNomina();"
                style="padding:6px 14px;border-radius:20px;border:1px solid rgba(255,255,255,0.15);cursor:pointer;font-size:12px;font-weight:700;background:rgba(255,255,255,0.05);color:${_admPag===_admTotalPags-1?'rgba(255,255,255,0.2)':'#fff'};"
                ${_admPag===_admTotalPags-1?'disabled':''}>Siguiente ▶</button>
        </div>
        <div style="text-align:center;font-size:11px;color:rgba(255,255,255,0.3);padding-bottom:8px;">
            Página ${_admPag+1} de ${_admTotalPags} · mostrando ${filasPagAdmin.length} de ${filasFiltradas.length} registros
        </div>` : ''}`;
}
