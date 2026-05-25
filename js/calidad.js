// MÓDULO CALIDAD
// ═══════════════════════════════════════════════════════
const CALIDAD_KEY = 'usd_calidad_registros';

function getCalidadRegistros() {
    try { return JSON.parse(localStorage.getItem(CALIDAD_KEY)) || []; }
    catch(e) { return []; }
}
function saveCalidadRegistros(data) {
    localStorage.setItem(CALIDAD_KEY, JSON.stringify(data));
    if (window._fbGuardar) window._fbGuardar(CALIDAD_KEY, data);
}

// Roles que pueden subir evaluaciones
function puedeSubirCalidad(rol) {
    return ['coordinador','supervisor1','supervisor2','capacitador','calidad'].includes(rol);
}

function abrirFormCalidad() {
    const rol = userLogueado ? userLogueado.rol : '';
    if (!puedeSubirCalidad(rol)) {
        alert('No tienes permiso para subir evaluaciones.');
        return;
    }
    // Llenar select de asesores
    const sel = document.getElementById('calAsesor');
    if (sel) {
        sel.innerHTML = '<option value="">Seleccionar asesor...</option>' +
            usuarios.filter(u => u.rol === 'asesor').map(u =>
                `<option value="${u.usuario}">${aNombrePropio(u.nombre)}</option>`
            ).join('');
    }
    ['calIdConv','calObservacion','calNota','calModelo','calNombreCliente'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    window._calAdjuntosPendientes = [];
    const prev = document.getElementById('calAdjPreview');
    if (prev) { prev.innerHTML = ''; prev.style.display = 'none'; }
    const inp = document.getElementById('calAdjInput');
    if (inp) inp.value = '';
    const notaPrev = document.getElementById('calNotaPreview');
    if (notaPrev) notaPrev.innerHTML = '';
    const modal = document.getElementById('modalCalidad');
    if (modal) { modal.style.display = 'flex'; }
}

function cerrarFormCalidad() {
    const modal = document.getElementById('modalCalidad');
    if (modal) modal.style.display = 'none';
    window._calAdjuntosPendientes = [];
    const prev = document.getElementById('calAdjPreview');
    if (prev) { prev.innerHTML = ''; prev.style.display = 'none'; }
    const inp = document.getElementById('calAdjInput');
    if (inp) inp.value = '';
    const notaPrev = document.getElementById('calNotaPreview');
    if (notaPrev) notaPrev.innerHTML = '';
}

function guardarCalidad() {
    const idConv  = (document.getElementById('calIdConv')?.value || '').trim();
    const asesor  = document.getElementById('calAsesor')?.value || '';
    const obs     = (document.getElementById('calObservacion')?.value || '').trim();
    const nota    = parseFloat(document.getElementById('calNota')?.value);
    const modelo  = (document.getElementById('calModelo')?.value || '').trim();
    const nombreCliente = (document.getElementById('calNombreCliente')?.value || '').trim();

    if (!idConv)  { alert('Ingresa el ID de conversación.'); return; }
    if (!asesor)  { alert('Selecciona un asesor.'); return; }
    if (!obs)     { alert('Escribe una observación.'); return; }
    if (isNaN(nota) || nota < 0 || nota > 100) { alert('La nota debe estar entre 0 y 100.'); return; }

    const adjuntos = window._calAdjuntosPendientes || [];
    const uAsesor = usuarios.find(u => u.usuario === asesor);
    const registros = getCalidadRegistros();
    registros.push({
        id: `cal_${Date.now()}_${Math.random().toString(36).slice(2,6)}`,
        idConv,
        asesorUid: asesor,
        asesorNombre: uAsesor ? aNombrePropio(uAsesor.nombre) : asesor,
        subidoPor: userLogueado.usuario,
        subidoPorNombre: aNombrePropio(userLogueado.nombre),
        modelo: modelo || '—',
        nombreCliente: nombreCliente || '—',
        observacion: obs,
        nota,
        adjuntos: adjuntos.length > 0 ? adjuntos : undefined,
        compromiso: '',
        fecha: new Date().toLocaleDateString('es-CO'),
        ts: Date.now()
    });
    saveCalidadRegistros(registros);
    window._calAdjuntosPendientes = [];
    cerrarFormCalidad();
    renderCalidad();
}

// ── Adjuntos de calidad ──
window._calAdjuntosPendientes = [];

function calAdjuntosSeleccionados(files) {
    if (!files || !files.length) return;
    if (!window._calAdjuntosPendientes) window._calAdjuntosPendientes = [];
    Array.from(files).forEach(file => {
        if (file.size > 10 * 1024 * 1024) { toast(`"${file.name}" supera 10MB.`, 'warning'); return; }
        const reader = new FileReader();
        reader.onload = (e) => {
            window._calAdjuntosPendientes.push({ nombre: file.name, tipo: file.type, dataUrl: e.target.result });
            _calAdjRender();
        };
        reader.readAsDataURL(file);
    });
    document.getElementById('calAdjInput').value = '';
}

function _calAdjRender() {
    const zona = document.getElementById('calAdjPreview');
    if (!zona) return;
    const adjs = window._calAdjuntosPendientes || [];
    if (!adjs.length) { zona.style.display = 'none'; zona.innerHTML = ''; return; }
    zona.style.display = 'flex';
    zona.innerHTML = adjs.map((adj, i) => {
        const ic = adj.tipo.startsWith('image/') ? '📷' : adj.tipo.includes('pdf') ? '📄' : adj.tipo.startsWith('audio') ? '🎵' : '📎';
        return `<div style="display:inline-flex;align-items:center;gap:5px;background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.15);border-radius:7px;padding:4px 9px;font-size:11px;color:#fff;">
            ${ic}<span style="max-width:80px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${adj.nombre}</span>
            <button onclick="window._calAdjuntosPendientes.splice(${i},1);_calAdjRender()" style="background:none;border:none;color:rgba(255,255,255,0.4);cursor:pointer;font-size:13px;line-height:1;padding:0;margin-left:2px;" onmouseover="this.style.color='#ff2d55'" onmouseout="this.style.color='rgba(255,255,255,0.4)'">✕</button>
        </div>`;
    }).join('');
}

function calNotaActualizar() {
    const val = parseFloat(document.getElementById('calNota')?.value);
    const prev = document.getElementById('calNotaPreview');
    if (!prev) return;
    if (isNaN(val)) { prev.innerHTML = ''; return; }
    let color, label;
    if (val >= 86) { color = '#27ae60'; label = '🟢 Alta calidad (86–100)'; }
    else if (val >= 66) { color = '#f1c40f'; label = '🟡 Calidad Media (66–85)'; }
    else { color = '#e74c3c'; label = '🔴 Baja calidad (0–65)'; }
    prev.innerHTML = `<span style="background:${color}22;color:${color};border:1px solid ${color}55;border-radius:7px;padding:3px 10px;font-size:11px;font-weight:700;">${label}</span>`;
}

function abrirModalCompromiso(id) {
    // Crear o reutilizar modal de compromiso
    let modal = document.getElementById('modalCompromisoCalidad');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modalCompromisoCalidad';
        modal.style.cssText = 'display:none;position:fixed;inset:0;background:rgba(0,0,0,0.8);z-index:9500;align-items:center;justify-content:center;';
        modal.innerHTML = `
            <div style="background:#1a1a1a;border-radius:18px;padding:28px;width:90%;max-width:460px;border:1px solid rgba(255,255,255,0.1);box-shadow:0 8px 40px rgba(0,0,0,0.8);">
                <h3 style="margin:0 0 16px;color:#fff;font-size:15px;">📝 Registrar Compromiso</h3>
                <input type="hidden" id="compromisoCalidadId" value="">
                <textarea id="compromisoCalidadTexto" rows="4" placeholder="Escribe aquí tu compromiso de mejora..."
                    style="width:100%;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.15);border-radius:10px;padding:11px 14px;color:#fff;font-size:13px;box-sizing:border-box;resize:vertical;font-family:inherit;outline:none;"></textarea>
                <div style="display:flex;gap:10px;margin-top:18px;">
                    <button onclick="cerrarModalCompromiso()" style="flex:1;background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.5);padding:11px;border-radius:10px;cursor:pointer;font-size:13px;font-weight:700;">Cancelar</button>
                    <button onclick="guardarCompromisoModal()" style="flex:2;background:var(--accent);color:#fff;border:none;padding:11px;border-radius:10px;cursor:pointer;font-size:13px;font-weight:700;">💾 Guardar Compromiso</button>
                </div>
            </div>`;
        document.body.appendChild(modal);
    }
    document.getElementById('compromisoCalidadId').value = id;
    document.getElementById('compromisoCalidadTexto').value = '';
    modal.style.display = 'flex';
    setTimeout(() => document.getElementById('compromisoCalidadTexto').focus(), 100);
}

function cerrarModalCompromiso() {
    const modal = document.getElementById('modalCompromisoCalidad');
    if (modal) modal.style.display = 'none';
}

function verCompromisoCompleto(id) {
    const registros = getCalidadRegistros();
    const r = registros.find(x => x.id === id);
    if (!r) return;

    // Crear modal si no existe
    let modal = document.getElementById('modalVerCompromiso');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modalVerCompromiso';
        modal.style.cssText = 'display:none;position:fixed;inset:0;background:rgba(0,0,0,0.88);z-index:9600;align-items:center;justify-content:center;padding:16px;box-sizing:border-box;overflow-y:auto;';
        modal.innerHTML = `
            <div style="background:#1a1a1a;border-radius:20px;width:100%;max-width:560px;border:1px solid rgba(255,255,255,0.1);box-shadow:0 12px 60px rgba(0,0,0,0.85);overflow:hidden;margin:auto;">
                <!-- Header -->
                <div id="vcDetHeader" style="padding:20px 24px 16px;border-bottom:1px solid rgba(255,255,255,0.07);display:flex;align-items:center;gap:12px;">
                    <span style="font-size:26px;">📋</span>
                    <div style="flex:1;">
                        <div style="font-size:15px;font-weight:800;color:#fff;">Detalle de Auditoría</div>
                        <div id="vcDetSubtitle" style="font-size:11px;color:var(--textMuted);margin-top:2px;"></div>
                    </div>
                    <button onclick="document.getElementById('modalVerCompromiso').style.display='none'"
                        style="background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.5);width:30px;height:30px;border-radius:9px;cursor:pointer;font-size:15px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">✕</button>
                </div>
                <!-- Body -->
                <div style="padding:20px 24px;display:flex;flex-direction:column;gap:14px;">
                    <!-- Fila: Asesor + Nota -->
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
                        <div style="background:rgba(255,255,255,0.04);border-radius:10px;padding:12px 14px;">
                            <div style="font-size:10px;color:var(--textMuted);text-transform:uppercase;letter-spacing:0.6px;margin-bottom:4px;">Asesor evaluado</div>
                            <div id="vcDetAsesor" style="font-size:13px;font-weight:700;color:#fff;"></div>
                        </div>
                        <div style="background:rgba(255,255,255,0.04);border-radius:10px;padding:12px 14px;">
                            <div style="font-size:10px;color:var(--textMuted);text-transform:uppercase;letter-spacing:0.6px;margin-bottom:4px;">Nota</div>
                            <div id="vcDetNota" style="font-size:22px;font-weight:900;"></div>
                        </div>
                    </div>
                    <!-- Fila: Creado por + Fecha -->
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
                        <div style="background:rgba(255,255,255,0.04);border-radius:10px;padding:12px 14px;">
                            <div style="font-size:10px;color:var(--textMuted);text-transform:uppercase;letter-spacing:0.6px;margin-bottom:4px;">Creado por</div>
                            <div id="vcDetCreador" style="font-size:13px;font-weight:700;color:#fff;"></div>
                            <div id="vcDetCreadorRol" style="font-size:10px;margin-top:3px;"></div>
                        </div>
                        <div style="background:rgba(255,255,255,0.04);border-radius:10px;padding:12px 14px;">
                            <div style="font-size:10px;color:var(--textMuted);text-transform:uppercase;letter-spacing:0.6px;margin-bottom:4px;">Fecha</div>
                            <div id="vcDetFecha" style="font-size:13px;font-weight:700;color:#fff;"></div>
                        </div>
                    </div>
                    <!-- Fila: ID Conv + Modelo -->
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
                        <div style="background:rgba(255,255,255,0.04);border-radius:10px;padding:12px 14px;">
                            <div style="font-size:10px;color:var(--textMuted);text-transform:uppercase;letter-spacing:0.6px;margin-bottom:4px;">ID Conversación</div>
                            <div id="vcDetIdConv" style="font-size:13px;color:rgba(255,255,255,0.8);word-break:break-all;"></div>
                        </div>
                        <div style="background:rgba(255,255,255,0.04);border-radius:10px;padding:12px 14px;">
                            <div style="font-size:10px;color:var(--textMuted);text-transform:uppercase;letter-spacing:0.6px;margin-bottom:4px;">Modelo</div>
                            <div id="vcDetModelo" style="font-size:13px;color:rgba(255,255,255,0.8);"></div>
                        </div>
                    </div>
                    <!-- Nombre Cliente -->
                    <div id="vcDetClienteWrap" style="background:rgba(255,255,255,0.04);border-radius:10px;padding:12px 14px;">
                        <div style="font-size:10px;color:var(--textMuted);text-transform:uppercase;letter-spacing:0.6px;margin-bottom:4px;">Nombre del Cliente</div>
                        <div id="vcDetCliente" style="font-size:13px;color:rgba(255,255,255,0.8);"></div>
                    </div>
                    <!-- Observación -->
                    <div style="background:rgba(255,255,255,0.04);border-radius:10px;padding:12px 14px;">
                        <div style="font-size:10px;color:var(--textMuted);text-transform:uppercase;letter-spacing:0.6px;margin-bottom:8px;">Observación</div>
                        <div id="vcDetObservacion" style="font-size:13px;color:rgba(255,255,255,0.85);line-height:1.65;white-space:pre-wrap;word-break:break-word;"></div>
                    </div>
                    <!-- Compromiso -->
                    <div id="vcDetCompromisoWrap" style="background:rgba(52,152,219,0.07);border:1px solid rgba(52,152,219,0.25);border-radius:10px;padding:12px 14px;">
                        <div style="font-size:10px;color:#3498db;text-transform:uppercase;letter-spacing:0.6px;margin-bottom:8px;font-weight:700;">📝 Compromiso del Asesor</div>
                        <div id="vcDetCompromiso" style="font-size:13px;color:rgba(255,255,255,0.85);line-height:1.65;white-space:pre-wrap;word-break:break-word;"></div>
                        <div id="vcDetCompromisoFecha" style="margin-top:8px;font-size:10px;color:rgba(255,255,255,0.3);text-align:right;"></div>
                    </div>
                    <!-- Adjuntos -->
                    <div id="vcDetAdjuntosWrap" style="display:none;background:rgba(255,255,255,0.04);border-radius:10px;padding:12px 14px;">
                        <div style="font-size:10px;color:var(--textMuted);text-transform:uppercase;letter-spacing:0.6px;margin-bottom:8px;font-weight:700;">📎 Adjuntos</div>
                        <div id="vcDetAdjuntos" style="display:flex;flex-wrap:wrap;gap:8px;"></div>
                    </div>
                    <!-- Badge eliminado (si aplica) -->
                    <div id="vcDetEliminadoWrap" style="display:none;background:rgba(231,76,60,0.1);border:1px solid rgba(231,76,60,0.35);border-radius:10px;padding:12px 14px;">
                        <div style="font-size:10px;color:#e74c3c;text-transform:uppercase;letter-spacing:0.6px;margin-bottom:6px;font-weight:800;">⛔ Registro Eliminado</div>
                        <div id="vcDetEliminadoInfo" style="font-size:12px;color:rgba(255,255,255,0.6);line-height:1.6;"></div>
                    </div>
                </div>
            </div>`;
        document.body.appendChild(modal);
    }

    // Poblar datos
    const notaColor = r.nota >= 86 ? '#27ae60' : r.nota >= 66 ? '#f1c40f' : '#e74c3c';
    const notaLabelDet = r.nota >= 86 ? 'Alta' : r.nota >= 66 ? 'Media' : 'Baja';
    const creadorRolLabel = { 'admin':'⚙️ Admin','coordinador':'🎯 Coordinador','supervisor1':'🌅 Sup. Mañana','supervisor2':'🌆 Sup. Tarde','capacitador':'📚 Formación','calidad':'✅ Calidad' };
    const creadorRolActual = (usuarios.find(u => u.usuario === r.subidoPor) || {}).rol || '';
    const creadorRolColor = {'admin':'#e74c3c','coordinador':'#8e44ad','supervisor1':'#27ae60','supervisor2':'#16a085','capacitador':'#2980b9','calidad':'#d35400'};
    const cc = creadorRolColor[creadorRolActual] || '#888';

    document.getElementById('vcDetSubtitle').textContent = `Auditoría del ${r.fecha}`;
    document.getElementById('vcDetAsesor').textContent = r.asesorNombre || '—';
    document.getElementById('vcDetNota').innerHTML = `<span style="color:${notaColor};font-weight:900;">${r.nota}</span><span style="font-size:13px;color:var(--textMuted);font-weight:400;"> / 100</span><span style="margin-left:6px;background:${notaColor}22;color:${notaColor};border:1px solid ${notaColor}55;border-radius:6px;padding:1px 7px;font-size:10px;font-weight:700;">${notaLabelDet}</span>`;
    document.getElementById('vcDetCreador').textContent = r.subidoPorNombre || '—';
    document.getElementById('vcDetCreadorRol').innerHTML = creadorRolActual
        ? `<span style="background:${cc}22;color:${cc};border:1px solid ${cc}55;border-radius:6px;padding:1px 7px;font-size:10px;font-weight:700;">${creadorRolLabel[creadorRolActual]||creadorRolActual}</span>` : '';
    document.getElementById('vcDetFecha').textContent = r.fecha || '—';
    document.getElementById('vcDetIdConv').textContent = r.idConv || '—';
    document.getElementById('vcDetModelo').textContent = r.modelo || '—';

    // Nombre cliente (ocultar si es —)
    const clienteWrap = document.getElementById('vcDetClienteWrap');
    const clienteVal = r.nombreCliente && r.nombreCliente !== '—' ? r.nombreCliente : null;
    clienteWrap.style.display = clienteVal ? '' : 'none';
    document.getElementById('vcDetCliente').textContent = clienteVal || '';

    document.getElementById('vcDetObservacion').textContent = r.observacion || '—';

    // Compromiso
    const compromisoWrap = document.getElementById('vcDetCompromisoWrap');
    if (r.compromiso) {
        compromisoWrap.style.display = '';
        document.getElementById('vcDetCompromiso').textContent = r.compromiso;
        const fcmp = r.compromisoTs ? new Date(r.compromisoTs).toLocaleString('es-CO') : '—';
        document.getElementById('vcDetCompromisoFecha').textContent = `Registrado: ${fcmp}`;
    } else {
        compromisoWrap.style.display = '';
        document.getElementById('vcDetCompromiso').innerHTML = '<span style="color:rgba(255,255,255,0.3);font-style:italic;">El asesor aún no ha registrado su compromiso.</span>';
        document.getElementById('vcDetCompromisoFecha').textContent = '';
    }

    // Adjuntos
    const adjWrap = document.getElementById('vcDetAdjuntosWrap');
    if (adjWrap) {
        if (r.adjuntos && r.adjuntos.length > 0) {
            adjWrap.style.display = '';
            const adjContainer = document.getElementById('vcDetAdjuntos');
            if (adjContainer) {
                adjContainer.innerHTML = r.adjuntos.map(adj => {
                    const ic = adj.tipo && adj.tipo.startsWith('image/') ? '📷' : adj.tipo && adj.tipo.includes('pdf') ? '📄' : adj.tipo && adj.tipo.startsWith('audio') ? '🎵' : '📎';
                    const isImg = adj.tipo && adj.tipo.startsWith('image/');
                    return `<div style="display:flex;flex-direction:column;gap:4px;">
                        ${isImg ? `<img src="${adj.dataUrl}" style="max-width:100%;max-height:180px;border-radius:8px;object-fit:contain;background:#0d0d0d;">` : ''}
                        <a href="${adj.dataUrl}" download="${adj.nombre}" style="display:inline-flex;align-items:center;gap:6px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:7px;padding:5px 10px;color:#fff;text-decoration:none;font-size:11px;font-weight:600;">${ic} ${adj.nombre}</a>
                    </div>`;
                }).join('');
            }
        } else {
            adjWrap.style.display = 'none';
        }
    }

    // Eliminado
    const elimWrap = document.getElementById('vcDetEliminadoWrap');
    if (r.eliminado) {
        elimWrap.style.display = '';
        document.getElementById('vcDetEliminadoInfo').innerHTML =
            `Por: <strong style="color:#fff;">${r.eliminadoPorNombre||'—'}</strong> · ${r.eliminadoFecha||'—'}<br>
             Motivo: <em style="color:rgba(255,180,180,0.85);">${r.eliminadoRazon||'—'}</em>`;
    } else {
        elimWrap.style.display = 'none';
    }

    modal.style.display = 'flex';
}

function guardarCompromisoModal() {
    const id = document.getElementById('compromisoCalidadId').value;
    const texto = (document.getElementById('compromisoCalidadTexto').value || '').trim();
    if (!texto) { toast('Escribe tu compromiso antes de guardar.', 'warning'); return; }
    const registros = getCalidadRegistros();
    const reg = registros.find(r => r.id === id);
    if (reg) {
        reg.compromiso = texto;
        reg.compromisoTs = Date.now();
        saveCalidadRegistros(registros);
        cerrarModalCompromiso();
        renderCalidad();
        toast('✅ Compromiso guardado correctamente.', 'success');
    }
}

function guardarCompromiso(id) {
    const input = document.getElementById(`compromiso_${id}`);
    if (!input) return;
    const texto = input.value.trim();
    if (!texto) { alert('Escribe tu compromiso antes de guardar.'); return; }
    const registros = getCalidadRegistros();
    const reg = registros.find(r => r.id === id);
    if (reg) {
        reg.compromiso = texto;
        reg.compromisoTs = Date.now();
        saveCalidadRegistros(registros);
        renderCalidad();
    }
}

async function eliminarEvaluacionCalidad(id) {
    // Solo coordinadores y admin pueden borrar auditorías
    const rolActual = userLogueado?.rol;
    if (!['admin', 'coordinador'].includes(rolActual)) {
        toast('⛔ Solo los coordinadores pueden eliminar auditorías.', 'error');
        return;
    }

    const registros = getCalidadRegistros();
    const reg = registros.find(r => r.id === id);
    if (!reg) { toast('Evaluación no encontrada.', 'error'); return; }

    // Pedir observación del motivo de borrado
    let modalRazon = document.getElementById('modalRazonBorrado');
    if (!modalRazon) {
        modalRazon = document.createElement('div');
        modalRazon.id = 'modalRazonBorrado';
        modalRazon.style.cssText = 'display:none;position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:10500;align-items:center;justify-content:center;';
        modalRazon.innerHTML = `
            <div style="background:#1a1a1a;border-radius:18px;padding:28px;width:90%;max-width:460px;border:1px solid rgba(231,76,60,0.4);box-shadow:0 8px 40px rgba(0,0,0,0.8);">
                <div style="font-size:32px;text-align:center;margin-bottom:10px;">🗑️</div>
                <h3 style="margin:0 0 6px;color:#fff;font-size:15px;text-align:center;">Eliminar Auditoría</h3>
                <p id="razonBorradoDesc" style="font-size:12px;color:rgba(255,255,255,0.5);text-align:center;margin:0 0 16px;"></p>
                <label style="font-size:12px;color:rgba(255,255,255,0.6);display:block;margin-bottom:6px;">Motivo de eliminación <span style="color:#e74c3c;">*</span></label>
                <textarea id="razonBorradoTexto" rows="3" placeholder="Explica por qué se elimina esta auditoría..."
                    style="width:100%;background:rgba(255,255,255,0.06);border:1px solid rgba(231,76,60,0.35);border-radius:10px;padding:11px 14px;color:#fff;font-size:13px;box-sizing:border-box;resize:vertical;font-family:inherit;outline:none;"></textarea>
                <div style="display:flex;gap:10px;margin-top:18px;">
                    <button onclick="document.getElementById('modalRazonBorrado').style.display='none'" style="flex:1;background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.5);padding:11px;border-radius:10px;cursor:pointer;font-size:13px;font-weight:700;">Cancelar</button>
                    <button id="btnConfirmarBorradoAuditoria" style="flex:2;background:#e74c3c;color:#fff;border:none;padding:11px;border-radius:10px;cursor:pointer;font-size:13px;font-weight:700;">🗑️ Confirmar Eliminación</button>
                </div>
            </div>`;
        document.body.appendChild(modalRazon);
    }

    // Rellenar descripción
    document.getElementById('razonBorradoDesc').innerHTML =
        `Auditoría de <strong style="color:#fff;">${reg.asesorNombre}</strong> · Nota <strong style="color:#f1c40f;">${reg.nota}</strong> · ${reg.fecha}`;
    document.getElementById('razonBorradoTexto').value = '';
    modalRazon.style.display = 'flex';
    setTimeout(() => document.getElementById('razonBorradoTexto').focus(), 100);

    // Asignar acción al botón confirmar
    document.getElementById('btnConfirmarBorradoAuditoria').onclick = function() {
        const razon = (document.getElementById('razonBorradoTexto').value || '').trim();
        if (!razon) { toast('⚠️ Debes escribir el motivo de eliminación.', 'warning'); return; }

        // Borrado lógico: marcar como eliminado sin quitar del array
        reg.eliminado = true;
        reg.eliminadoPor = userLogueado.usuario;
        reg.eliminadoPorNombre = aNombrePropio(userLogueado.nombre);
        reg.eliminadoRazon = razon;
        reg.eliminadoTs = Date.now();
        reg.eliminadoFecha = new Date().toLocaleDateString('es-CO');

        saveCalidadRegistros(registros);
        document.getElementById('modalRazonBorrado').style.display = 'none';
        renderCalidad();
        toast('✅ Auditoría marcada como eliminada y guardada en el registro.', 'success');
    };
}

function renderCalidad() {
    // Sincronizar desde Firebase
    if (window._fbCargar) {
        window._fbCargar(CALIDAD_KEY).then(data => {
            if (data) {
                const arr = Array.isArray(data) ? data : Object.values(data);
                localStorage.setItem(CALIDAD_KEY, JSON.stringify(arr));
            }
            _renderCalidadTabla();
        }).catch(() => _renderCalidadTabla());
    } else {
        _renderCalidadTabla();
    }

    // Mostrar/ocultar botón de nueva evaluación según rol
    const btn = document.getElementById('btnNuevaCalidad');
    if (btn) btn.style.display = puedeSubirCalidad(userLogueado?.rol) ? '' : 'none';
}

function _renderCalidadTabla() {
    const tbody = document.getElementById('tbodyCalidad');
    if (!tbody) return;
    let registros = getCalidadRegistros();

    // Filtrar por jornada si es supervisor1/supervisor2
    const jornada = window._filtroJornada;
    if (jornada) {
        registros = registros.filter(r => {
            if (r.eliminado) return true; // eliminados: siempre visibles para el supervisor
            const u = usuarios.find(x => x.usuario === r.asesorUid);
            return u && u.jornada === jornada;
        });
    }
    // Si es asesor, solo ver sus propios registros Y ocultar los eliminados
    if (userLogueado && userLogueado.rol === 'asesor') {
        registros = registros.filter(r => r.asesorUid === userLogueado.usuario && !r.eliminado);
    }
    // Roles superiores ven todo (incluyendo eliminados)

    if (registros.length === 0) {
        tbody.innerHTML = '<tr><td colspan="11" style="text-align:center;color:var(--textMuted);padding:30px;">Sin evaluaciones registradas.</td></tr>';
        return;
    }

    const esAsesor = userLogueado && userLogueado.rol === 'asesor';
    const puedeEliminar = puedeSubirCalidad(userLogueado?.rol);

    // Colores por rol del creador
    const rolCreadorColor = {
        'admin':'#e74c3c','coordinador':'#8e44ad','supervisor1':'#27ae60','supervisor2':'#16a085','capacitador':'#2980b9','calidad':'#d35400'
    };

    tbody.innerHTML = registros.slice().reverse().map(r => {
        const notaColor = r.nota >= 86 ? '#27ae60' : r.nota >= 66 ? '#f1c40f' : '#e74c3c';
        const notaLabel = r.nota >= 86 ? 'Alta' : r.nota >= 66 ? 'Media' : 'Baja';

        // Badge visual del creador
        const creadorRol = (usuarios.find(u => u.usuario === r.subidoPor) || {}).rol || '';
        const creadorColor = rolCreadorColor[creadorRol] || '#888';
        const esElMismoQueLoCrea = r.subidoPor === userLogueado.usuario;
        const creadorBadge = `
            <div style="display:flex;flex-direction:column;gap:3px;">
                <span style="font-size:12px;font-weight:700;color:#fff;">${r.subidoPorNombre || '—'}</span>
                <span style="display:inline-flex;align-items:center;gap:4px;background:${creadorColor}22;color:${creadorColor};border:1px solid ${creadorColor}55;border-radius:8px;padding:2px 7px;font-size:10px;font-weight:700;width:fit-content;">
                    ✍️ ${creadorRol ? creadorRol.charAt(0).toUpperCase() + creadorRol.slice(1) : 'Sistema'}
                    ${esElMismoQueLoCrea ? '<span style="margin-left:3px;opacity:0.7;">(Tú)</span>' : ''}
                </span>
            </div>`;

        // Columna compromiso: solo texto o botón agregar (sin botón ver detalle aquí)
        const compromisoHTML = esAsesor
            ? (r.compromiso
                ? `<span style="color:rgba(255,255,255,0.7);font-size:12px;max-width:180px;display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${r.compromiso}</span>`
                : `<button onclick="abrirModalCompromiso('${r.id}')" style="background:var(--accent);color:#fff;border:none;border-radius:8px;padding:6px 12px;font-size:11px;font-weight:700;cursor:pointer;white-space:nowrap;">✍️ Agregar</button>`)
            : (r.compromiso
                ? `<span style="color:rgba(255,255,255,0.6);font-size:12px;max-width:180px;display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${r.compromiso}</span>`
                : `<span style="color:rgba(255,255,255,0.25);font-size:11px;font-style:italic;">Sin compromiso</span>`);

        // Botón ojo (ver detalle) — siempre visible para todos
        const btnOjo = `<button onclick="verCompromisoCompleto('${r.id}')"
            title="Ver detalle de auditoría"
            style="background:rgba(52,152,219,0.12);border:1px solid rgba(52,152,219,0.4);color:#3498db;width:30px;height:30px;border-radius:8px;cursor:pointer;font-size:15px;display:flex;align-items:center;justify-content:center;transition:0.2s;"
            onmouseover="this.style.background='rgba(52,152,219,0.3)';this.style.color='#fff'"
            onmouseout="this.style.background='rgba(52,152,219,0.12)';this.style.color='#3498db'">👁️</button>`;

        // Botón eliminar: SOLO coordinadores y admin, y solo si no está ya eliminado
        const puedeEliminarEste = esRolAdmin(userLogueado?.rol) && !r.eliminado;
        const btnEliminar = puedeEliminarEste
            ? `<button onclick="eliminarEvaluacionCalidad('${r.id}')"
                title="Eliminar esta evaluación"
                style="background:rgba(231,76,60,0.12);border:1px solid rgba(231,76,60,0.4);color:#e74c3c;width:30px;height:30px;border-radius:8px;cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center;transition:0.2s;"
                onmouseover="this.style.background='rgba(231,76,60,0.3)';this.style.color='#fff'"
                onmouseout="this.style.background='rgba(231,76,60,0.12)';this.style.color='#e74c3c'">🗑️</button>`
            : '';

        // Badge de eliminado (visible para todos los roles no-asesor)
        const eliminadoBadge = (r.eliminado && !esAsesor) ? `
            <div style="margin-top:5px;background:rgba(231,76,60,0.1);border:1px solid rgba(231,76,60,0.35);border-radius:8px;padding:5px 8px;font-size:10px;line-height:1.6;">
                <div style="color:#e74c3c;font-weight:800;">⛔ ELIMINADO</div>
                <div style="color:rgba(255,255,255,0.55);">Por: <strong style="color:#fff;">${r.eliminadoPorNombre||'—'}</strong> · ${r.eliminadoFecha||'—'}</div>
                <div style="color:rgba(255,180,180,0.75);font-style:italic;">Motivo: ${r.eliminadoRazon||'—'}</div>
            </div>` : '';

        const rowStyle = r.eliminado
            ? 'border-bottom:1px solid rgba(255,255,255,0.05);opacity:0.55;'
            : 'border-bottom:1px solid rgba(255,255,255,0.05);';

        return `<tr style="${rowStyle}">
            <td style="padding:10px;color:rgba(255,255,255,0.7);font-size:12px;">${r.idConv}</td>
            <td style="padding:10px;color:#fff;font-size:12px;font-weight:600;">${r.asesorNombre}${eliminadoBadge}</td>
            <td style="padding:10px;">${creadorBadge}</td>
            <td style="padding:10px;color:rgba(255,255,255,0.7);font-size:12px;">${r.modelo || '—'}</td>
            <td style="padding:10px;color:rgba(255,255,255,0.7);font-size:12px;max-width:200px;">${r.observacion}</td>
            <td style="padding:10px;text-align:center;">
                <div style="display:flex;flex-direction:column;align-items:center;gap:3px;">
                    <span style="background:${notaColor};color:#fff;font-weight:700;font-size:13px;padding:3px 10px;border-radius:8px;">${r.nota}</span>
                    <span style="font-size:9px;font-weight:700;color:${notaColor};text-transform:uppercase;letter-spacing:0.5px;">${notaLabel}</span>
                </div>
            </td>
            <td style="padding:10px;">${compromisoHTML}</td>
            <td style="padding:10px;text-align:center;color:var(--textMuted);font-size:11px;">${r.fecha}</td>
            <td style="padding:10px;text-align:center;">
                ${r.adjuntos && r.adjuntos.length > 0
                    ? `<div style="display:flex;gap:4px;flex-wrap:wrap;justify-content:center;">${r.adjuntos.map((adj,ai) => {
                        const ic = adj.tipo && adj.tipo.startsWith('image/') ? '📷' : adj.tipo && adj.tipo.includes('pdf') ? '📄' : adj.tipo && adj.tipo.includes('audio') ? '🎵' : '📎';
                        return `<a href="${adj.dataUrl}" download="${adj.nombre}" title="${adj.nombre}" style="background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.15);border-radius:6px;padding:3px 7px;font-size:11px;color:#fff;text-decoration:none;display:inline-flex;align-items:center;gap:3px;">${ic} <span style="max-width:60px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${adj.nombre}</span></a>`;
                    }).join('')}</div>`
                    : `<span style="color:rgba(255,255,255,0.2);font-size:11px;">—</span>`}
            </td>
            <td style="padding:10px;text-align:center;">
                <div style="display:flex;align-items:center;justify-content:center;gap:6px;">
                    ${btnOjo}${btnEliminar}
                </div>
            </td>
        </tr>`;
    }).join('');
}
// ═══════════════════════════════════════════════════════════════════════

// ── REENVIAR MENSAJES ────────────────────────────────────────────────────────

// Cache global para callbacks de reenvío
if (!window._reenviarCallbacks) window._reenviarCallbacks = {};

function _reenviarMostrarSelector(labelTexto, adjNombre, onContacto, onGrupo, overlayId) {
    if (document.getElementById(overlayId)) document.getElementById(overlayId).remove();
    // Guardar callbacks en cache global para que el onclick inline los encuentre
    window._reenviarCallbacks[overlayId] = { onContacto, onGrupo };

    const destinos = usuarios.filter(u => u.usuario !== userLogueado.usuario);
    const ov = document.createElement('div');
    ov.id = overlayId;
    ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.75);z-index:10000;display:flex;align-items:center;justify-content:center;';
    const preview = labelTexto ? `"${labelTexto.substring(0,50)}${labelTexto.length>50?'…':''}"` : (adjNombre ? `📎 ${adjNombre}` : '');

    const grupoItem = `<div onclick="window._reenviarCallbacks['${overlayId}'].onGrupo();document.getElementById('${overlayId}').remove();" style="display:flex;align-items:center;gap:10px;padding:12px 14px;cursor:pointer;border-radius:10px;transition:0.15s;border:1px solid transparent;" onmouseover="this.style.background='rgba(255,45,85,0.12)';this.style.borderColor='rgba(255,45,85,0.2)'" onmouseout="this.style.background='transparent';this.style.borderColor='transparent'">
        <div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#ff2d55,#c0153a);display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;">👥</div>
        <div>
            <div style="font-size:13px;font-weight:700;color:#fff;">GRUPO USD</div>
            <div style="font-size:10px;color:rgba(255,255,255,0.4);">Todos los integrantes</div>
        </div>
        <div style="margin-left:auto;font-size:18px;color:rgba(255,45,85,0.6);">➤</div>
    </div>`;

    const items = destinos.map(u => {
        const foto = u.foto || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png';
        return `<div onclick="window._reenviarCallbacks['${overlayId}'].onContacto('${u.usuario}');document.getElementById('${overlayId}').remove();" style="display:flex;align-items:center;gap:10px;padding:12px 14px;cursor:pointer;border-radius:10px;transition:0.15s;border:1px solid transparent;" onmouseover="this.style.background='rgba(255,255,255,0.07)';this.style.borderColor='rgba(255,255,255,0.08)'" onmouseout="this.style.background='transparent';this.style.borderColor='transparent'">
            <img src="${foto}" style="width:36px;height:36px;border-radius:50%;object-fit:cover;border:2px solid var(--accent);flex-shrink:0;" onerror="this.src='https://cdn-icons-png.flaticon.com/512/3135/3135715.png'">
            <div style="flex:1;min-width:0;">
                <div style="font-size:13px;font-weight:700;color:#fff;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${aNombrePropio(u.nombre).split(' ').slice(0,2).join(' ')}</div>
                <div style="font-size:10px;color:rgba(255,255,255,0.4);">${u.rol}</div>
            </div>
            <div style="font-size:18px;color:rgba(255,255,255,0.2);">➤</div>
        </div>`;
    }).join('');

    ov.innerHTML = `<div style="background:#1a1a1a;border-radius:18px;padding:20px;min-width:300px;max-width:380px;width:90%;border:1px solid rgba(255,255,255,0.1);box-shadow:0 8px 40px rgba(0,0,0,0.8);">
        <div style="font-size:15px;font-weight:800;color:#fff;margin-bottom:4px;">↪ Reenviar a...</div>
        <div style="font-size:11px;color:rgba(255,255,255,0.3);margin-bottom:16px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${preview}</div>
        <div style="display:flex;flex-direction:column;gap:2px;max-height:300px;overflow-y:auto;">${grupoItem}<div style="border-top:1px solid rgba(255,255,255,0.06);margin:6px 0;"></div>${items}</div>
        <button onclick="document.getElementById('${overlayId}').remove()" style="width:100%;margin-top:14px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.4);padding:10px;border-radius:10px;cursor:pointer;font-size:12px;font-weight:700;">Cancelar</button>
    </div>`;
    document.body.appendChild(ov);
}

// Admin/super: reenviar mensaje (texto o adjunto) a otro chat o grupo
function reenviarMensajeCompleto(info, origenUid) {
    const textoReal = (info.texto || '').replace(/\\n/g, '\n');
    const _onContacto = function(destUid) {
        const msgs = getChatMensajes();
        if (info.adjunto && info.adjunto.dataUrl) {
            msgs.push({ de: userLogueado.usuario, para: destUid, texto: textoReal ? '↪ ' + textoReal : '', adjunto: info.adjunto, timestamp: Date.now(), leido: false, reenviado: true, autorOriginal: info.autorOriginal || '' });
        } else if (textoReal) {
            msgs.push({ de: userLogueado.usuario, para: destUid, texto: '↪ ' + textoReal, timestamp: Date.now(), leido: false, reenviado: true, autorOriginal: info.autorOriginal || '' });
        } else if (info.adjNombre) {
            msgs.push({ de: userLogueado.usuario, para: destUid, texto: '↪ (adjunto: ' + info.adjNombre + ')', timestamp: Date.now(), leido: false });
        }
        saveChatMensajes(msgs);
        if (ventanasAbiertas[destUid]) renderMensajesVentana(destUid);
        else abrirVentanaChat(destUid);
        toast('✅ Mensaje reenviado', 'success', 2500);
    };
    const _onGrupo = function() {
        const msgs = getGrupoMensajes();
        if (info.adjunto && info.adjunto.dataUrl) {
            msgs.push({ de: userLogueado.usuario, texto: textoReal ? '↪ ' + textoReal : '', adjunto: info.adjunto, timestamp: Date.now(), reenviado: true, autorOriginal: info.autorOriginal || '' });
        } else {
            const contenido = textoReal ? '↪ ' + textoReal : '↪ (adjunto: ' + info.adjNombre + ')';
            msgs.push({ de: userLogueado.usuario, texto: contenido, timestamp: Date.now(), reenviado: true, autorOriginal: info.autorOriginal || '' });
        }
        saveGrupoMensajes(msgs);
        renderMensajesGrupo();
        toast('✅ Mensaje reenviado al grupo', 'success', 2500);
    };
    _reenviarMostrarSelector(textoReal, info.adjNombre, _onContacto, _onGrupo, 'reenviarOverlay');
}

// Asesor: reenviar mensaje a otro admin/super o al grupo
function reenviarMensajeAsesorCompleto(info) {
    const textoReal = (info.texto || '').replace(/\\n/g, '\n');
    const _onContacto = function(destUid) {
        const msgs = getChatMensajes();
        if (info.adjunto && info.adjunto.dataUrl) {
            msgs.push({ de: userLogueado.usuario, para: destUid, texto: textoReal ? '↪ ' + textoReal : '', adjunto: info.adjunto, timestamp: Date.now(), leido: false, reenviado: true, autorOriginal: info.autorOriginal || '' });
        } else if (textoReal) {
            msgs.push({ de: userLogueado.usuario, para: destUid, texto: '↪ ' + textoReal, timestamp: Date.now(), leido: false, reenviado: true, autorOriginal: info.autorOriginal || '' });
        } else if (info.adjNombre) {
            msgs.push({ de: userLogueado.usuario, para: destUid, texto: '↪ (adjunto: ' + info.adjNombre + ')', timestamp: Date.now(), leido: false });
        }
        saveChatMensajes(msgs);
        abrirConversacionAsesor(destUid);
        toast('✅ Mensaje reenviado', 'success', 2500);
    };
    const _onGrupo = function() {
        if (!isGrupoHabilitado() && !esRolSup(userLogueado.rol) && !esRolAdmin(userLogueado.rol) && !esRolCoord(userLogueado.rol)) { toast('El grupo está cerrado', 'error', 2500); return; }
        const msgs = getGrupoMensajes();
        if (info.adjunto && info.adjunto.dataUrl) {
            msgs.push({ de: userLogueado.usuario, texto: textoReal ? '↪ ' + textoReal : '', adjunto: info.adjunto, timestamp: Date.now(), reenviado: true, autorOriginal: info.autorOriginal || '' });
        } else {
            const contenido = textoReal ? '↪ ' + textoReal : '↪ (adjunto: ' + info.adjNombre + ')';
            msgs.push({ de: userLogueado.usuario, texto: contenido, timestamp: Date.now(), reenviado: true, autorOriginal: info.autorOriginal || '' });
        }
        saveGrupoMensajes(msgs);
        abrirConversacionGrupoAsesor();
        toast('✅ Mensaje reenviado al grupo', 'success', 2500);
    };
    _reenviarMostrarSelector(textoReal, info.adjNombre, _onContacto, _onGrupo, 'reenviarOverlayAsesor');
}

// Visor imagen en overlay
function chatVerImagen(dataUrl) {
    const ov = document.createElement('div');
    ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.9);z-index:9999;display:flex;align-items:center;justify-content:center;cursor:zoom-out;';
    ov.innerHTML = `<img src="${dataUrl}" style="max-width:90vw;max-height:90vh;border-radius:12px;box-shadow:0 8px 40px rgba(0,0,0,0.8);">`;
    ov.onclick = () => ov.remove();
    document.body.appendChild(ov);
}

function enviarMensajeChat() {
    const para = document.getElementById('chatDestinatarioActivo').value;
    if (!para) return;
    // Si el destino es el grupo USD, redirigir
    if (para === '__grupo_usd__') { enviarMensajeGrupo(); return; }
    // Bloquear envío si el admin/super tiene el chat cerrado con este asesor
    const modoActual = getModoParaAsesor(para, userLogueado.usuario);
    if (modoActual === 'cerrado') {
        actualizarAreaRespuestaAsesor(para);
        return;
    }
    const texto = document.getElementById('chatInput').value.trim();
    // Si hay adjuntos pendientes, enviarlos primero
    let huboCambios = false;
    if (window._chatAdjuntosPendientes && window._chatAdjuntosPendientes.length > 0) {
        window._chatAdjuntosPendientes.forEach(adj => {
            const msgs = getChatMensajes();
            msgs.push({ de: userLogueado.usuario, para, texto: '', adjunto: adj, timestamp: Date.now(), leido: false });
            saveChatMensajes(msgs);
        });
        window._chatAdjuntosPendientes = [];
        chatLimpiarPreview();
        huboCambios = true;
    }
    if (texto) {
        const msgs = getChatMensajes();
        msgs.push({ id: `${userLogueado.usuario}_${Date.now()}_${Math.random().toString(36).slice(2,7)}`, de: userLogueado.usuario, para, texto, timestamp: Date.now(), leido: false });
        saveChatMensajes(msgs);
        huboCambios = true;
    }
    if (!huboCambios) return;
    document.getElementById('chatInput').value = '';
    renderChatMensajesAsesor(para);
}

// ── SISTEMA DE ADJUNTOS ──────────────────────────────────────────────────────
window._chatAdjuntosPendientes = [];

function chatAbrirAdjunto() {
    document.getElementById('chatFileInput').click();
}

function chatArchivoSeleccionado(files) {
    if (!files || files.length === 0) return;
    Array.from(files).forEach(file => chatProcesarArchivo(file));
    document.getElementById('chatFileInput').value = ''; // reset input
}

function chatProcesarArchivo(file) {
    _chatProcesarArchivoBase(file, (adj) => {
        window._chatAdjuntosPendientes.push(adj);
        chatActualizarPreview();
    });
}

function chatFormatSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function chatActualizarPreview() {
    const zona = document.getElementById('chatAdjuntosPreview');
    if (!zona) return;
    const adjs = window._chatAdjuntosPendientes;
    if (adjs.length === 0) {
        zona.classList.remove('tiene-adjuntos');
        zona.innerHTML = '';
        return;
    }
    zona.classList.add('tiene-adjuntos');
    zona.innerHTML = adjs.map((adj, i) => {
        let icono = '📎';
        if (adj.tipo.startsWith('image/')) icono = '📷';
        else if (adj.tipo.startsWith('video/')) icono = '🎥';
        else if (adj.tipo.includes('pdf')) icono = '📄';
        else if (adj.tipo.includes('sheet') || adj.tipo.includes('excel') || adj.tipo.includes('csv')) icono = '📊';
        else if (adj.tipo.includes('word')) icono = '📝';
        return `<div class="adjunto-chip">
            <span>${icono}</span>
            <span title="${adj.nombre}">${adj.nombre}</span>
            <button onclick="chatEliminarAdjunto(${i})" title="Quitar">✕</button>
        </div>`;
    }).join('');
}

function chatEliminarAdjunto(idx) {
    window._chatAdjuntosPendientes.splice(idx, 1);
    chatActualizarPreview();
}

function chatLimpiarPreview() {
    window._chatAdjuntosPendientes = [];
    chatActualizarPreview();
}

// ── DRAG & DROP sobre el panel de chat ──────────────────────────────────────
(function initChatDragDrop() {
    document.addEventListener('DOMContentLoaded', () => {
        const panel = document.getElementById('chatPanel');
        if (!panel) return;
        panel.addEventListener('dragover', (e) => {
            e.preventDefault();
            const dest = document.getElementById('chatDestinatarioActivo');
            const inputArea = document.getElementById('chatInputArea');
            if (inputArea && inputArea.style.display !== 'none') {
                panel.classList.add('drag-over');
            }
        });
        panel.addEventListener('dragleave', (e) => {
            if (!panel.contains(e.relatedTarget)) panel.classList.remove('drag-over');
        });
        panel.addEventListener('drop', (e) => {
            e.preventDefault();
            panel.classList.remove('drag-over');
            const dest = document.getElementById('chatDestinatarioActivo');
            const inputArea = document.getElementById('chatInputArea');
            if (!dest || !dest.value || !inputArea || inputArea.style.display === 'none') return;
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                Array.from(files).forEach(file => chatProcesarArchivo(file));
            }
        });
    });
})()

function enviarRespuestaCerradaAsesor(texto) {
    const para = document.getElementById('chatDestinatarioActivo').value;
    if (!para) return;
    const msgs = getChatMensajes();
    msgs.push({ de: userLogueado.usuario, para, texto, timestamp: Date.now(), leido: false });
    saveChatMensajes(msgs);
    renderChatMensajesAsesor(para);
}

function chatKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviarMensajeChat(); }
}

// ══════════════════════════════════════════════════════════════════
