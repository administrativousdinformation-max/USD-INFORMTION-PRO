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
// ── HASH CON SALT: hash(contraseña + ":usd:" + usuario) ─────────────────────
