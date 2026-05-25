/* ══════════════════════════════════════════════════
   SISTEMA DE TOASTS
   Uso: toast('Mensaje', 'success' | 'error' | 'warning' | 'info', duracion_ms)
══════════════════════════════════════════════════ */
function toast(msg, tipo = 'info', dur = 3500) {
    const iconos = { success:'✅', error:'❌', warning:'⚠️', info:'ℹ️' };
    const cont = document.getElementById('toast-container');
    const t = document.createElement('div');
    t.className = `toast ${tipo}`;
    t.style.setProperty('--toast-dur', dur + 'ms');
    t.innerHTML = `
        <span class="toast-icon">${iconos[tipo] || 'ℹ️'}</span>
        <span class="toast-msg">${msg}</span>
        <span class="toast-close" onclick="cerrarToast(this.parentElement)">✕</span>
        <div class="toast-bar"></div>`;
    cont.appendChild(t);
    const timer = setTimeout(() => cerrarToast(t), dur);
    t.addEventListener('click', () => { clearTimeout(timer); cerrarToast(t); });
    return t;
}
/* ══════════════════════════════════════════════════
   MENÚ HAMBURGUESA MÓVIL
══════════════════════════════════════════════════ */
function toggleSidebarMobile() {
    const sidebar  = document.querySelector('.sidebar');
    const overlay  = document.getElementById('sidebar-overlay');
    const btn      = document.getElementById('hamburger-btn');
    const isOpen   = sidebar.classList.contains('mobile-open');
    if (isOpen) {
        cerrarSidebarMobile();
    } else {
        sidebar.classList.add('mobile-open');
        overlay.style.display = 'block';
        setTimeout(() => overlay.classList.add('visible'), 10);
        btn.classList.add('open');
    }
}
function cerrarSidebarMobile() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    const btn     = document.getElementById('hamburger-btn');
    sidebar.classList.remove('mobile-open');
    overlay.classList.remove('visible');
    btn.classList.remove('open');
    setTimeout(() => { overlay.style.display = 'none'; }, 300);
}
// Cerrar sidebar al navegar en móvil
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', () => {
            if (window.innerWidth <= 900) cerrarSidebarMobile();
        });
    });
});

/* ══════════════════════════════════════════════════
   SKELETON SCREENS — helpers para mostrar/ocultar
══════════════════════════════════════════════════ */
function skeletonCards(containerId, cantidad = 3) {
    const cont = document.getElementById(containerId);
    if (!cont) return;
    let html = '';
    for (let i = 0; i < cantidad; i++) {
        html += `
        <div class="skeleton-card">
            <div class="skeleton skeleton-card-header"></div>
            <div class="skeleton-card-body">
                <div style="display:flex;align-items:center;gap:12px;">
                    <div class="skeleton skeleton-circle"></div>
                    <div style="flex:1;display:flex;flex-direction:column;gap:8px;">
                        <div class="skeleton skeleton-line mid"></div>
                        <div class="skeleton skeleton-line short"></div>
                    </div>
                </div>
                <div class="skeleton skeleton-number"></div>
                <div class="skeleton skeleton-line"></div>
                <div class="skeleton skeleton-line mid"></div>
            </div>
        </div>`;
    }
    cont.innerHTML = html;
}
function skeletonTabla(containerId, filas = 5) {
    const cont = document.getElementById(containerId);
    if (!cont) return;
    let rows = '';
    for (let i = 0; i < filas; i++) {
        rows += `<div style="display:flex;gap:12px;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
            <div class="skeleton skeleton-circle" style="width:36px;height:36px;border-radius:50%;"></div>
            <div style="flex:1;display:flex;flex-direction:column;gap:7px;justify-content:center;">
                <div class="skeleton skeleton-line mid"></div>
                <div class="skeleton skeleton-line short"></div>
            </div>
            <div class="skeleton skeleton-line" style="width:60px;height:28px;border-radius:8px;"></div>
        </div>`;
    }
    cont.innerHTML = `<div style="padding:8px 0;">${rows}</div>`;
}

function cerrarToast(el) {
    if (!el || el.classList.contains('hide')) return;
    el.classList.add('hide');
    setTimeout(() => el.remove(), 320);
}

/* ══════════════════════════════════════════════════
   MODAL DE CONFIRMACIÓN (reemplaza confirm() nativo)
   Uso: confirmar({ titulo, msg, icono, labelOk, labelCancel, colorOk })
        .then(ok => { if(ok) { ... } })
══════════════════════════════════════════════════ */
function confirmar({ titulo = '¿Estás seguro?', msg = '', icono = '⚠️', labelOk = 'Confirmar', labelCancel = 'Cancelar', colorOk = null } = {}) {
    return new Promise(resolve => {
        const overlay = document.getElementById('confirm-overlay');
        document.getElementById('confirm-icon').textContent  = icono;
        document.getElementById('confirm-title').textContent = titulo;
        document.getElementById('confirm-msg').textContent   = msg;
        const btnOk = document.getElementById('btn-confirm-ok');
        const btnCc = document.getElementById('btn-confirm-cancel');
        btnOk.textContent = labelOk;
        btnCc.textContent = labelCancel;
        btnOk.style.background = colorOk || 'var(--accent)';
        overlay.style.display = 'flex';
        overlay.classList.remove('hide');
        const cerrar = (val) => {
            overlay.classList.add('hide');
            setTimeout(() => { overlay.style.display = 'none'; overlay.classList.remove('hide'); }, 220);
            btnOk.onclick = null; btnCc.onclick = null;
            resolve(val);
        };
        btnOk.onclick = () => cerrar(true);
        btnCc.onclick = () => cerrar(false);
        overlay.onclick = (e) => { if (e.target === overlay) cerrar(false); };
    });
}
function aNombrePropio(str) {
    if (!str) return "";
    return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

// MANTENEMOS TU LISTA BASE ORIGINAL
const listaBase = [
    {nombre: "Admin Sistema",                    usuario:"USD.ADMI",              password:"433eb04d6d87e1c998e941b099006053db558c66b0f95fccdc2c38d8b56507f7", rol:"admin",             foto: "Fotos Empresa/ADMI.jpg",       jornada: "ÚNICA"},
    {nombre: "Brayan Jesus Castro Cifuentes",    usuario:"BRAYAN.CASTRO",         password:"593197165a47da438ecf47e4352719249a2fd9baca5cd3a8d57e93b8fb8db8ed", rol:"coordinador", foto: "Fotos Empresa/Brayan.jpg",   jornada: "ÚNICA"},
    {nombre: "Brandon Steven Castro Cifuentes",  usuario:"BRANDON.CASTRO",        password:"019f879d07f7d3fb7712d3ea8e2f8278119efb01051a62a28bec8790d9cb11bc", rol:"coordinador", foto: "Fotos Empresa/Brandon.jpg",  jornada: "ÚNICA"},
    {nombre: "Dilan Andres Castro Cifuentes",    usuario:"DILAN.CASTRO",          password:"5d222239f7472350684eea1a2633fd2a9a7d0627db445b82e00a89c4e078e6c0", rol:"coordinador", foto: "Fotos Empresa/Dilan.jpg",    jornada: "ÚNICA"},
    {nombre: "Julian Felipe Cubillos Vivas",     usuario:"JULIAN.CUBILLOS",       password:"81e7f84a9c2503ded03a4c4ecd0a2098fe488f1a0bf1567c6e00afacbf8049e6", rol:"asesor",      foto: "Fotos Empresa/Julian.jpg",    plataforma: "AmoLatina", grupo: "ALEMANIA",  jornada: "TARDE"},
    {nombre: "Alejandro Peña Medina",            usuario:"ALEJANDRO.PEÑA",        password:"4083451517c675e42e46b3733bdaea51a799120b7e2cb5a62fe5e7038c5cae07", rol:"asesor",      foto: "Fotos Empresa/Alejandro.jpg", plataforma: "AmoLatina", grupo: "ESPAÑA",    jornada: "TARDE"},
    {nombre: "Supervisor Mañana",                usuario:"SUPERVISOR.1",          password:"8cf24a7e93f26e9cc9e380b7c167e9f0b5ef70124f98ee003698d4e7de656abc", rol:"supervisor1", foto: "", jornada: "MAÑANA"},
    {nombre: "Supervisor Tarde",                 usuario:"SUPERVISOR.2",          password:"18ade33405a8f8d912c844613dbdbc8774b4b0f514359c22c1cf2fe213e810f0", rol:"supervisor2", foto: "", jornada: "TARDE"},
    {nombre: "Calidad Uno",                      usuario:"CALIDAD.1",             password:"2cf836e2ee0389e4de3b82216e9ea71e0904a84754498fc283dae39dc956ef69", rol:"calidad",     foto: "", jornada: "ÚNICA"},
    {nombre: "Formacion Uno",                    usuario:"FORMACION.1",           password:"d44d6dc62d842a597a72daa9ad7d973fe3ec5fdfb1c3a5d6dae32efe49a784ec", rol:"capacitador", foto: "", jornada: "ÚNICA"},
];

// ── DATOS FIJOS GRUPO / JORNADA ─────────────────────────────────────────────
// Fuente de verdad hardcodeada — se usa cuando el lookup por nombre falla
const DATOS_FIJOS = [
    { nombre: "Julian Felipe Cubillos Vivas",  grupo: "ALEMANIA",  jornada: "TARDE" },
    { nombre: "Alejandro Peña Medina",          grupo: "ESPAÑA",    jornada: "TARDE" },
];

function getGrupoJornada(nombre) {
    const nk = (nombre || '').toLowerCase().trim();
    // 1. Buscar exacto en usuarios (localStorage)
    let u = usuarios.find(u => u.nombre.toLowerCase().trim() === nk);
    // 2. Fallback: búsqueda parcial — requiere al menos 2 palabras coincidentes (evita falsos positivos por primer nombre)
    if (!u) {
        const palabras = nk.split(' ').filter(p => p.length > 2);
        u = usuarios.find(u => {
            const un = u.nombre.toLowerCase();
            return palabras.length >= 2 && palabras.filter(p => un.includes(p)).length >= 2;
        });
    }
    if (u && (u.grupo || u.jornada)) return { grupo: u.grupo || '', jornada: u.jornada || '', plataforma: u.plataforma || '', foto: u.foto || '' };
    // 3. Fallback: datos fijos hardcodeados — solo coincidencia exacta o de 2+ palabras
    let d = DATOS_FIJOS.find(d => d.nombre.toLowerCase().trim() === nk);
    if (!d) {
        const palabras = nk.split(' ').filter(p => p.length > 2);
        d = DATOS_FIJOS.find(d => {
            const dn = d.nombre.toLowerCase();
            return palabras.length >= 2 && palabras.filter(p => dn.includes(p)).length >= 2;
        });
    }
    if (d) return { grupo: d.grupo, jornada: d.jornada, plataforma: u ? u.plataforma || '' : '', foto: u ? u.foto || '' : '' };
    return { grupo: '', jornada: '', plataforma: u ? u.plataforma || '' : '', foto: u ? u.foto || '' : '' };
}
// ────────────────────────────────────────────────────────────────────────────
