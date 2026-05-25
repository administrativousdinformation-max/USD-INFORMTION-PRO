// ─────────────────────────────────────────────────────────────────────────────
// ══ MÓDULO DOCUMENTOS LABORALES — Referencia Laboral + Desprendibles PDF ══
// ─────────────────────────────────────────────────────────────────────────────

function _usdFechaLarga(d) {
    if (!d) d = new Date();
    const dd   = String(d.getDate()).padStart(2,'0');
    const mm   = String(d.getMonth()+1).padStart(2,'0');
    const aaaa = d.getFullYear();
    return `${dd}/${mm}/${aaaa}`;
}
function _usdFmtCOP(n) {
    const num = parseFloat(String(n||'0').replace(/[^0-9.-]/g,'')) || 0;
    return new Intl.NumberFormat('es-CO',{style:'currency',currency:'COP',maximumFractionDigits:0}).format(num);
}
function _usdNombrePropio(s) {
    if (typeof aNombrePropio === 'function') return aNombrePropio(s);
    return (s||'').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
}
function _usdCedula(usuario) {
    const hv = (JSON.parse(localStorage.getItem('hojas_vida_usd')||'{}') || {})[usuario] || {};
    if (hv.cedula && hv.cedula.trim()) return hv.cedula.trim();
    if (hv.documento && hv.documento.trim()) return hv.documento.trim();
    // Buscar en nómina como fallback — buscar PRIMERO por login exacto
    try {
        const nom = JSON.parse(localStorage.getItem('datos_nomina_usd')||'[]');
        const _n = s => (s||'').toString().toLowerCase().trim()
            .normalize('NFD').replace(/[\u0300-\u036f]/g,'');
        const uLog = _n(usuario);
        // 1) Match por login exacto
        let row = nom.find(r => _n(r.login||r.usuario||'') === uLog);
        // 2) Match por nombre si no encontró por login
        if (!row) {
            const usrs = JSON.parse(localStorage.getItem('usuarios_usd')||'[]');
            const uObj = usrs.find(x => _n(x.usuario||'') === uLog);
            if (uObj) {
                const uNom = _n(uObj.nombre||'');
                row = nom.find(r => {
                    const rNom = _n(r.nombres||r.nombre||'');
                    if (!rNom || !uNom) return false;
                    const pw = uNom.split(' ').filter(p=>p.length>3);
                    const pr = rNom.split(' ').filter(p=>p.length>3);
                    return pw.length >= 2 && pr.length >= 2 &&
                           pw.filter(p=>pr.includes(p)).length >= Math.min(2, pw.length);
                });
            }
        }
        if (row) {
            // Columna DOCUMENTO es la cédula en el Excel
            const cc = String(row.documento||row.cedula||row.cc||row.doc||'').trim();
            if (cc && cc !== '0') return cc;
        }
    } catch(e) {}
    // Buscar en usuarios
    try {
        const usrs = JSON.parse(localStorage.getItem('usuarios_usd')||'[]');
        const u = usrs.find(x => (x.usuario||'').toLowerCase() === (usuario||'').toLowerCase());
        if (u && u.cedula) return u.cedula;
    } catch(e) {}
    return '___________';
}
function _usdFechaIngreso(usuario) {
    const hv = (JSON.parse(localStorage.getItem('hojas_vida_usd')||'{}') || {})[usuario] || {};
    const _convertir = (val) => {
        if (!val) return null;
        const s = String(val).trim();
        // Número serial de Excel (ej: 46116)
        if (/^\d{4,5}$/.test(s)) {
            const d = new Date(Math.round((parseFloat(s) - 25569) * 86400 * 1000));
            const dd = String(d.getUTCDate()).padStart(2,'0');
            const mm = String(d.getUTCMonth()+1).padStart(2,'0');
            return `${dd}/${mm}/${d.getUTCFullYear()}`;
        }
        // Formato ISO yyyy-mm-dd
        if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
            const [a,m,d2] = s.split('-');
            return `${d2.substring(0,2)}/${m}/${a}`;
        }
        // Ya tiene formato legible — devolver tal cual
        return s;
    };
    if (hv.fechaIngreso) {
        const r = _convertir(hv.fechaIngreso);
        return r || hv.fechaIngreso.toUpperCase();
    }
    try {
        const nom = JSON.parse(localStorage.getItem('datos_nomina_usd')||'[]');
        const row = nom.find(r => (r.login||r.usuario||'').toLowerCase().trim() === (usuario||'').toLowerCase().trim());
        if (row && (row.fecha_ingreso||row.fecha_de_ingreso)) {
            const r = _convertir(row.fecha_ingreso||row.fecha_de_ingreso);
            return r || String(row.fecha_ingreso||row.fecha_de_ingreso).toUpperCase();
        }
    } catch(e) {}
    return '01/01/2025';
}
function _usdSalarioPromedio(usuario) {
    try {
        const raw = JSON.parse(localStorage.getItem('datos_nomina_usd')||'[]');
        const filas = raw.filter(r => {
            const rLogin = (r.login||r.usuario||r.nombres||'').toLowerCase().trim();
            const uLogin = (usuario||'').toLowerCase().trim();
            return rLogin === uLogin || rLogin.replace(/\s+/g,'.') === uLogin;
        });
        if (!filas.length) return 900000;
        const salarios = filas.map(r => {
            const sb = parseFloat(String(r.salario_basico||'0').replace(/[^0-9.-]/g,''))||0;
            const sp = parseFloat(String(r.salario_puntos||'0').replace(/[^0-9.-]/g,''))||0;
            const sa = parseFloat(String(r.salario_a_pagar||'0').replace(/[^0-9.-]/g,''))||0;
            return (sb>0||sp>0) ? Math.max(sb,sp) : sa;
        }).filter(v=>v>0);
        if (!salarios.length) return 900000;
        return Math.round(salarios.reduce((a,b)=>a+b,0)/salarios.length);
    } catch(e) { return 900000; }
}

function _usdNumeroALetras(n) {
    const unidades = ['','UN','DOS','TRES','CUATRO','CINCO','SEIS','SIETE','OCHO','NUEVE','DIEZ','ONCE','DOCE','TRECE','CATORCE','QUINCE','DIECISÉIS','DIECISIETE','DIECIOCHO','DIECINUEVE'];
    const decenas  = ['','DIEZ','VEINTE','TREINTA','CUARENTA','CINCUENTA','SESENTA','SETENTA','OCHENTA','NOVENTA'];
    const cientos  = ['','CIEN','DOSCIENTOS','TRESCIENTOS','CUATROCIENTOS','QUINIENTOS','SEISCIENTOS','SETECIENTOS','OCHOCIENTOS','NOVECIENTOS'];
    if (n === 0) return 'CERO';
    if (n < 0) return 'MENOS ' + _usdNumeroALetras(-n);
    let r = '';
    if (n >= 1000000) { r += _usdNumeroALetras(Math.floor(n/1000000)) + (Math.floor(n/1000000)===1?' MILLÓN':' MILLONES') + ' '; n %= 1000000; }
    if (n >= 1000)    { r += (Math.floor(n/1000)===1?'MIL':_usdNumeroALetras(Math.floor(n/1000))+' MIL') + ' '; n %= 1000; }
    if (n >= 100)     { r += (n===100?'CIEN':cientos[Math.floor(n/100)]) + ' '; n %= 100; }
    if (n >= 20)      { r += decenas[Math.floor(n/10)] + (n%10?' Y '+unidades[n%10]:'') + ' '; }
    else if (n > 0)   { r += unidades[n] + ' '; }
    return r.trim();
}

function _usdHTMLReferenciaLaboral(u, hv, _editable) {
    const nombre       = _usdNombrePropio(u.nombre).toUpperCase();
    const cedula       = _usdCedula(u.usuario);
    const cargo        = 'ASESOR';
    const fechaIngreso = _usdFechaIngreso(u.usuario);
    const ciudad       = 'Bogotá';
    const salario      = _usdSalarioPromedio(u.usuario);
    const salarioLetras= _usdNumeroALetras(salario);
    const salarioCOP   = _usdFmtCOP(salario);
    const fecha        = _usdFechaLarga(new Date());
    const refNum       = 'USD REF '+new Date().getFullYear()+' '+String(Math.floor(Math.random()*99999)).padStart(5,'0');

    // Si es editable (admin/coordinador), envolver campos en contenteditable
    const ed = _editable;
    const wt = (val, cls) => ed ? `<span class="edit-field ${cls}" contenteditable="true" spellcheck="false">${val}</span>` : val;

    return `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>Referencia Laboral</title>
<style>*{box-sizing:border-box;margin:0;padding:0;}body{font-family:'Times New Roman',Times,serif;background:#fff;color:#1a1a2e;font-size:13px;}.page{max-width:720px;margin:0 auto;padding:40px 48px;}.header{display:flex;align-items:center;gap:18px;border-bottom:3px solid #1a2744;padding-bottom:18px;margin-bottom:28px;}.logo-box{background:#1a2744;color:#fff;font-size:22px;font-weight:900;padding:10px 16px;border-radius:8px;letter-spacing:2px;flex-shrink:0;font-family:'Segoe UI',Arial,sans-serif;}.company-name{font-size:18px;font-weight:900;color:#1a2744;text-transform:uppercase;letter-spacing:2px;font-family:'Segoe UI',Arial,sans-serif;}.company-sub{font-size:9px;color:#666;text-transform:uppercase;letter-spacing:3px;margin-top:3px;font-family:'Segoe UI',Arial,sans-serif;}.meta{text-align:right;font-size:10px;color:#888;margin-bottom:24px;line-height:1.7;}.cert-badge{display:inline-block;background:#1a2744;color:#fff;font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:2px;padding:4px 14px;border-radius:4px;margin-bottom:20px;font-family:'Segoe UI',Arial,sans-serif;}.company-id{font-size:12px;color:#333;margin-bottom:16px;line-height:1.8;}.body-text{font-size:13px;line-height:1.9;color:#222;margin-bottom:20px;text-align:justify;}.body-text strong{color:#1a2744;}.firma-area{margin-top:48px;border-top:1px solid #ccc;padding-top:16px;}.firma-name{font-size:15px;font-style:italic;color:#1a2744;font-weight:700;margin-bottom:4px;}.firma-cargo{font-size:11px;color:#666;text-transform:uppercase;letter-spacing:1px;}.firma-empresa{font-size:10px;color:#999;margin-top:2px;}.footer-note{margin-top:28px;background:#f0f4fa;border:1px solid #c8d8f0;border-radius:6px;padding:10px 16px;font-size:10px;color:#3a5a8a;text-align:center;}.edit-field{border-bottom:1px dashed #e74c3c;min-width:20px;display:inline-block;outline:none;background:rgba(231,76,60,0.04);padding:0 2px;border-radius:2px;}.edit-field:focus{background:rgba(231,76,60,0.1);}.edit-toolbar{background:#f0f4fa;border:1px solid #c8d8f0;border-radius:8px;padding:8px 14px;margin-bottom:16px;font-size:11px;color:#3a5a8a;display:flex;align-items:center;gap:8px;}@media print{body{padding:0;}.page{padding:30px 36px;}button{display:none!important;}.edit-toolbar{display:none!important;}.edit-field{border-bottom:none;background:none;}}</style></head><body>
<div class="page">
  ${ed ? '<div class="edit-toolbar">✏️ <strong>Modo edición:</strong> Haz clic en cualquier campo subrayado en rojo para editarlo antes de imprimir.</div>' : ''}
  <div class="header"><div class="logo-box">USD</div><div><div class="company-name">USDINFORMATION</div><div class="company-sub">Amor real en un mundo digital</div></div></div>
  <div class="meta">${wt(ciudad,'f-ciudad')}, ${wt(fecha,'f-fecha')} &nbsp;·&nbsp; Ref: ${wt(refNum,'f-ref')}</div>
  <span class="cert-badge">Certificado Laboral</span>
  <div class="company-id"><strong>USDINFORMATION S.A.S</strong><br><strong>CERTIFICA QUE:</strong></div>
  <div class="body-text">El (la) señor(a) <strong>${wt(nombre,'f-nombre')}</strong>, identificado(a) con cédula de ciudadanía <strong>No. ${wt(cedula,'f-cedula')}</strong> expedida en <strong>${wt(ciudad,'f-ciudad2')}</strong>, labora en nuestra empresa a través de un contrato de trabajo desde el <strong>${wt(fechaIngreso,'f-ingreso')}</strong>, desempeñando el cargo de <strong>${wt(cargo,'f-cargo')}</strong> devengando un promedio mensual de <strong>${wt(salarioLetras+' PESOS MCTE ('+salarioCOP+')','f-salario')}</strong>.</div>
  <div class="body-text">Para constancia de lo anterior, se firma en <strong>${wt(ciudad+' (Cundinamarca)','f-firma-ciudad')}</strong>, el ${wt(fecha,'f-fecha2')}.</div>
  <div class="firma-area"><div class="firma-name">${wt('Stiven Castro','f-firmante')}</div><div class="firma-cargo">${wt('Gerente General','f-firmante-cargo')}</div><div class="firma-empresa">USDINFORMATION</div></div>
  <div class="footer-note">Documento generado digitalmente por USDINFORMATION · No requiere sello físico</div>
  <div style="text-align:center;margin-top:18px;"><button onclick="window.print()" style="background:#1a2744;color:#fff;border:none;padding:9px 28px;border-radius:8px;cursor:pointer;font-weight:700;font-size:12px;font-family:'Segoe UI',Arial,sans-serif;">🖨️ Imprimir / Guardar PDF</button></div>
</div></body></html>`;
}

function _usdHTMLDesprendible(u, r, _editable) {
    const campo = (...keys) => { for(const k of keys){if(r[k]!==undefined&&r[k]!=='')return r[k];}return ''; };
    const hv    = (JSON.parse(localStorage.getItem('hojas_vida_usd')||'{}') || {})[u.usuario] || {};
    const nombre     = _usdNombrePropio(u.nombre);
    // Prioridad: cédula de la fila del Excel → hoja de vida → fallback
    const _rDoc = String(r['documento']||r['cedula']||r['cc']||r['doc']||'').trim();
    const cedula = (_rDoc && _rDoc !== '0') ? _rDoc : _usdCedula(u.usuario);
    const cargo      = 'ASESOR';
    const _periodoRaw = campo('periodo','quincena','período','mes') || '';
    const _qNumRaw    = String(campo('quincena_num','quincena','num_quincena') || '').trim();
    const _formatPeriodo = (p) => {
        if (!p) return 'Período';
        const s = String(p).trim();
        const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
        const qSufijo = (_qNumRaw === '1' || _qNumRaw === '2') ? ` — QUINCENA ${_qNumRaw}` : '';
        // ── Serial de Excel (ej: 46143) → fecha real ──
        const nSerial = Number(s);
        if (!isNaN(nSerial) && nSerial > 40000 && nSerial < 60000) {
            const d   = new Date(Math.round((nSerial - 25569) * 86400 * 1000));
            const mes = meses[d.getUTCMonth()];
            const anio = d.getUTCFullYear();
            return `${mes.toUpperCase()} ${anio}${qSufijo}`;
        }
        // Si ya incluye la palabra "quincena" → devolver en mayúsculas
        if (/quincena/i.test(s)) return s.toUpperCase();
        // Formato «YYYY-MM-Q» ej: 2026-05-1
        const m1 = s.match(/(\d{4})[-\/](\d{1,2})[-\/]([12])/);
        if (m1) { const mes = meses[parseInt(m1[2])-1]||''; return `${mes.toUpperCase()} ${m1[1]} — QUINCENA ${m1[3]}`; }
        // Formato «MM-YYYY-Q» ej: 05-2026-2
        const m2 = s.match(/(\d{1,2})[-\/](\d{4}).*([12])$/);
        if (m2) { const mes = meses[parseInt(m2[1])-1]||''; return `${mes.toUpperCase()} ${m2[2]} — QUINCENA ${m2[3]}`; }
        // Texto con nombre de mes
        const mNom = meses.find(m => s.toLowerCase().includes(m.toLowerCase()));
        const qNum = s.match(/Q?([12])\s*$/i);
        const anioM = s.match(/(20\d{2})/);
        if (mNom && qNum) { const anio = anioM ? anioM[1] : new Date().getFullYear(); return `${mNom.toUpperCase()} ${anio} — QUINCENA ${qNum[1]}`; }
        if (mNom) { const anio = anioM ? anioM[1] : new Date().getFullYear(); return `${mNom.toUpperCase()} ${anio}${qSufijo}`; }
        return s.toUpperCase();
    };
    const periodo = _formatPeriodo(_periodoRaw);
    const esQ1PDF = _qNumRaw === '1';
    const sb = parseFloat(String(campo('salario_basico','salario_básico')||'0').replace(/[^0-9.-]/g,''))||0;
    const sp = parseFloat(String(campo('salario_puntos')||'0').replace(/[^0-9.-]/g,''))||0;
    const sa = parseFloat(String(campo('salario_a_pagar')||'0').replace(/[^0-9.-]/g,''))||0;
    const salario   = (sb>0||sp>0)?Math.max(sb,sp):sa;
    const bonos     = parseFloat(String(campo('bono_mensual','bono mensual')||'0').replace(/[^0-9.-]/g,''))||0;
    const bonoS     = parseFloat(String(campo('bono_semanal','bono semanal')||'0').replace(/[^0-9.-]/g,''))||0;
    const bonoAd    = parseFloat(String(campo('bono_adicional')||'0').replace(/[^0-9.-]/g,''))||0;
    const puntos    = parseFloat(String(campo('puntos','puntos_periodo')||'0').replace(/[^0-9.-]/g,''))||0;
    const adelantos = parseFloat(String(campo('adelantos')||'0').replace(/[^0-9.-]/g,''))||0;
    const otras     = parseFloat(String(campo('otras_deducciones','otras deducciones','otras')||'0').replace(/[^0-9.-]/g,''))||0;
    // Q1: adelanto ya fue entregado → devengos = adelanto, deducciones = vacío, neto = adelanto
    // Q2: salario completo + adelanto en devengos, adelanto en deducciones, neto = salario
    const totalDed  = esQ1PDF ? otras : (adelantos + otras);
    const totalDev  = esQ1PDF ? (adelantos + otras === 0 ? adelantos : adelantos) : (salario + adelantos + bonos + bonoS + bonoAd);
    const netoQ1    = adelantos - otras;
    const netoQ2    = salario - otras;
    const neto      = esQ1PDF ? netoQ1 : netoQ2;
    const f = v => _usdFmtCOP(v);
    const fila = (label,val,bold,color) => `<tr><td style="padding:7px 12px;border-bottom:1px solid #e8ecf0;font-size:11px;${color?'color:'+color+';':''}">${label}</td><td style="padding:7px 12px;border-bottom:1px solid #e8ecf0;font-size:11px;text-align:right;${bold?'font-weight:800;color:#1a2744;':''}${color?'color:'+color+';':''}">${val}</td></tr>`;

    return `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>Desprendible ${nombre}</title>
<style>*{box-sizing:border-box;margin:0;padding:0;}body{font-family:'Times New Roman',Times,serif;background:#fff;color:#1a1a2e;font-size:12px;}.page{max-width:720px;margin:0 auto;padding:36px 44px;}.header{display:flex;align-items:center;gap:16px;border-bottom:3px solid #1a2744;padding-bottom:16px;margin-bottom:22px;}.logo-box{background:#1a2744;color:#fff;font-size:20px;font-weight:900;padding:8px 14px;border-radius:6px;letter-spacing:2px;flex-shrink:0;font-family:'Segoe UI',Arial,sans-serif;}.company-name{font-size:16px;font-weight:900;color:#1a2744;text-transform:uppercase;letter-spacing:2px;font-family:'Segoe UI',Arial,sans-serif;}.company-sub{font-size:9px;color:#666;text-transform:uppercase;letter-spacing:3px;margin-top:2px;font-family:'Segoe UI',Arial,sans-serif;}.info-grid{display:grid;grid-template-columns:1fr 1fr;border:1px solid #d0d8e8;border-radius:8px;overflow:hidden;margin-bottom:18px;}.info-cell{padding:9px 14px;border-bottom:1px solid #e8ecf0;}.info-cell:nth-child(odd){border-right:1px solid #e8ecf0;background:#f8fafd;}.info-label{font-size:9px;color:#8899aa;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:2px;font-family:'Segoe UI',Arial,sans-serif;}.info-val{font-size:12px;font-weight:700;color:#1a2744;}.tables-wrap{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;}.tbl-card{border:1px solid #d0d8e8;border-radius:8px;overflow:hidden;}.tbl-header{background:#1a2744;color:#fff;padding:8px 12px;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:1px;font-family:'Segoe UI',Arial,sans-serif;}.neto-bar{background:#1a2744;color:#fff;border-radius:8px;padding:14px 18px;display:flex;justify-content:space-between;align-items:center;margin-bottom:18px;}.neto-label{font-size:11px;text-transform:uppercase;letter-spacing:1px;opacity:0.8;font-family:'Segoe UI',Arial,sans-serif;}.neto-val{font-size:22px;font-weight:900;}.footer-note{background:#f0f4fa;border:1px solid #c8d8f0;border-radius:6px;padding:9px 14px;font-size:10px;color:#3a5a8a;text-align:center;}.edit-field{border-bottom:1px dashed #e74c3c;min-width:20px;display:inline-block;outline:none;background:rgba(231,76,60,0.04);padding:0 2px;border-radius:2px;}.edit-field:focus{background:rgba(231,76,60,0.1);}.edit-toolbar{background:#f0f4fa;border:1px solid #c8d8f0;border-radius:8px;padding:8px 14px;margin-bottom:16px;font-size:11px;color:#3a5a8a;display:flex;align-items:center;gap:8px;font-family:'Segoe UI',Arial,sans-serif;}@media print{body{padding:0;}.page{padding:24px 32px;}button{display:none!important;}.edit-toolbar{display:none!important;}.edit-field{border-bottom:none;background:none;}}</style></head><body>
<div class="page">
  ${_editable ? '<div class="edit-toolbar">✏️ <strong>Modo edición:</strong> Haz clic en cualquier valor para editarlo antes de imprimir.</div>' : ''}
  <div class="header"><div class="logo-box">USD</div><div><div class="company-name">USDINFORMATION</div><div class="company-sub">Amor real en un mundo digital</div></div></div>
  <div class="info-grid">
    <div class="info-cell"><div class="info-label">Compañía</div><div class="info-val">USDINFORMATION S.A.S.</div></div>
    <div class="info-cell"><div class="info-label">Período Liquidado</div><div class="info-val" ${_editable?'contenteditable="true"':''}>${periodo}</div></div>
    <div class="info-cell"><div class="info-label">Nombre</div><div class="info-val" ${_editable?'contenteditable="true"':''}>${nombre}</div></div>
    <div class="info-cell"><div class="info-label">Cargo</div><div class="info-val" ${_editable?'contenteditable="true"':''}>${cargo}</div></div>
    <div class="info-cell"><div class="info-label">Cédula</div><div class="info-val" ${_editable?'contenteditable="true"':''}>${cedula}</div></div>
    <div class="info-cell"><div class="info-label">Ciudad</div><div class="info-val" ${_editable?'contenteditable="true"':''}">Bogotá</div></div>
  </div>
  <div class="tables-wrap">
    <div class="tbl-card"><div class="tbl-header">Devengos</div><table style="width:100%;border-collapse:collapse;"><thead><tr><th style="padding:6px 12px;text-align:left;font-size:10px;color:#888;border-bottom:1px solid #e8ecf0;">Concepto</th><th style="padding:6px 12px;text-align:right;font-size:10px;color:#888;border-bottom:1px solid #e8ecf0;">Valor</th></tr></thead><tbody>${esQ1PDF ? fila('Adelanto entregado',f(adelantos)) : fila('Salario / Servicios',f(salario))}${!esQ1PDF && adelantos>0 ? fila('Adelanto (recuperación)',f(adelantos)) : ''}${!esQ1PDF && bonoS>0 ? fila('Bono Semanal',f(bonoS)) : ''}${!esQ1PDF && bonos>0 ? fila('Bono Mensual',f(bonos)) : ''}${!esQ1PDF && bonoAd>0 ? fila('Bono Adicional',f(bonoAd)) : ''}${!esQ1PDF && (bonos+bonoS+bonoAd)===0 ? fila('Bonificaciones',f(0)) : ''}${!esQ1PDF && puntos>0 ? fila('Puntos período',puntos+' pts') : ''}${fila('Total devengos',f(totalDev),true)}</tbody></table></div>
    <div class="tbl-card"><div class="tbl-header">Deducciones</div><table style="width:100%;border-collapse:collapse;"><thead><tr><th style="padding:6px 12px;text-align:left;font-size:10px;color:#888;border-bottom:1px solid #e8ecf0;">Concepto</th><th style="padding:6px 12px;text-align:right;font-size:10px;color:#888;border-bottom:1px solid #e8ecf0;">Valor</th></tr></thead><tbody>${!esQ1PDF && adelantos>0 ? fila('Adelanto descontado',f(adelantos)) : ''}${otras>0 ? fila('Otras deducciones',f(otras)) : ''}${fila('Total deducciones',f(totalDed),true)}</tbody></table></div>
  </div>
  <div class="neto-bar"><span class="neto-label">Neto a Pagar</span><span class="neto-val">${f(neto < 0 ? 0 : neto)}</span></div>
  <div class="footer-note">Documento generado digitalmente por USDINFORMATION · No requiere sello físico</div>
  <div style="text-align:center;margin-top:16px;"><button onclick="window.print()" style="background:#1a2744;color:#fff;border:none;padding:9px 28px;border-radius:8px;cursor:pointer;font-weight:700;font-size:12px;">🖨️ Imprimir / Guardar PDF</button></div>
</div></body></html>`;
}

function _usdFilasNomina(usuario, nombre) {
    try {
        let datos = JSON.parse(localStorage.getItem('datos_nomina_usd')||'[]');
        if (!Array.isArray(datos)) datos = Object.values(datos);
        const _n = s => (s||'').toString().toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ');
        const uLogin  = _n(usuario);
        const uNombre = _n(nombre);
        // Obtener cédula del usuario desde hojas_vida o usuarios
        let uCedula = '';
        try {
            const hv = (JSON.parse(localStorage.getItem('hojas_vida_usd')||'{}'))[usuario] || {};
            uCedula = _n(String(hv.cedula||hv.documento||'').trim());
            if (!uCedula) {
                const usrs = JSON.parse(localStorage.getItem('usuarios_usd')||'[]');
                const uObj = usrs.find(x => _n(x.usuario||'') === uLogin);
                if (uObj) uCedula = _n(String(uObj.cedula||uObj.documento||'').trim());
            }
        } catch(e) {}

        return datos.filter(r => {
            const rLogin  = _n(r.login||r.usuario||'');
            const rNombre = _n(r.nombres||r.nombre||'');
            // 1) Login exacto (más confiable)
            if (rLogin && rLogin === uLogin) return true;
            // 2) Login con formato nombre.apellido
            if (rLogin && rLogin === uNombre.replace(/\s+/g,'.')) return true;
            // 3) Documento/cédula (muy confiable si existe)
            if (uCedula && uCedula.length > 4) {
                const rDoc = _n(String(r.documento||r.cedula||r.cc||r.doc||'').trim());
                if (rDoc && rDoc === uCedula) return true;
            }
            // 4) Nombre con umbral: 2 palabras largas coincidentes
            const pw = uNombre.split(' ').filter(p=>p.length>3);
            const pr = rNombre.split(' ').filter(p=>p.length>3);
            if (pw.length >= 2 && pr.length >= 2) {
                return pw.filter(p=>pr.includes(p)).length >= Math.min(2, pw.length);
            }
            return false;
        });
    } catch(e) { return []; }
}

function _usdAbrirPDF(html, titulo) {
    try {
        const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href     = url;
        a.target   = '_blank';
        a.rel      = 'noopener';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 5000);
        if(typeof toast==='function') toast('📄 '+titulo+' lista. Usa "Guardar como PDF".','success');
    } catch(e) {
        console.error('Error abriendo PDF:', e);
        if(typeof toast==='function') toast('Error al generar el PDF. Intenta de nuevo.','error');
    }
}

// ── Asesor: su propia referencia laboral ─────────────────────────────────────
function usdGenerarReferenciaLaboral() {
    if (!userLogueado) return;
    const hv = (JSON.parse(localStorage.getItem('hojas_vida_usd')||'{}') || {})[userLogueado.usuario] || {};
    _usdAbrirPDF(_usdHTMLReferenciaLaboral(userLogueado, hv, false), 'Referencia Laboral');
}

// ── Asesor: ver sus desprendibles ────────────────────────────────────────────
function usdVerDesprendibles() {
    if (!userLogueado) return;
    const filas = _usdFilasNomina(userLogueado.usuario, userLogueado.nombre);
    if (!filas.length) { if(typeof toast==='function') toast('No hay desprendibles disponibles aún. Consulta con tu administrador.','warning',4000); return; }
    _usdMostrarModalDesprendiblesAsesor(userLogueado, filas);
}

function _usdMostrarModalDesprendiblesAsesor(u, filas) {
    const campoR = (r,...keys) => { for(const k of keys){if(r[k]!==undefined&&r[k]!=='')return r[k];}return ''; };
    const existente = document.getElementById('_usdModalDespAsesor');
    if (existente) existente.remove();
    const modal = document.createElement('div');
    modal.id = '_usdModalDespAsesor';
    modal.style.cssText = 'position:fixed;inset:0;z-index:10001;background:rgba(0,0,0,0.75);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:16px;';
    const _MESES_DSP = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
    function _fmtPerDsp(p, q, fallback) {
        p = String(p || '').trim();
        if (!p) return q ? `Quincena ${q}` : fallback;
        const mNom = _MESES_DSP.find(m => p.toLowerCase().includes(m.toLowerCase()));
        const anioM = p.match(/(20\d{2})/);
        const anio = anioM ? anioM[1] : '';
        const qLabel = q==='1'||q==='2' ? ` — Q${q}` : '';
        if (mNom) return `${mNom}${anio?' '+anio:''}${qLabel}`;
        return p + qLabel;
    }
    const lista = filas.map((r,i) => {
        const _perRaw3 = campoR(r,'periodo','período','mes') || '';
        const _qNum3   = String(campoR(r,'quincena_num','quincena','num_quincena')||'').trim();
        const periodo  = _fmtPerDsp(_perRaw3, _qNum3, 'Período '+(i+1));
        const sb = parseFloat(String(campoR(r,'salario_basico','salario_básico')||'0').replace(/[^0-9.-]/g,''))||0;
        const sp = parseFloat(String(campoR(r,'salario_puntos')||'0').replace(/[^0-9.-]/g,''))||0;
        const sa = parseFloat(String(campoR(r,'salario_a_pagar')||'0').replace(/[^0-9.-]/g,''))||0;
        const salario = (sb>0||sp>0)?Math.max(sb,sp):sa;
        const _dedDsp  = (parseFloat(String(campoR(r,'adelantos')||'0').replace(/[^0-9.-]/g,''))||0) + (parseFloat(String(campoR(r,'otras_deducciones','otras')||'0').replace(/[^0-9.-]/g,''))||0);
        const neto = salario - _dedDsp;
        return `<div style="display:flex;align-items:center;gap:10px;background:rgba(241,196,15,0.07);border:1px solid rgba(241,196,15,0.2);border-radius:10px;padding:10px 12px;"><span style="font-size:18px;flex-shrink:0;">💵</span><div style="flex:1;"><div style="font-size:12px;font-weight:800;color:#fff;">${periodo}</div><div style="font-size:11px;color:#f1c40f;font-weight:700;margin-top:2px;">${_usdFmtCOP(neto)}</div></div><button onclick="_usdDescargarDesprendible(${i})" style="padding:7px 14px;border-radius:8px;border:none;cursor:pointer;background:linear-gradient(135deg,#f1c40f,#e67e22);color:#1a1a1a;font-weight:800;font-size:10px;white-space:nowrap;">⬇️ PDF</button></div>`;
    }).join('');
    modal.innerHTML = `<div style="background:var(--panelBg,#1e1e1e);border-radius:20px;border:1px solid rgba(255,255,255,0.12);width:100%;max-width:440px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.6);"><div style="background:linear-gradient(135deg,rgba(241,196,15,0.2),rgba(241,196,15,0.06));border-bottom:3px solid #f1c40f;padding:16px 18px;display:flex;align-items:center;gap:10px;"><span style="font-size:22px;">💵</span><div style="flex:1;"><div style="font-size:14px;font-weight:900;color:#fff;">Mis Desprendibles — Pago Quincenal</div><div style="font-size:10px;color:#f1c40f;margin-top:2px;font-weight:700;">${filas.length} período${filas.length!==1?'s':''} disponible${filas.length!==1?'s':''}</div></div><button onclick="document.getElementById('_usdModalDespAsesor').remove()" style="background:rgba(255,255,255,0.1);border:none;color:#fff;width:30px;height:30px;border-radius:7px;cursor:pointer;font-size:15px;">✕</button></div><div style="padding:16px;display:flex;flex-direction:column;gap:8px;max-height:360px;overflow-y:auto;">${lista}</div></div>`;
    document.body.appendChild(modal);
    modal.addEventListener('click', e => { if(e.target===modal) modal.remove(); });
    window._usdDespFilas = filas;
    window._usdDespUsuario = u;
}
function _usdDescargarDesprendible(idx) {
    const r = (window._usdDespFilas||[])[idx];
    const u = window._usdDespUsuario;
    if (!r || !u) return;
    const campoR = (...keys) => { for(const k of keys){if(r[k]!==undefined&&r[k]!=='')return r[k];}return ''; };
    const periodo = campoR('periodo','quincena','período','mes') || ('Período '+(idx+1));
    _usdAbrirPDF(_usdHTMLDesprendible(u, r, false), 'Desprendible '+periodo);
}

// ── Admin: modal docs de un asesor ───────────────────────────────────────────
function usdAbrirModalDocsPorUsuario(usuarioLogin) {
    // Siempre usar la fuente más fresca: usuarios (puede ser actualizado por Firebase)
    // y _usuariosGlobal como respaldo
    const ref = (typeof usuarios !== 'undefined' && Array.isArray(usuarios) && usuarios.length)
                ? usuarios
                : (window._usuariosGlobal || []);

    if (!ref.length) {
        toast('Lista de usuarios no disponible. Recarga la página.', 'error');
        return;
    }

    // Normalizar: quitar tildes + mayúsculas
    const _nrm = s => (s||'').toString().trim().toUpperCase()
                      .normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    const loginBuscado = _nrm(usuarioLogin);

    // 1) Coincidencia exacta (sin tildes)
    let u = ref.find(x => _nrm(x.usuario) === loginBuscado);

    // 2) Por segmentos: ALEJANDRO.PENA === ALEJANDRO.PEÑA
    if (!u) {
        const partes = loginBuscado.split('.').filter(Boolean);
        u = ref.find(x => {
            const px = _nrm(x.usuario).split('.').filter(Boolean);
            return partes.length >= 2 && px.length >= 2
                && partes.every(p => px.some(xp => xp === p));
        });
    }

    if (!u) {
        console.warn('[Docs] No encontrado:', usuarioLogin, '| usuarios disponibles:', ref.map(x => x.usuario));
        toast('No se encontró el usuario: ' + usuarioLogin, 'error');
        return;
    }

    _usdAbrirModalDocsUsuario(u);
}

function _usdAbrirModalDocsUsuario(u) {
    if (!u) return;

    const prev = document.getElementById('_modalDocsAdmin');
    if (prev) prev.remove();

    const filas  = _usdFilasNomina(u.usuario, u.nombre);
    const campoR = (r, ...keys) => { for (const k of keys) { if (r[k] !== undefined && r[k] !== '') return r[k]; } return ''; };

    window._usdDocsAdminUsuario = u;
    window._usdDocsAdminFilas   = filas;

    const _MESES_D = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

    // Convierte número serial de Excel (ej: 46143) o texto a "Mayo 2026"
    const _serialAFecha = (val) => {
        const n = Number(val);
        if (!isNaN(n) && n > 40000 && n < 60000) {
            // Excel serial: días desde 1900-01-01 (con bug del año bisiesto 1900)
            const d = new Date(Math.round((n - 25569) * 86400 * 1000));
            const mes  = _MESES_D[d.getUTCMonth()];
            const anio = d.getUTCFullYear();
            return `${mes} ${anio}`;
        }
        return null;
    };

    const _fmtP = (p, q, fb) => {
        p = String(p || '').trim();
        if (!p) return q ? `Quincena ${q}` : fb;
        const qL = (q === '1' || q === '2') ? ` — Q${q}` : '';
        // Intentar interpretar como serial de Excel primero
        const desdeSerie = _serialAFecha(p);
        if (desdeSerie) return desdeSerie + qL;
        // Si ya tiene nombre de mes legible
        const mNom = _MESES_D.find(m => p.toLowerCase().includes(m.toLowerCase()));
        const anio = (p.match(/(20\d{2})/) || [])[1] || '';
        return mNom ? `${mNom}${anio ? ' ' + anio : ''}${qL}` : p + qL;
    };

    // ── Agrupar filas por Año → Mes → Quincena ──────────────────────────────
    // Extraer año de la cadena de periodo (ej. "Mayo 2025" → 2025, "Enero" → sin año)
    function _extraerAnio(pRaw) {
        const s = String(pRaw || '');
        const m = s.match(/(20\d{2})/);
        return m ? m[1] : null;
    }
    function _extraerMes(pRaw) {
        if (!pRaw && pRaw !== 0) return null;
        const s = String(pRaw);
        return _MESES_D.find(m => s.toLowerCase().includes(m.toLowerCase())) || null;
    }

    // Construir estructura: { anio: { mes: [ {r, i2, qN, per, monto, subLabel} ] } }
    const _grupos = {};
    const _sinAnio = '__sinAnio__';
    filas.forEach((r, i2) => {
        const pRaw = campoR(r, 'periodo', 'período', 'mes') || '';
        const qN   = String(campoR(r, 'quincena_num', 'quincena', 'num_quincena') || '').trim();
        const per  = _fmtP(pRaw, qN, 'Período ' + (i2 + 1));
        const anio = _extraerAnio(pRaw) || _extraerAnio(per) || _sinAnio;
        // Clave de mes: extraer SOLO el nombre del mes (sin Q, sin año) para que
        // Q1 y Q2 del mismo mes caigan en el mismo grupo/carpeta
        const mes  = _extraerMes(pRaw) || _extraerMes(per) || per.replace(/\s*—\s*Q\d/i,'').trim();

        const sb  = parseFloat(String(campoR(r, 'salario_basico', 'salario_básico') || '0').replace(/[^0-9.-]/g, '')) || 0;
        const sp  = parseFloat(String(campoR(r, 'salario_puntos') || '0').replace(/[^0-9.-]/g, '')) || 0;
        const sa  = parseFloat(String(campoR(r, 'salario_a_pagar') || '0').replace(/[^0-9.-]/g, '')) || 0;
        const ade = parseFloat(String(campoR(r, 'adelantos') || '0').replace(/[^0-9.-]/g, '')) || 0;
        const otr = parseFloat(String(campoR(r, 'otras_deducciones', 'otras') || '0').replace(/[^0-9.-]/g, '')) || 0;
        const devengado = (sb > 0 || sp > 0) ? Math.max(sb, sp) : sa;
        const esQ1 = qN === '1';
        const neto = devengado - ade - otr;
        const monto = esQ1 ? devengado : neto;

        let subLabel = '';
        if (!esQ1) {
            if (ade > 0) subLabel += `<div style="display:flex;justify-content:space-between;font-size:10px;color:#e74c3c;margin-top:3px;"><span>➖ Adelanto descontado</span><span>-${_usdFmtCOP(ade)}</span></div>`;
            if (otr > 0) subLabel += `<div style="display:flex;justify-content:space-between;font-size:10px;color:#e74c3c;margin-top:2px;"><span>➖ Otras deducciones</span><span>-${_usdFmtCOP(otr)}</span></div>`;
            if (ade > 0 || otr > 0) subLabel += `<div style="display:flex;justify-content:space-between;font-size:10px;color:#27ae60;font-weight:800;margin-top:3px;border-top:1px solid rgba(255,255,255,0.1);padding-top:3px;"><span>✅ Neto a pagar</span><span>${_usdFmtCOP(neto)}</span></div>`;
        }

        if (!_grupos[anio]) _grupos[anio] = {};
        if (!_grupos[anio][mes]) _grupos[anio][mes] = [];
        _grupos[anio][mes].push({ r, i2, qN, per, monto, subLabel });
    });

    // Determinar si hay más de un año con datos reales (para mostrar nivel año)
    const _anios = Object.keys(_grupos).filter(a => a !== _sinAnio).sort();
    const _conAnio = _anios.length > 0;
    const _multiAnio = _anios.length > 1 || (_anios.length === 1 && _grupos[_sinAnio]);

    // Renderizar un grupo de quincenas dentro de un mes
    // mesLabel: nombre del mes+año del acordeón padre (ej. "Abril 2026")
    // Dentro del acordeón solo se muestra Q1 / Q2 (sin repetir el mes)
    function _renderQuincenas(items, mesLabel) {
        return items.map(({ i2, qN, per, monto, subLabel }) => {
            let etiqueta, badgeQ = '';
            if (qN === '1' || qN === '2') {
                // Dentro del mes: mostrar solo "1ª Quincena" con badge Q1/Q2
                etiqueta = qN === '1' ? '1ª Quincena (1–15)' : '2ª Quincena (16–30)';
                badgeQ = `<span style="background:rgba(255,45,85,0.15);color:#ff6b88;border:1px solid rgba(255,45,85,0.3);border-radius:6px;padding:1px 7px;font-size:10px;font-weight:800;margin-left:6px;">Q${qN}</span>`;
            } else {
                etiqueta = per;
            }
            return `
            <div style="display:flex;align-items:center;gap:8px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:10px 14px;">
                <span style="font-size:16px;">💵</span>
                <div style="flex:1;">
                    <div style="font-size:12px;font-weight:800;color:#fff;display:flex;align-items:center;">${etiqueta}${badgeQ}</div>
                    <div style="font-size:12px;color:#f1c40f;font-weight:700;margin-top:2px;">${_usdFmtCOP(monto)}</div>
                    ${subLabel}
                </div>
                <button onclick="usdAdminDescargarDesprendible(${i2})" style="padding:7px 13px;border-radius:8px;border:none;cursor:pointer;background:linear-gradient(135deg,#f1c40f,#e67e22);color:#1a1a1a;font-weight:800;font-size:11px;white-space:nowrap;">⬇️ PDF</button>
            </div>`;
        }).join('');
    }

    // Renderizar meses dentro de un año (o directamente si no hay años)
    // El encabezado del acordeón incluye mes + año; dentro solo se ven Q1/Q2
    function _renderMeses(mesesObj, abiertoPorDefecto) {
        // Ordenar por índice de mes en el año
        const mesesOrdenados = Object.keys(mesesObj).sort((a, b) => {
            const ia = _MESES_D.indexOf(a), ib = _MESES_D.indexOf(b);
            return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
        });
        return mesesOrdenados.map((mes, mi) => {
            const abierto = abiertoPorDefecto && mi === mesesOrdenados.length - 1;
            // Para el encabezado: buscar el año dentro de los ítems del mes para mostrarlo
            const _anioEjemplo = (() => {
                const item = mesesObj[mes][0];
                if (!item) return '';
                // Intentar extraer año del pRaw o del per formateado
                const pRaw = String(campoR(item.r, 'periodo', 'período', 'mes') || '');
                const mAnio = pRaw.match(/(20\d{2})/) || (item.per || '').match(/(20\d{2})/);
                return mAnio ? ' ' + mAnio[1] : '';
            })();
            const tituloMes = mes + _anioEjemplo;
            return `
            <div style="border:1px solid rgba(255,255,255,0.1);border-radius:10px;overflow:hidden;margin-bottom:6px;">
                <button onclick="(function(btn){var c=btn.nextElementSibling;var open=c.style.display!=='none';c.style.display=open?'none':'flex';btn.querySelector('.tri').textContent=open?'▶':'▼';})(this)"
                    style="width:100%;display:flex;align-items:center;gap:8px;padding:10px 14px;background:rgba(255,255,255,0.06);border:none;color:#fff;cursor:pointer;font-size:13px;font-weight:700;text-align:left;">
                    <span class="tri" style="font-size:10px;color:var(--accent);">${abierto ? '▼' : '▶'}</span>
                    <span style="font-size:16px;">📅</span>
                    <span style="flex:1;">${tituloMes}</span>
                    <span style="font-size:10px;color:rgba(255,255,255,0.4);">${mesesObj[mes].length} desprendible${mesesObj[mes].length !== 1 ? 's' : ''}</span>
                </button>
                <div style="display:${abierto ? 'flex' : 'none'};flex-direction:column;gap:6px;padding:10px;">
                    ${_renderQuincenas(mesesObj[mes], tituloMes)}
                </div>
            </div>`;
        }).join('');
    }

    let contenidoDesp = '';
    if (!filas.length) {
        contenidoDesp = '<p style="color:rgba(255,255,255,0.4);font-size:12px;text-align:center;padding:20px 0;">Sin datos de nómina para este usuario.</p>';
    } else if (!_multiAnio) {
        // Un solo año o sin año: mostrar directamente los meses (sin nivel año)
        const mesesObj = Object.values(_grupos)[0] || {};
        contenidoDesp = _renderMeses(mesesObj, true);
    } else {
        // Múltiples años: nivel año → mes → quincenas
        const todosMeses = {};
        if (_grupos[_sinAnio]) Object.assign(todosMeses, _grupos[_sinAnio]);

        const aniosSorted = [..._anios].sort();
        contenidoDesp = aniosSorted.map((anio, ai) => {
            const abierto = ai === aniosSorted.length - 1;
            return `
            <div style="border:1px solid rgba(255,45,85,0.25);border-radius:12px;overflow:hidden;margin-bottom:8px;">
                <button onclick="(function(btn){var c=btn.nextElementSibling;var open=c.style.display!=='none';c.style.display=open?'none':'block';btn.querySelector('.tri').textContent=open?'▶':'▼';})(this)"
                    style="width:100%;display:flex;align-items:center;gap:8px;padding:12px 16px;background:rgba(255,45,85,0.1);border:none;color:#fff;cursor:pointer;font-size:14px;font-weight:900;text-align:left;">
                    <span class="tri" style="font-size:10px;color:var(--accent);">${abierto ? '▼' : '▶'}</span>
                    <span style="font-size:18px;">📆</span>
                    <span style="flex:1;">${anio}</span>
                </button>
                <div style="display:${abierto ? 'block' : 'none'};padding:10px;">
                    ${_renderMeses(_grupos[anio], abierto)}
                </div>
            </div>`;
        }).join('');
        // Sin año al final si existe
        if (_grupos[_sinAnio]) {
            contenidoDesp += _renderMeses(_grupos[_sinAnio], false);
        }
    }

    const modal = document.createElement('div');
    modal.id = '_modalDocsAdmin';
    modal.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.82);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;padding:16px;';
    modal.innerHTML = `
        <div style="background:#1a1a2e;border-radius:20px;border:1px solid rgba(255,255,255,0.12);width:100%;max-width:460px;overflow:hidden;box-shadow:0 24px 80px rgba(0,0,0,0.7);">
            <div style="background:linear-gradient(135deg,rgba(39,174,96,0.25),rgba(39,174,96,0.08));border-bottom:2px solid rgba(39,174,96,0.4);padding:16px 20px;display:flex;align-items:center;gap:10px;">
                <span style="font-size:22px;">📄</span>
                <div style="flex:1;">
                    <div style="font-size:15px;font-weight:900;color:#fff;">${_usdNombrePropio(u.nombre)}</div>
                    <div style="font-size:10px;color:rgba(255,255,255,0.5);margin-top:2px;">Documentos laborales</div>
                </div>
                <button onclick="document.getElementById('_modalDocsAdmin').remove()" style="background:rgba(255,255,255,0.1);border:none;color:#fff;width:32px;height:32px;border-radius:8px;cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center;">✕</button>
            </div>
            <div style="padding:16px;display:flex;flex-direction:column;gap:12px;">
                <div style="font-size:11px;color:rgba(255,255,255,0.5);font-weight:700;text-transform:uppercase;letter-spacing:1px;">📋 Referencia Laboral</div>
                <button onclick="usdGenerarReferenciaLaboralAdmin()" style="width:100%;padding:11px;border-radius:10px;border:1px solid rgba(255,255,255,0.15);cursor:pointer;background:rgba(255,255,255,0.05);color:#fff;font-weight:700;font-size:12px;text-align:left;">
                    📄 Generar Referencia Laboral
                </button>
                <div style="font-size:11px;color:rgba(255,255,255,0.5);font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-top:4px;">💵 Desprendibles de Nómina</div>
                <div style="display:flex;flex-direction:column;gap:8px;max-height:300px;overflow-y:auto;">${contenidoDesp}</div>
            </div>
        </div>`;
    document.body.appendChild(modal);
    modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
}

// Compatibilidad con llamadas por índice
function usdAbrirModalDocsAdmin(idx) {
    const ref = (typeof usuarios !== 'undefined' && Array.isArray(usuarios) && usuarios.length)
                ? usuarios : (window._usuariosGlobal || []);
    const u = ref[idx];
    if (!u) { toast('No se encontró el usuario. Recarga la página.', 'error'); return; }
    _usdAbrirModalDocsUsuario(u);
}
function usdCerrarModalDocsAdmin() {
    const m1 = document.getElementById('modalDocsAdmin');
    if (m1) m1.style.display = 'none';
    const m2 = document.getElementById('_modalDocsAdmin');
    if (m2) m2.remove();
}
function usdGenerarReferenciaLaboralAdmin() {
    const u = window._usdDocsAdminUsuario;
    if (!u) return;
    const hv = (JSON.parse(localStorage.getItem('hojas_vida_usd')||'{}') || {})[u.usuario] || {};
    const _esEd = userLogueado && esRolCoord(userLogueado.rol);
    _usdAbrirPDF(_usdHTMLReferenciaLaboral(u, hv, _esEd), 'Referencia Laboral — '+_usdNombrePropio(u.nombre));
}
function usdAdminDescargarDesprendible(idx) {
    const r = (window._usdDocsAdminFilas||[])[idx];
    const u = window._usdDocsAdminUsuario;
    if (!r || !u) return;
    const campoR = (...keys) => { for(const k of keys){if(r[k]!==undefined&&r[k]!=='')return r[k];}return ''; };
    const periodo = campoR('periodo','quincena','período','mes') || ('Período '+(idx+1));
    const _esEditor = userLogueado && esRolCoord(userLogueado.rol);
    _usdAbrirPDF(_usdHTMLDesprendible(u, r, _esEditor), 'Desprendible '+periodo+' — '+_usdNombrePropio(u.nombre));
}
window.addEventListener('DOMContentLoaded', () => {
    const m = document.getElementById('modalDocsAdmin');
    if (m) m.addEventListener('click', e => { if(e.target===m) usdCerrarModalDocsAdmin(); });
});
// ── SIDEBAR COLAPSABLE ──────────────────────────────────────────────────────
function toggleSidebarCollapse() {
    const sidebar = document.getElementById('mainSidebar');
    const wrapper = document.querySelector('.main-wrapper');
    const btn     = document.getElementById('sidebar-toggle-btn');
    if (!sidebar) return;
    const collapsed = sidebar.classList.toggle('collapsed');
    if (wrapper) wrapper.classList.toggle('sidebar-collapsed', collapsed);
    if (btn)     btn.textContent = collapsed ? '▶' : '◀';
    try { localStorage.setItem('usd_sidebar_collapsed', collapsed ? '1' : '0'); } catch(e) {}
}
(function _restoreSidebarState() {
    window.addEventListener('DOMContentLoaded', function() {
        try {
            if (localStorage.getItem('usd_sidebar_collapsed') === '1') {
                const sidebar = document.getElementById('mainSidebar');
                const wrapper = document.querySelector('.main-wrapper');
                const btn     = document.getElementById('sidebar-toggle-btn');
                if (sidebar) sidebar.classList.add('collapsed');
                if (wrapper) wrapper.classList.add('sidebar-collapsed');
                if (btn)     btn.textContent = '▶';
            }
        } catch(e) {}
    });
})();
// ─────────────────────────────────────────────────────────────────────────────
