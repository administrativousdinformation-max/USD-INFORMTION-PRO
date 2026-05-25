function renderHojaDeVida() {
    const cvGuardado = hojasDev[userLogueado.usuario] || {};
    const plataforma = cvGuardado.plataforma || userLogueado.plataforma || "";
    const accentColor = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#ff2d55";
    const gj      = getGrupoJornada(userLogueado.nombre);
    const grupo   = cvGuardado.grupo   || userLogueado.grupo   || gj.grupo   || "";
    const jornada = cvGuardado.jornada || userLogueado.jornada || gj.jornada || "";
    const jornadaColor = {'TARDE':'#3498db','MAÑANA':'#27ae60','MADRUGADA':'#9b59b6','ÚNICA':'#e67e22','MADRUGADA':'#e74c3c'}[(jornada||'').toUpperCase()] || '#888';
    const jornadaIcon  = {'TARDE':'🌆','MAÑANA':'🌅','MADRUGADA':'🌙','ÚNICA':'⭐','MADRUGADA':'🌃'}[(jornada||'').toUpperCase()] || '🕐';
    const platCfg = getPlatConfig(plataforma);
    const cvData  = hojasDev[userLogueado.usuario] || {};

    const html = `
        <!-- HEADER TIPO CARD -->
        <div style="background:linear-gradient(135deg,${platCfg.color || accentColor}18,${platCfg.color || accentColor}38);border-bottom:3px solid ${platCfg.color || accentColor};padding:22px 24px;margin:-20px -20px 24px -20px;border-radius:var(--borderRadius) var(--borderRadius) 0 0;display:flex;align-items:center;gap:18px;flex-wrap:wrap;">
            <img src="${userLogueado.foto || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'}" onerror="this.src='https://cdn-icons-png.flaticon.com/512/3135/3135715.png'"
                style="width:80px;height:80px;border-radius:var(--photoRadius);object-fit:cover;border:3px solid ${platCfg.color || accentColor};flex-shrink:0;box-shadow:0 4px 18px rgba(0,0,0,0.4);">
            <div style="flex:1;min-width:0;">
                <div style="font-size:20px;font-weight:900;margin-bottom:6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${aNombrePropio(userLogueado.nombre)}</div>
                <div style="display:flex;flex-wrap:wrap;gap:6px;align-items:center;">
                    <span style="background:${platCfg.color || accentColor}22;color:${platCfg.color || accentColor};border:1px solid ${platCfg.color || accentColor}55;border-radius:10px;padding:3px 12px;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:1px;">${userLogueado.rol}</span>
                    ${plataforma ? `<span style="background:${platCfg.color}22;color:${platCfg.color};border:1px solid ${platCfg.color}55;border-radius:10px;padding:3px 12px;font-size:11px;font-weight:700;">${platCfg.emoji} ${plataforma}</span>` : ''}
                    ${jornada ? `<span style="background:${jornadaColor}22;color:${jornadaColor};border:1px solid ${jornadaColor}55;border-radius:10px;padding:3px 12px;font-size:11px;font-weight:700;">${jornadaIcon} ${jornada}</span>` : ''}
                    ${grupo ? `<span style="background:rgba(255,255,255,0.07);color:var(--textMuted);border:1px solid rgba(255,255,255,0.12);border-radius:10px;padding:3px 12px;font-size:11px;font-weight:700;">👥 ${grupo}</span>` : ''}
                </div>
            </div>
            <div style="text-align:center;flex-shrink:0;">
                <div style="font-size:28px;font-weight:900;color:${platCfg.color || accentColor};line-height:1;">USD</div>
                <div style="font-size:9px;color:var(--textMuted);text-transform:uppercase;letter-spacing:1px;margin-top:2px;">INFORMATION</div>
            </div>
        </div>

        <!-- GRID DE INFO BÁSICA -->
        <div style="margin-bottom:20px;">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:14px;padding-bottom:8px;border-bottom:2px solid ${platCfg.color || accentColor}44;">
                <span style="font-size:16px;">📋</span>
                <span style="font-size:13px;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:${platCfg.color || accentColor};">Información del Perfil</span>
            </div>
            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;">
                <div style="background:rgba(255,255,255,0.03);padding:14px;border-radius:12px;border:1px solid rgba(255,255,255,0.07);">
                    <div style="font-size:10px;color:${platCfg.color || accentColor};text-transform:uppercase;font-weight:800;letter-spacing:1px;margin-bottom:6px;">🪪 Identificación</div>
                    <div style="font-size:14px;font-weight:700;color:#fff;">${userLogueado.usuario}</div>
                </div>
                <div style="background:rgba(255,255,255,0.03);padding:14px;border-radius:12px;border:1px solid rgba(255,255,255,0.07);">
                    <div style="font-size:10px;color:${platCfg.color || accentColor};text-transform:uppercase;font-weight:800;letter-spacing:1px;margin-bottom:6px;">🏢 Empresa</div>
                    <div style="font-size:14px;font-weight:700;color:#fff;">USDINFORMATION</div>
                </div>
                <div style="background:rgba(255,255,255,0.03);padding:14px;border-radius:12px;border:1px solid rgba(255,255,255,0.07);">
                    <div style="font-size:10px;color:${platCfg.color || accentColor};text-transform:uppercase;font-weight:800;letter-spacing:1px;margin-bottom:6px;">✅ Estado</div>
                    <div style="font-size:14px;font-weight:700;color:#27ae60;">${cvData.estado || 'Activo'}</div>
                </div>
                <div style="background:rgba(255,255,255,0.03);padding:14px;border-radius:12px;border:1px solid rgba(255,255,255,0.07);">
                    <div style="font-size:10px;color:${platCfg.color || accentColor};text-transform:uppercase;font-weight:800;letter-spacing:1px;margin-bottom:6px;">📍 Ubicación</div>
                    <div style="font-size:14px;font-weight:700;color:#fff;">${cvData.ciudad || 'Sede Principal'}</div>
                </div>
                ${plataforma ? `<div style="background:${platCfg.color}12;padding:14px;border-radius:12px;border:1px solid ${platCfg.color}30;">
                    <div style="font-size:10px;color:${platCfg.color};text-transform:uppercase;font-weight:800;letter-spacing:1px;margin-bottom:6px;">${platCfg.emoji} Plataforma</div>
                    <div style="font-size:14px;font-weight:700;color:${platCfg.color};">${plataforma}</div>
                </div>` : ''}
                ${jornada ? `<div style="background:${jornadaColor}12;padding:14px;border-radius:12px;border:1px solid ${jornadaColor}30;">
                    <div style="font-size:10px;color:${jornadaColor};text-transform:uppercase;font-weight:800;letter-spacing:1px;margin-bottom:6px;">${jornadaIcon} Jornada</div>
                    <div style="font-size:14px;font-weight:700;color:${jornadaColor};">${jornada}</div>
                </div>` : ''}
                ${grupo ? `<div style="background:rgba(255,255,255,0.03);padding:14px;border-radius:12px;border:1px solid rgba(255,255,255,0.07);">
                    <div style="font-size:10px;color:var(--textMuted);text-transform:uppercase;font-weight:800;letter-spacing:1px;margin-bottom:6px;">👥 Grupo</div>
                    <div style="font-size:14px;font-weight:700;color:#fff;">${grupo}</div>
                </div>` : ''}
                ${cvData.fechaIngreso ? `<div style="background:rgba(255,255,255,0.03);padding:14px;border-radius:12px;border:1px solid rgba(255,255,255,0.07);">
                    <div style="font-size:10px;color:${platCfg.color || accentColor};text-transform:uppercase;font-weight:800;letter-spacing:1px;margin-bottom:6px;">📅 Fecha de Ingreso</div>
                    <div style="font-size:14px;font-weight:700;color:#fff;">${cvData.fechaIngreso}</div>
                </div>` : ''}
            </div>
        </div>

        <!-- DATOS PERSONALES DEL CV si existen -->
        ${(cvData.telefono || cvData.correo || cvData.estudios || cvData.fechaNac || cvData.edad || cvData.banco || cvData.cuenta) ? `
        <div style="margin-bottom:20px;">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:14px;padding-bottom:8px;border-bottom:2px solid rgba(255,255,255,0.12);">
                <span style="font-size:16px;">👤</span>
                <span style="font-size:13px;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:var(--textMuted);">Datos Personales</span>
            </div>
            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;">
                ${cvData.telefono ? `<div style="background:rgba(255,255,255,0.03);padding:14px;border-radius:12px;border:1px solid rgba(255,255,255,0.07);">
                    <div style="font-size:10px;color:${platCfg.color || accentColor};text-transform:uppercase;font-weight:800;letter-spacing:1px;margin-bottom:6px;">📞 Teléfono</div>
                    <div style="font-size:14px;font-weight:700;">${cvData.telefono}</div>
                </div>` : ''}
                ${cvData.correo ? `<div style="background:rgba(255,255,255,0.03);padding:14px;border-radius:12px;border:1px solid rgba(255,255,255,0.07);">
                    <div style="font-size:10px;color:${platCfg.color || accentColor};text-transform:uppercase;font-weight:800;letter-spacing:1px;margin-bottom:6px;">✉️ Correo</div>
                    <div style="font-size:13px;font-weight:600;word-break:break-word;">${cvData.correo}</div>
                </div>` : ''}
                ${cvData.fechaNac ? `<div style="background:rgba(255,255,255,0.03);padding:14px;border-radius:12px;border:1px solid rgba(255,255,255,0.07);">
                    <div style="font-size:10px;color:${platCfg.color || accentColor};text-transform:uppercase;font-weight:800;letter-spacing:1px;margin-bottom:6px;">🎂 Fecha de Nac.</div>
                    <div style="font-size:14px;font-weight:700;">${cvData.fechaNac}</div>
                </div>` : ''}
                ${cvData.estudios ? `<div style="background:rgba(255,255,255,0.03);padding:14px;border-radius:12px;border:1px solid rgba(255,255,255,0.07);">
                    <div style="font-size:10px;color:${platCfg.color || accentColor};text-transform:uppercase;font-weight:800;letter-spacing:1px;margin-bottom:6px;">🎓 Estudios</div>
                    <div style="font-size:14px;font-weight:700;">${cvData.estudios}</div>
                </div>` : ''}
                ${cvData.direccion ? `<div style="background:rgba(255,255,255,0.03);padding:14px;border-radius:12px;border:1px solid rgba(255,255,255,0.07);grid-column:1/-1;">
                    <div style="font-size:10px;color:${platCfg.color || accentColor};text-transform:uppercase;font-weight:800;letter-spacing:1px;margin-bottom:6px;">🏠 Dirección</div>
                    <div style="font-size:13px;font-weight:600;">${cvData.direccion}</div>
                </div>` : ''}
                ${cvData.edad ? `<div style="background:rgba(255,255,255,0.03);padding:14px;border-radius:12px;border:1px solid rgba(255,255,255,0.07);">
                    <div style="font-size:10px;color:${platCfg.color || accentColor};text-transform:uppercase;font-weight:800;letter-spacing:1px;margin-bottom:6px;">🎂 Edad</div>
                    <div style="font-size:14px;font-weight:700;">${cvData.edad} años</div>
                </div>` : ''}
                ${cvData.banco ? `<div style="background:rgba(255,255,255,0.03);padding:14px;border-radius:12px;border:1px solid rgba(255,255,255,0.07);">
                    <div style="font-size:10px;color:${platCfg.color || accentColor};text-transform:uppercase;font-weight:800;letter-spacing:1px;margin-bottom:6px;">🏦 Banco</div>
                    <div style="font-size:14px;font-weight:700;">${cvData.banco}</div>
                </div>` : ''}
                ${cvData.cuenta ? `<div style="background:rgba(255,255,255,0.03);padding:14px;border-radius:12px;border:1px solid rgba(255,255,255,0.07);grid-column:1/-1;">
                    <div style="font-size:10px;color:${platCfg.color || accentColor};text-transform:uppercase;font-weight:800;letter-spacing:1px;margin-bottom:6px;">💳 Número de Cuenta</div>
                    <div style="font-size:14px;font-weight:700;letter-spacing:1px;">${cvData.cuenta}</div>
                </div>` : ''}
            </div>
        </div>` : ''}

        <!-- HABILIDADES si existen -->
        ${cvData.habilidades ? `
        <div style="margin-bottom:20px;">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:14px;padding-bottom:8px;border-bottom:2px solid rgba(255,255,255,0.12);">
                <span style="font-size:16px;">⭐</span>
                <span style="font-size:13px;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:var(--textMuted);">Habilidades / Observaciones</span>
            </div>
            <div style="background:rgba(255,255,255,0.03);padding:16px;border-radius:12px;border:1px solid rgba(255,255,255,0.07);font-size:13px;line-height:1.7;color:var(--textMain);">${cvData.habilidades}</div>
        </div>` : ''}

        <!-- DOCUMENTOS LABORALES -->
        <div style="margin-top:8px;">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:14px;padding-bottom:8px;border-bottom:2px solid ${platCfg.color || accentColor}44;">
                <span style="font-size:16px;">📄</span>
                <span style="font-size:13px;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:${platCfg.color || accentColor};">Documentos Laborales</span>
            </div>
            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:14px;">
                <!-- Referencia Laboral -->
                <div style="background:linear-gradient(135deg,rgba(39,174,96,0.12),rgba(39,174,96,0.04));border:1px solid rgba(39,174,96,0.3);border-radius:16px;padding:18px;display:flex;flex-direction:column;gap:10px;">
                    <div style="display:flex;align-items:center;gap:10px;">
                        <div style="width:40px;height:40px;border-radius:10px;background:rgba(39,174,96,0.2);display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;">🏢</div>
                        <div>
                            <div style="font-size:13px;font-weight:800;color:#fff;">Referencia Laboral</div>
                            <div style="font-size:10px;color:rgba(255,255,255,0.5);margin-top:2px;">Documento oficial firmado</div>
                        </div>
                    </div>
                    <button onclick="usdGenerarReferenciaLaboral()" style="width:100%;padding:10px;border-radius:10px;border:none;cursor:pointer;background:linear-gradient(135deg,#27ae60,#2ecc71);color:#fff;font-weight:800;font-size:12px;display:flex;align-items:center;justify-content:center;gap:6px;transition:0.2s;" onmouseover="this.style.opacity='0.85'" onmouseout="this.style.opacity='1'">⬇️ Descargar PDF</button>
                </div>
                <!-- Desprendibles de Nómina -->
                <div style="background:linear-gradient(135deg,rgba(241,196,15,0.12),rgba(241,196,15,0.04));border:1px solid rgba(241,196,15,0.3);border-radius:16px;padding:18px;display:flex;flex-direction:column;gap:10px;">
                    <div style="display:flex;align-items:center;gap:10px;">
                        <div style="width:40px;height:40px;border-radius:10px;background:rgba(241,196,15,0.2);display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;">💵</div>
                        <div>
                            <div style="font-size:13px;font-weight:800;color:#fff;">Desprendibles de Nómina</div>
                            <div style="font-size:10px;color:rgba(255,255,255,0.5);margin-top:2px;">Historial quincenal de pagos</div>
                        </div>
                    </div>
                    <button onclick="usdVerDesprendibles()" style="width:100%;padding:10px;border-radius:10px;border:none;cursor:pointer;background:linear-gradient(135deg,#f1c40f,#f39c12);color:#1a1a1a;font-weight:800;font-size:12px;display:flex;align-items:center;justify-content:center;gap:6px;transition:0.2s;" onmouseover="this.style.opacity='0.85'" onmouseout="this.style.opacity='1'">👁️ Ver desprendibles</button>
                </div>
            </div>
        </div>
    `;
    document.getElementById("cvDetalleContent").innerHTML = html;
}

function cambiarColor(variable, valor) {
    document.documentElement.style.setProperty(variable, valor);
    let colors = JSON.parse(localStorage.getItem('usd_theme_colors')) || {};
    colors[variable] = valor;
    localStorage.setItem('usd_theme_colors', JSON.stringify(colors));
    if (variable === '--fontFamily') cfgCargarFuenteGoogle(valor);
}

function resetearColores() {
    localStorage.removeItem('usd_theme_colors');
    location.reload();
}

// LÓGICA EXCEL ORIGINAL
document.getElementById("excelFile").addEventListener("change", function(e) {
    if (e.target.files.length > 0) {
        document.getElementById("btnConfirmar").style.display = "block";
        const nombreEl = document.getElementById("excelFileNombre");
        const nombreTexto = document.getElementById("excelFileNombreTexto");
        const nombre = "📄 " + e.target.files[0].name;
        if (nombreTexto) nombreTexto.textContent = nombre;
        else nombreEl.textContent = nombre;
        nombreEl.style.display = "block";
        localStorage.setItem('usd_excel_principal_nombre', e.target.files[0].name);
    }
});

function eliminarExcelPrincipal() {
    localStorage.removeItem('usd_excel_principal_nombre');
    const nombreEl = document.getElementById("excelFileNombre");
    if (nombreEl) nombreEl.style.display = "none";
    const btnConf = document.getElementById("btnConfirmar");
    if (btnConf) btnConf.style.display = "none";
    const excelInput = document.getElementById("excelFile");
    if (excelInput) excelInput.value = "";
    toast('Archivo eliminado. Sube uno nuevo cuando lo necesites.', 'info');
}

// Restaurar nombre del Excel al cargar la página
window.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
        const nombreGuardado = localStorage.getItem('usd_excel_principal_nombre');
        if (nombreGuardado) {
            const nombreEl = document.getElementById("excelFileNombre");
            const nombreTexto = document.getElementById("excelFileNombreTexto");
            if (nombreEl) {
                if (nombreTexto) nombreTexto.textContent = "📄 " + nombreGuardado;
                else nombreEl.textContent = "📄 " + nombreGuardado;
                nombreEl.style.display = "block";
            }
        }
    }, 500);
});

function procesarExcel() {
    let file = document.getElementById("excelFile").files[0];
    let reader = new FileReader();
    reader.onload = (ev) => {
        let wb = XLSX.read(new Uint8Array(ev.target.result), {type:"array"});
        // Diagnóstico: mostrar hojas detectadas
        toast(`📊 Excel detectado: ${wb.SheetNames.length} hoja(s): ${wb.SheetNames.join(', ')}`, 'info');
        // Hoja 1: Asistencia — columnas: Nombre, Dia, Asistencia
        datosAsis = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], {defval: ""});
        // Hoja 2: Puntos — columnas: Nombre, Dia, Puntos, Fecha
        datosPunt = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[1]], {defval: ""});
        // Hoja 3: Nómina (opcional)
        if (wb.SheetNames[2]) {
            const rawNomina = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[2]], {defval: ""});
            // Normalizar claves a minúsculas para compatibilidad
            const datosNomina = rawNomina.map(r => {
                const norm = {};
                Object.keys(r).forEach(k => { norm[k.toLowerCase()] = r[k]; });
                return norm;
            });
            localStorage.setItem('datos_nomina_usd', JSON.stringify(datosNomina));
        }

        // Hoja Ingreso_Plataforma: buscar por nombre flexible
        const _normSheet = n => n.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[\s_\-]+/g,'');
        toast(`📋 Hojas detectadas: ${wb.SheetNames.join(' | ')}`, 'info');
        const _hIngPlat = wb.SheetNames.find(n => {
            const norm = _normSheet(n);
            return norm === 'ingresoplataforma' || norm === 'ingresosplataforma'
                || norm.includes('ingresoplat') || norm.includes('ingresosplat')
                || norm.includes('plataforma');
        });
        if (_hIngPlat) {
            try {
                // Leer con header:1 para normalizar nombres de columna sin importar mayúsculas/tildes/espacios
                const _rawAll = XLSX.utils.sheet_to_json(wb.Sheets[_hIngPlat], {header:1, defval:''});
                // Encontrar la fila de cabecera real: la que contenga "Plataforma" o "Mes"
                const _norm3 = s => String(s).trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
                let _hdrIdxP = _rawAll.findIndex(row => row.some(c => { const n=_norm3(c); return n==='plataforma'||n==='mes'||n==='puntos'||n.includes('puntos del'); }));
                if (_hdrIdxP < 0) _hdrIdxP = _rawAll.findIndex(row => row.some(c => String(c).trim() !== ''));
                if (_hdrIdxP < 0) _hdrIdxP = 0;
                const _hdrsRaw = _rawAll[_hdrIdxP];
                const _norm2 = s => String(s).trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
                // Mapeo flexible de columnas
                const _colIdx = {};
                _hdrsRaw.forEach((h, i) => { _colIdx[_norm2(h)] = i; });
                // Buscar columnas por nombre normalizado — soporta "Puntos del Mes", "Tarifa (COP/punto)", etc.
                const _findCol = (...keys) => {
                    for (const k of keys) {
                        const n = _norm2(k);
                        for (const col of Object.keys(_colIdx)) {
                            if (col === n || col.startsWith(n) || n.startsWith(col)) return _colIdx[col];
                        }
                    }
                    return -1;
                };
                const _iPlat   = _findCol('plataforma','platform','plat');
                const _iPuntos = _findCol('puntos del mes','puntos','pts','points');
                const _iTarifa = _findCol('tarifa (cop/punto)','tarifa cop','tarifa','valor','rate','precio');
                const _iMes    = _findCol('mes','month');
                const _iAnio   = _findCol('anio','año','year','ano');
                // Filas de datos: excluir filas de total o instrucciones (col C no vacía y no es "TOTAL")
                const _dataRows = _rawAll.slice(_hdrIdxP + 1).filter(row => {
                    const plat = String(row[_iPlat >= 0 ? _iPlat : 2] || '').trim();
                    return plat && plat.toUpperCase() !== 'TOTAL';
                });
                if (_dataRows.length > 0) {
                    const _now     = new Date();
                    const _mesesES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
                    const _primerRow = _dataRows[0] || [];
                    const _mesExcel  = String(_iMes  >= 0 ? (_primerRow[_iMes]  || '') : '').trim() || _mesesES[_now.getMonth()];
                    const _anioExcel = String(_iAnio >= 0 ? (_primerRow[_iAnio] || '') : '').trim() || String(_now.getFullYear());
                    const filas = _dataRows.map(row => {
                        const plat   = String(row[_iPlat   >= 0 ? _iPlat   : 2] || '').trim();
                        const puntos = parseFloat(row[_iPuntos >= 0 ? _iPuntos : 3]) || 0;
                        const tarifa = parseFloat(row[_iTarifa >= 0 ? _iTarifa : 4]) || 0;
                        const ingreso = puntos * tarifa;
                        return { plataforma: plat, puntos, tarifa, ingreso };
                    }).filter(f => f.plataforma && f.plataforma.toUpperCase() !== 'TOTAL' && (f.puntos > 0 || f.tarifa > 0));
                    if (filas.length > 0) {
                        const histIngr = _ingresosCargar();
                        const _label   = `${_mesExcel} ${_anioExcel}`;
                        const idx      = histIngr.findIndex(p => p.mes === _mesExcel && p.anio === _anioExcel);
                        const periodo  = { mes: _mesExcel, anio: _anioExcel, label: _label, filas,
                            totalIngresos: filas.reduce((s,f)=>s+f.ingreso, 0),
                            fechaGuardado: new Date().toLocaleString('es-CO') + ' (desde Excel - ' + _hIngPlat + ')' };
                        if (idx >= 0) histIngr[idx] = periodo; else histIngr.unshift(periodo);
                        _ingresosGuardarData(histIngr);
                        // ingresosIniciarFilas ya se llama dentro de _ingresosCargarPeriodo
                        const _idxNuevo = _ingresosCargar().findIndex(p => p.mes === _mesExcel && p.anio === _anioExcel);
                        if (_idxNuevo >= 0) _ingresosCargarPeriodo(_idxNuevo, true);
                        _ingresosRenderHistorial();
                        // Marcar inputs como solo lectura (datos desde Excel)
                        document.querySelectorAll('#ingresosFilas .ing-puntos, #ingresosFilas .ing-tarifa').forEach(inp => {
                            inp.readOnly = true;
                            inp.style.opacity = '0.7';
                            inp.style.cursor = 'not-allowed';
                            inp.title = 'Dato cargado desde Excel (solo lectura)';
                        });
                        toast(`✅ Ingresos plataforma (${_label}) cargados desde "${_hIngPlat}"`, 'success');
                    }
                }
            } catch(e) { console.warn('[Excel Ingreso_Plataforma]', e); }
        } else {
            console.warn('[Excel] No se encontró hoja "Ingreso_Plataforma". Hojas disponibles:', wb.SheetNames.join(', '));
            toast(`⚠️ No se encontró hoja de Ingresos Plataforma. Hojas en el Excel: ${wb.SheetNames.join(' | ')}`, 'warning');
        }

        // Hoja Ingresos_Egresos: buscar por nombre flexible
        const _hIE = wb.SheetNames.find(n => {
            const norm = _normSheet(n);
            return norm === 'ingresosegresos' || norm === 'ingresosyegresos'
                || norm.includes('ingresoseg') || norm.includes('ingresoeg')
                || (norm.includes('ingreso') && norm.includes('egreso'));
        });
        if (_hIE) {
            try {
                // Usar header:1 para obtener arrays crudos y buscar la fila de cabecera real
                const rawIE_all = XLSX.utils.sheet_to_json(wb.Sheets[_hIE], {header:1, defval: ''});
                // Buscar la fila que contiene "Mes", "Concepto" o "Valor" como cabecera
                let headerRowIdx = -1;
                for (let i = 0; i < rawIE_all.length; i++) {
                    const row = rawIE_all[i].map(c => String(c||'').toLowerCase().trim());
                    if (row.includes('mes') || row.includes('concepto') || row.includes('valor')) {
                        headerRowIdx = i; break;
                    }
                }
                // Parsear con el header correcto si se encontró, si no usar el comportamiento por defecto
                let rawIE;
                if (headerRowIdx >= 0) {
                    rawIE = XLSX.utils.sheet_to_json(wb.Sheets[_hIE], {defval: '', range: headerRowIdx});
                } else {
                    rawIE = XLSX.utils.sheet_to_json(wb.Sheets[_hIE], {defval: ''});
                }
                // Función para normalizar texto: quitar tildes, minúsculas, sin símbolos
                const _normConcepto = s => String(s||'').toLowerCase().trim()
                    .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
                    .replace(/[^a-z0-9\s]/g,' ').replace(/\s+/g,' ').trim();

                if (rawIE.length > 0) {
                    // Buscar Mes/Año buscando en todas las filas
                    let _mesIE = '', _anioIE = '';
                    for (const r of rawIE) {
                        const mesVal  = String(r['Mes']  || r['mes']  || r['MES']  || '').trim();
                        const anioVal = String(r['Anio'] || r['anio'] || r['Año'] || r['ANIO'] || r['AÑO'] || '').trim();
                        if (mesVal && mesVal.length > 2 && isNaN(Number(mesVal)))  _mesIE  = mesVal;
                        if (anioVal && !isNaN(Number(anioVal)) && Number(anioVal) > 2000) _anioIE = anioVal;
                        if (_mesIE && _anioIE) break;
                    }
                    const conceptoMap = {
                        'ingresos por puntos':   'ie_ing_puntos',
                        'bonos adicionales':     'ie_ing_bonos',
                        'otros ingresos':        'ie_ing_otros',
                        'salida de nomina':      'ie_eg_nomina',
                        'nomina':                'ie_eg_nomina',
                        'deducibles':            'ie_eg_deducibles',
                        'deducibles prestamos':  'ie_eg_deducibles',
                        'prestamos':             'ie_eg_deducibles',
                        'bonos pagados':         'ie_eg_bonos',
                        'otros egresos':         'ie_eg_otros',
                    };
                    const ieData = {};
                    rawIE.forEach(r => {
                        const concepto = _normConcepto(r['Concepto'] || r['concepto'] || r['CONCEPTO'] || '');
                        const valorRaw = r['Valor'] || r['valor'] || r['VALOR'] || 0;
                        const valor    = parseFloat(String(valorRaw).replace(/[^0-9.\-]/g,'')) || 0;
                        // Buscar coincidencia exacta primero, luego parcial
                        let key = conceptoMap[concepto];
                        if (!key) {
                            // Búsqueda parcial
                            for (const [k, v] of Object.entries(conceptoMap)) {
                                if (concepto.includes(k) || k.includes(concepto.split(' ').filter(w=>w.length>3).join(' '))) {
                                    key = v; break;
                                }
                            }
                        }
                        if (key && valor > 0) ieData[key] = valor;
                    });
                    if (_mesIE && _anioIE && Object.keys(ieData).length > 0) {
                        const ingPuntos = ieData['ie_ing_puntos']  || 0;
                        const ingBonos  = ieData['ie_ing_bonos']   || 0;
                        const ingOtros  = ieData['ie_ing_otros']   || 0;
                        const egNomina  = ieData['ie_eg_nomina']   || 0;
                        const egDed     = ieData['ie_eg_deducibles']|| 0;
                        const egBonos   = ieData['ie_eg_bonos']    || 0;
                        const egOtros   = ieData['ie_eg_otros']    || 0;
                        const totalIng  = ingPuntos + ingBonos + ingOtros;
                        const totalEg   = egNomina + egDed + egBonos + egOtros;
                        const ganancia  = totalIng - totalEg;
                        const histIE    = _ieCargar ? _ieCargar() : (JSON.parse(localStorage.getItem('usd_ingresos_egresos')||'[]'));
                        const _label    = `${_mesIE} ${_anioIE}`;
                        const idxIE     = histIE.findIndex(p => p.mes === _mesIE && p.anio === _anioIE);
                        const periodoIE = { mes: _mesIE, anio: _anioIE, label: _label,
                            ingPuntos, ingBonos, ingOtros, totalIngresos: totalIng,
                            egNomina, egDed, egBonos, egOtros, totalEgresos: totalEg,
                            gananciaNeta: ganancia,
                            fechaGuardado: new Date().toLocaleString('es-CO') + ' (desde Excel)' };
                        if (idxIE >= 0) histIE[idxIE] = periodoIE; else histIE.unshift(periodoIE);
                        localStorage.setItem('usd_ingresos_egresos', JSON.stringify(histIE));
                        if (window._fbGuardar) window._fbGuardar('usd_ingresos_egresos', histIE);
                        const camposIE = ['ie_ing_puntos','ie_ing_bonos','ie_ing_otros','ie_eg_nomina','ie_eg_deducibles','ie_eg_bonos','ie_eg_otros'];
                        camposIE.forEach(id => {
                            const el = document.getElementById(id);
                            if(el) {
                                el.value = ieData[id]||0;
                                el.readOnly = true;
                            }
                            // Actualizar span display
                            const disp = document.getElementById(id + '_display');
                            if (disp) disp.textContent = (ieData[id]||0) > 0 ? (ieData[id]||0).toLocaleString('es-CO') : '0';
                        });
                        if (typeof ieRecalcular === 'function') ieRecalcular();
                        if (typeof _ieRenderHistorial === 'function') _ieRenderHistorial();
                        toast(`✅ Ingresos & Egresos (${_label}) cargados desde Excel`, 'success');
                    }
                }
            } catch(e) { console.warn('[Excel Ingresos_Egresos]', e); }
        } else {
            console.warn('[Excel] No se encontró hoja "Ingresos_Egresos". Hojas disponibles:', wb.SheetNames.join(', '));
        }

        // Guardar en localStorage + Firebase para que TODOS los roles vean los datos
        localStorage.setItem('datos_asis_usd', JSON.stringify(datosAsis));
        localStorage.setItem('datos_punt_usd', JSON.stringify(datosPunt));
        // Forzar sincronizacion explicita a Firebase
        if (window._fbGuardar) {
            window._fbGuardar('datos_asis_usd', datosAsis);
            window._fbGuardar('datos_punt_usd', datosPunt);
        }
        // Actualizar historial inmediatamente para quien subio el Excel
        if (typeof renderHistorialCompleto === 'function') renderHistorialCompleto();

        // Calcular totales para graficas de inicio
        const hoy = new Date().getDate();
        let totalAsis = 0, totalFaltas = 0, totalPuntos = 0;
        const nombresUnicos = [...new Set(datosAsis.map(r => r['Nombre']))];
        datosAsis.forEach(r => {
            const dia = parseInt(r['Dia'] || 0);
            if (dia > 0 && dia <= hoy) {
                if (parseInt(r['Asistencia']) === 1) totalAsis++;
                else totalFaltas++;
            }
        });
        datosPunt.forEach(r => { totalPuntos += parseFloat(r['Puntos'] || 0); });

        actualizarGraficas(totalAsis, totalFaltas, Math.round(totalPuntos));
        renderRanking();
        renderAsistencia();
        renderPuntos();
        document.getElementById("btnConfirmar").style.display = "none";
        toast('Base de datos cargada correctamente.', 'success');
        irA('home');
    };
    reader.readAsArrayBuffer(file);
}

function actualizarGraficas(ok, falta, puntos) {
    renderContadoresGeneral();
}
window.actualizarGraficas = actualizarGraficas;

function renderContadoresGeneral() {
    const cont = document.getElementById('contadoresGeneral');
    if (!cont) return;
    // Actualizar color del botón POR ASESOR según plataforma del asesor
    setTimeout(actualizarColorBtnPorAsesor, 100);
    // Skeleton mientras carga
    skeletonCards('contadoresGeneral', 4);

    const hoy = new Date().getDate();

    // ── VISTA ASESOR: su asistencia personal + puntos de su plataforma ──
    if (userLogueado && userLogueado.rol === 'asesor') {
        const miNombre = userLogueado.nombre.toLowerCase().trim();
        const miPlat = userLogueado.plataforma || '';
        const cfg = getPlatConfig(miPlat);

        // Asistencia personal (excluir descansos)
        const misAsis = datosAsis.filter(r => (r['Nombre']||'').toLowerCase().trim() === miNombre);
        const asisOk  = misAsis.filter(r => parseInt(r['Dia']||0) <= hoy && parseInt(r['Asistencia']) === 1).length;
        const asisFalta = misAsis.filter(r => parseInt(r['Dia']||0) <= hoy && parseInt(r['Asistencia']) === -1).length;
        const diasHab = asisOk + asisFalta;
        const pctAsis = diasHab > 0 ? Math.round((asisOk / diasHab) * 100) : 0;

        // Puntos de su plataforma
        let ptsPlat = 0;
        datosPunt.forEach(r => {
            const n = r['Nombre'] || '';
            const u = usuarios.find(u => u.nombre.toLowerCase().trim() === n.toLowerCase().trim());
            const plat = (u && u.plataforma) ? u.plataforma : '';
            if (plat === miPlat) {
                const p = parseFloat(r['Puntos']);
                if (!isNaN(p)) ptsPlat += p;
            }
        });
        const ptsPlatStr = isNaN(ptsPlat) ? '0.00' : ptsPlat.toFixed(2);

        cont.style.gridTemplateColumns = '1fr';
        cont.style.justifyContent = 'center';
        cont.style.maxWidth = '960px';
        cont.style.margin = '0 auto';
        const pctColor = pctAsis >= 90 ? '#27ae60' : pctAsis >= 70 ? '#f39c12' : 'var(--accent)';
        const gj = getGrupoJornada(userLogueado.nombre);
        const jornada = userLogueado.jornada || gj.jornada || '';
        const grupo   = userLogueado.grupo   || gj.grupo   || '';
        const jColor  = {'TARDE':'#3498db','MAÑANA':'#27ae60','MADRUGADA':'#9b59b6','ÚNICA':'#e67e22','MADRUGADA':'#e74c3c'}[(jornada||'').toUpperCase()] || '#888';
        const jIcon   = {'TARDE':'🌆','MAÑANA':'🌅','MADRUGADA':'🌙','ÚNICA':'⭐','MADRUGADA':'🌃'}[(jornada||'').toUpperCase()] || '🕐';
        const foto    = userLogueado.foto || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png';
        cont.innerHTML = `
            <!-- Tarjeta Break — centrada arriba, ancho completo -->
            <div style="display:flex;justify-content:center;width:100%;grid-column:1/-1;">
                <div style="width:100%;max-width:480px;">
                    ${renderTarjetaPausa()}
                </div>
            </div>
            <!-- Fila inferior: Asistencia + Plataforma -->
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px;width:100%;grid-column:1/-1;">
            <!-- Tarjeta Asistencia -->
            <div style="background:var(--panelBg);border-radius:18px;border:1px solid rgba(255,255,255,0.1);overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.2);">
                <div style="background:linear-gradient(135deg,${pctColor}20,${pctColor}40);border-bottom:3px solid ${pctColor};padding:20px 22px;display:flex;align-items:center;gap:14px;">
                    <img src="${foto}" onerror="this.src='https://cdn-icons-png.flaticon.com/512/3135/3135715.png'" style="width:54px;height:54px;border-radius:50%;object-fit:cover;border:3px solid ${pctColor};flex-shrink:0;">
                    <div style="flex:1;">
                        <div style="font-size:15px;font-weight:900;">${aNombrePropio(userLogueado.nombre)}</div>
                        <div style="display:flex;gap:5px;margin-top:4px;flex-wrap:wrap;">
                            ${jornada ? `<span style="background:${jColor}22;color:${jColor};border:1px solid ${jColor}55;border-radius:10px;padding:2px 9px;font-size:10px;font-weight:700;">${jIcon} ${jornada}</span>` : ''}
                            ${grupo   ? `<span style="background:rgba(255,255,255,0.07);color:var(--textMuted);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:2px 9px;font-size:10px;font-weight:700;">👥 ${grupo}</span>` : ''}
                        </div>
                    </div>
                </div>
                <div style="padding:20px 22px;text-align:center;">
                    <div style="font-size:11px;color:var(--textMuted);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">📊 Mi Asistencia</div>
                    <div style="font-size:68px;font-weight:900;color:${pctColor};line-height:1;margin:8px 0;">${pctAsis}%</div>
                    <div style="display:flex;justify-content:center;gap:20px;margin-top:12px;">
                        <div style="text-align:center;"><div style="font-size:22px;font-weight:900;color:#27ae60;">${asisOk}</div><div style="font-size:10px;color:var(--textMuted);text-transform:uppercase;letter-spacing:0.5px;">Asistencias</div></div>
                        <div style="text-align:center;"><div style="font-size:22px;font-weight:900;color:var(--accent);">${asisFalta}</div><div style="font-size:10px;color:var(--textMuted);text-transform:uppercase;letter-spacing:0.5px;">Faltas</div></div>
                    </div>
                </div>
            </div>
            <!-- Tarjeta Plataforma -->
            <div style="background:var(--panelBg);border-radius:18px;border:1px solid rgba(255,255,255,0.1);overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.2);">
                <div style="background:linear-gradient(135deg,${cfg.color}20,${cfg.color}40);border-bottom:3px solid ${cfg.color};padding:20px 22px;display:flex;align-items:center;gap:14px;">
                    <div style="width:54px;height:54px;border-radius:14px;background:${cfg.color};display:flex;align-items:center;justify-content:center;font-size:26px;flex-shrink:0;box-shadow:0 4px 14px ${cfg.color}55;">${cfg.emoji}</div>
                    <div>
                        <div style="font-size:15px;font-weight:900;">${miPlat || 'Mi Plataforma'}</div>
                        <div style="font-size:11px;color:var(--textMuted);margin-top:2px;">Puntos del equipo</div>
                    </div>
                </div>
                <div style="padding:20px 22px;text-align:center;">
                    <div style="font-size:11px;color:var(--textMuted);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">${cfg.emoji} Puntos Totales</div>
                    <div style="font-size:68px;font-weight:900;color:${cfg.color};line-height:1;margin:8px 0;">${ptsPlatStr}</div>
                    <div style="font-size:13px;color:var(--textMuted);margin-top:10px;">puntos del equipo ${miPlat}</div>
                </div>
            </div>
            </div>`;
        return;
    }

    // ── VISTA ADMIN / SUPERVISOR ──

    // Sumar puntos por plataforma (asesores + puntos de fila OFICINA)
    const porPlat = {};
    datosPunt.forEach(r => {
        const n = r['Nombre'] || ''; const p = parseFloat(r['Puntos'] || 0);
        if (!n || isNaN(p)) return;
        const u = usuarios.find(u => u.nombre.toLowerCase().trim() === n.toLowerCase().trim());
        // Detectar si es fila de OFICINA
        const { esOficina, plataforma: platOficina } = detectarOficina(n);
        if (esOficina) {
            // Sumar puntos de OFICINA a su plataforma correspondiente
            const platKey = platOficina || 'AmoLatina';
            if (!porPlat[platKey]) porPlat[platKey] = { puntos: 0, asesores: new Set() };
            porPlat[platKey].puntos += p;
            return;
        }
        // Sin plataforma se suma a AmoLatina
        const plat = (u && u.plataforma) ? u.plataforma : 'AmoLatina';
        if (!porPlat[plat]) porPlat[plat] = { puntos: 0, asesores: new Set() };
        porPlat[plat].puntos += p;
        porPlat[plat].asesores.add(n);
    });

    // Total asistencia (excluir descansos)
    let totalAsis = 0, totalFaltas = 0;
    datosAsis.forEach(r => {
        const dia = parseInt(r['Dia'] || 0);
        if (dia < 1 || dia > hoy) return;
        if (parseInt(r['Asistencia']) === 1) totalAsis++;
        else if (parseInt(r['Asistencia']) === -1) totalFaltas++;
    });

    // Total puntos todas las plataformas
    const totalPuntos = Object.values(porPlat).reduce((s, d) => s + d.puntos, 0);
    const totalAsesores = Object.values(porPlat).reduce((s, d) => s + d.asesores.size, 0);

    const pctAsis = (totalAsis + totalFaltas) > 0 ? Math.round((totalAsis / (totalAsis + totalFaltas)) * 100) : 0;

    const pctColor = pctAsis >= 90 ? '#27ae60' : pctAsis >= 70 ? '#f39c12' : 'var(--accent)';

    // Fila superior: stats globales
    let html = `
    <div style="grid-column:1/-1;display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px;width:100%;justify-content:center;">
        <!-- Asistencia General -->
        <div class="glass-card" style="background:var(--panelBg);border-radius:18px;border:1px solid rgba(255,255,255,0.1);overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.2);padding:0;animation-delay:0s;transition:0.25s;" onmouseover="this.style.transform='translateY(-4px)';this.style.boxShadow='0 10px 30px rgba(0,0,0,0.35)'" onmouseout="this.style.transform='';this.style.boxShadow='0 4px 20px rgba(0,0,0,0.2)'">
            <div style="background:linear-gradient(135deg,${pctColor}20,${pctColor}40);border-bottom:3px solid ${pctColor};padding:16px 20px;display:flex;align-items:center;gap:12px;">
                <div style="width:46px;height:46px;border-radius:12px;background:${pctColor};display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0;box-shadow:0 4px 12px ${pctColor}55;">📊</div>
                <div><div style="font-size:14px;font-weight:900;">Asistencia General</div><div style="font-size:11px;color:var(--textMuted);">Todos los asesores</div></div>
            </div>
            <div style="padding:18px 20px;text-align:center;">
                <div style="font-size:58px;font-weight:900;color:${pctColor};line-height:1;">${pctAsis}%</div>
                <div style="display:flex;justify-content:center;gap:18px;margin-top:12px;">
                    <div><div style="font-size:20px;font-weight:900;color:#27ae60;">${totalAsis}</div><div style="font-size:10px;color:var(--textMuted);text-transform:uppercase;">Asistencias</div></div>
                    <div><div style="font-size:20px;font-weight:900;color:var(--accent);">${totalFaltas}</div><div style="font-size:10px;color:var(--textMuted);text-transform:uppercase;">Faltas</div></div>
                </div>
                <div style="margin-top:14px;border-top:1px solid rgba(255,255,255,0.06);padding-top:12px;">
                    <div style="font-size:9px;color:rgba(255,255,255,0.3);text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">📈 Tendencia últimos 7 días</div>
                    <div id="sparkline-asistencia" style="width:100%;height:52px;"></div>
                </div>
            </div>
        </div>
        <!-- Total Puntos -->
        <div class="glass-card" style="background:var(--panelBg);border-radius:18px;border:1px solid rgba(255,255,255,0.1);overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.2);padding:0;animation-delay:0.08s;transition:0.25s;" onmouseover="this.style.transform='translateY(-4px)';this.style.boxShadow='0 10px 30px rgba(0,0,0,0.35)'" onmouseout="this.style.transform='';this.style.boxShadow='0 4px 20px rgba(0,0,0,0.2)'">
            <div style="background:linear-gradient(135deg,rgba(255,45,85,0.25),rgba(255,45,85,0.5));border-bottom:3px solid var(--accent);padding:16px 20px;display:flex;align-items:center;gap:12px;">
                <div style="width:46px;height:46px;border-radius:12px;background:var(--accent);display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0;box-shadow:0 4px 12px rgba(255,45,85,0.4);">⭐</div>
                <div><div style="font-size:14px;font-weight:900;color:#ffffff;">Total Puntos</div><div style="font-size:11px;color:rgba(255,255,255,0.7);">Todas las plataformas</div></div>
            </div>
            <div style="padding:18px 20px;text-align:center;">
                <div style="font-size:58px;font-weight:900;color:var(--accent);line-height:1;">${totalPuntos.toFixed(2)}</div>
                <div style="margin-top:12px;font-size:13px;color:var(--textMuted);">${totalAsesores} asesor${totalAsesores!==1?'es':''} activos</div>
                <div style="margin-top:14px;border-top:1px solid rgba(255,255,255,0.06);padding-top:12px;">
                    <div style="font-size:9px;color:rgba(255,255,255,0.3);text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">📈 Tendencia últimos 7 días</div>
                    <div id="sparkline-puntos" style="width:100%;height:52px;"></div>
                </div>
            </div>
        </div>
    </div>`;

    // Plataformas individuales
    if (Object.keys(porPlat).length === 0) {
        html += `<div style="grid-column:1/-1;background:var(--panelBg);border-radius:18px;padding:40px;text-align:center;border:1px dashed rgba(255,255,255,0.1);">
            <p style="color:var(--textMuted);font-size:14px;">Carga el archivo Excel para ver los datos.</p>
        </div>`;
    } else {
        Object.entries(porPlat).forEach(([plat, data]) => {
            const cfg = getPlatConfig(plat);
            const numAsesores = data.asesores.size;
            html += `
            <div style="background:var(--panelBg);border-radius:18px;border:1px solid rgba(255,255,255,0.1);overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.2);transition:0.25s;" onmouseover="this.style.transform='translateY(-3px)';this.style.boxShadow='0 8px 28px rgba(0,0,0,0.3)'" onmouseout="this.style.transform='';this.style.boxShadow='0 4px 20px rgba(0,0,0,0.2)'">
                <div style="background:linear-gradient(135deg,${cfg.color}20,${cfg.color}42);border-bottom:3px solid ${cfg.color};padding:16px 20px;display:flex;align-items:center;gap:12px;">
                    <div style="width:46px;height:46px;border-radius:12px;background:${cfg.color};display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0;box-shadow:0 4px 12px ${cfg.color}55;">${cfg.emoji}</div>
                    <div>
                        <div style="font-size:15px;font-weight:900;">${plat.toUpperCase()}</div>
                        ${numAsesores > 0 ? `<div style="font-size:11px;color:var(--textMuted);">${numAsesores} asesor${numAsesores!==1?'es':''}</div>` : ''}
                    </div>
                </div>
                <div style="padding:14px 20px;text-align:center;">
                    <div style="font-size:11px;color:var(--textMuted);text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">Puntos Totales</div>
                    <div style="font-size:54px;font-weight:900;color:${cfg.color};line-height:1;">${data.puntos.toFixed(2)}</div>
                    <div style="margin-top:10px;">
                        <div style="background:#2a2a2a;border-radius:6px;height:6px;overflow:hidden;">
                            <div style="background:${cfg.color};width:${totalPuntos>0?Math.round((data.puntos/totalPuntos)*100):0}%;height:100%;border-radius:6px;"></div>
                        </div>
                        <div style="font-size:11px;color:var(--textMuted);margin-top:5px;">${totalPuntos>0?Math.round((data.puntos/totalPuntos)*100):0}% del total</div>
                    </div>
                </div>
            </div>`;
        });
    }

    cont.innerHTML = html;
}

// RANKING ORIGINAL
function renderRanking() {
    const cont = document.getElementById('tablaRanking');
    if (!cont) return;
    skeletonTabla('tablaRanking', 6);

    if (datosPunt.length === 0) {
        cont.innerHTML = '<p style="color:var(--textMuted);text-align:center;padding:30px;">Carga el archivo Excel para ver el ranking.</p>';
        return;
    }

    // Sumar puntos por nombre — solo asesores reales
    const totalPuntos = {};
    datosPunt.forEach(r => {
        const n = r['Nombre'] || r['nombre'] || '';
        const p = parseFloat(r['Puntos'] || r['puntos'] || 0);
        if (!n || isNaN(p)) return;
        // Filtrar: solo incluir si existe un usuario con rol 'asesor' cuyo nombre coincida
        const esAsesorReal = usuarios.some(u =>
            u.rol === 'asesor' && u.nombre.toLowerCase().trim() === n.toLowerCase().trim()
        );
        if (!esAsesorReal) return;
        totalPuntos[n] = (totalPuntos[n] || 0) + p;
    });

    // Agrupar por plataforma
    const porPlat = {};
    Object.keys(totalPuntos).forEach(nombre => {
        const u = usuarios.find(u => u.nombre.toLowerCase().trim() === nombre.toLowerCase().trim());
        const plat = (u && u.plataforma) ? u.plataforma : 'Sin plataforma';
        if (!porPlat[plat]) porPlat[plat] = [];
        porPlat[plat].push({ nombre, puntos: totalPuntos[nombre] });
    });

    Object.values(porPlat).forEach(arr => arr.sort((a, b) => b.puntos - a.puntos));
    const medals = ['🥇','🥈','🥉'];
    const jornadaCfgRk = { 'TARDE':{color:'#3498db',icon:'🌆'}, 'MAÑANA':{color:'#27ae60',icon:'🌅'}, 'MADRUGADA':{color:'#9b59b6',icon:'🌙'}, 'ÚNICA':{color:'#e67e22',icon:'⭐'}, 'MADRUGADA':{color:'#e74c3c',icon:'🌃'} };

    let sectionsHTML = '';
    Object.entries(porPlat).forEach(([plat, asesores]) => {
        const cfg = getPlatConfig(plat);
        const total = asesores.reduce((s,a)=>s+a.puntos,0);
        const maxJ = asesores[0] ? asesores[0].puntos : 1;

        const cards = asesores.map((a, i) => {
            const gj   = getGrupoJornada(a.nombre);
            const u    = usuarios.find(u => u.nombre.toLowerCase().trim() === a.nombre.toLowerCase().trim());
            const foto = (u && u.foto) ? u.foto : 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png';
            const jornada = (gj.jornada || '').toUpperCase();
            const jCfg = jornadaCfgRk[jornada] || {color:'#888', icon:'🕐'};
            const medal = medals[i] || ('#'+(i+1));
            const barW = maxJ > 0 ? Math.round((a.puntos/maxJ)*100) : 0;
            const esTuyo = userLogueado && a.nombre.toLowerCase().trim() === userLogueado.nombre.toLowerCase().trim();
            const hColor = esTuyo ? 'var(--accent)' : cfg.color;
            const isTop3 = i < 3;

            return `<div style="background:var(--panelBg);border-radius:${isTop3?'14px':'12px'};border:1px solid rgba(255,255,255,${esTuyo?'0.18':'0.07'});overflow:hidden;transition:0.2s;" onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 6px 20px rgba(0,0,0,0.25)'" onmouseout="this.style.transform='';this.style.boxShadow=''">
                <div style="background:linear-gradient(135deg,${hColor}18,${hColor}38);border-bottom:2px solid ${hColor};padding:10px 13px;display:flex;align-items:center;gap:8px;">
                    <div style="font-size:${isTop3?'22px':'18px'};width:26px;text-align:center;flex-shrink:0;">${medal}</div>
                    <img src="${foto}" onerror="this.src='https://cdn-icons-png.flaticon.com/512/3135/3135715.png'" style="width:${isTop3?'38px':'32px'};height:${isTop3?'38px':'32px'};border-radius:50%;object-fit:cover;border:2px solid ${hColor};flex-shrink:0;">
                    <div style="flex:1;min-width:0;">
                        <div style="font-size:12px;font-weight:${esTuyo?'900':'800'};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:${esTuyo?'var(--accent)':'inherit'};">${aNombrePropio(a.nombre)}${esTuyo?' ← Tú':''}</div>
                        <div style="display:flex;gap:3px;margin-top:2px;flex-wrap:wrap;">
                            ${jornada ? `<span style="background:${jCfg.color}22;color:${jCfg.color};border:1px solid ${jCfg.color}44;border-radius:7px;padding:1px 6px;font-size:9px;font-weight:700;">${jCfg.icon} ${jornada}</span>` : ''}
                            ${gj.grupo ? `<span style="background:rgba(255,255,255,0.07);color:var(--textMuted);border-radius:7px;padding:1px 6px;font-size:9px;">👥 ${gj.grupo}</span>` : ''}
                        </div>
                    </div>
                    <div style="text-align:center;flex-shrink:0;">
                        <div style="font-size:${isTop3?'18px':'15px'};font-weight:900;color:${hColor};line-height:1;">${a.puntos.toFixed(2)}</div>
                        <div style="font-size:8px;color:var(--textMuted);">pts</div>
                    </div>
                </div>
                <div style="padding:6px 12px 8px;">
                    <div style="display:flex;align-items:center;gap:6px;">
                        <div style="flex:1;background:#2a2a2a;border-radius:6px;height:4px;overflow:hidden;"><div style="background:${hColor};width:${barW}%;height:100%;border-radius:6px;"></div></div>
                        <span style="font-size:9px;color:var(--textMuted);">${barW}%</span>
                    </div>
                </div>
            </div>`;
        }).join('');

        sectionsHTML += `
        <div style="margin-bottom:28px;">
            <div style="background:linear-gradient(135deg,${cfg.color}18,${cfg.color}35);border-radius:14px;border:1px solid ${cfg.color}44;padding:14px 18px;margin-bottom:14px;display:flex;align-items:center;gap:12px;box-shadow:0 4px 16px rgba(0,0,0,0.15);">
                <div style="width:46px;height:46px;border-radius:12px;background:${cfg.color};display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0;box-shadow:0 4px 12px ${cfg.color}55;">${cfg.emoji}</div>
                <div style="flex:1;">
                    <div style="font-size:16px;font-weight:900;color:${cfg.color};text-transform:uppercase;letter-spacing:1px;">${plat}</div>
                    <div style="font-size:11px;color:var(--textMuted);margin-top:2px;">${asesores.length} asesor${asesores.length!==1?'es':''} · ${total.toFixed(2)} pts totales</div>
                </div>
                <div style="text-align:center;">
                    <div style="font-size:26px;font-weight:900;color:${cfg.color};">${total.toFixed(0)}</div>
                    <div style="font-size:9px;color:var(--textMuted);text-transform:uppercase;letter-spacing:0.5px;">pts</div>
                </div>
            </div>
            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:10px;">${cards}</div>
        </div>`;
    });

    cont.innerHTML = sectionsHTML || '<p style="color:var(--textMuted);text-align:center;padding:30px;">Sin datos de puntos.</p>';
}

// Guarda referencias a las graficas de asistencia para destruirlas al recargar
let chartsAsistencia = {};

function renderAsistencia() {
    const cont = document.getElementById('graficasAsistencia');
    const diasSpan = document.getElementById('diasTranscurridos');
    if (!cont) return;
    skeletonCards('graficasAsistencia', 3);

    const diaHoy = new Date().getDate();
    const diasDelMes = Array.from({length: diaHoy}, (_, i) => i + 1);
    if (diasSpan) diasSpan.textContent = `Días transcurridos del mes: ${diaHoy}`;

    const _datosAsisFil = filtrarPorJornada(datosAsis, 'Jornada');
    const porNombre = {};
    _datosAsisFil.forEach(row => {
        const nombre = row['Nombre'] || row['nombre'] || '';
        const dia = parseInt(row['Dia'] || row['dia'] || 0);
        const asistio = parseInt(row['Asistencia'] || row['asistencia'] || 0);
        if (!nombre || dia < 1 || dia > diaHoy) return;
        if (!porNombre[nombre]) porNombre[nombre] = {};
        porNombre[nombre][dia] = asistio;
    });

    let nombresVisibles = Object.keys(porNombre);

    // Para calidad/capacitador: mostrar solo asesores bajo el promedio de asistencia
    if (window._filtroSolobajoPromedio && nombresVisibles.length > 0) {
        const pcts = nombresVisibles.map(n => {
            const dias = Object.values(porNombre[n]);
            const ok = dias.filter(v => v === 1).length;
            const falta = dias.filter(v => v === -1).length;
            const total = ok + falta;
            return total > 0 ? ok / total : 1;
        });
        const promedio = pcts.reduce((a, b) => a + b, 0) / pcts.length;
        nombresVisibles = nombresVisibles.filter((n, i) => pcts[i] < promedio);
    }

    if (nombresVisibles.length === 0) {
        cont.innerHTML = '<p style="color:var(--textMuted);text-align:center;padding:40px;">Sin datos. Carga el archivo Excel.</p>';
        return;
    }

    // ASESOR: tabla personal por dia
    if (userLogueado.rol === 'asesor') {
        const miNombre = userLogueado.nombre.toLowerCase().trim();
        const entrada = Object.entries(porNombre).find(([n]) => n.toLowerCase().trim() === miNombre);
        if (!entrada) {
            cont.innerHTML = '<div class="glass-card"><p style="color:var(--textMuted);text-align:center;padding:30px;">Sin datos para tu usuario.</p></div>';
            return;
        }
        const [nombre, dias] = entrada;
        // Leer grupo/jornada con fallback a datos fijos
        const _gjA  = getGrupoJornada(userLogueado.nombre);
        const grupo   = userLogueado.grupo   || _gjA.grupo   || '';
        const jornada = userLogueado.jornada || _gjA.jornada || '';
        const asistidos = diasDelMes.filter(d => dias[d] === 1).length;
        const descansos = diasDelMes.filter(d => dias[d] === 0).length;
        const faltas    = diasDelMes.filter(d => dias[d] === -1).length;
        const diasHabiles = asistidos + faltas;
        const pct = diasHabiles > 0 ? Math.round((asistidos / diasHabiles) * 100) : 0;
        const celdasCalendario = diasDelMes.map(d => {
            const v = dias[d];
            const letra   = v === 1 ? 'A' : v === 0 ? 'D' : v === -1 ? 'F' : '·';
            const bg      = v === 1 ? '#27ae60' : v === 0 ? 'rgba(243,156,18,0.15)' : v === -1 ? 'rgba(255,45,85,0.15)' : 'rgba(255,255,255,0.04)';
            const border  = v === 1 ? 'none' : v === 0 ? '1px solid #f39c12' : v === -1 ? '1px solid var(--accent)' : '1px solid rgba(255,255,255,0.07)';
            const color   = v === 1 ? '#fff' : v === 0 ? '#f39c12' : v === -1 ? 'var(--accent)' : 'rgba(255,255,255,0.25)';
            return `<div style="display:flex;flex-direction:column;align-items:center;gap:3px;">
                <span style="font-size:9px;color:rgba(255,255,255,0.3);font-weight:600;">${d}</span>
                <div style="width:34px;height:34px;border-radius:8px;background:${bg};border:${border};color:${color};font-size:11px;font-weight:800;display:flex;align-items:center;justify-content:center;">${letra}</div>
            </div>`;
        }).join('');
        const pctBarColor = pct >= 90 ? '#27ae60' : pct >= 70 ? '#f39c12' : 'var(--accent)';
        cont.innerHTML = `
            <div style="max-width:520px;margin:0 auto;">
                <!-- Tarjeta header -->
                <div style="background:var(--panelBg);border-radius:18px;border:1px solid rgba(255,255,255,0.1);overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.25);margin-bottom:16px;">
                    <div style="background:linear-gradient(135deg,${pctBarColor}20,${pctBarColor}40);border-bottom:3px solid ${pctBarColor};padding:20px 22px;display:flex;align-items:center;gap:14px;">
                        <img src="${userLogueado.foto||'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'}" onerror="this.src='https://cdn-icons-png.flaticon.com/512/3135/3135715.png'" style="width:58px;height:58px;border-radius:50%;object-fit:cover;border:3px solid ${pctBarColor};flex-shrink:0;box-shadow:0 3px 12px rgba(0,0,0,0.3);">
                        <div style="flex:1;">
                            <div style="font-size:16px;font-weight:900;">${aNombrePropio(nombre)}</div>
                            <div style="display:flex;gap:5px;margin-top:5px;flex-wrap:wrap;">
                                ${jornada ? `<span style="background:rgba(255,255,255,0.12);color:#fff;font-size:10px;font-weight:700;padding:2px 10px;border-radius:10px;text-transform:uppercase;">🕐 ${jornada}</span>` : ''}
                                ${grupo   ? `<span style="background:rgba(255,255,255,0.08);color:rgba(255,255,255,0.7);font-size:10px;font-weight:700;padding:2px 10px;border-radius:10px;text-transform:uppercase;">👥 ${grupo}</span>` : ''}
                            </div>
                        </div>
                        <div style="text-align:center;flex-shrink:0;">
                            <div style="font-size:42px;font-weight:900;color:${pctBarColor};line-height:1;">${pct}%</div>
                            <div style="font-size:10px;color:rgba(255,255,255,0.5);text-transform:uppercase;letter-spacing:0.5px;">Asistencia</div>
                        </div>
                    </div>
                    <!-- Stats row -->
                    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;padding:16px 22px;gap:0;">
                        <div style="text-align:center;padding:0 10px;border-right:1px solid rgba(255,255,255,0.08);">
                            <div style="font-size:28px;font-weight:900;color:#27ae60;">${asistidos}</div>
                            <div style="font-size:10px;color:var(--textMuted);text-transform:uppercase;letter-spacing:0.5px;margin-top:2px;">Asistencias</div>
                        </div>
                        <div style="text-align:center;padding:0 10px;border-right:1px solid rgba(255,255,255,0.08);">
                            <div style="font-size:28px;font-weight:900;color:#f39c12;">${descansos}</div>
                            <div style="font-size:10px;color:var(--textMuted);text-transform:uppercase;letter-spacing:0.5px;margin-top:2px;">Descansos</div>
                        </div>
                        <div style="text-align:center;padding:0 10px;">
                            <div style="font-size:28px;font-weight:900;color:var(--accent);">${faltas}</div>
                            <div style="font-size:10px;color:var(--textMuted);text-transform:uppercase;letter-spacing:0.5px;margin-top:2px;">Faltas</div>
                        </div>
                    </div>
                </div>
                <!-- Calendario visual -->
                <div style="background:var(--panelBg);border-radius:18px;border:1px solid rgba(255,255,255,0.1);overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.2);">
                    <div style="padding:14px 18px;border-bottom:1px solid rgba(255,255,255,0.07);display:flex;align-items:center;justify-content:space-between;">
                        <span style="font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:var(--textMuted);">📅 Registro del Mes</span>
                        <div style="display:flex;gap:10px;font-size:10px;color:var(--textMuted);">
                            <span style="display:flex;align-items:center;gap:4px;"><span style="display:inline-block;width:14px;height:14px;border-radius:4px;background:#27ae60;"></span>A</span>
                            <span style="display:flex;align-items:center;gap:4px;"><span style="display:inline-block;width:14px;height:14px;border-radius:4px;border:1px solid #f39c12;background:rgba(243,156,18,0.15);"></span>D</span>
                            <span style="display:flex;align-items:center;gap:4px;"><span style="display:inline-block;width:14px;height:14px;border-radius:4px;border:1px solid var(--accent);background:rgba(255,45,85,0.15);"></span>F</span>
                        </div>
                    </div>
                    <div style="padding:16px 18px;display:flex;flex-wrap:wrap;gap:8px;justify-content:flex-start;">${celdasCalendario}</div>
                </div>
            </div>`;
        return;
    }

    // ADMIN / SUPERVISOR: tabla Excel todos los asesores
    // Ordenar: primero MAÑANA, luego TARDE, luego MADRUGADA, luego sin jornada; dentro de cada jornada alfabético
    const ordenJornada = { 'MAÑANA': 0, 'TARDE': 1, 'MADRUGADA': 2 };
    nombresVisibles.sort((a, b) => {
        const gjA = getGrupoJornada(a);
        const gjB = getGrupoJornada(b);
        const jA = (gjA.jornada || '').toUpperCase();
        const jB = (gjB.jornada || '').toUpperCase();
        const oA = ordenJornada[jA] !== undefined ? ordenJornada[jA] : 99;
        const oB = ordenJornada[jB] !== undefined ? ordenJornada[jB] : 99;
        if (oA !== oB) return oA - oB;
        return a.localeCompare(b, 'es');
    });
    const thDias = diasDelMes.map(d => `<th style="text-align:center;min-width:28px;font-size:11px;padding:4px;">D${d}</th>`).join('');
    const filas = nombresVisibles.map(nombre => {
        const dias = porNombre[nombre];
        const asistidos = diasDelMes.filter(d => dias[d] === 1).length;
        const descansos = diasDelMes.filter(d => dias[d] === 0).length;
        const faltas    = diasDelMes.filter(d => dias[d] === -1).length;
        const diasHabiles = asistidos + faltas;
        const pct = diasHabiles > 0 ? Math.round((asistidos / diasHabiles) * 100) : 0;
        const u = usuarios.find(u => u.nombre.toLowerCase().trim() === nombre.toLowerCase().trim());
        const gj      = getGrupoJornada(nombre);
        const plat    = gj.plataforma || (u && u.plataforma ? u.plataforma : '-');
        const grupo   = gj.grupo   || '—';
        const jornada = gj.jornada || '—';
        const cfg = getPlatConfig(plat);
        const celdas = diasDelMes.map(d => {
            const v = dias[d];
            if (v === 1)  return `<td style="text-align:center;color:#27ae60;font-weight:800;font-size:12px;">A</td>`;
            if (v === 0)  return `<td style="text-align:center;color:#f39c12;font-weight:800;font-size:12px;">D</td>`;
            if (v === -1) return `<td style="text-align:center;color:var(--accent);font-weight:800;font-size:12px;">F</td>`;
            return `<td style="text-align:center;color:var(--textMuted);font-size:10px;">-</td>`;
        }).join('');
        return `<tr>
            <td style="white-space:nowrap;font-weight:600;padding:6px 8px;">${aNombrePropio(nombre)}</td>
            <td style="padding:4px 6px;"><span style="background:${cfg.color};color:#fff;padding:2px 8px;border-radius:20px;font-size:10px;font-weight:700;">${plat}</span></td>
            <td style="padding:4px 6px;"><span style="background:rgba(255,255,255,0.08);color:var(--textMuted);padding:2px 8px;border-radius:20px;font-size:10px;font-weight:700;">🕐 ${jornada}</span></td>
            <td style="padding:4px 6px;"><span style="background:rgba(255,255,255,0.08);color:var(--textMuted);padding:2px 8px;border-radius:20px;font-size:10px;font-weight:700;">👥 ${grupo}</span></td>
            <td style="text-align:center;color:#27ae60;font-weight:700;">${asistidos}</td>
            <td style="text-align:center;color:#f39c12;font-weight:700;">${descansos}</td>
            <td style="text-align:center;color:var(--accent);font-weight:700;">${faltas}</td>
            <td style="text-align:center;font-weight:700;">${pct}%</td>
            ${celdas}
        </tr>`;
    }).join('');
    // Agrupar por jornada para mostrar secciones
    const porJornada = {};
    nombresVisibles.forEach(nombre => {
        const gj = getGrupoJornada(nombre);
        const j = (gj.jornada || 'SIN JORNADA').toUpperCase();
        if (!porJornada[j]) porJornada[j] = [];
        porJornada[j].push(nombre);
    });
    const ordenJ = ['MAÑANA','TARDE','MADRUGADA','MADRUGADA'];
    const jornadasOrder = [...ordenJ.filter(j=>porJornada[j]), ...Object.keys(porJornada).filter(j=>!ordenJ.includes(j))];
    const jornadaCfg = { 'TARDE':{color:'#3498db',icon:'🌆'}, 'MAÑANA':{color:'#27ae60',icon:'🌅'}, 'MADRUGADA':{color:'#9b59b6',icon:'🌙'}, 'ÚNICA':{color:'#e67e22',icon:'⭐'}, 'MADRUGADA':{color:'#e74c3c',icon:'🌃'}, 'SIN JORNADA':{color:'#888',icon:'🕐'} };

    let sectionsHTML = '';
    jornadasOrder.forEach(jornada => {
        const jCfg = jornadaCfg[jornada] || {color:'#888',icon:'🕐'};
        const nombresJ = porJornada[jornada];
        const cards = nombresJ.map(nombre => {
            const dias = porNombre[nombre];
            const asistidos = diasDelMes.filter(d => dias[d] === 1).length;
            const descansos = diasDelMes.filter(d => dias[d] === 0).length;
            const faltas    = diasDelMes.filter(d => dias[d] === -1).length;
            const diasHabiles = asistidos + faltas;
            const pct = diasHabiles > 0 ? Math.round((asistidos / diasHabiles) * 100) : 0;
            const u = usuarios.find(u => u.nombre.toLowerCase().trim() === nombre.toLowerCase().trim());
            const gj = getGrupoJornada(nombre);
            const plat = gj.plataforma || (u && u.plataforma ? u.plataforma : '');
            const grupo = gj.grupo || '—';
            const cfg = getPlatConfig(plat);
            const foto = u ? (u.foto || '') : '';
            const pctColor = pct >= 90 ? '#27ae60' : pct >= 70 ? '#f39c12' : 'var(--accent)';
            const celdaDias = diasDelMes.map(d => {
                const v = dias[d];
                if (v === 1)  return `<div style="display:flex;flex-direction:column;align-items:center;gap:2px;"><span style="font-size:8px;color:rgba(255,255,255,0.3);font-weight:600;">${d}</span><span style="display:inline-block;width:22px;height:22px;border-radius:5px;background:#27ae60;color:#fff;font-size:9px;font-weight:800;text-align:center;line-height:22px;">A</span></div>`;
                if (v === 0)  return `<div style="display:flex;flex-direction:column;align-items:center;gap:2px;"><span style="font-size:8px;color:rgba(255,255,255,0.3);font-weight:600;">${d}</span><span style="display:inline-block;width:22px;height:22px;border-radius:5px;background:#f39c1222;border:1px solid #f39c12;color:#f39c12;font-size:9px;font-weight:800;text-align:center;line-height:22px;">D</span></div>`;
                if (v === -1) return `<div style="display:flex;flex-direction:column;align-items:center;gap:2px;"><span style="font-size:8px;color:rgba(255,255,255,0.3);font-weight:600;">${d}</span><span style="display:inline-block;width:22px;height:22px;border-radius:5px;background:rgba(255,45,85,0.15);border:1px solid var(--accent);color:var(--accent);font-size:9px;font-weight:800;text-align:center;line-height:22px;">F</span></div>`;
                return `<div style="display:flex;flex-direction:column;align-items:center;gap:2px;"><span style="font-size:8px;color:rgba(255,255,255,0.15);font-weight:600;">${d}</span><span style="display:inline-block;width:22px;height:22px;border-radius:5px;background:rgba(255,255,255,0.04);color:var(--textMuted);font-size:9px;text-align:center;line-height:22px;">-</span></div>`;
            }).join('');
            return `<div style="background:var(--panelBg);border-radius:14px;border:1px solid rgba(255,255,255,0.08);overflow:hidden;transition:0.2s;" onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 6px 20px rgba(0,0,0,0.25)'" onmouseout="this.style.transform='';this.style.boxShadow=''">
                <div style="background:linear-gradient(135deg,${jCfg.color}15,${jCfg.color}30);border-bottom:2px solid ${jCfg.color};padding:12px 14px;display:flex;align-items:center;gap:10px;">
                    <img src="${foto}" onerror="this.src='https://cdn-icons-png.flaticon.com/512/3135/3135715.png'" style="width:38px;height:38px;border-radius:50%;object-fit:cover;border:2px solid ${jCfg.color};flex-shrink:0;">
                    <div style="flex:1;min-width:0;">
                        <div style="font-size:13px;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${aNombrePropio(nombre)}</div>
                        <div style="display:flex;gap:4px;margin-top:3px;flex-wrap:wrap;">
                            ${plat ? `<span style="background:${cfg.color};color:#fff;border-radius:8px;padding:1px 7px;font-size:10px;font-weight:700;">${plat}</span>` : ''}
                            ${grupo !== '—' ? `<span style="background:rgba(255,255,255,0.08);color:var(--textMuted);border-radius:8px;padding:1px 7px;font-size:10px;font-weight:700;">👥 ${grupo}</span>` : ''}
                        </div>
                    </div>
                    <div style="text-align:center;flex-shrink:0;">
                        <div style="font-size:22px;font-weight:900;color:${pctColor};line-height:1;">${pct}%</div>
                        <div style="font-size:9px;color:var(--textMuted);text-transform:uppercase;letter-spacing:0.5px;">Asistencia</div>
                    </div>
                </div>
                <div style="padding:10px 14px;">
                    <div style="display:flex;justify-content:space-around;margin-bottom:10px;padding-bottom:8px;border-bottom:1px solid rgba(255,255,255,0.06);">
                        <div style="text-align:center;"><div style="font-size:18px;font-weight:900;color:#27ae60;">${asistidos}</div><div style="font-size:9px;color:var(--textMuted);">Asistencias</div></div>
                        <div style="text-align:center;"><div style="font-size:18px;font-weight:900;color:#f39c12;">${descansos}</div><div style="font-size:9px;color:var(--textMuted);">Descansos</div></div>
                        <div style="text-align:center;"><div style="font-size:18px;font-weight:900;color:var(--accent);">${faltas}</div><div style="font-size:9px;color:var(--textMuted);">Faltas</div></div>
                    </div>
                    <div style="display:flex;flex-wrap:wrap;gap:3px;">${celdaDias}</div>
                </div>
            </div>`;
        }).join('');

        sectionsHTML += `
        <div style="margin-bottom:28px;">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:14px;padding-bottom:8px;border-bottom:2px solid ${jCfg.color}44;">
                <span style="font-size:18px;">${jCfg.icon}</span>
                <span style="font-size:14px;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:${jCfg.color};">Jornada ${jornada}</span>
                <span style="background:${jCfg.color}22;color:${jCfg.color};border:1px solid ${jCfg.color}55;border-radius:10px;padding:2px 9px;font-size:11px;font-weight:700;">${nombresJ.length} asesor${nombresJ.length!==1?'es':''}</span>
            </div>
            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:14px;">${cards}</div>
        </div>`;
    });

    const leyenda = `<div style="display:flex;gap:12px;margin-bottom:18px;flex-wrap:wrap;">
        <span style="font-size:11px;color:var(--textMuted);display:flex;align-items:center;gap:4px;"><span style="display:inline-block;width:18px;height:18px;border-radius:4px;background:#27ae60;color:#fff;font-size:8px;font-weight:800;text-align:center;line-height:18px;">A</span> Asiste</span>
        <span style="font-size:11px;color:var(--textMuted);display:flex;align-items:center;gap:4px;"><span style="display:inline-block;width:18px;height:18px;border-radius:4px;background:#f39c1222;border:1px solid #f39c12;color:#f39c12;font-size:8px;font-weight:800;text-align:center;line-height:18px;">D</span> Descanso</span>
        <span style="font-size:11px;color:var(--textMuted);display:flex;align-items:center;gap:4px;"><span style="display:inline-block;width:18px;height:18px;border-radius:4px;background:rgba(255,45,85,0.15);border:1px solid var(--accent);color:var(--accent);font-size:8px;font-weight:800;text-align:center;line-height:18px;">F</span> Falta</span>
    </div>`;

    cont.innerHTML = leyenda + sectionsHTML;
}


// GESTIÓN DE PERSONAL (NUEVO REQUISITO)
function guardarUsuario() {
    const editIdx = parseInt(document.getElementById("editIndex").value);
    const passInput = document.getElementById("newPass").value;
    const n = {
        nombre:     document.getElementById("newNombre").value.trim(),
        foto:       document.getElementById("newFotoUrl").value.trim(),
        usuario:    document.getElementById("newUser").value.trim().toUpperCase(),
        password:   passInput,
        rol:        document.getElementById("newRol").value,
        plataforma: document.getElementById("newPlataforma").value,
        grupo:      document.getElementById("newGrupo").value
    };

    if (!n.nombre || !n.usuario) { toast('Completa nombre e ID de usuario.', 'warning'); return; }

    async function _guardar() {
        if (editIdx === -1) {
            // Usuario nuevo: contraseña obligatoria, SIEMPRE hashear con salt
            if (!n.password) { toast('La contraseña es obligatoria para usuarios nuevos.', 'warning'); return; }
            n.password = await _hashConSalt(n.password, n.usuario);
            usuarios.push(n);
        } else {
            if (!n.password) {
                // Sin nueva contraseña: conservar hash existente
                n.password = usuarios[editIdx].password;
            } else {
                // Nueva contraseña: hashear con salt. Nunca aceptar un hash directo
                n.password = await _hashConSalt(n.password, n.usuario);
            }
            n.usuario = usuarios[editIdx].usuario; // ID no editable una vez creado
            usuarios[editIdx] = n;
        }
        localStorage.setItem('usuarios_usd', JSON.stringify(usuarios));
        cancelarEdicion();
        renderListaUsuarios();
        toast('Perfil guardado correctamente.', 'success');
    }
    _guardar();
}

function desbloqueoManual() {
    const input = document.getElementById('desbloquearUserId');
    const usuarioId = (input.value || '').trim();
    if (!usuarioId) { toast('⚠️ Escribe el ID del usuario a desbloquear.', 'warning'); return; }
    // Ejecutar el desbloqueo directo sin validar el estado local
    // ya que el localStorage del admin puede no tener los intentos del asesor
    function _ejecutarDesbloqueo(data) {
        delete data[usuarioId];
        Storage.prototype.setItem.call(localStorage, INTENTOS_KEY, JSON.stringify(data));
        if (window._fbGuardar) { try { window._fbGuardar(INTENTOS_KEY, data); } catch(e) {} }
        input.value = '';
        toast('🔓 Usuario "' + usuarioId + '" desbloqueado correctamente.', 'success');
        renderListaUsuarios();
    }
    // Primero intentar sincronizar desde Firebase para tener el estado real
    if (window._fbCargar) {
        window._fbCargar(INTENTOS_KEY).then(fbData => {
            const data = fbData || JSON.parse(localStorage.getItem(INTENTOS_KEY) || '{}');
            _ejecutarDesbloqueo(data);
        }).catch(() => {
            const data = JSON.parse(localStorage.getItem(INTENTOS_KEY) || '{}');
            _ejecutarDesbloqueo(data);
        });
    } else {
        const data = JSON.parse(localStorage.getItem(INTENTOS_KEY) || '{}');
        _ejecutarDesbloqueo(data);
    }
}

function desbloquearUsuario(usuarioId) {
    const data = JSON.parse(localStorage.getItem(INTENTOS_KEY) || '{}');
    delete data[usuarioId];
    localStorage.setItem(INTENTOS_KEY, JSON.stringify(data));
    // Sincronizar desbloqueo con Firebase para que todos los dispositivos lo reflejen
    if (window._fbGuardar) {
        try { window._fbGuardar(INTENTOS_KEY, data); } catch(e) {}
    }
    renderListaUsuarios();
    toast('\ud83d\udd13 Usuario desbloqueado correctamente.', 'success');
}

window.renderListaUsuarios = function renderListaUsuarios() {
    const asesores = usuarios
        .map((u, i) => ({ u, i }))
        .filter(({ u }) => u.rol === 'asesor')
        .sort((a, b) => a.u.nombre.localeCompare(b.u.nombre, 'es'));
    const otros = usuarios
        .map((u, i) => ({ u, i }))
        .filter(({ u }) => u.rol !== 'asesor');
    const lista = esRolAdmin(userLogueado.rol) ? [...otros, ...asesores] : asesores;

    const jornadaColor = { 'TARDE':'#3498db', 'MAÑANA':'#27ae60', 'MADRUGADA':'#9b59b6', 'ÚNICA':'#e67e22', 'MADRUGADA':'#e74c3c' };
    const rolColor = { 'admin':'#e74c3c', 'coordinador':'#8e44ad', 'supervisor1':'#27ae60', 'supervisor2':'#16a085', 'capacitador':'#2980b9', 'calidad':'#d35400', 'asesor':'#3498db' };
    const rolLabel = { 'admin':'⚙️ Admin', 'coordinador':'🎯 Coordinador', 'supervisor1':'🌅 Sup. Mañana', 'supervisor2':'🌆 Sup. Tarde', 'capacitador':'📚 Capacitador', 'calidad':'✅ Calidad', 'asesor':'👤 Asesor' };

    const makeCard = ({ u, i }) => {
        const gj      = getGrupoJornada(u.nombre);
        const grupo   = u.grupo   || gj.grupo   || '';
        const jornada = u.jornada || gj.jornada || '';
        const plat    = u.plataforma || '';
        const foto    = u.foto || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png';
        const cfg     = getPlatConfig(plat);
        const jColor  = jornadaColor[(jornada||'').toUpperCase()] || '#888';
        const rColor  = rolColor[u.rol] || '#888';
        const jIcon   = { 'TARDE':'🌆', 'MAÑANA':'🌅', 'MADRUGADA':'🌙', 'MADRUGADA':'🌃' }[(jornada||'').toUpperCase()] || '🕐';
        const bloqueado = esBloqueado(u.usuario);
        const borderColor = bloqueado ? '#e74c3c' : rColor;

        const badgeBloqueado = bloqueado ? `
            <div style="display:flex;align-items:center;gap:6px;padding:7px 10px;background:rgba(231,76,60,0.12);border-radius:8px;border:1px solid rgba(231,76,60,0.35);margin-top:2px;">
                <span style="font-size:13px;">🔒</span>
                <span style="font-size:11px;font-weight:800;color:#e74c3c;flex:1;">Usuario bloqueado</span>
                <button onclick="desbloquearUsuario('${u.usuario}')" style="background:#e74c3c;color:#fff;border:none;padding:4px 10px;border-radius:7px;cursor:pointer;font-size:10px;font-weight:800;transition:0.2s;white-space:nowrap;" onmouseover="this.style.opacity='0.82'" onmouseout="this.style.opacity='1'">🔓 Desbloquear</button>
            </div>` : '';

        return `
        <div style="background:var(--panelBg);border-radius:16px;border:1px solid ${bloqueado ? 'rgba(231,76,60,0.4)' : 'rgba(255,255,255,0.08)'};overflow:hidden;display:flex;flex-direction:column;transition:0.25s;box-shadow:0 4px 16px rgba(0,0,0,0.2);" onmouseover="this.style.transform='translateY(-3px)';this.style.boxShadow='0 10px 30px rgba(0,0,0,0.35)';this.style.borderColor='${borderColor}55'" onmouseout="this.style.transform='';this.style.boxShadow='0 4px 16px rgba(0,0,0,0.2)';this.style.borderColor='${bloqueado ? 'rgba(231,76,60,0.4)' : 'rgba(255,255,255,0.08)'}'">
            <div style="background:linear-gradient(135deg,${rColor}15,${rColor}32);border-bottom:3px solid ${bloqueado ? '#e74c3c' : rColor};padding:16px 18px;display:flex;align-items:center;gap:12px;">
                <div style="position:relative;flex-shrink:0;">
                    <img src="${foto}" onerror="this.src='https://cdn-icons-png.flaticon.com/512/3135/3135715.png'" style="width:52px;height:52px;border-radius:50%;object-fit:cover;border:2px solid ${bloqueado ? '#e74c3c' : rColor};box-shadow:0 3px 10px rgba(0,0,0,0.35);${bloqueado ? 'filter:grayscale(0.4);' : ''}">
                    <div style="position:absolute;bottom:-2px;right:-2px;width:16px;height:16px;border-radius:50%;background:${bloqueado ? '#e74c3c' : '#27ae60'};border:2px solid var(--panelBg);"></div>
                </div>
                <div style="flex:1;min-width:0;">
                    <div style="font-size:13px;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:4px;">${aNombrePropio(u.nombre)}</div>
                    <span style="font-size:10px;font-weight:700;background:${rColor};color:#fff;padding:2px 9px;border-radius:10px;text-transform:uppercase;letter-spacing:0.5px;">${rolLabel[u.rol]||u.rol}</span>
                </div>
            </div>
            <div style="padding:12px 16px;flex:1;display:flex;flex-direction:column;gap:10px;">
                <div style="display:flex;flex-wrap:wrap;gap:5px;">
                    ${plat ? `<span style="background:${cfg.color}22;color:${cfg.color};border:1px solid ${cfg.color}55;border-radius:10px;padding:3px 10px;font-size:11px;font-weight:700;">${cfg.emoji} ${plat}</span>` : ''}
                    ${jornada ? `<span style="background:${jColor}18;color:${jColor};border:1px solid ${jColor}44;border-radius:10px;padding:3px 10px;font-size:11px;font-weight:700;">${jIcon} ${jornada}</span>` : ''}
                    ${grupo ? `<span style="background:rgba(255,255,255,0.06);color:var(--textMuted);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:3px 10px;font-size:11px;font-weight:700;">👥 ${grupo}</span>` : ''}
                </div>
                <div style="display:flex;align-items:center;gap:6px;padding:6px 10px;background:rgba(255,255,255,0.03);border-radius:8px;border:1px solid rgba(255,255,255,0.06);">
                    <span style="font-size:11px;">🪪</span>
                    <span style="font-size:10px;color:var(--textMuted);font-family:monospace;letter-spacing:0.5px;">${u.usuario}</span>
                </div>
                ${badgeBloqueado}
            </div>
            <div style="padding:10px 14px;border-top:1px solid rgba(255,255,255,0.06);display:flex;gap:6px;">
                <button class="btn-action btn-edit" onclick="editarPerfil(${i})" style="flex:1;padding:8px 4px;border-radius:8px;font-size:11px;font-weight:700;">✏️ Editar</button>
                <button class="btn-action btn-cv" onclick="abrirModalCV(${i})" style="flex:1;padding:8px 4px;border-radius:8px;font-size:11px;font-weight:700;">📋 HV</button>
                <button onclick="usdAbrirModalDocsPorUsuario('${u.usuario}')" style="flex:1;padding:8px 4px;border-radius:8px;font-size:11px;font-weight:700;background:linear-gradient(135deg,rgba(39,174,96,0.25),rgba(39,174,96,0.12));color:#27ae60;border:1px solid rgba(39,174,96,0.4);cursor:pointer;transition:0.2s;" onmouseover="this.style.opacity='0.8'" onmouseout="this.style.opacity='1'">📄 Docs</button>
                <button class="btn-action btn-delete" onclick="borrarPerfil(${i})" style="padding:8px 10px;border-radius:8px;font-size:11px;">🗑️</button>
            </div>
        </div>`;
    };

    // Separar por rol para mostrar secciones
    const supervisoresLista = lista.filter(({u}) => !esRolAsesor(u.rol));
    const asesoresLista     = lista.filter(({u}) => u.rol === 'asesor');

    let html = '';

    if (supervisoresLista.length > 0) {
        html += `
        <div style="margin-bottom:28px;">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:14px;padding-bottom:8px;border-bottom:2px solid rgba(230,126,34,0.35);">
                <span style="font-size:18px;">🔑</span>
                <span style="font-size:14px;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:#e67e22;">Personal de Gestión</span>
                <span style="background:rgba(230,126,34,0.2);color:#e67e22;border:1px solid rgba(230,126,34,0.4);border-radius:10px;padding:2px 9px;font-size:11px;font-weight:700;">${supervisoresLista.length} persona${supervisoresLista.length!==1?'s':''}</span>
            </div>
            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:14px;">${supervisoresLista.map(makeCard).join('')}</div>
        </div>`;
    }

    if (asesoresLista.length > 0) {
        html += `
        <div style="margin-bottom:10px;">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:14px;padding-bottom:8px;border-bottom:2px solid rgba(52,152,219,0.35);">
                <span style="font-size:18px;">👥</span>
                <span style="font-size:14px;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:#3498db;">Asesores</span>
                <span style="background:rgba(52,152,219,0.2);color:#3498db;border:1px solid rgba(52,152,219,0.4);border-radius:10px;padding:2px 9px;font-size:11px;font-weight:700;">${asesoresLista.length} asesor${asesoresLista.length!==1?'es':''}</span>
            </div>
            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:14px;">${asesoresLista.map(makeCard).join('')}</div>
        </div>`;
    }

    if (!html) html = `<p style="color:var(--textMuted);text-align:center;padding:40px;">Sin perfiles registrados.</p>`;

    document.getElementById("listaUsuariosHtml").innerHTML = html;
}

function editarPerfil(i) {
    const u = usuarios[i];
    document.getElementById("editIndex").value = i;
    document.getElementById("newNombre").value = u.nombre;
    document.getElementById("newFotoUrl").value = u.foto || "";
    document.getElementById("newUser").value = u.usuario;
    document.getElementById("newPass").value = ""; // No mostrar el hash; dejar vacío para no cambiarla
    document.getElementById("newRol").value = u.rol;
    document.getElementById("newPlataforma").value = u.plataforma || "";
    document.getElementById("newGrupo").value = u.grupo || "";
   
    document.getElementById("formTitle").innerText = "Editando Perfil";
    document.getElementById("btnSave").innerText = "💾 ACTUALIZAR";
    document.getElementById("btnCancel").style.display = "block";
    // Scroll al formulario
    document.getElementById("formTitle").closest("div[style]").scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function cancelarEdicion() {
    document.getElementById("editIndex").value = "-1";
    document.getElementById("formTitle").innerText = "Registro de Perfil";
    document.getElementById("btnSave").innerText = "💾 GUARDAR";
    document.getElementById("btnCancel").style.display = "none";
    ["newNombre", "newFotoUrl", "newUser", "newPass"].forEach(id => document.getElementById(id).value = "");
    document.getElementById("newPlataforma").value = "";
    document.getElementById("newGrupo").value = "";
}

function borrarPerfil(i) {
    confirmar({ titulo: '¿Eliminar perfil?', msg: 'Esta acción no se puede deshacer.', icono: '🗑️', labelOk: 'Eliminar', colorOk: '#e74c3c' }).then(ok => { if(ok) {
        usuarios.splice(i, 1);
        localStorage.setItem('usuarios_usd', JSON.stringify(usuarios));
        renderListaUsuarios();
        toast('Perfil eliminado.', 'success');
    } });
}

// HOJA DE VIDA PERSONAL — NUEVO
function abrirModalCV(i) {
    const u = usuarios[i];
    // Verificar permiso: supervisor solo puede ver/editar asesores
    if(esRolSuperior(userLogueado.rol) && !esRolAdmin(userLogueado.rol) && !esRolAsesor(u.rol)) {
        toast('Solo puedes gestionar hojas de vida de asesores.', 'warning'); return;
    }
    document.getElementById("cvUserIndex").value = i;
    const key = u.usuario;
    const cv = hojasDev[key] || {};

    document.getElementById("cvNombre").value = cv.nombre || u.nombre || "";
    document.getElementById("cvCedula").value = cv.cedula || u.usuario || "";
    document.getElementById("cvCargo").value = cv.cargo || u.rol || "";
    document.getElementById("cvFechaNac").value = cv.fechaNac || "";
    document.getElementById("cvTelefono").value = cv.telefono || "";
    document.getElementById("cvCorreo").value = cv.correo || "";
    document.getElementById("cvCiudad").value = cv.ciudad || "";
    document.getElementById("cvEstudios").value = cv.estudios || "";
    document.getElementById("cvDireccion").value = cv.direccion || "";
    document.getElementById("cvHabilidades").value = cv.habilidades || "";
    document.getElementById("cvFechaIngreso").value = cv.fechaIngreso || "";
    document.getElementById("cvEstado").value = cv.estado || "Activo";
    document.getElementById("cvPlataforma").value = cv.plataforma || u.plataforma || "";
    document.getElementById("cvGrupo").value      = cv.grupo    || u.grupo    || "";
    document.getElementById("cvJornada").value    = cv.jornada  || u.jornada  || "";
    document.getElementById("cvEdad").value       = cv.edad     || "";
    document.getElementById("cvBanco").value      = cv.banco    || "";
    document.getElementById("cvCuenta").value     = cv.cuenta   || "";

    document.getElementById("modalCV").classList.add("open");
}

function cerrarModalCV() {
    document.getElementById("modalCV").classList.remove("open");
}

function guardarCV() {
    const i = parseInt(document.getElementById("cvUserIndex").value);
    if(i < 0) return;
    const u = usuarios[i];
    const key = u.usuario;

    hojasDev[key] = {
        nombre: document.getElementById("cvNombre").value,
        cedula: document.getElementById("cvCedula").value,
        cargo: document.getElementById("cvCargo").value,
        fechaNac: document.getElementById("cvFechaNac").value,
        telefono: document.getElementById("cvTelefono").value,
        correo: document.getElementById("cvCorreo").value,
        ciudad: document.getElementById("cvCiudad").value,
        estudios: document.getElementById("cvEstudios").value,
        direccion: document.getElementById("cvDireccion").value,
        habilidades: document.getElementById("cvHabilidades").value,
        fechaIngreso: document.getElementById("cvFechaIngreso").value,
        estado: document.getElementById("cvEstado").value,
        plataforma: document.getElementById("cvPlataforma").value,
        grupo: document.getElementById("cvGrupo").value,
        jornada: document.getElementById("cvJornada").value,
        edad: document.getElementById("cvEdad").value,
        banco: document.getElementById("cvBanco").value,
        cuenta: document.getElementById("cvCuenta").value
    };
    // Sincronizar grupo y jornada también en el objeto usuario
    usuarios[i].grupo   = document.getElementById("cvGrupo").value;
    usuarios[i].jornada = document.getElementById("cvJornada").value;
    localStorage.setItem('usuarios_usd', JSON.stringify(usuarios));

    localStorage.setItem('hojas_vida_usd', JSON.stringify(hojasDev));
    cerrarModalCV();
    toast(`Hoja de vida de ${aNombrePropio(u.nombre)} guardada correctamente.`, 'success');
}

// Cerrar modal al hacer clic fuera
document.getElementById("modalCV").addEventListener("click", function(e) {
    if(e.target === this) cerrarModalCV();
});


// ── MÓDULO DE GRUPOS ────────────────────────────────────────────────────────
const gruposBase = [
    { nombre: "ALEMANIA",  modelos: [
        { nombre: "Cami, 26",      codigo: "113084672831" },
        { nombre: "Alejandra, 32", codigo: "112938570031" },
        { nombre: "Valentina, 22", codigo: "112934731231" },
        { nombre: "Jim, 49",       codigo: "112876923531" },
        { nombre: "Leidy, 29",     codigo: "114385896631" },
        { nombre: "Yuli, 27",      codigo: "112923453031" }
    ], asesores: [
        { id: "JULIAN.CUBILLOS",      nombre: "Julian Felipe Cubillos Vivas",           jornada: "TARDE"  },
    ]},
    { nombre: "ESPAÑA",    modelos: [
        { nombre: "Julieth, 26",   codigo: "112934964231" },
        { nombre: "Marinela, 29",  codigo: "112875295131" },
        { nombre: "Yess, 26",      codigo: "112872031531" },
        { nombre: "Fernanda, 29",  codigo: "112858625031" },
        { nombre: "Dany, 41",      codigo: "113052126831" },
        { nombre: "Evelin, 26",    codigo: "113116890631" }
    ], asesores: [
        { id: "ALEJANDRO.PEÑA",       nombre: "Alejandro Peña Medina",                  jornada: "TARDE"  }
    ]},
    { nombre: "FRANCIA",   modelos: [
        { nombre: "Evelin, 26",    codigo: "L1988871" },
        { nombre: "Yess, 26",      codigo: "L3223410" },
        { nombre: "Marinela, 29",  codigo: "L1521221" },
        { nombre: "Yes, 21",       codigo: "L2839099" },
        { nombre: "Sofia, 21",     codigo: "L3130224" },
        { nombre: "Vanesa, 21",    codigo: "L3735480" },
        { nombre: "Fernanda, 22",  codigo: "L2889489" },
        { nombre: "Mary, 48",      codigo: "L3894233" }
    ], asesores: [
    ]},
    { nombre: "ARGENTINA", modelos: [
        { nombre: "Valentina, 22",  codigo: "18685103" },
        { nombre: "Evelin, 26",     codigo: "18710487" },
        { nombre: "Yess, 26",       codigo: "18749923" },
        { nombre: "Vanesa, 21",     codigo: "18673506" },
        { nombre: "Fernanda, 22",   codigo: "18682666" },
        { nombre: "Alejandra, 21",  codigo: "18676417" },
        { nombre: "Karina",         codigo: "18749702" },
        { nombre: "Jennifer, 28",   codigo: "18750097" },
        { nombre: "Mary, 48",       codigo: "18763994" }
    ], asesores: [
        
    ]},
];

// Migrar registro antiguo: modelo string → modelos array, asesorId/asesorNombre → asesores[]
function migrarGrupo(g) {
    // Migrar modelo string → modelos array
    if (!g.modelos) {
        g.modelos = (g.modelo && g.modelo.trim()) ? [g.modelo.trim()] : [];
        delete g.modelo;
    }
    // Si aún tiene formato viejo asesorId, limpiar — se reemplazará desde gruposBase
    if (g.hasOwnProperty('asesorId')) {
        delete g.asesorId;
        delete g.asesorNombre;
    }
    if (!g.asesores) g.asesores = [];
    return g;
}

let grupos = (function() {
    const saved = JSON.parse(localStorage.getItem('grupos_usd'));
    if (saved && saved.length > 0) {
        let changed = false;
        // Migrar formato antiguo
        saved.forEach((g, i) => { saved[i] = migrarGrupo(g); });
        // Sincronizar desde gruposBase: asesores con jornada definida son la fuente de verdad
        gruposBase.forEach(base => {
            let gSaved = saved.find(g => g.nombre === base.nombre);
            if (!gSaved) {
                saved.push(JSON.parse(JSON.stringify(base)));
                changed = true;
            } else {
                // Eliminar asesores sin jornada que hayan quedado del formato viejo
                const antes = gSaved.asesores.length;
                gSaved.asesores = gSaved.asesores.filter(a => a.jornada && a.jornada.trim() !== '');
                if (gSaved.asesores.length !== antes) changed = true;
                // Agregar asesores base que falten (comparar por id de usuario)
                base.asesores.forEach(ba => {
                    if (!gSaved.asesores.find(a => a.id === ba.id)) {
                        gSaved.asesores.push({...ba});
                        changed = true;
                    }
                });
                // Sincronizar modelos desde gruposBase: agregar las que falten por código
                if (!gSaved.modelos) { gSaved.modelos = []; }
                base.modelos.forEach(bm => {
                    if (!gSaved.modelos.find(m => (typeof m === 'object' ? m.codigo : m) === bm.codigo)) {
                        gSaved.modelos.push({...bm});
                        changed = true;
                    }
                });
            }
        });
        // Filtrar asesores bloqueados de todos los grupos
        saved.forEach(g => { if(g.asesores) g.asesores = g.asesores.filter(a => !_USUARIOS_BLOQUEADOS.includes(a.id)); });
        if (changed) localStorage.setItem('grupos_usd', JSON.stringify(saved));
        return saved;
    }
    const base = gruposBase.map(g => { const gb = JSON.parse(JSON.stringify(g)); if(gb.asesores) gb.asesores = gb.asesores.filter(a => !_USUARIOS_BLOQUEADOS.includes(a.id)); return gb; });
    localStorage.setItem('grupos_usd', JSON.stringify(base));
    return base;
})();

function cargarSelectAsesor() {
    const sel = document.getElementById('grupoAsesor');
    if (!sel) return;
    sel.innerHTML = '<option value="" style="background:#1a1a1a;color:white;">— Seleccionar Asesor —</option>';
    // Mostrar TODOS los asesores sin importar jornada
    usuarios.filter(u => u.rol === 'asesor').forEach(u => {
        const jornada = u.jornada ? ` (${u.jornada})` : '';
        sel.innerHTML += `<option value="${u.usuario}" style="background:#1a1a1a;color:white;">${aNombrePropio(u.nombre)}${jornada}</option>`;
    });
}

// Renderiza la lista de asesores dentro del modal de crear/editar grupo
function renderAsesorListModal() {
    const cont = document.getElementById('grupoAsesoresList');
    if (!cont) return;
    const asesores = JSON.parse(document.getElementById('grupoAsesoresData').value || '[]');
    if (asesores.length === 0) {
        cont.innerHTML = '<p style="color:var(--textMuted);font-size:12px;padding:6px 0;">Ningún asesor agregado aún.</p>';
        return;
    }
    const jornadaColor = { 'TARDE':'#3498db', 'MAÑANA':'#27ae60', 'MADRUGADA':'#9b59b6', 'ÚNICA':'#e67e22', 'MADRUGADA':'#e74c3c' };
    cont.innerHTML = asesores.map((a, i) => {
        const color = jornadaColor[a.jornada ? a.jornada.toUpperCase() : ''] || '#888';
        return `<div style="display:flex;align-items:center;gap:8px;padding:8px 10px;background:rgba(255,255,255,0.04);border-radius:8px;border:1px solid rgba(255,255,255,0.07);">
            <span style="flex:1;font-size:13px;font-weight:600;">${aNombrePropio(a.nombre)}</span>
            <span style="background:${color}22;color:${color};border:1px solid ${color}55;border-radius:10px;padding:2px 8px;font-size:10px;font-weight:700;text-transform:uppercase;">${a.jornada || '—'}</span>
            <button onclick="quitarAsesorDelGrupo(${i})" style="background:rgba(255,45,85,0.15);border:1px solid var(--accent);color:var(--accent);width:24px;height:24px;border-radius:50%;cursor:pointer;font-size:11px;font-weight:bold;flex-shrink:0;">✕</button>
        </div>`;
    }).join('');
}

function agregarAsesorAlGrupo() {
    const sel = document.getElementById('grupoAsesor');
    const id = sel.value;
    if (!id) return;
    const asesores = JSON.parse(document.getElementById('grupoAsesoresData').value || '[]');
    if (asesores.find(a => a.id === id)) { toast('Ese asesor ya está en el grupo.', 'warning'); return; }
    const uObj = usuarios.find(u => u.usuario === id);
    if (!uObj) return;
    asesores.push({ id, nombre: uObj.nombre, jornada: uObj.jornada || '' });
    document.getElementById('grupoAsesoresData').value = JSON.stringify(asesores);
    sel.value = '';
    renderAsesorListModal();
}

function quitarAsesorDelGrupo(i) {
    const asesores = JSON.parse(document.getElementById('grupoAsesoresData').value || '[]');
    asesores.splice(i, 1);
    document.getElementById('grupoAsesoresData').value = JSON.stringify(asesores);
    renderAsesorListModal();
}

function cargarSelectGrupoPersonal() {
    const sel = document.getElementById('newGrupo');
    if (!sel) return;
    const gruposActuales = JSON.parse(localStorage.getItem('grupos_usd')) || gruposBase;
    const valorActual = sel.value;
    sel.innerHTML = '<option value="" style="background:#1a1a1a;color:white;">&#8212; Grupo &#8212;</option>';
    gruposActuales.forEach(g => {
        sel.innerHTML += `<option value="${g.nombre}" style="background:#1a1a1a;color:white;">${g.nombre}</option>`;
    });
    sel.value = valorActual;
}

function abrirModalGrupo(idx) {
    cancelarGrupo();
    cargarSelectAsesor();
    if (idx !== undefined && idx >= 0) {
        const g = grupos[idx];
        document.getElementById('editGrupoIndex').value = idx;
        document.getElementById('grupoNombre').value = g.nombre;
        document.getElementById('grupoModelo').value = (g.modelos && g.modelos.length > 0) ? g.modelos[0] : '';
        // Cargar asesores existentes en el hidden input
        const asesores = g.asesores || (g.asesorId ? [{id: g.asesorId, nombre: g.asesorNombre || g.asesorId, jornada: ''}] : []);
        document.getElementById('grupoAsesoresData').value = JSON.stringify(asesores);
        document.getElementById('grupoFormTitle').innerText = '📝 Editar Grupo';
    } else {
        document.getElementById('grupoAsesoresData').value = '[]';
        document.getElementById('grupoFormTitle').innerText = '➕ Crear Grupo';
    }
    renderAsesorListModal();
    const modal = document.getElementById('modalGrupo');
    modal.style.display = 'flex';
}

function cerrarModalGrupo() {
    document.getElementById('modalGrupo').style.display = 'none';
    cancelarGrupo();
}

// Modal de modelos
function abrirModalModelos(idx) {
    document.getElementById('modelosGrupoIndex').value = idx;
    const g = grupos[idx];
    document.getElementById('modelosModalTitulo').innerText = `👩 Modelos — ${g.nombre}`;
    document.getElementById('modelosModalSubtitle').innerText = `Asesor: ${aNombrePropio(g.asesorNombre || '')}`;
    document.getElementById('nuevaModeloInput').value = '';
    const cInput = document.getElementById('nuevaModeloCodigo'); if (cInput) cInput.value = '';
    renderListaModelosModal(idx);
    document.getElementById('modalModelos').style.display = 'flex';
}

function cerrarModalModelos() {
    document.getElementById('modalModelos').style.display = 'none';
    renderGrupos();
}

function renderListaModelosModal(idx) {
    const g = grupos[idx !== undefined ? idx : parseInt(document.getElementById('modelosGrupoIndex').value)];
    const cont = document.getElementById('listaModelosModal');
    if (!g || !g.modelos || g.modelos.length === 0) {
        cont.innerHTML = '<p style="color:var(--textMuted);font-size:13px;text-align:center;padding:20px 0;">Sin modelos asignadas aún.</p>';
        return;
    }
    cont.innerHTML = g.modelos.map((m, mi) => {
        const nombre = typeof m === 'object' ? (m.nombre || '') : m;
        const codigo = typeof m === 'object' ? (m.codigo || '') : '';
        const nombreArchivo = nombre.trim().split(' ')[0];
        const rutaFoto = `Fotos Modelos/${nombreArchivo}.jpg`;
        const gIdx = parseInt(document.getElementById('modelosGrupoIndex').value);
        return `
        <div style="display:flex;align-items:center;gap:10px;padding:10px 12px;background:rgba(255,255,255,0.04);border-radius:10px;border:1px solid rgba(255,255,255,0.07);">
            <img src="${rutaFoto}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"
                onclick="abrirFotoModelo('${nombre.replace(/'/g,"\\'")}','${codigo}','${g.nombre}')"
                style="width:44px;height:44px;border-radius:50%;object-fit:cover;border:2px solid var(--accent);flex-shrink:0;cursor:pointer;transition:0.2s;"
                onmouseover="this.style.transform='scale(1.08)'" onmouseout="this.style.transform='scale(1)'"
                title="Ver foto completa">
            <div onclick="abrirFotoModelo('${nombre.replace(/'/g,"\\'")}','${codigo}','${g.nombre}')"
                style="width:44px;height:44px;border-radius:50%;background:var(--accent);display:none;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;cursor:pointer;border:2px solid var(--accent);">👩</div>
            <div style="flex:1;min-width:0;">
                <div style="font-size:14px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${aNombrePropio(nombre)}</div>
                ${codigo ? `<div style="font-size:11px;color:var(--accent);font-weight:700;margin-top:2px;">🔑 Código: ${codigo}</div>` : '<div style="font-size:11px;color:var(--textMuted);">Sin código</div>'}
            </div>
            <button onclick="abrirFotoModelo('${nombre.replace(/'/g,"\\'")}','${codigo}','${g.nombre}')" style="background:rgba(255,45,85,0.1);border:1px solid rgba(255,45,85,0.3);color:var(--accent);width:28px;height:28px;border-radius:50%;cursor:pointer;font-size:13px;flex-shrink:0;transition:0.2s;" title="Ver foto" onmouseover="this.style.background='rgba(255,45,85,0.25)'" onmouseout="this.style.background='rgba(255,45,85,0.1)'">🖼</button>
            <button onclick="eliminarModelo(${gIdx},${mi})" style="background:rgba(255,45,85,0.15);border:1px solid var(--accent);color:var(--accent);width:28px;height:28px;border-radius:50%;cursor:pointer;font-size:13px;font-weight:bold;flex-shrink:0;" title="Eliminar">✕</button>
        </div>`;
    }).join('');
}

function agregarModelo() {
    const idx = parseInt(document.getElementById('modelosGrupoIndex').value);
    const input = document.getElementById('nuevaModeloInput');
    const inputCodigo = document.getElementById('nuevaModeloCodigo');
    const nombre = input.value.trim();
    const codigo = inputCodigo ? inputCodigo.value.trim() : '';
    if (!nombre) return;
    if (!grupos[idx].modelos) grupos[idx].modelos = [];
    // Compatibilidad: comparar tanto objetos como strings
    const yaExiste = grupos[idx].modelos.find(m => {
        const n = typeof m === 'object' ? m.nombre : m;
        return n.toLowerCase() === nombre.toLowerCase();
    });
    if (yaExiste) { toast('Esa modelo ya está en el grupo.', 'warning'); return; }
    // Guardar como objeto {nombre, codigo}
    grupos[idx].modelos.push({ nombre, codigo });
    localStorage.setItem('grupos_usd', JSON.stringify(grupos));
    input.value = '';
    if (inputCodigo) inputCodigo.value = '';
    renderListaModelosModal(idx);
}

async function eliminarModelo(gIdx, mIdx) {
    const okElimMod = await confirmar({ titulo: '¿Eliminar modelo?', msg: 'Se quitará del grupo.', icono: '🗑️', labelOk: 'Eliminar', colorOk: '#e74c3c' });
    if (!okElimMod) return;
    grupos[gIdx].modelos.splice(mIdx, 1);
    localStorage.setItem('grupos_usd', JSON.stringify(grupos));
    renderListaModelosModal(gIdx);
}

// ── FOTO MODELO ──────────────────────────────────────────────────────────────
// ── GALERÍA FOTOS MODELO ─────────────────────────────────────────────────────
let _galeria = { fotos: [], idx: 0, nombre: '' };

function abrirFotoModelo(nombre, codigo, grupoNombre) {
    const modal = document.getElementById('modalFotoModelo');
    if (!modal) return;
    const carpeta = nombre.trim().split(',')[0].trim().split(' ')[0]; // Primer nombre sin coma = carpeta
    _galeria = { fotos: [], idx: 0, nombre: carpeta };

    document.getElementById('fotoModeloNombre').textContent = aNombrePropio(nombre);
    document.getElementById('fotoModeloCodigo').textContent = codigo ? `🔑 ${codigo}` : '';
    document.getElementById('fotoModeloGrupo').textContent = grupoNombre ? `👥 ${grupoNombre}` : '';
    const carpetaSpan = document.getElementById('fotoModeloCarpeta');
    if (carpetaSpan) carpetaSpan.textContent = carpeta;

    // Ocultar elementos hasta cargar
    document.getElementById('fotoModeloImg').style.display = 'none';
    document.getElementById('fotoModeloPlaceholder').style.display = 'none';
    document.getElementById('fotoModeloContador').style.display = 'none';
    document.getElementById('fotoModeloBtnPrev').style.display = 'none';
    document.getElementById('fotoModeloBtnNext').style.display = 'none';
    document.getElementById('fotoModeloThumbs').innerHTML = '';
    modal.style.display = 'flex';

    // Cargar fotos secuencialmente: Foto1.jpg, Foto2.jpg, ...
    cargarFotosModelo(carpeta, 1);
}

function cargarFotosModelo(carpeta, n) {
    if (n > 100) { _mostrarGaleria(); return; } // máximo 100 fotos
    const img = new Image();
    const ruta = `Fotos Modelos/${carpeta}/Foto${n}.jpg`;
    img.onload  = () => { _galeria.fotos.push(ruta); cargarFotosModelo(carpeta, n + 1); };
    img.onerror = () => {
        if (n === 1) { _mostrarPlaceholder(); } // ninguna foto encontrada
        else { _mostrarGaleria(); }             // terminaron las fotos
    };
    img.src = ruta;
}

function _mostrarPlaceholder() {
    document.getElementById('fotoModeloPlaceholder').style.display = 'flex';
    document.getElementById('fotoModeloThumbs').style.display = 'none';
}

function _mostrarGaleria() {
    const fotos = _galeria.fotos;
    _irFotoModelo(0);

    // Miniaturas
    const thumbsCont = document.getElementById('fotoModeloThumbs');
    thumbsCont.style.display = fotos.length > 1 ? 'flex' : 'none';
    thumbsCont.innerHTML = fotos.map((src, i) => `
        <img src="${src}" onclick="_irFotoModelo(${i})" id="thumb_modelo_${i}"
            style="width:54px;height:54px;object-fit:cover;border-radius:8px;cursor:pointer;flex-shrink:0;border:2px solid ${i===0?'var(--accent)':'rgba(255,255,255,0.12)'};transition:0.2s;opacity:${i===0?'1':'0.55'};"
            onmouseover="this.style.opacity='1';this.style.borderColor='var(--accent)'"
            onmouseout="if(${i}!==_galeria.idx){this.style.opacity='0.55';this.style.borderColor='rgba(255,255,255,0.12)'}">`
    ).join('');

    // Flechas
    document.getElementById('fotoModeloBtnPrev').style.display = fotos.length > 1 ? 'flex' : 'none';
    document.getElementById('fotoModeloBtnNext').style.display = fotos.length > 1 ? 'flex' : 'none';
    // Contador
    const cnt = document.getElementById('fotoModeloContador');
    cnt.style.display = fotos.length > 1 ? 'block' : 'none';
}

function _irFotoModelo(idx) {
    const fotos = _galeria.fotos;
    if (!fotos.length) return;
    idx = (idx + fotos.length) % fotos.length;
    _galeria.idx = idx;
    const img = document.getElementById('fotoModeloImg');
    img.style.opacity = '0';
    setTimeout(() => { img.src = fotos[idx]; img.style.display = 'block'; img.style.opacity = '1'; }, 120);
    document.getElementById('fotoModeloContador').textContent = `${idx + 1} / ${fotos.length}`;
    // Guardar ruta actual para descarga
    _galeria.rutaActual = fotos[idx];
    _galeria.nombreDescarga = `${_galeria.nombre}_Foto${idx + 1}.jpg`;
    // Actualizar miniaturas
    fotos.forEach((_, i) => {
        const t = document.getElementById(`thumb_modelo_${i}`);
        if (!t) return;
        t.style.borderColor = i === idx ? 'var(--accent)' : 'rgba(255,255,255,0.12)';
        t.style.opacity     = i === idx ? '1' : '0.55';
    });
    // Scroll a miniatura activa
    const thumbActivo = document.getElementById(`thumb_modelo_${idx}`);
    if (thumbActivo) thumbActivo.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
}

function fotoModeloErrorHandler() {
    // Si la imagen principal falla (no debería, pero por si acaso)
    document.getElementById('fotoModeloImg').style.display = 'none';
    document.getElementById('fotoModeloPlaceholder').style.display = 'flex';
}

function navegarFotoModelo(dir) { _irFotoModelo(_galeria.idx + dir); }

function descargarFotoModelo() {
    if (!_galeria.rutaActual) return;
    const a = document.createElement('a');
    a.href = _galeria.rutaActual;
    a.download = _galeria.nombreDescarga || 'foto.jpg';
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => a.remove(), 500);
}

function cerrarFotoModelo() {
    const modal = document.getElementById('modalFotoModelo');
    if (modal) modal.style.display = 'none';
    _galeria = { fotos: [], idx: 0, nombre: '' };
}

// ── BANNER INFORMATIVO ───────────────────────────────────────────────────────
const BANNER_KEY = 'banner_info_usd';

function bannerInit() {
    const zona = document.getElementById('bannerInfoZona');
    if (!zona) return;
    const rol = userLogueado && userLogueado.rol;
    if (!rol) return;
    zona.style.display = 'block';

    // Asesor: ocultar zona de subida, mostrar solo contenido si existe
    const esEditor = (rol === 'admin'); // Solo admin puede subir banner
    document.getElementById('bannerSubidaZona').style.display = esEditor ? 'block' : 'none';

    // Ocultar botones de edición para asesor
    const botonesEdicion = document.querySelectorAll('#bannerContenidoZona [title="Cambiar archivo"], #bannerContenidoZona [title="Quitar banner"]');
    botonesEdicion.forEach(b => b.style.display = esEditor ? 'flex' : 'none');

    const saved = localStorage.getItem(BANNER_KEY);
    if (saved) {
        try { const d = JSON.parse(saved); bannerMostrarGuardado(d); } catch(e) {}
    }
}
window.bannerInit = bannerInit;

function bannerCargarArchivo(input) {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
        const data = { nombre: file.name, tipo: file.type, src: ev.target.result, fecha: new Date().toLocaleDateString('es-CO', {day:'2-digit',month:'short',year:'numeric'}) };
        // Guardar en localStorage Y sincronizar con Firebase
        localStorage.setItem(BANNER_KEY, JSON.stringify(data));
        if (window._fbGuardar) {
            try { window._fbGuardar(BANNER_KEY, data); } catch(e) {}
        }
        bannerMostrarGuardado(data);
    };
    reader.readAsDataURL(file);
    input.value = '';
}

function bannerMostrarGuardado(d) {
    document.getElementById('bannerSubidaZona').style.display = 'none';
    document.getElementById('bannerContenidoZona').style.display = 'block';
    document.getElementById('bannerPieFecha').textContent = d.fecha || '';

    const esImagen = d.tipo && d.tipo.startsWith('image/');
    const imgWrap = document.getElementById('bannerImgWrap');
    const archivoWrap = document.getElementById('bannerArchivoWrap');

    if (esImagen) {
        imgWrap.style.display = 'block';
        archivoWrap.style.display = 'none';
        document.getElementById('bannerImg').src = d.src;
    } else {
        imgWrap.style.display = 'none';
        archivoWrap.style.display = 'flex';
        const iconos = { 'pdf':'📕', 'xlsx':'📗', 'xls':'📗', 'docx':'📘', 'doc':'📘', 'pptx':'📙', 'ppt':'📙', 'txt':'📄', 'csv':'📊', 'mp4':'🎬' };
        const ext = (d.nombre || '').split('.').pop().toLowerCase();
        document.getElementById('bannerArchivoIcono').textContent = iconos[ext] || '📄';
        document.getElementById('bannerArchivoNombre').textContent = d.nombre;
        document.getElementById('bannerArchivoTipo').textContent = ext.toUpperCase();
        const link = document.getElementById('bannerArchivoLink');
        link.href = d.src;
        link.download = d.nombre;
    }
}

async function bannerEliminar() {
    const okBanner = await confirmar({ titulo: '¿Quitar el banner?', msg: 'Se eliminará el archivo informativo actual.', icono: '🖼️', labelOk: 'Quitar', colorOk: '#e74c3c' });
    if (!okBanner) return;
    localStorage.removeItem(BANNER_KEY);
    // Sincronizar eliminación con Firebase (guardar null/objeto vacío para forzar borrado en todos los clientes)
    if (window._fbGuardar) {
        try { window._fbGuardar(BANNER_KEY, null); } catch(e) {}
    }
    document.getElementById('bannerContenidoZona').style.display = 'none';
    document.getElementById('bannerSubidaZona').style.display = 'block';
}
// ─────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────

function guardarGrupo() {
    const idx = parseInt(document.getElementById('editGrupoIndex').value);
    const nombre = document.getElementById('grupoNombre').value.trim().toUpperCase();
    const modeloVal = document.getElementById('grupoModelo').value.trim();
    const asesores = JSON.parse(document.getElementById('grupoAsesoresData').value || '[]');
    if (!nombre) { toast('Escribe el nombre del grupo.', 'warning'); return; }
    if (asesores.length === 0) { toast('Agrega al menos un asesor al grupo.', 'warning'); return; }
    const modelos = modeloVal ? [modeloVal] : [];
    if (idx === -1) {
        grupos.push({ nombre, modelos, asesores });
    } else {
        grupos[idx].nombre = nombre;
        grupos[idx].asesores = asesores;
        if (modeloVal && !grupos[idx].modelos.find(m => m.toLowerCase() === modeloVal.toLowerCase())) {
            grupos[idx].modelos.push(modeloVal);
        }
    }
    localStorage.setItem('grupos_usd', JSON.stringify(grupos));
    // Actualizar campo grupo en perfil de cada asesor asignado
    let usuariosChanged = false;
    asesores.forEach(a => {
        const uIdx = usuarios.findIndex(u => u.usuario === a.id);
        if (uIdx !== -1 && usuarios[uIdx].grupo !== nombre) {
            usuarios[uIdx].grupo = nombre;
            usuariosChanged = true;
        }
    });
    if (usuariosChanged) localStorage.setItem('usuarios_usd', JSON.stringify(usuarios));
    cerrarModalGrupo();
    renderGrupos();
}

function editarGrupo(i) { abrirModalGrupo(i); }

async function eliminarGrupo(i) {
    const okGrupo = await confirmar({ titulo: '¿Eliminar grupo?', msg: 'Se eliminará el grupo y todos sus datos.', icono: '🗑️', labelOk: 'Eliminar', colorOk: '#e74c3c' });
    if (!okGrupo) return;
    const g = grupos[i];
    // Limpiar grupo de todos los asesores asociados
    (g.asesores || []).forEach(a => {
        const uIdx = usuarios.findIndex(u => u.usuario === a.id);
        if (uIdx !== -1) { delete usuarios[uIdx].grupo; }
    });
    localStorage.setItem('usuarios_usd', JSON.stringify(usuarios));
    grupos.splice(i, 1);
    localStorage.setItem('grupos_usd', JSON.stringify(grupos));
    renderGrupos();
}

function cancelarGrupo() {
    document.getElementById('editGrupoIndex').value = '-1';
    document.getElementById('grupoNombre').value = '';
    document.getElementById('grupoModelo').value = '';
    document.getElementById('grupoAsesor').value = '';
    const dataEl = document.getElementById('grupoAsesoresData');
    if (dataEl) dataEl.value = '[]';
    document.getElementById('grupoFormTitle').innerText = '➕ Crear Grupo';
}

function renderGrupos() {
    const cont = document.getElementById('listaGruposHtml');
    if (!cont) return;

    // Stats bar
    const statsBar = document.getElementById('gruposStatsBar');
    if (statsBar) {
        const totalModelos = grupos.reduce((s, g) => s + (g.modelos ? g.modelos.length : 0), 0);
        const totalAsesores = grupos.reduce((s, g) => s + (g.asesores ? g.asesores.length : 0), 0);
        statsBar.innerHTML = `
            <div style="background:rgba(255,255,255,0.04);border-radius:12px;padding:14px 18px;border:1px solid rgba(255,255,255,0.08);display:flex;align-items:center;gap:12px;">
                <div style="font-size:26px;">👥</div>
                <div><div style="font-size:22px;font-weight:900;color:var(--accent);">${grupos.length}</div><div style="font-size:11px;color:var(--textMuted);text-transform:uppercase;letter-spacing:1px;">Grupos</div></div>
            </div>
            <div style="background:rgba(255,255,255,0.04);border-radius:12px;padding:14px 18px;border:1px solid rgba(255,255,255,0.08);display:flex;align-items:center;gap:12px;">
                <div style="font-size:26px;">🧑‍💼</div>
                <div><div style="font-size:22px;font-weight:900;color:var(--accent);">${totalAsesores}</div><div style="font-size:11px;color:var(--textMuted);text-transform:uppercase;letter-spacing:1px;">Asesores</div></div>
            </div>
            <div style="background:rgba(255,255,255,0.04);border-radius:12px;padding:14px 18px;border:1px solid rgba(255,255,255,0.08);display:flex;align-items:center;gap:12px;">
                <div style="font-size:26px;">👩</div>
                <div><div style="font-size:22px;font-weight:900;color:var(--accent);">${totalModelos}</div><div style="font-size:11px;color:var(--textMuted);text-transform:uppercase;letter-spacing:1px;">Modelos</div></div>
            </div>
        `;
    }

    if (grupos.length === 0) {
        cont.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:60px;color:var(--textMuted);font-size:14px;">Sin grupos creados. Haz clic en <strong>+ Nuevo Grupo</strong> para empezar.</div>';
        return;
    }

    const jornadaConfig = {
        'TARDE':      { color: '#3498db', icon: '🌆' },
        'MAÑANA':     { color: '#27ae60', icon: '🌅' },
        'MADRUGADA':  { color: '#9b59b6', icon: '🌙' },
        'ÚNICA':      { color: '#e67e22', icon: '⭐' },
        'MADRUGADA':      { color: '#e74c3c', icon: '🌃' },
        'DEFAULT':    { color: '#888',    icon: '🕐'  }
    };

    cont.innerHTML = grupos.map((g, i) => {
        const color = grupoColor(i);
        const asesores = g.asesores || [];
        const modelos = g.modelos || [];

        // Agrupar asesores por jornada
        const porJornada = {};
        asesores.forEach(a => {
            const j = (a.jornada || 'SIN JORNADA').toUpperCase();
            if (!porJornada[j]) porJornada[j] = [];
            porJornada[j].push(a);
        });

        // Ordenar jornadas: MAÑANA → TARDE → MADRUGADA → otras
        const ordenJornada = ['MAÑANA', 'TARDE', 'MADRUGADA', 'MADRUGADA'];
        const jornadasOrdenadas = [
            ...ordenJornada.filter(j => porJornada[j]),
            ...Object.keys(porJornada).filter(j => !ordenJornada.includes(j))
        ];

        // HTML de asesores por jornada
        let asesorSectionsHTML = '';
        if (asesores.length === 0) {
            asesorSectionsHTML = `<div style="padding:10px 12px;background:rgba(255,255,255,0.03);border-radius:10px;border:1px dashed rgba(255,255,255,0.1);color:var(--textMuted);font-size:12px;text-align:center;">Sin asesores asignados</div>`;
        } else {
            asesorSectionsHTML = jornadasOrdenadas.map(jornada => {
                const cfg = jornadaConfig[jornada] || jornadaConfig['DEFAULT'];
                const lista = porJornada[jornada];
                const asesorItems = lista.map(a => {
                    const uObj = usuarios.find(u => u.usuario === a.id);
                    const foto = uObj ? (uObj.foto || '') : '';
                    return `<div style="display:flex;align-items:center;gap:8px;padding:8px 10px;background:rgba(255,255,255,0.03);border-radius:8px;border:1px solid rgba(255,255,255,0.06);">
                        <img src="${foto}" onerror="this.src='https://cdn-icons-png.flaticon.com/512/3135/3135715.png'" style="width:32px;height:32px;border-radius:50%;object-fit:cover;border:2px solid ${cfg.color};flex-shrink:0;">
                        <span style="flex:1;font-size:12px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${aNombrePropio(a.nombre)}</span>
                        <span style="width:8px;height:8px;border-radius:50%;background:#27ae60;flex-shrink:0;box-shadow:0 0 5px #27ae60;"></span>
                    </div>`;
                }).join('');
                return `<div style="margin-bottom:8px;">
                    <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">
                        <span style="font-size:14px;">${cfg.icon}</span>
                        <span style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:${cfg.color};">Jornada ${jornada}</span>
                        <span style="background:${cfg.color}22;color:${cfg.color};border-radius:10px;padding:1px 7px;font-size:10px;font-weight:700;">${lista.length}</span>
                    </div>
                    <div style="display:flex;flex-direction:column;gap:4px;">${asesorItems}</div>
                </div>`;
            }).join('');
        }

        // Modelos — mostrar todas
        let modelosHTML = '';
        if (modelos.length === 0) {
            modelosHTML = `<div style="padding:8px 12px;background:rgba(255,255,255,0.03);border-radius:8px;border:1px dashed rgba(255,255,255,0.08);color:var(--textMuted);font-size:12px;text-align:center;">Sin modelos asignadas</div>`;
        } else {
            modelosHTML = modelos.map(m => {
                const nombreM = typeof m === 'object' ? (m.nombre || '') : m;
                const codigoM = typeof m === 'object' ? (m.codigo || '') : '';
                const nombreArchivo = nombreM.trim().split(' ')[0];
                const rutaFoto = `Fotos Modelos/${nombreArchivo}.jpg`;
                return `<span onclick="abrirFotoModelo('${nombreM.replace(/'/g,"\\'")}','${codigoM}','${g.nombre}')"
                    style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.15);border-radius:20px;padding:5px 12px;font-size:12px;font-weight:600;display:inline-flex;align-items:center;gap:6px;white-space:nowrap;cursor:pointer;transition:0.2s;"
                    onmouseover="this.style.background='rgba(255,45,85,0.18)';this.style.borderColor='rgba(255,45,85,0.5)';this.style.color='#fff'"
                    onmouseout="this.style.background='rgba(255,255,255,0.06)';this.style.borderColor='rgba(255,255,255,0.15)';this.style.color=''"
                    title="Ver foto de ${aNombrePropio(nombreM)}">
                    <img src="${rutaFoto}" onerror="this.style.display='none'" style="width:20px;height:20px;border-radius:50%;object-fit:cover;border:1px solid rgba(255,45,85,0.5);">
                    👩 ${aNombrePropio(nombreM)}
                </span>`;
            }).join('');
        }

        return `
        <div style="background:var(--panelBg);border-radius:18px;border:1px solid rgba(255,255,255,0.1);overflow:hidden;display:flex;flex-direction:column;transition:0.25s;box-shadow:0 4px 20px rgba(0,0,0,0.2);" onmouseover="this.style.transform='translateY(-3px)';this.style.boxShadow='0 8px 30px rgba(0,0,0,0.3)'" onmouseout="this.style.transform='';this.style.boxShadow='0 4px 20px rgba(0,0,0,0.2)'">
            <!-- Header tarjeta -->
            <div style="background:linear-gradient(135deg,${color}22,${color}44);border-bottom:3px solid ${color};padding:18px 20px;display:flex;align-items:center;justify-content:space-between;">
                <div style="display:flex;align-items:center;gap:12px;">
                    <div style="width:46px;height:46px;border-radius:12px;background:${color};display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:900;color:#fff;box-shadow:0 4px 14px ${color}55;flex-shrink:0;">${g.nombre.charAt(0)}</div>
                    <div>
                        <div style="font-size:17px;font-weight:900;letter-spacing:1px;color:#fff;">${g.nombre}</div>
                        <div style="font-size:11px;color:rgba(255,255,255,0.55);margin-top:1px;">${asesores.length} asesor${asesores.length !== 1 ? 'es' : ''} · ${modelos.length} modelo${modelos.length !== 1 ? 's' : ''}</div>
                    </div>
                </div>
                <div style="display:flex;gap:6px;">
                    <button onclick="editarGrupo(${i})" style="background:rgba(255,255,255,0.12);border:none;color:#fff;width:30px;height:30px;border-radius:8px;cursor:pointer;font-size:13px;transition:0.2s;" title="Editar" onmouseover="this.style.background='rgba(255,255,255,0.22)'" onmouseout="this.style.background='rgba(255,255,255,0.12)'">✏️</button>
                    <button onclick="eliminarGrupo(${i})" style="background:rgba(255,45,85,0.2);border:none;color:var(--accent);width:30px;height:30px;border-radius:8px;cursor:pointer;font-size:13px;transition:0.2s;" title="Eliminar" onmouseover="this.style.background='rgba(255,45,85,0.35)'" onmouseout="this.style.background='rgba(255,45,85,0.2)'">🗑️</button>
                </div>
            </div>

            <!-- Cuerpo tarjeta -->
            <div style="padding:16px 18px;flex:1;display:flex;flex-direction:column;gap:14px;">
                <!-- Asesores por jornada -->
                <div>
                    <div style="font-size:10px;color:var(--textMuted);text-transform:uppercase;letter-spacing:1px;font-weight:700;margin-bottom:10px;">🧑‍💼 Asesores por Jornada</div>
                    ${asesorSectionsHTML}
                </div>
                <!-- Modelos -->
                <div>
                    <div style="font-size:10px;color:var(--textMuted);text-transform:uppercase;letter-spacing:1px;font-weight:700;margin-bottom:8px;">👩 Modelos</div>
                    <div style="display:flex;flex-wrap:wrap;gap:6px;">${modelosHTML}</div>
                </div>
            </div>

            <!-- Footer acciones -->
            <div style="padding:12px 18px;border-top:1px solid rgba(255,255,255,0.06);display:flex;gap:8px;">
                <button onclick="abrirModalModelos(${i})" style="flex:1;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.12);color:var(--textMain);padding:9px;border-radius:10px;cursor:pointer;font-size:12px;font-weight:700;transition:0.2s;display:flex;align-items:center;justify-content:center;gap:6px;" onmouseover="this.style.background='rgba(255,255,255,0.1)'" onmouseout="this.style.background='rgba(255,255,255,0.05)'">
                    👩 Gestionar Modelos
                </button>
            </div>
        </div>`;
    }).join('');
}
// ── FIN MÓDULO DE GRUPOS ─────────────────────────────────────────────────────

function irA(id) {
    // Secciones restringidas: solo roles superiores pueden verlas
    const seccionesRestringidas = ['config-sup', 'config', 'usuarios', 'grupos', 'indicadores', 'resumen-contable'];
    if (seccionesRestringidas.includes(id) && userLogueado && !esRolSuperior(userLogueado.rol)) return;
    document.querySelectorAll(".seccion").forEach(s => s.style.display = "none");
    document.querySelectorAll(".menu-item").forEach(m => m.classList.remove("active"));
    document.getElementById("sec-" + id).style.display = "block";
    // Buscar primero en el menú dinámico (admin/supervisor), luego en el estático (asesor)
    const menuDynamic = document.querySelector(`#dynamicMenu .menu-item[onclick="irA('${id}')"]`);
    const menuStatic  = document.querySelector(`.sidebar > .menu-item[onclick="irA('${id}')"]`);
    const menuTarget  = menuDynamic || menuStatic;
    if (menuTarget) menuTarget.classList.add('active');
    // Actualizar título topbar móvil
    const titulos = { home:'Inicio', asistencia:'Asistencia', puntos:'Puntos', ranking:'Ranking',
        nomina:'Nómina', 'hoja-vida':'Datos Personales', usuarios:'Personal', grupos:'Grupos',
        indicadores:'Indicadores', 'resumen-contable':'Resumen Contable', config:'Configuración', 'config-sup':'Configuración', 'mi-grupo':'Mi Grupo', calidad:'Calidad' };
    const topTitle = document.getElementById('mobile-topbar-title');
    if (topTitle) topTitle.textContent = titulos[id] || 'Panel';
    // Guardar sección activa para restaurar al refrescar
    localStorage.setItem('usd_seccion_activa', id);
    if(id === 'grupos') {
        cargarSelectAsesor();
        renderGrupos();
    }
    if(id === 'resumen-contable') {
        // Recargar desde Firebase antes de renderizar para mostrar datos al dia
        if (window._fbCargar) {
            Promise.all([
                window._fbCargar('usd_ingresos_plataformas'),
                window._fbCargar('usd_ingresos_egresos'),
                window._fbCargar('datos_contable_usd')
            ]).then(([plat, ie, contable]) => {
                const _escr = (k,v) => { if (v !== null) Storage.prototype.setItem.call(localStorage, k, JSON.stringify(v)); };
                _escr('usd_ingresos_plataformas', plat);
                _escr('usd_ingresos_egresos', ie);
                _escr('datos_contable_usd', contable);
                renderResumenContable();
                // Cargar automáticamente el período más reciente en la tabla de ingresos plataforma
                try {
                    const _hP = Array.isArray(plat) ? plat : JSON.parse(localStorage.getItem('usd_ingresos_plataformas') || '[]');
                    if (_hP.length > 0 && typeof _ingresosCargarPeriodo === 'function') {
                        setTimeout(() => _ingresosCargarPeriodo(0, true), 150);
                    }
                } catch(e) {}
                // Cargar automáticamente el período más reciente en los campos Ingresos & Egresos
                try {
                    const _hIE = Array.isArray(ie) ? ie : JSON.parse(localStorage.getItem('usd_ingresos_egresos') || '[]');
                    if (_hIE.length > 0 && typeof _ieCargarPeriodo === 'function') {
                        setTimeout(() => _ieCargarPeriodo(0), 200);
                    }
                } catch(e) {}
            }).catch(() => renderResumenContable());
        } else {
            renderResumenContable();
        }
    }
    if(id === 'usuarios') {
        cargarSelectGrupoPersonal();
        // Sincronizar bloqueos desde Firebase antes de renderizar
        if (window._fbCargar) {
            window._fbCargar('usd_login_intentos').then(data => {
                if (data) Storage.prototype.setItem.call(localStorage, 'usd_login_intentos', JSON.stringify(data));
                renderListaUsuarios();
            }).catch(() => renderListaUsuarios());
        } else {
            renderListaUsuarios();
        }
    }
    if(id === 'mi-grupo') {
        renderMiGrupo();
    }
    if(id === 'nomina') {
        renderNomina();
    }
    if(id === 'calidad') {
        renderCalidad();
    }
    if(id === 'home') {
        renderContadoresGeneral();
    }
    if(id === 'asistencia') {
        renderAsistencia();
    }
    if(id === 'puntos') {
        renderPuntos();
    }
    if(id === 'ranking') {
        renderRanking();
        switchRankTab('general');
    }
    if(id === 'config-sup') {
        renderSupChatModos();
        cargarValoresConfigTarjeta();
    }
    if(id === 'config') {
        cargarValoresConfigTarjeta();
        cfgCargarValores();
        cfgCargarFuenteGoogle(getComputedStyle(document.documentElement).getPropertyValue('--fontFamily'));
    }
    if(id === 'hoja-vida') {
        renderHojaDeVida();
    }
    if(id === 'indicadores') {
        // Recargar datos desde Firebase antes de renderizar historial
        if (window._fbCargar) {
            Promise.all([
                window._fbCargar('datos_asis_usd'),
                window._fbCargar('datos_punt_usd')
            ]).then(([asis, punt]) => {
                const _escr = (k,v) => v !== null && Storage.prototype.setItem.call(localStorage, k, JSON.stringify(v));
                _escr('datos_asis_usd', asis);
                _escr('datos_punt_usd', punt);
                renderIndicadores();
                if (typeof renderHistorialCompleto === 'function') renderHistorialCompleto();
            });
        } else {
            renderIndicadores();
            if (typeof renderHistorialCompleto === 'function') renderHistorialCompleto();
        }
    }
    if(id === 'comparativo') {
        // Un solo fetch a Firebase, un solo render (evita race condition con IIFE)
        if (window._fbCargar) {
            Promise.all([
                window._fbCargar('usd_comparativo_meses'),
                window._fbCargar('datos_asis_usd'),
                window._fbCargar('datos_punt_usd')
            ]).then(([comp, asis, punt]) => {
                const _escr = (k,v) => { if (v !== null) Storage.prototype.setItem.call(localStorage, k, JSON.stringify(v)); };
                _escr('usd_comparativo_meses', comp);
                _escr('datos_asis_usd', asis);
                _escr('datos_punt_usd', punt);
                try {
                    const _nuevo = window._fbValToArray(comp);
                    if (_nuevo.length > 0) {
                        comparativoMeses = _nuevo;
                    } else {
                        // Firebase devolvió vacío — usar localStorage como respaldo
                        const _local = JSON.parse(localStorage.getItem('usd_comparativo_meses') || '[]');
                        comparativoMeses = Array.isArray(_local) ? _local : window._fbValToArray(_local);
                    }
                } catch(e) { comparativoMeses = []; }
                if (typeof renderHistorialCompleto === 'function') renderHistorialCompleto();
            }).catch(() => {
                try { comparativoMeses = JSON.parse(localStorage.getItem('usd_comparativo_meses') || '[]'); } catch(e) { comparativoMeses = []; }
                if (typeof renderHistorialCompleto === 'function') renderHistorialCompleto();
            });
        } else {
            try { comparativoMeses = JSON.parse(localStorage.getItem('usd_comparativo_meses') || '[]'); } catch(e) { comparativoMeses = []; }
            if (typeof renderHistorialCompleto === 'function') renderHistorialCompleto();
        }
    }
}

function renderMiGrupo() {
    const cont = document.getElementById('miGrupoContent');
    if (!cont) return;
    const gruposGuardados = JSON.parse(localStorage.getItem('grupos_usd')) || [];
    const nombreUser = userLogueado.nombre.toLowerCase().trim();
    const miGrupo = gruposGuardados.find(g =>
        (g.asesores && g.asesores.find(a => a.id === userLogueado.usuario || (a.nombre && a.nombre.toLowerCase().trim() === nombreUser))) ||
        g.asesorId === userLogueado.usuario ||
        (g.asesorNombre && g.asesorNombre.toLowerCase().trim() === nombreUser)
    );
    const grupoBase = gruposBase.find(g =>
        (g.asesores && g.asesores.find(a => a.id === userLogueado.usuario || (a.nombre && a.nombre.toLowerCase().trim() === nombreUser)))
    );
    const datoFijo = DATOS_FIJOS.find(d => d.nombre.toLowerCase().trim() === nombreUser);
    const grupoNombre = (miGrupo && miGrupo.nombre) || userLogueado.grupo || (grupoBase && grupoBase.nombre) || (datoFijo && datoFijo.grupo) || '';
    const jornada     = userLogueado.jornada || (datoFijo && datoFijo.jornada) || '';
    const plataforma  = userLogueado.plataforma || '';
    const modeloAsignada = (miGrupo && miGrupo.modelos && miGrupo.modelos.length > 0) ? miGrupo.modelos[0] : ((grupoBase && grupoBase.modelos && grupoBase.modelos.length > 0) ? grupoBase.modelos[0] : '');

    // Badge en el header
    const header = document.getElementById('miGrupoHeader');
    if (header) {
        const badgeExist = header.querySelector('#miGrupoBadge');
        if (badgeExist) badgeExist.remove();
        if (grupoNombre) {
            const badge = document.createElement('div');
            badge.id = 'miGrupoBadge';
            badge.innerHTML = `<div class="cv-card-item" style="margin:0;padding:8px 16px;display:flex;flex-direction:column;min-width:120px;">
                <div class="cv-label">Grupo</div>
                <div class="cv-value" style="color:var(--accent);font-weight:bold;font-size:15px;">${grupoNombre}</div>
            </div>`;
            header.appendChild(badge);
        }
    }

    if (!grupoNombre) {
        cont.innerHTML = `
            <div class="glass-card" style="text-align:center; padding:40px;">
                <div style="font-size:48px; margin-bottom:15px;">&#128101;</div>
                <h3 style="color:var(--textMuted); margin:0 0 8px;">Aún no tienes un grupo asignado</h3>
                <p style="color:var(--textMuted); font-size:13px; margin:0;">Tu coordinador o administrador te asignará un grupo próximamente.</p>
            </div>`;
        return;
    }

    // Modelos del grupo (todas)
    const todasModelos = (miGrupo && miGrupo.modelos && miGrupo.modelos.length > 0)
        ? miGrupo.modelos
        : ((grupoBase && grupoBase.modelos && grupoBase.modelos.length > 0) ? grupoBase.modelos : []);

    // Asesores del grupo
    const asesoresGrupo = (miGrupo && miGrupo.asesores) || (grupoBase && grupoBase.asesores) || [];

    const modelosHTML = todasModelos.length === 0
        ? `<div style="color:var(--textMuted);font-style:italic;font-size:13px;padding:10px 0;">Sin modelos asignadas</div>`
        : todasModelos.map(m => {
            const nombreM = typeof m === 'object' ? (m.nombre || '') : m;
            const codigoM = typeof m === 'object' ? (m.codigo || '') : '';
            const carpeta  = nombreM.trim().split(' ')[0];
            const rutaFoto = `Fotos Modelos/${carpeta}/Foto1.jpg`;
            return `<div onclick="abrirFotoModelo('${nombreM.replace(/'/g,"\\'")}','${codigoM}','${grupoNombre}')"
                style="display:flex;align-items:center;gap:10px;padding:10px 12px;background:rgba(255,255,255,0.04);border-radius:10px;border:1px solid rgba(255,255,255,0.07);cursor:pointer;transition:0.2s;"
                onmouseover="this.style.background='rgba(255,45,85,0.08)';this.style.borderColor='rgba(255,45,85,0.3)'"
                onmouseout="this.style.background='rgba(255,255,255,0.04)';this.style.borderColor='rgba(255,255,255,0.07)'">
                <img src="${rutaFoto}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"
                    style="width:36px;height:36px;border-radius:50%;object-fit:cover;border:2px solid var(--accent);flex-shrink:0;">
                <div style="width:36px;height:36px;border-radius:50%;background:var(--accent);display:none;align-items:center;justify-content:center;font-size:17px;flex-shrink:0;">👩</div>
                <div style="flex:1;min-width:0;">
                    <div style="font-size:13px;font-weight:700;">${aNombrePropio(nombreM)}</div>
                    ${codigoM ? `<div style="font-size:11px;color:var(--accent);font-weight:600;margin-top:2px;">🔑 ${codigoM}</div>` : ''}
                </div>
                <span style="font-size:16px;opacity:0.4;">🖼</span>
            </div>`;
        }).join('');

    const asesoresHTML = asesoresGrupo.length === 0
        ? `<div style="color:var(--textMuted);font-style:italic;font-size:13px;padding:10px 0;">Sin compañeros asignados</div>`
        : asesoresGrupo.map(a => {
            const esYo = a.id === userLogueado.usuario;
            const uObj = usuarios.find(u => u.usuario === a.id);
            const foto = uObj ? (uObj.foto || '') : '';
            const jCol = a.jornada === 'MAÑANA' ? '#27ae60' : a.jornada === 'TARDE' ? '#3498db' : '#9b59b6';
            return `<div style="display:flex;align-items:center;gap:10px;padding:10px 12px;background:${esYo ? 'rgba(255,45,85,0.08)' : 'rgba(255,255,255,0.04)'};border-radius:10px;border:1px solid ${esYo ? 'rgba(255,45,85,0.25)' : 'rgba(255,255,255,0.07)'};position:relative;">
                <img src="${foto}" onerror="this.src='https://cdn-icons-png.flaticon.com/512/3135/3135715.png'" style="width:36px;height:36px;border-radius:50%;object-fit:cover;border:2px solid ${jCol};flex-shrink:0;">
                <div style="flex:1;min-width:0;">
                    <div style="font-size:13px;font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${aNombrePropio(a.nombre)} ${esYo ? '<span style="font-size:10px;color:var(--accent);font-weight:700;">(Tú)</span>' : ''}</div>
                    <div style="font-size:11px;color:${jCol};font-weight:600;margin-top:2px;">🕐 Jornada ${a.jornada || ''}</div>
                </div>
            </div>`;
        }).join('');

    cont.innerHTML = `
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:20px;">
            <div class="glass-card" style="animation-delay:0s;transition:0.25s;" onmouseover="this.style.transform='translateY(-4px)';this.style.boxShadow='0 10px 30px rgba(0,0,0,0.35)'" onmouseout="this.style.transform='';this.style.boxShadow=''">
                <div style="font-size:11px;color:var(--textMuted);text-transform:uppercase;letter-spacing:1px;font-weight:700;margin-bottom:14px;">👩 Modelos del Grupo (${todasModelos.length})</div>
                <div style="display:flex;flex-direction:column;gap:8px;">${modelosHTML}</div>
            </div>
            <div class="glass-card" style="animation-delay:0.08s;transition:0.25s;" onmouseover="this.style.transform='translateY(-4px)';this.style.boxShadow='0 10px 30px rgba(0,0,0,0.35)'" onmouseout="this.style.transform='';this.style.boxShadow=''">
                <div style="font-size:11px;color:var(--textMuted);text-transform:uppercase;letter-spacing:1px;font-weight:700;margin-bottom:14px;">🧑‍💼 Asesores del Grupo (${asesoresGrupo.length})</div>
                <div style="display:flex;flex-direction:column;gap:8px;">${asesoresHTML}</div>
            </div>
        </div>`;
}

// ── TABS INICIO ──────────────────────────────────────────────────────────────
let tabActual = 'general';
let chartsPorAsesor = {};

function actualizarColorBtnPorAsesor() {
    const btnAsesor = document.getElementById('tabPorAsesor');
    if (!btnAsesor) return;
    let color = null;
    if (typeof userLogueado !== 'undefined' && userLogueado && userLogueado.nombre) {
        const u = (typeof usuarios !== 'undefined' ? usuarios : [])
            .find(x => x.nombre && x.nombre.toLowerCase().trim() === userLogueado.nombre.toLowerCase().trim());
        if (u && u.plataforma) color = getPlatConfig(u.plataforma).color;
    }
    const c = color || 'var(--accent)';
    // Only update if tab is NOT active (active state is handled by switchTab)
    const vistaAsesor = document.getElementById('vistaPorAsesor');
    const isActive = vistaAsesor && vistaAsesor.style.display !== 'none';
    if (isActive) {
        btnAsesor.style.background = c;
        btnAsesor.style.color = '#fff';
        btnAsesor.style.border = 'none';
        btnAsesor.style.boxShadow = '0 3px 14px ' + c + '66';
    } else {
        btnAsesor.style.color = c;
        btnAsesor.style.border = '2px solid ' + c;
        btnAsesor.style.boxShadow = '';
    }
}

function switchTab(tab) {
    tabActual = tab;
    const btnGen = document.getElementById('tabGeneral');
    const btnAsesor = document.getElementById('tabPorAsesor');
    const vistaGen = document.getElementById('vistaGeneral');
    const vistaAsesor = document.getElementById('vistaPorAsesor');

    // Color dinámico por plataforma del asesor logueado (o acento global si no aplica)
    function _getColorPorAsesor(nombreAsesor) {
        if (!nombreAsesor) return null;
        const u = (typeof usuarios !== 'undefined' ? usuarios : [])
            .find(x => x.nombre && x.nombre.toLowerCase().trim() === nombreAsesor.toLowerCase().trim());
        if (!u || !u.plataforma) return null;
        return getPlatConfig(u.plataforma).color;
    }
    const _colorAsesor = (typeof userLogueado !== 'undefined' && userLogueado)
        ? _getColorPorAsesor(userLogueado.nombre)
        : null;
    const _colorBtn = _colorAsesor || 'var(--accent)';

    if (tab === 'general') {
        vistaGen.style.display = 'block';
        vistaAsesor.style.display = 'none';
        btnGen.style.background = 'var(--accent)';
        btnGen.style.color = '#fff';
        btnGen.style.border = 'none';
        btnAsesor.style.background = 'transparent';
        btnAsesor.style.color = _colorBtn;
        btnAsesor.style.border = '2px solid ' + _colorBtn;
        btnAsesor.style.boxShadow = '';
    } else {
        vistaGen.style.display = 'none';
        vistaAsesor.style.display = 'block';
        btnGen.style.background = 'transparent';
        btnGen.style.color = 'var(--accent)';
        btnGen.style.border = '2px solid var(--accent)';
        btnAsesor.style.background = _colorBtn;
        btnAsesor.style.color = '#fff';
        btnAsesor.style.border = 'none';
        btnAsesor.style.boxShadow = '0 3px 14px ' + _colorBtn + '66';
        renderPorAsesor();
    }
}

// ── OFICINA POR PLATAFORMA ───────────────────────────────────────────────────
// Detecta si un nombre es una fila de oficina: termina en " OFICINA" (case-insensitive)
// o es exactamente "OFICINA" (legado). Retorna { esOficina, plataforma } donde
// plataforma es el nombre de la plataforma base (p.ej. "AmoLatina") o null si es legado.
function detectarOficina(nombre) {
    if (!nombre) return { esOficina: false, plataforma: null };
    const n = nombre.trim();
    // Formato legado: exactamente "OFICINA"
    if (n.toUpperCase() === 'OFICINA') return { esOficina: true, plataforma: null };
    // Formato nuevo: "NOMBRE OFICINA" — buscar coincidencia con plataforma conocida
    const upper = n.toUpperCase();
    if (upper.endsWith(' OFICINA')) {
        const baseName = n.slice(0, n.length - 8).trim(); // quitar " OFICINA"
        // Buscar plataforma que coincida (case-insensitive)
        const platKeys = Object.keys(plataformaConfigBase);
        const match = platKeys.find(k => k.toUpperCase() === baseName.toUpperCase());
        return { esOficina: true, plataforma: match || baseName };
    }
    return { esOficina: false, plataforma: null };
}

// ── COLORES POR PLATAFORMA ───────────────────────────────────────────────────
const plataformaConfigBase = {
    'AmoLatina':      { emoji: '❤️', color: '#ff0a2e' },   // Rojo fuerte
    'WishPark':       { emoji: '💜', color: '#9b59b6' },   // Morada
    'Dream':          { emoji: '💙', color: '#2980b9' },   // Azul
    'TalkyTimes':     { emoji: '💙', color: '#3498db' },   // Azul claro
    'LatinMelodies':  { emoji: '🩷', color: '#e91e8c' },   // Rosada
};

function getPlatConfig(plat) {
    const base = plataformaConfigBase[plat] || { emoji: '⭐', color: getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#ff2d55' };
    const savedColor = localStorage.getItem('cfg_plat_color_' + plat);
    return { emoji: base.emoji, color: savedColor || base.color };
}

function cambiarColorPlataforma(plat, color) {
    localStorage.setItem('cfg_plat_color_' + plat, color);
    // Redibujar vista Por Asesor si esta activa
    if (document.getElementById('vistaPorAsesor') &&
        document.getElementById('vistaPorAsesor').style.display !== 'none') {
        renderPorAsesor();
    }
    // Redibujar ranking si esta visible
    if (document.getElementById('sec-ranking') &&
        document.getElementById('sec-ranking').style.display !== 'none') {
        renderRanking();
    }
}

// ── VISTA POR ASESOR EN INICIO ───────────────────────────────────────────────
function renderPorAsesor() {
    if (datosAsis.length === 0 && datosPunt.length === 0) {
        document.getElementById('graficasPorAsesor').innerHTML =
            '<p style="color:var(--textMuted);grid-column:1/-1;text-align:center;padding:40px;">Carga el archivo Excel para ver los datos por asesor.</p>';
        const _rpEl = document.getElementById('resumenPlataformas'); if(_rpEl) _rpEl.innerHTML = '';
        return;
    }

    const hoy = new Date().getDate();

    // Agrupar asistencia
    const asis = {};
    datosAsis.forEach(r => {
        const n = r['Nombre'] || ''; const dia = parseInt(r['Dia'] || 0);
        if (!n || dia > hoy) return;
        if (!asis[n]) asis[n] = { ok: 0, total: 0 };
        asis[n].total++;
        if (parseInt(r['Asistencia']) === 1) asis[n].ok++;
    });

    // Agrupar puntos con clave normalizada (evita fallos por mayúsculas/espacios/tildes)
    const puntos = {}; // clave: nombre.toLowerCase().trim()
    const nombresOriginalesPunt = {}; // clave normalizada → nombre original para mostrar
    datosPunt.forEach(r => {
        const n = (r['Nombre'] || '').trim();
        const p = parseFloat(r['Puntos'] || 0);
        if (!n || isNaN(p)) return;
        const nk = n.toLowerCase().trim();
        puntos[nk] = (puntos[nk] || 0) + p;
        if (!nombresOriginalesPunt[nk]) nombresOriginalesPunt[nk] = n;
    });

    // Función para buscar puntos por nombre — siempre normalizado
    function getPuntos(nombre) {
        const nk = nombre.toLowerCase().trim();
        if (puntos[nk] !== undefined) return puntos[nk];
        // Búsqueda parcial por si hay leve diferencia
        const partial = Object.keys(puntos).find(k => k.includes(nk) || nk.includes(k));
        return partial ? puntos[partial] : 0;
    }

    // Filtrar por rol — unir nombres de ambas hojas usando originales
    const nombresAsis = Object.keys(asis);
    const nombresPunt = Object.values(nombresOriginalesPunt);
    let nombres = [...new Set([...nombresAsis, ...nombresPunt])];
    if (userLogueado.rol === 'asesor') {
        nombres = nombres.filter(n => n.toLowerCase().trim() === userLogueado.nombre.toLowerCase().trim());
    }

    // ── Resumen plataformas ──
    const porPlat = {};
    nombres.forEach(n => {
        const u = usuarios.find(u => u.nombre.toLowerCase().trim() === n.toLowerCase().trim());
        const plat = (u && u.plataforma) ? u.plataforma : 'Sin plataforma';
        if (!porPlat[plat]) porPlat[plat] = { asesores: 0, puntos: 0 };
        porPlat[plat].asesores++;
        porPlat[plat].puntos += getPuntos(n);
    });

    // (paneles resumen plataformas removidos por solicitud)

    // ── Gráficas por asesor ──
    Object.values(chartsPorAsesor).forEach(c => c.destroy());
    chartsPorAsesor = {};

    const cont = document.getElementById('graficasPorAsesor');
    cont.innerHTML = '';

    nombres.forEach(nombre => {
        const gj      = getGrupoJornada(nombre);
        // Si no hay plataforma en el usuario, intentar extraerla del nombre (filas de Oficina)
        let plat = gj.plataforma || '';
        if (!plat) {
            const _ofDet = detectarOficina(nombre);
            if (_ofDet.esOficina && _ofDet.plataforma) plat = _ofDet.plataforma;
        }
        const grupo   = gj.grupo      || '';
        const jornada = gj.jornada    || '';
        const cfg = getPlatConfig(plat);
        // Recalcular asistencia excluyendo días de descanso (valor 0)
        const diaHoyLocal = new Date().getDate();
        const asisNombre = datosAsis.filter(r => (r['Nombre']||'').toLowerCase().trim() === nombre.toLowerCase().trim());
        const asisOk = asisNombre.filter(r => parseInt(r['Dia']||0) <= diaHoyLocal && parseInt(r['Asistencia']) === 1).length;
        const asisFalta = asisNombre.filter(r => parseInt(r['Dia']||0) <= diaHoyLocal && parseInt(r['Asistencia']) === -1).length;
        const diasHabilesReal = asisOk + asisFalta;
        const pct = diasHabilesReal > 0 ? Math.round((asisOk / diasHabilesReal) * 100) : 0;
        const pts = parseFloat(getPuntos(nombre)) || 0;
        const ptsStr = isNaN(pts) ? '0.00' : pts.toFixed(2);
        const META_PUNTOS = 300;
        const pctPuntos = Math.min(100, Math.round((pts / META_PUNTOS) * 100)) || 0;
        const faltas = asisFalta;

        const idA = 'pa-asis-' + nombre.replace(/\s+/g,'_');
        const idP = 'pa-punt-' + nombre.replace(/\s+/g,'_');

        // Detectar si es fila de Oficina (solo muestra puntos, sin asistencia)
        const _esOficinaCard = detectarOficina(nombre).esOficina;

        // Colores personalizados de tarjeta
        const tc = getConfigTarjeta();
        const cCardBg     = tc.cardBg     || null;
        const cTitulo     = tc.cardTitulo || '#ffffff';
        const cTexto      = tc.cardTexto  || 'var(--textMuted)';
        const cEmoji      = tc.cardEmoji  || cfg.color;
        // El color de plataforma SIEMPRE controla: borde, nombre plataforma y números
        const cBorde      = cfg.color;
        const cValor      = cfg.color;

        const card = document.createElement('div');
        card.className = 'glass-card';
        card.style.borderTop = `3px solid ${cBorde}`;
        if (cCardBg) card.style.background = cCardBg;
        card.innerHTML = `
            <div style="background:linear-gradient(135deg,${cBorde}20,${cBorde}40);border-bottom:3px solid ${cBorde};padding:14px 16px;margin:-20px -20px 16px -20px;border-radius:var(--borderRadius) var(--borderRadius) 0 0;display:flex;align-items:center;gap:12px;">
                <div style="width:42px;height:42px;border-radius:12px;background:${cEmoji};display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;box-shadow:0 4px 12px ${cBorde}55;">${cfg.emoji}</div>
                <div style="flex:1;min-width:0;">
                    <div style="font-size:14px;font-weight:900;color:#ffffff;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${aNombrePropio(nombre)}</div>
                    <div style="font-size:11px;color:${cBorde};font-weight:700;text-transform:uppercase;">${plat || 'Sin plataforma'}</div>
                    <div style="display:flex;gap:6px;margin-top:4px;flex-wrap:wrap;">
                        ${jornada ? `<span style="background:rgba(255,255,255,0.08);color:${cTexto};font-size:10px;font-weight:700;padding:2px 8px;border-radius:10px;text-transform:uppercase;">🕐 ${jornada}</span>` : ''}
                        ${grupo   ? `<span style="background:rgba(255,255,255,0.08);color:${cTexto};font-size:10px;font-weight:700;padding:2px 8px;border-radius:10px;text-transform:uppercase;">👥 ${grupo}</span>` : ''}
                    </div>
                </div>
            </div>
            ${_esOficinaCard ? `
            <div style="text-align:center;padding:8px 0;">
                <div style="font-size:11px;color:${cTexto};margin-bottom:6px;">Puntos</div>
                <div style="width:45%;margin:0 auto;"><canvas id="${idP}"></canvas></div>
                <div style="font-size:26px;font-weight:900;color:${cValor};margin-top:6px;">${ptsStr}</div>
                <div style="font-size:10px;color:${cTexto};">${pctPuntos}% de meta (300 pts)</div>
            </div>` : `
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                <div style="text-align:center;">
                    <div style="font-size:11px;color:${cTexto};margin-bottom:6px;">Asistencia</div>
                    <div style="width:80%;margin:0 auto;"><canvas id="${idA}"></canvas></div>
                    <div style="font-size:20px;font-weight:900;color:${cValor};margin-top:4px;">${pct}%</div>
                    <div style="font-size:10px;color:${cTexto};">${asisOk} asist. &middot; ${faltas} faltas</div>
                </div>
                <div style="text-align:center;">
                    <div style="font-size:11px;color:${cTexto};margin-bottom:6px;">Puntos</div>
                    <div style="width:80%;margin:0 auto;"><canvas id="${idP}"></canvas></div>
                    <div style="font-size:20px;font-weight:900;color:${cValor};margin-top:4px;">${ptsStr}</div>
                    <div style="font-size:10px;color:${cTexto};">${pctPuntos}% de meta (300 pts)</div>
                </div>
            </div>`}`;
        cont.appendChild(card);

        const META_CHART = 300;
        setTimeout(() => {
            const ctxA = document.getElementById(idA);
            const ctxP = document.getElementById(idP);
            const colorAsis = localStorage.getItem('cfg_color_asesor_asis') || cfg.color;
            const colorPunt = localStorage.getItem('cfg_color_asesor_punt') || cfg.color;
            const colorBg   = localStorage.getItem('cfg_color_asesor_bg')   || '#2a2a2a';
            // Solo crear gráfica de asistencia si NO es Oficina
            if (!_esOficinaCard && ctxA) chartsPorAsesor[idA] = new Chart(ctxA, {
                type: 'doughnut',
                data: { datasets: [{ data: [asisOk || 0.001, faltas || 0.001], backgroundColor: [colorAsis, colorBg], borderWidth: 0 }] },
                options: { plugins: { legend: { display: false } }, cutout: '72%' }
            });
            if (ctxP) chartsPorAsesor[idP] = new Chart(ctxP, {
                type: 'doughnut',
                data: { datasets: [{ data: [pts || 0.001, Math.max(0, META_CHART - pts)], backgroundColor: [colorPunt, colorBg], borderWidth: 0 }] },
                options: { plugins: { legend: { display: false } }, cutout: '72%' }
            });
        }, 50);
    });
}

// ── PUNTOS TABLE ─────────────────────────────────────────────────────────────
function renderPuntos() {
    const cont = document.getElementById('tablaPuntos');
    const fechaSpan = document.getElementById('puntosResumenFecha');
    if (!cont) return;
    skeletonTabla('tablaPuntos', 6);

    if (datosPunt.length === 0) {
        cont.innerHTML = '<p style="color:var(--textMuted);text-align:center;padding:40px;">Carga el archivo Excel para ver los puntos.</p>';
        return;
    }

    const hoy = new Date().getDate();
    const diasDelMes = Array.from({length: hoy}, (_, i) => i + 1);
    if (fechaSpan) fechaSpan.textContent = `D\u00edas transcurridos: ${hoy}`;

    // Agrupar por nombre y dia
    const porNombre = {};
    let totalGlobal = 0;
    datosPunt.forEach(r => {
        const n = r['Nombre'] || ''; const p = parseFloat(r['Puntos'] || 0); const dia = parseInt(r['Dia'] || 0);
        if (!n || dia < 1 || dia > hoy) return;
        // Solo incluir asesores reales
        const esAsesorReal = usuarios.some(u =>
            u.rol === 'asesor' && u.nombre.toLowerCase().trim() === n.toLowerCase().trim()
        );
        if (!esAsesorReal) return;
        if (!porNombre[n]) porNombre[n] = {};
        porNombre[n][dia] = isNaN(p) ? '' : p;
        if (!isNaN(p) && p > 0) totalGlobal += p;
    });

    // Filtrar por rol
    let nombres = Object.keys(porNombre);
    if (userLogueado.rol === 'asesor') {
        nombres = nombres.filter(n => n.toLowerCase().trim() === userLogueado.nombre.toLowerCase().trim());
    }
    // Para calidad/capacitador: solo asesores bajo el promedio de puntos totales
    if (window._filtroSolobajoPromedio && nombres.length > 0) {
        const totales = nombres.map(n => Object.values(porNombre[n]).reduce((s,v)=>s+(parseFloat(v)||0),0));
        const promedioPts = totales.reduce((a,b)=>a+b,0) / totales.length;
        nombres = nombres.filter((n,i) => totales[i] < promedioPts);
    }

    // ASESOR: tarjeta vertical igual que asistencia
    if (userLogueado.rol === 'asesor') {
        const miNombre = userLogueado.nombre.toLowerCase().trim();
        const entrada = Object.entries(porNombre).find(([n]) => n.toLowerCase().trim() === miNombre);
        if (!entrada) {
            cont.innerHTML = '<div class="glass-card"><p style="color:var(--textMuted);text-align:center;padding:30px;">Sin datos de puntos para tu usuario.</p></div>';
            return;
        }
        const [nombre, dias] = entrada;
        const total = Object.values(dias).reduce((s,v) => s + (parseFloat(v)||0), 0);
        const diasConPts = Object.values(dias).filter(v => parseFloat(v) > 0).length;
        const avg = diasConPts > 0 ? (total / diasConPts).toFixed(2) : '0.00';
        // Leer grupo/jornada con fallback a datos fijos
        const _gjP  = getGrupoJornada(userLogueado.nombre);
        const plat    = userLogueado.plataforma || _gjP.plataforma || '';
        const grupo   = userLogueado.grupo      || _gjP.grupo      || '';
        const jornada = userLogueado.jornada    || _gjP.jornada    || '';
        const cfg = getPlatConfig(plat);

        const celdasPuntos = diasDelMes.map(d => {
            const v = dias[d];
            const pts = parseFloat(v);
            let label, bg, border, color;
            if (v === '' || v === undefined) {
                label = '·'; bg = 'rgba(255,255,255,0.04)'; border = '1px solid rgba(255,255,255,0.07)'; color = 'rgba(255,255,255,0.2)';
            } else if (pts > 0) {
                label = pts % 1 === 0 ? pts.toFixed(0) : (pts.toFixed(2).replace(/\.?0+$/, ''));
                bg = 'rgba(39,174,96,0.18)'; border = '1px solid #27ae60'; color = '#27ae60';
            } else {
                label = '0'; bg = 'rgba(255,45,85,0.12)'; border = '1px solid var(--accent)'; color = 'var(--accent)';
            }
            const fontSize = label.length > 4 ? '7px' : label.length > 3 ? '8px' : '10px';
            return `<div style="display:flex;flex-direction:column;align-items:center;gap:3px;">
                <span style="font-size:9px;color:rgba(255,255,255,0.3);font-weight:600;">${d}</span>
                <div style="width:34px;height:34px;border-radius:8px;background:${bg};border:${border};color:${color};font-size:${fontSize};font-weight:800;display:flex;align-items:center;justify-content:center;line-height:1;">${label}</div>
            </div>`;
        }).join('');

        cont.innerHTML = `
            <div style="max-width:520px;margin:0 auto;">
                <!-- Tarjeta header puntos -->
                <div class="glass-card" style="background:var(--panelBg);border-radius:18px;border:1px solid rgba(255,255,255,0.1);overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.25);margin-bottom:16px;padding:0;animation-delay:0s;transition:0.25s;" onmouseover="this.style.transform='translateY(-4px)';this.style.boxShadow='0 10px 30px rgba(0,0,0,0.35)'" onmouseout="this.style.transform='';this.style.boxShadow='0 4px 20px rgba(0,0,0,0.25)'">
                    <div style="background:linear-gradient(135deg,${cfg.color}20,${cfg.color}42);border-bottom:3px solid ${cfg.color};padding:20px 22px;display:flex;align-items:center;gap:14px;">
                        <div style="width:58px;height:58px;border-radius:16px;background:${cfg.color};display:flex;align-items:center;justify-content:center;font-size:28px;flex-shrink:0;box-shadow:0 4px 16px ${cfg.color}55;">${cfg.emoji}</div>
                        <div style="flex:1;">
                            <div style="font-size:16px;font-weight:900;">${aNombrePropio(nombre)}</div>
                            <div style="display:flex;gap:5px;margin-top:5px;flex-wrap:wrap;">
                                ${plat ? `<span style="background:${cfg.color}33;color:${cfg.color};font-size:10px;font-weight:700;padding:2px 10px;border-radius:10px;text-transform:uppercase;">${plat}</span>` : ''}
                                ${jornada ? `<span style="background:rgba(255,255,255,0.1);color:#fff;font-size:10px;font-weight:700;padding:2px 10px;border-radius:10px;text-transform:uppercase;">🕐 ${jornada}</span>` : ''}
                                ${grupo   ? `<span style="background:rgba(255,255,255,0.07);color:rgba(255,255,255,0.6);font-size:10px;font-weight:700;padding:2px 10px;border-radius:10px;text-transform:uppercase;">👥 ${grupo}</span>` : ''}
                            </div>
                        </div>
                    </div>
                    <!-- Stats row -->
                    <div style="display:grid;grid-template-columns:1fr 1fr;padding:16px 22px;gap:0;">
                        <div style="text-align:center;padding:0 10px;border-right:1px solid rgba(255,255,255,0.08);">
                            <div style="font-size:32px;font-weight:900;color:${cfg.color};">${total.toFixed(2)}</div>
                            <div style="font-size:10px;color:var(--textMuted);text-transform:uppercase;letter-spacing:0.5px;margin-top:2px;">Puntos Totales</div>
                        </div>
                        <div style="text-align:center;padding:0 10px;">
                            <div style="font-size:32px;font-weight:900;color:var(--textMuted);">${avg}</div>
                            <div style="font-size:10px;color:var(--textMuted);text-transform:uppercase;letter-spacing:0.5px;margin-top:2px;">Promedio / Día</div>
                        </div>
                    </div>
                </div>
                <!-- Calendario de puntos -->
                <div class="glass-card" style="background:var(--panelBg);border-radius:18px;border:1px solid rgba(255,255,255,0.1);overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.2);padding:0;animation-delay:0.08s;transition:0.25s;" onmouseover="this.style.transform='translateY(-4px)';this.style.boxShadow='0 10px 30px rgba(0,0,0,0.35)'" onmouseout="this.style.transform='';this.style.boxShadow='0 4px 20px rgba(0,0,0,0.2)'">
                    <div style="padding:14px 18px;border-bottom:1px solid rgba(255,255,255,0.07);display:flex;align-items:center;justify-content:space-between;">
                        <span style="font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:var(--textMuted);">📅 Puntos por Día</span>
                        <div style="display:flex;gap:10px;font-size:10px;color:var(--textMuted);">
                            <span style="display:flex;align-items:center;gap:4px;"><span style="display:inline-block;width:14px;height:14px;border-radius:4px;border:1px solid #27ae60;background:rgba(39,174,96,0.18);"></span>Con pts</span>
                            <span style="display:flex;align-items:center;gap:4px;"><span style="display:inline-block;width:14px;height:14px;border-radius:4px;border:1px solid var(--accent);background:rgba(255,45,85,0.12);"></span>Sin pts</span>
                        </div>
                    </div>
                    <div style="padding:16px 18px;display:flex;flex-wrap:wrap;gap:8px;justify-content:flex-start;">${celdasPuntos}</div>
                </div>
            </div>`;
        return;
    }

    // Ordenar por total desc
    nombres.sort((a, b) => {
        const ta = Object.values(porNombre[a]).reduce((s,v) => s + (parseFloat(v)||0), 0);
        const tb = Object.values(porNombre[b]).reduce((s,v) => s + (parseFloat(v)||0), 0);
        return tb - ta;
    });

    // Agrupar por jornada
    const porJornada = {};
    nombres.forEach(nombre => {
        const gj = getGrupoJornada(nombre);
        const j = (gj.jornada || 'SIN JORNADA').toUpperCase();
        if (!porJornada[j]) porJornada[j] = [];
        porJornada[j].push(nombre);
    });
    const ordenJ = ['MAÑANA','TARDE','MADRUGADA','MADRUGADA'];
    const jornadasOrder = [...ordenJ.filter(j=>porJornada[j]), ...Object.keys(porJornada).filter(j=>!ordenJ.includes(j))];
    const jornadaCfgP = { 'TARDE':{color:'#3498db',icon:'🌆'}, 'MAÑANA':{color:'#27ae60',icon:'🌅'}, 'MADRUGADA':{color:'#9b59b6',icon:'🌙'}, 'ÚNICA':{color:'#e67e22',icon:'⭐'}, 'MADRUGADA':{color:'#e74c3c',icon:'🌃'}, 'SIN JORNADA':{color:'#888',icon:'🕐'} };
    const medalsP = ['🥇','🥈','🥉'];

    let sectionsHTML = '';
    jornadasOrder.forEach(jornada => {
        const jCfg = jornadaCfgP[jornada] || {color:'#888', icon:'🕐'};
        const nombresJ = porJornada[jornada];
        const totalJornada = nombresJ.reduce((s, n) => s + Object.values(porNombre[n]).reduce((ss,v)=>ss+(parseFloat(v)||0),0), 0);
        const maxJ = Math.max(...nombresJ.map(n => Object.values(porNombre[n]).reduce((s,v)=>s+(parseFloat(v)||0),0)));

        const cards = nombresJ.map((nombre, rankIdx) => {
            const dias = porNombre[nombre];
            const total = Object.values(dias).reduce((s,v)=>s+(parseFloat(v)||0),0);
            const diasConPts = Object.values(dias).filter(v=>parseFloat(v)>0).length;
            const avg = diasConPts > 0 ? (total/diasConPts).toFixed(2) : '0.00';
            const gj = getGrupoJornada(nombre);
            const plat = gj.plataforma || '';
            const grupo = gj.grupo || '';
            const cfg = getPlatConfig(plat);
            const u = usuarios.find(u => u.nombre.toLowerCase().trim() === nombre.toLowerCase().trim());
            const foto = u ? (u.foto||'') : '';
            const medal = medalsP[rankIdx] || ('#'+(rankIdx+1));
            const barW = maxJ > 0 ? Math.round((total/maxJ)*100) : 0;
            const totalColor = total > 0 ? '#27ae60' : 'var(--accent)';

            const chipsDias = diasDelMes.map(d => {
                const v = dias[d]; const pts = parseFloat(v);
                if (v===''||v===undefined) return `<div style="display:flex;flex-direction:column;align-items:center;gap:2px;"><span style="font-size:8px;color:rgba(255,255,255,0.15);font-weight:600;">${d}</span><span style="display:inline-block;width:22px;height:22px;border-radius:5px;background:rgba(255,255,255,0.04);color:var(--textMuted);font-size:9px;text-align:center;line-height:22px;">-</span></div>`;
                if (pts>0) { const ptsLabel=pts%1===0?pts.toFixed(0):pts.toFixed(2).replace(/\.?0+$/,''); const ptsFontSize=ptsLabel.length>4?'7px':ptsLabel.length>3?'8px':'9px'; return `<div style="display:flex;flex-direction:column;align-items:center;gap:2px;"><span style="font-size:8px;color:rgba(255,255,255,0.3);font-weight:600;">${d}</span><span style="display:inline-block;width:22px;height:22px;border-radius:5px;background:#27ae6022;border:1px solid #27ae60;color:#27ae60;font-size:${ptsFontSize};font-weight:800;text-align:center;line-height:22px;">${ptsLabel}</span></div>`; }
                return `<div style="display:flex;flex-direction:column;align-items:center;gap:2px;"><span style="font-size:8px;color:rgba(255,255,255,0.3);font-weight:600;">${d}</span><span style="display:inline-block;width:22px;height:22px;border-radius:5px;background:rgba(255,45,85,0.12);border:1px solid var(--accent);color:var(--accent);font-size:9px;font-weight:800;text-align:center;line-height:22px;">0</span></div>`;
            }).join('');

            return `<div style="background:var(--panelBg);border-radius:14px;border:1px solid rgba(255,255,255,0.08);overflow:hidden;transition:0.2s;" onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 6px 20px rgba(0,0,0,0.25)'" onmouseout="this.style.transform='';this.style.boxShadow=''">
                <div style="background:linear-gradient(135deg,${jCfg.color}15,${jCfg.color}30);border-bottom:2px solid ${jCfg.color};padding:12px 14px;display:flex;align-items:center;gap:10px;">
                    <div style="font-size:20px;width:28px;text-align:center;flex-shrink:0;">${medal}</div>
                    <img src="${foto}" onerror="this.src='https://cdn-icons-png.flaticon.com/512/3135/3135715.png'" style="width:38px;height:38px;border-radius:50%;object-fit:cover;border:2px solid ${cfg.color||jCfg.color};flex-shrink:0;">
                    <div style="flex:1;min-width:0;">
                        <div style="font-size:13px;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${aNombrePropio(nombre)}</div>
                        <div style="display:flex;gap:4px;margin-top:3px;flex-wrap:wrap;">
                            ${plat?`<span style="background:${cfg.color};color:#fff;border-radius:8px;padding:1px 7px;font-size:10px;font-weight:700;">${plat}</span>`:''}
                            ${grupo?`<span style="background:rgba(255,255,255,0.08);color:var(--textMuted);border-radius:8px;padding:1px 7px;font-size:10px;font-weight:700;">👥 ${grupo}</span>`:''}
                        </div>
                    </div>
                    <div style="text-align:center;flex-shrink:0;">
                        <div style="font-size:22px;font-weight:900;color:${totalColor};line-height:1;">${total.toFixed(2)}</div>
                        <div style="font-size:9px;color:var(--textMuted);text-transform:uppercase;letter-spacing:0.5px;">pts</div>
                    </div>
                </div>
                <div style="padding:10px 14px;">
                    <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;padding-bottom:8px;border-bottom:1px solid rgba(255,255,255,0.06);">
                        <div style="flex:1;background:#2a2a2a;border-radius:6px;height:6px;overflow:hidden;">
                            <div style="background:${jCfg.color};width:${barW}%;height:100%;border-radius:6px;"></div>
                        </div>
                        <span style="font-size:10px;color:var(--textMuted);white-space:nowrap;">Prom: ${avg}</span>
                    </div>
                    <div style="display:flex;flex-wrap:wrap;gap:3px;">${chipsDias}</div>
                </div>
            </div>`;
        }).join('');

        sectionsHTML += `
        <div style="margin-bottom:28px;">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:14px;padding-bottom:8px;border-bottom:2px solid ${jCfg.color}44;">
                <span style="font-size:18px;">${jCfg.icon}</span>
                <span style="font-size:14px;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:${jCfg.color};">Jornada ${jornada}</span>
                <span style="background:${jCfg.color}22;color:${jCfg.color};border:1px solid ${jCfg.color}55;border-radius:10px;padding:2px 9px;font-size:11px;font-weight:700;">${nombresJ.length} asesor${nombresJ.length!==1?'es':''}</span>
                <span style="margin-left:auto;font-size:12px;font-weight:800;color:${jCfg.color};">${totalJornada.toFixed(2)} pts total</span>
            </div>
            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:14px;">${cards}</div>
        </div>`;
    });

    cont.innerHTML = sectionsHTML;
}


// ── RANKING TABS ─────────────────────────────────────────────────────────────
let rankTabActual = 'general';

function switchRankTab(tab) {
    rankTabActual = tab;
    const tabs   = { general:'tabRankGen', plataforma:'tabRankPlat', jornada:'tabRankJorn' };
    const vistas = { general:'vistaRankGeneral', plataforma:'vistaRankPlataforma', jornada:'vistaRankJornada' };
    Object.entries(tabs).forEach(([key, id]) => {
        const btn = document.getElementById(id);
        if (!btn) return;
        if (key === tab) { btn.style.background='var(--accent)'; btn.style.color='#fff'; btn.style.border='none'; }
        else { btn.style.background='transparent'; btn.style.color='var(--accent)'; btn.style.border='2px solid var(--accent)'; }
    });
    Object.entries(vistas).forEach(([key, id]) => {
        const el = document.getElementById(id);
        if (el) el.style.display = key === tab ? 'block' : 'none';
    });
    if (tab === 'general') renderRankingGeneral();
    if (tab === 'plataforma') renderRanking();
    if (tab === 'jornada') renderRankingJornada();
}

function renderRankingGeneral() {
    const cont = document.getElementById('tablaRankingGeneral');
    if (!cont) return;
    if (datosPunt.length === 0) { cont.innerHTML = '<div class="glass-card"><p style="color:var(--textMuted);text-align:center;padding:30px;">Carga el archivo Excel.</p></div>'; return; }
    const totalPuntos = {};
    datosPunt.forEach(r => {
        const n=r['Nombre']||r['nombre']||'';
        const p=parseFloat(r['Puntos']||r['puntos']||0);
        if(!n||isNaN(p)) return;
        // Solo incluir asesores reales
        const esAsesorReal = usuarios.some(u => u.rol === 'asesor' && u.nombre.toLowerCase().trim() === n.toLowerCase().trim());
        if (!esAsesorReal) return;
        totalPuntos[n]=(totalPuntos[n]||0)+p;
    });
    const lista = Object.entries(totalPuntos).map(([nombre,puntos])=>({nombre,puntos})).sort((a,b)=>b.puntos-a.puntos);
    const medals=['🥇','🥈','🥉'];
    const maxPts = lista[0]?lista[0].puntos:1;
    const jornadaCfgR = { 'TARDE':{color:'#3498db',icon:'🌆'}, 'MAÑANA':{color:'#27ae60',icon:'🌅'}, 'MADRUGADA':{color:'#9b59b6',icon:'🌙'}, 'ÚNICA':{color:'#e67e22',icon:'⭐'}, 'MADRUGADA':{color:'#e74c3c',icon:'🌃'} };
    const topTotal = lista.reduce((s,a)=>s+a.puntos,0);

    // Stats header
    const statsHTML = `
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:10px;margin-bottom:22px;">
            <div style="background:rgba(255,255,255,0.04);border-radius:12px;padding:12px 16px;border:1px solid rgba(255,255,255,0.08);display:flex;align-items:center;gap:10px;">
                <span style="font-size:22px;">🏆</span>
                <div><div style="font-size:20px;font-weight:900;color:var(--accent);">${lista.length}</div><div style="font-size:10px;color:var(--textMuted);text-transform:uppercase;letter-spacing:1px;">Asesores</div></div>
            </div>
            <div style="background:rgba(255,255,255,0.04);border-radius:12px;padding:12px 16px;border:1px solid rgba(255,255,255,0.08);display:flex;align-items:center;gap:10px;">
                <span style="font-size:22px;">⭐</span>
                <div><div style="font-size:20px;font-weight:900;color:var(--accent);">${topTotal.toFixed(2)}</div><div style="font-size:10px;color:var(--textMuted);text-transform:uppercase;letter-spacing:1px;">Pts Total</div></div>
            </div>
            <div style="background:rgba(255,255,255,0.04);border-radius:12px;padding:12px 16px;border:1px solid rgba(255,255,255,0.08);display:flex;align-items:center;gap:10px;">
                <span style="font-size:22px;">📈</span>
                <div><div style="font-size:20px;font-weight:900;color:var(--accent);">${lista.length>0?(topTotal/lista.length).toFixed(2):0}</div><div style="font-size:10px;color:var(--textMuted);text-transform:uppercase;letter-spacing:1px;">Prom Asesor</div></div>
            </div>
        </div>`;

    const cards = lista.map((a,i) => {
        const gj = getGrupoJornada(a.nombre);
        const u = usuarios.find(u=>u.nombre.toLowerCase().trim()===a.nombre.toLowerCase().trim());
        const foto = (u&&u.foto)?u.foto:'https://cdn-icons-png.flaticon.com/512/3135/3135715.png';
        const plat = (u&&u.plataforma)?u.plataforma:'';
        const cfg = getPlatConfig(plat);
        const medal = medals[i]||(i+1);
        const barW = maxPts>0?Math.round((a.puntos/maxPts)*100):0;
        const esTuyo = userLogueado && a.nombre.toLowerCase().trim()===userLogueado.nombre.toLowerCase().trim();
        const jornada = (gj.jornada||'').toUpperCase();
        const jCfg = jornadaCfgR[jornada]||{color:cfg.color||'#888',icon:'🕐'};
        const headerColor = esTuyo ? 'var(--accent)' : jCfg.color;
        const grupo = gj.grupo||'';
        // Top 3 tienen tarjeta más destacada
        const isTop3 = i < 3;

        return `<div style="background:var(--panelBg);border-radius:${isTop3?'16px':'14px'};border:1px solid rgba(255,255,255,${isTop3?'0.15':'0.08'});overflow:hidden;transition:0.25s;box-shadow:${isTop3?'0 4px 20px rgba(0,0,0,0.25)':'0 2px 10px rgba(0,0,0,0.15)'};" onmouseover="this.style.transform='translateY(-3px)';this.style.boxShadow='0 8px 28px rgba(0,0,0,0.3)'" onmouseout="this.style.transform='';this.style.boxShadow='${isTop3?'0 4px 20px rgba(0,0,0,0.25)':'0 2px 10px rgba(0,0,0,0.15)'}'">
            <div style="background:linear-gradient(135deg,${headerColor}20,${headerColor}40);border-bottom:${isTop3?3:2}px solid ${headerColor};padding:${isTop3?'14px 16px':'11px 14px'};display:flex;align-items:center;gap:10px;">
                <div style="font-size:${isTop3?'26px':'20px'};width:32px;text-align:center;flex-shrink:0;">${medal}</div>
                <img src="${foto}" onerror="this.src='https://cdn-icons-png.flaticon.com/512/3135/3135715.png'" style="width:${isTop3?'44px':'36px'};height:${isTop3?'44px':'36px'};border-radius:50%;object-fit:cover;border:2px solid ${headerColor};flex-shrink:0;box-shadow:0 2px 8px rgba(0,0,0,0.3);">
                <div style="flex:1;min-width:0;">
                    <div style="font-size:${isTop3?'14px':'13px'};font-weight:${esTuyo?'900':'800'};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:${esTuyo?'var(--accent)':'inherit'};">${aNombrePropio(a.nombre)}${esTuyo?' ← Tú':''}</div>
                    <div style="display:flex;gap:4px;margin-top:3px;flex-wrap:wrap;">
                        ${plat?`<span style="background:${cfg.color};color:#fff;border-radius:8px;padding:1px 7px;font-size:10px;font-weight:700;">${plat}</span>`:''}
                        ${jornada?`<span style="background:${jCfg.color}22;color:${jCfg.color};border:1px solid ${jCfg.color}55;border-radius:8px;padding:1px 7px;font-size:10px;font-weight:700;">${jCfg.icon} ${jornada}</span>`:''}
                        ${grupo?`<span style="background:rgba(255,255,255,0.07);color:var(--textMuted);border-radius:8px;padding:1px 7px;font-size:10px;font-weight:700;">👥 ${grupo}</span>`:''}
                    </div>
                </div>
                <div style="text-align:center;flex-shrink:0;">
                    <div style="font-size:${isTop3?'22px':'18px'};font-weight:900;color:${headerColor};line-height:1;">${a.puntos.toFixed(2)}</div>
                    <div style="font-size:9px;color:var(--textMuted);">pts</div>
                </div>
            </div>
            <div style="padding:8px 14px 10px;">
                <div style="display:flex;align-items:center;gap:8px;">
                    <div style="flex:1;background:#2a2a2a;border-radius:6px;height:5px;overflow:hidden;">
                        <div style="background:${headerColor};width:${barW}%;height:100%;border-radius:6px;transition:width 0.6s ease;"></div>
                    </div>
                    <span style="font-size:10px;color:var(--textMuted);white-space:nowrap;">${barW}%</span>
                </div>
            </div>
        </div>`;
    }).join('');

    // Tarjetas OFICINA por plataforma — solo visible para admin y supervisor
    let oficinaHTML = '';
    if (userLogueado && userLogueado.rol !== 'asesor') {
        // Acumular puntos por plataforma de oficina
        // Clave: nombre de plataforma (ej: "AmoLatina") o "__legado__" para "OFICINA" sin plataforma
        const oficinaPorPlat = {};
        datosPunt.forEach(r => {
            const n = r['Nombre'] || r['nombre'] || '';
            const p = parseFloat(r['Puntos'] || r['puntos'] || 0);
            if (!n || isNaN(p)) return;
            const { esOficina, plataforma } = detectarOficina(n);
            if (!esOficina) return;
            // Verificar que no sea un asesor registrado con ese nombre exacto
            const esAsesorReal = usuarios.some(u => u.rol === 'asesor' && u.nombre.toLowerCase().trim() === n.toLowerCase().trim());
            if (esAsesorReal) return;
            const key = plataforma || '__legado__';
            oficinaPorPlat[key] = (oficinaPorPlat[key] || 0) + p;
        });
        const platsOficina = Object.entries(oficinaPorPlat);
        if (platsOficina.length > 0) {
            const maxOfPts = Math.max(...platsOficina.map(([,p]) => p), 1);
            const bloques = platsOficina.map(([plat, puntos]) => {
                const isLegado = plat === '__legado__';
                const platCfg = isLegado ? { emoji: '🏢', color: '#f1c40f' } : getPlatConfig(plat);
                const color = platCfg.color;
                const emoji = platCfg.emoji;
                const titulo = isLegado ? 'OFICINA' : `${plat.toUpperCase()} OFICINA`;
                const barW = Math.round((puntos / maxOfPts) * 100);
                return `
                <div style="background:var(--panelBg);border-radius:14px;border:1px solid ${color}40;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.2);">
                    <div style="background:linear-gradient(135deg,${color}18,${color}35);border-bottom:2px solid ${color};padding:12px 16px;display:flex;align-items:center;gap:10px;">
                        <div style="width:34px;height:34px;border-radius:9px;background:${color};display:flex;align-items:center;justify-content:center;font-size:17px;flex-shrink:0;">${emoji}</div>
                        <div>
                            <div style="font-size:13px;font-weight:900;color:${color};">${titulo}</div>
                            <div style="font-size:10px;color:rgba(255,255,255,0.4);">Solo Admin y Supervisor</div>
                        </div>
                    </div>
                    <div style="padding:12px 16px;display:flex;align-items:center;gap:12px;">
                        <div style="flex:1;">
                            <div style="background:#2a2a2a;border-radius:6px;height:6px;overflow:hidden;">
                                <div style="background:${color};width:${barW}%;height:100%;border-radius:6px;transition:width 0.5s;"></div>
                            </div>
                        </div>
                        <div style="text-align:center;flex-shrink:0;min-width:54px;">
                            <div style="font-size:20px;font-weight:900;color:${color};line-height:1;">${puntos.toFixed(2)}</div>
                            <div style="font-size:9px;color:var(--textMuted);">pts</div>
                        </div>
                    </div>
                </div>`;
            }).join('');
            oficinaHTML = `
            <div style="margin-top:22px;">
                <div style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:2px;color:rgba(255,255,255,0.35);margin-bottom:12px;padding-left:4px;">🏢 Puntos Oficina · Solo admin y coordinador</div>
                <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;">${bloques}</div>
            </div>`;
        }
    }

    cont.innerHTML = statsHTML + `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:14px;">${cards}</div>` + oficinaHTML;
}

function renderRankingJornada() {
    const cont = document.getElementById('tablaRankingJornada');
    if (!cont) return;
    if (datosPunt.length===0) { cont.innerHTML='<div class="glass-card"><p style="color:var(--textMuted);text-align:center;padding:30px;">Carga el archivo Excel.</p></div>'; return; }
    const totalPuntos={};
    datosPunt.forEach(r=>{const n=r['Nombre']||r['nombre']||'';const p=parseFloat(r['Puntos']||r['puntos']||0);if(!n||isNaN(p))return;
        // Excluir OFICINA del ranking de asesores
        const esAsesorReal=usuarios.some(u=>u.rol==='asesor'&&u.nombre.toLowerCase().trim()===n.toLowerCase().trim());
        if(!esAsesorReal)return;
        totalPuntos[n]=(totalPuntos[n]||0)+p;});
    const porJornada={};
    Object.keys(totalPuntos).forEach(nombre=>{
        const gj=getGrupoJornada(nombre);
        const jorn=(gj.jornada?gj.jornada.toUpperCase():'SIN JORNADA');
        if(!porJornada[jorn])porJornada[jorn]=[];
        porJornada[jorn].push({nombre,puntos:totalPuntos[nombre]});
    });
    const jornadaCfgJ = { 'MAÑANA':{color:'#27ae60',icon:'🌅'}, 'TARDE':{color:'#3498db',icon:'🌆'}, 'MADRUGADA':{color:'#9b59b6',icon:'🌙'}, 'MADRUGADA':{color:'#e74c3c',icon:'🌃'}, 'SIN JORNADA':{color:'#888',icon:'🕐'} };
    const ordenJ = ['MAÑANA','TARDE','MADRUGADA','MADRUGADA'];
    const jornadasOrder = [...ordenJ.filter(j=>porJornada[j]), ...Object.keys(porJornada).filter(j=>!ordenJ.includes(j))];
    const medals=['🥇','🥈','🥉'];

    // ── ASESOR: ver solo su jornada ──
    if (userLogueado && userLogueado.rol === 'asesor') {
        const gjAsesor = getGrupoJornada(userLogueado.nombre);
        const miJornada = gjAsesor.jornada ? gjAsesor.jornada.toUpperCase() : 'SIN JORNADA';
        const asesores = (porJornada[miJornada]||[]).sort((a,b)=>b.puntos-a.puntos);
        const jCfg = jornadaCfgJ[miJornada]||{color:'#888',icon:'🕐'};
        const maxPts = asesores[0]?asesores[0].puntos:1;

        const cards = asesores.map((a,i)=>{
            const u=usuarios.find(u=>u.nombre.toLowerCase().trim()===a.nombre.toLowerCase().trim());
            const foto=(u&&u.foto)?u.foto:'https://cdn-icons-png.flaticon.com/512/3135/3135715.png';
            const plat=(u&&u.plataforma)?u.plataforma:'';
            const gj=getGrupoJornada(a.nombre);
            const cfg=getPlatConfig(plat);
            const medal=medals[i]||(i+1);
            const barW=maxPts>0?Math.round((a.puntos/maxPts)*100):0;
            const esTuyo=a.nombre.toLowerCase().trim()===userLogueado.nombre.toLowerCase().trim();
            const hColor=esTuyo?'var(--accent)':jCfg.color;
            return `<div style="background:var(--panelBg);border-radius:14px;border:1px solid rgba(255,255,255,${esTuyo?'0.2':'0.08'});overflow:hidden;transition:0.2s;" onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 6px 20px rgba(0,0,0,0.25)'" onmouseout="this.style.transform='';this.style.boxShadow=''">
                <div style="background:linear-gradient(135deg,${hColor}20,${hColor}40);border-bottom:2px solid ${hColor};padding:12px 14px;display:flex;align-items:center;gap:10px;">
                    <div style="font-size:22px;width:28px;text-align:center;flex-shrink:0;">${medal}</div>
                    <img src="${foto}" onerror="this.src='https://cdn-icons-png.flaticon.com/512/3135/3135715.png'" style="width:38px;height:38px;border-radius:50%;object-fit:cover;border:2px solid ${hColor};flex-shrink:0;">
                    <div style="flex:1;min-width:0;">
                        <div style="font-size:13px;font-weight:${esTuyo?'900':'800'};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:${esTuyo?'var(--accent)':'inherit'};">${aNombrePropio(a.nombre)}${esTuyo?' ← Tú':''}</div>
                        <div style="display:flex;gap:4px;margin-top:3px;flex-wrap:wrap;">
                            ${plat?`<span style="background:${cfg.color};color:#fff;border-radius:8px;padding:1px 7px;font-size:10px;font-weight:700;">${plat}</span>`:''}
                            ${gj.grupo?`<span style="background:rgba(255,255,255,0.08);color:var(--textMuted);border-radius:8px;padding:1px 7px;font-size:10px;">👥 ${gj.grupo}</span>`:''}
                        </div>
                    </div>
                    <div style="text-align:center;flex-shrink:0;">
                        <div style="font-size:20px;font-weight:900;color:${hColor};line-height:1;">${a.puntos.toFixed(2)}</div>
                        <div style="font-size:9px;color:var(--textMuted);">pts</div>
                    </div>
                </div>
                <div style="padding:8px 14px 10px;">
                    <div style="display:flex;align-items:center;gap:8px;">
                        <div style="flex:1;background:#2a2a2a;border-radius:6px;height:5px;overflow:hidden;"><div style="background:${hColor};width:${barW}%;height:100%;border-radius:6px;"></div></div>
                        <span style="font-size:10px;color:var(--textMuted);">${barW}%</span>
                    </div>
                </div>
            </div>`;
        }).join('');

        cont.innerHTML = `
            <div style="background:linear-gradient(135deg,${jCfg.color}18,${jCfg.color}35);border-radius:16px;border:1px solid ${jCfg.color}44;padding:16px 20px;margin-bottom:20px;display:flex;align-items:center;gap:14px;">
                <span style="font-size:32px;">${jCfg.icon}</span>
                <div>
                    <div style="font-size:16px;font-weight:900;color:${jCfg.color};text-transform:uppercase;letter-spacing:1px;">Jornada ${miJornada}</div>
                    <div style="font-size:12px;color:var(--textMuted);">${asesores.length} asesor${asesores.length!==1?'es':''} en tu jornada</div>
                </div>
            </div>
            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:12px;">${cards}</div>`;
        return;
    }

    // ── ADMIN/SUPERVISOR: todas las jornadas como secciones ──
    Object.values(porJornada).forEach(arr=>arr.sort((a,b)=>b.puntos-a.puntos));
    let sectionsHTML = '';
    jornadasOrder.forEach(jorn => {
        const asesores = porJornada[jorn];
        const jCfg = jornadaCfgJ[jorn]||{color:'#888',icon:'🕐'};
        const total = asesores.reduce((s,a)=>s+a.puntos,0);
        const maxJ = asesores[0]?asesores[0].puntos:1;

        const cards = asesores.map((a,i)=>{
            const u=usuarios.find(u=>u.nombre.toLowerCase().trim()===a.nombre.toLowerCase().trim());
            const foto=(u&&u.foto)?u.foto:'https://cdn-icons-png.flaticon.com/512/3135/3135715.png';
            const plat=(u&&u.plataforma)?u.plataforma:'';
            const gj=getGrupoJornada(a.nombre);
            const cfg=getPlatConfig(plat);
            const medal=medals[i]||(i+1);
            const barW=maxJ>0?Math.round((a.puntos/maxJ)*100):0;
            return `<div style="background:var(--panelBg);border-radius:14px;border:1px solid rgba(255,255,255,0.08);overflow:hidden;transition:0.2s;" onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 6px 20px rgba(0,0,0,0.25)'" onmouseout="this.style.transform='';this.style.boxShadow=''">
                <div style="background:linear-gradient(135deg,${jCfg.color}15,${jCfg.color}32);border-bottom:2px solid ${jCfg.color};padding:12px 14px;display:flex;align-items:center;gap:10px;">
                    <div style="font-size:20px;width:26px;text-align:center;flex-shrink:0;">${medal}</div>
                    <img src="${foto}" onerror="this.src='https://cdn-icons-png.flaticon.com/512/3135/3135715.png'" style="width:36px;height:36px;border-radius:50%;object-fit:cover;border:2px solid ${jCfg.color};flex-shrink:0;">
                    <div style="flex:1;min-width:0;">
                        <div style="font-size:13px;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${aNombrePropio(a.nombre)}</div>
                        <div style="display:flex;gap:4px;margin-top:3px;flex-wrap:wrap;">
                            ${plat?`<span style="background:${cfg.color};color:#fff;border-radius:8px;padding:1px 7px;font-size:10px;font-weight:700;">${plat}</span>`:''}
                            ${gj.grupo?`<span style="background:rgba(255,255,255,0.07);color:var(--textMuted);border-radius:8px;padding:1px 7px;font-size:10px;">👥 ${gj.grupo}</span>`:''}
                        </div>
                    </div>
                    <div style="text-align:center;flex-shrink:0;">
                        <div style="font-size:18px;font-weight:900;color:${jCfg.color};line-height:1;">${a.puntos.toFixed(2)}</div>
                        <div style="font-size:9px;color:var(--textMuted);">pts</div>
                    </div>
                </div>
                <div style="padding:8px 14px 10px;">
                    <div style="display:flex;align-items:center;gap:8px;">
                        <div style="flex:1;background:#2a2a2a;border-radius:6px;height:5px;overflow:hidden;"><div style="background:${jCfg.color};width:${barW}%;height:100%;border-radius:6px;"></div></div>
                        <span style="font-size:10px;color:var(--textMuted);">${barW}%</span>
                    </div>
                </div>
            </div>`;
        }).join('');

        sectionsHTML += `
        <div style="margin-bottom:28px;">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:14px;padding-bottom:8px;border-bottom:2px solid ${jCfg.color}44;">
                <span style="font-size:20px;">${jCfg.icon}</span>
                <span style="font-size:14px;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:${jCfg.color};">Jornada ${jorn}</span>
                <span style="background:${jCfg.color}22;color:${jCfg.color};border:1px solid ${jCfg.color}55;border-radius:10px;padding:2px 9px;font-size:11px;font-weight:700;">${asesores.length} asesor${asesores.length!==1?'es':''}</span>
                <span style="margin-left:auto;font-size:12px;font-weight:800;color:${jCfg.color};">${total.toFixed(2)} pts total</span>
            </div>
            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:12px;">${cards}</div>
        </div>`;
    });

    // Tarjetas OFICINA por plataforma en Ranking Jornada — solo admin y supervisor
    if (userLogueado && userLogueado.rol !== 'asesor') {
        const oficinaPorPlatJ = {};
        datosPunt.forEach(r => {
            const n = r['Nombre'] || r['nombre'] || '';
            const p = parseFloat(r['Puntos'] || r['puntos'] || 0);
            if (!n || isNaN(p)) return;
            const { esOficina, plataforma } = detectarOficina(n);
            if (!esOficina) return;
            const esAsesorReal = usuarios.some(u => u.rol === 'asesor' && u.nombre.toLowerCase().trim() === n.toLowerCase().trim());
            if (esAsesorReal) return;
            const key = plataforma || '__legado__';
            oficinaPorPlatJ[key] = (oficinaPorPlatJ[key] || 0) + p;
        });
        const platsJ = Object.entries(oficinaPorPlatJ);
        if (platsJ.length > 0) {
            const maxOfJ = Math.max(...platsJ.map(([,p]) => p), 1);
            const bloquesJ = platsJ.map(([plat, puntos]) => {
                const isLegado = plat === '__legado__';
                const platCfg = isLegado ? { emoji: '🏢', color: '#f1c40f' } : getPlatConfig(plat);
                const color = platCfg.color;
                const emoji = platCfg.emoji;
                const titulo = isLegado ? 'OFICINA' : `${plat.toUpperCase()} OFICINA`;
                const barW = Math.round((puntos / maxOfJ) * 100);
                return `
                <div style="background:var(--panelBg);border-radius:14px;border:1px solid ${color}40;overflow:hidden;">
                    <div style="background:linear-gradient(135deg,${color}18,${color}35);border-bottom:2px solid ${color};padding:11px 14px;display:flex;align-items:center;gap:8px;">
                        <div style="width:30px;height:30px;border-radius:8px;background:${color};display:flex;align-items:center;justify-content:center;font-size:15px;flex-shrink:0;">${emoji}</div>
                        <div style="font-size:12px;font-weight:900;color:${color};">${titulo}</div>
                    </div>
                    <div style="padding:10px 14px;display:flex;align-items:center;gap:10px;">
                        <div style="flex:1;background:#2a2a2a;border-radius:5px;height:5px;overflow:hidden;">
                            <div style="background:${color};width:${barW}%;height:100%;border-radius:5px;"></div>
                        </div>
                        <div style="font-size:17px;font-weight:900;color:${color};flex-shrink:0;">${puntos.toFixed(2)} <span style="font-size:9px;color:var(--textMuted);font-weight:400;">pts</span></div>
                    </div>
                </div>`;
            }).join('');
            sectionsHTML += `
            <div style="margin-top:14px;">
                <div style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:2px;color:rgba(255,255,255,0.35);margin-bottom:10px;padding-left:2px;">🏢 Puntos Oficina · Solo admin y coordinador</div>
                <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px;">${bloquesJ}</div>
            </div>`;
        }
    }

    cont.innerHTML = sectionsHTML;
}
// ── FIN RANKING TABS ──────────────────────────────────────────────────────────

// ── CONFIG GRUPOS ────────────────────────────────────────────────────────────
const jornadaColorDefaults = { 'MAÑANA':'#27ae60', 'TARDE':'#3498db', 'MADRUGADA':'#9b59b6', 'ÚNICA':'#e67e22', 'MADRUGADA':'#e74c3c' };
let jornadaColors = JSON.parse(localStorage.getItem('usd_jornada_colors') || 'null') || {...jornadaColorDefaults};

const grupoPaletaDefaults = ['#ff2d55','#3498db','#27ae60','#9b59b6','#e67e22','#1abc9c','#e74c3c','#2980b9'];
let grupoPaletaCustom = JSON.parse(localStorage.getItem('usd_grupo_paleta') || 'null') || [...grupoPaletaDefaults];

// Sobreescribir la función grupoColor para usar la paleta configurable
function grupoColor(i) { return grupoPaletaCustom[i % grupoPaletaCustom.length]; }

// Función que usan todos los renders para obtener el color de jornada
function getJornadaColor(jornada) {
    return jornadaColors[(jornada||'').toUpperCase()] || '#888';
}
function getJornadaIcon(jornada) {
    const icons = { 'MAÑANA':'🌅', 'TARDE':'🌆', 'MADRUGADA':'🌙', 'ÚNICA':'⭐', 'MADRUGADA':'🌃' };
    return icons[(jornada||'').toUpperCase()] || '🕐';
}

function cfgJornadaColor(jornada, valor, lblId) {
    jornadaColors[jornada.toUpperCase()] = valor;
    localStorage.setItem('usd_jornada_colors', JSON.stringify(jornadaColors));
    const lbl = document.getElementById(lblId);
    if (lbl) lbl.textContent = valor;
    renderCfgGruposPreview();
}

function cfgGrupoPaletaColor(idx, valor) {
    grupoPaletaCustom[idx] = valor;
    localStorage.setItem('usd_grupo_paleta', JSON.stringify(grupoPaletaCustom));
    renderCfgGruposPaleta();
    renderCfgGruposPreview();
}

async function resetearColoresGrupos() {
    const okReset = await confirmar({ titulo: '¿Restablecer colores?', msg: 'Se volverán a los valores por defecto.', icono: '🎨', labelOk: 'Restablecer', colorOk: '#e67e22' });
    if (!okReset) return;
    jornadaColors = {...jornadaColorDefaults};
    grupoPaletaCustom = [...grupoPaletaDefaults];
    localStorage.removeItem('usd_jornada_colors');
    localStorage.removeItem('usd_grupo_paleta');
    renderCfgGruposPaleta();
    renderCfgGruposPreview();
    // Actualizar inputs de color
    ['MAÑANA','TARDE','MADRUGADA','MADRUGADA'].forEach(j => {
        const input = document.getElementById('colorJornada'+j);
        const lbl   = document.getElementById('lbl_jornada'+j);
        if (input) input.value = jornadaColorDefaults[j];
        if (lbl)   lbl.textContent = jornadaColorDefaults[j];
    });
}

function renderCfgGruposPaleta() {
    const cont = document.getElementById('grupoPaletaControls');
    if (!cont) return;
    cont.innerHTML = grupoPaletaCustom.map((color, i) => `
        <div style="display:flex;align-items:center;gap:8px;padding:8px 10px;background:rgba(255,255,255,0.04);border-radius:10px;border:1px solid rgba(255,255,255,0.08);">
            <div style="width:28px;height:28px;border-radius:8px;background:${color};flex-shrink:0;box-shadow:0 2px 8px ${color}66;"></div>
            <label style="flex:1;font-size:12px;color:var(--textMuted);">Grupo ${i+1}</label>
            <input type="color" value="${color}" class="input-color-custom" style="width:30px;height:30px;" oninput="cfgGrupoPaletaColor(${i},this.value)">
        </div>`).join('');
}

function renderCfgGruposPreview() {
    const cont = document.getElementById('cfgGruposPreview');
    if (!cont) return;
    const color = grupoPaletaCustom[0] || '#ff2d55';
    const jColor = jornadaColors['TARDE'] || '#3498db';
    const jColorM = jornadaColors['MAÑANA'] || '#27ae60';
    cont.innerHTML = `
        <div style="background:var(--panelBg);border-radius:16px;border:1px solid rgba(255,255,255,0.1);overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.2);">
            <div style="background:linear-gradient(135deg,${color}22,${color}44);border-bottom:3px solid ${color};padding:14px 16px;display:flex;align-items:center;gap:10px;">
                <div style="width:40px;height:40px;border-radius:10px;background:${color};display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:900;color:#fff;">A</div>
                <div><div style="font-size:15px;font-weight:900;">ALEMANIA</div><div style="font-size:11px;color:rgba(255,255,255,0.55);">2 asesores · 1 modelo</div></div>
            </div>
            <div style="padding:12px 14px;display:flex;flex-direction:column;gap:8px;">
                <div style="font-size:10px;color:var(--textMuted);text-transform:uppercase;letter-spacing:1px;font-weight:700;">Asesores por Jornada</div>
                <div style="font-size:10px;font-weight:700;color:${jColorM};">🌅 Jornada Mañana <span style="background:${jColorM}22;border:1px solid ${jColorM}55;border-radius:8px;padding:1px 7px;margin-left:4px;">1</span></div>
                <div style="padding:6px 8px;background:rgba(255,255,255,0.04);border-radius:8px;display:flex;align-items:center;gap:8px;">
                    <div style="width:28px;height:28px;border-radius:50%;background:${jColorM};display:flex;align-items:center;justify-content:center;font-size:13px;">👤</div>
                    <span style="font-size:12px;font-weight:600;">Juan Asesor</span>
                </div>
                <div style="font-size:10px;font-weight:700;color:${jColor};">🌆 Jornada Tarde <span style="background:${jColor}22;border:1px solid ${jColor}55;border-radius:8px;padding:1px 7px;margin-left:4px;">1</span></div>
                <div style="padding:6px 8px;background:rgba(255,255,255,0.04);border-radius:8px;display:flex;align-items:center;gap:8px;">
                    <div style="width:28px;height:28px;border-radius:50%;background:${jColor};display:flex;align-items:center;justify-content:center;font-size:13px;">👤</div>
                    <span style="font-size:12px;font-weight:600;">Maria Asesora</span>
                </div>
            </div>
        </div>`;
}

function initCfgGruposTab() {
    // Cargar colores guardados en los inputs
    ['MAÑANA','TARDE','MADRUGADA','MADRUGADA'].forEach(j => {
        const input = document.getElementById('colorJornada'+j);
        const lbl   = document.getElementById('lbl_jornada'+j);
        const saved = jornadaColors[j] || jornadaColorDefaults[j];
        if (input) input.value = saved;
        if (lbl)   lbl.textContent = saved;
    });
    renderCfgGruposPaleta();
    renderCfgGruposPreview();
}
// ── FIN CONFIG GRUPOS ─────────────────────────────────────────────────────────

function mostrarContacto() { toast('📧 administrativo.usdinformation@gmail.com', 'info', 5000); }

// ══════════════════════════════════════════════════════════════════
