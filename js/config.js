//  SISTEMA DE CONFIGURACIÓN EXTENDIDA
// ══════════════════════════════════════════════════════════════════

const CFG_EXTRA_KEY = 'usd_theme_extra';

function cfgGetExtra() { return JSON.parse(localStorage.getItem(CFG_EXTRA_KEY)) || {}; }
function cfgSaveExtra(obj) { localStorage.setItem(CFG_EXTRA_KEY, JSON.stringify(obj)); }

// Color + label + persistencia
function cfgColor(variable, valor, lblId) {
    cambiarColor(variable, valor);
    if (lblId) document.getElementById(lblId).textContent = valor;
}

// Slider + label + persistencia
function cfgSlider(variable, valor, lblId, lblText) {
    cambiarColor(variable, valor);
    if (lblId) document.getElementById(lblId).textContent = lblText || valor;
}

// Guardar valor extra (no CSS var) en localStorage
function cfgGuardarExtra(key, valor, lblId, lblText) {
    const extra = cfgGetExtra();
    extra[key] = valor;
    cfgSaveExtra(extra);
    if (lblId) document.getElementById(lblId).textContent = lblText || valor;
    // Aplicar si corresponde
    if (key === 'cfg_bar_height') {
        document.querySelectorAll('[data-bar-inner]').forEach(el => el.style.height = valor);
    }
}

// Forma de fotos: aplica a la variable y regenera vistas si están activas
function cfgPhotoShape(valor) {
    cfgColor('--photoRadius', valor, null);
    const extra = cfgGetExtra();
    extra['photoShape'] = valor;
    cfgSaveExtra(extra);
}

// Animaciones on/off
function cfgAnimaciones(activas) {
    const lbl = document.getElementById('lblAnimaciones');
    if (lbl) lbl.textContent = activas ? 'Activadas' : 'Desactivadas';
    const style = document.getElementById('animStyle') || (() => {
        const s = document.createElement('style'); s.id = 'animStyle';
        document.head.appendChild(s); return s;
    })();
    style.textContent = activas ? '' : '.seccion, .glass-card { animation: none !important; }';
    const extra = cfgGetExtra();
    extra['animaciones'] = activas;
    cfgSaveExtra(extra);
}

// Colores de tabla con opacidad
function cfgTableBorder(hexColor) {
    const rgba = hexToRgba(hexColor, 0.15);
    cfgColor('--tableBorderColor', rgba, 'lbl_tableBorder');
}
function cfgTableHover(hexColor) {
    const rgba = hexToRgba(hexColor, 0.08);
    cfgColor('--tableRowHover', rgba, 'lbl_tableHover');
}

function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1,3),16);
    const g = parseInt(hex.slice(3,5),16);
    const b = parseInt(hex.slice(5,7),16);
    return `rgba(${r},${g},${b},${alpha})`;
}

// Densidad de tabla
function cfgTableDensity(valor) {
    cfgColor('--tableRowPadding', valor, null);
    const extra = cfgGetExtra();
    extra['tableDensity'] = valor;
    cfgSaveExtra(extra);
}

// Plataformas
function cfgPlataforma(plat, color, lblId) {
    cambiarColorPlataforma(plat, color);
    if (lblId) document.getElementById(lblId).textContent = color;
}

// Gráficas donut
function cfgDonut(tipo, valor, lblId) {
    cambiarConfigGraficaAsesor(tipo, valor);
    if (lblId) document.getElementById(lblId).textContent = valor;
}

// Actualizar podio (re-render ranking si está visible)
function cfgActualizarPodio() {
    if (document.getElementById('sec-ranking') &&
        document.getElementById('sec-ranking').style.display !== 'none') {
        renderRanking();
    }
}

// Tabs de configuración
function switchConfigTab(tab) {
    const tabs = ['colores','interfaz','tipografia','tablas','plataformas','graficas','avanzado','grupos'];
    tabs.forEach(t => {
        const btn = document.getElementById('cfgTab' + t.charAt(0).toUpperCase() + t.slice(1));
        const pane = document.getElementById('cfgPane_' + t);
        if (btn) {
            if (t === tab) {
                btn.style.background = 'var(--accent)';
                btn.style.color = '#fff';
                btn.style.border = 'none';
            } else {
                btn.style.background = 'transparent';
                btn.style.color = 'var(--accent)';
                btn.style.border = '2px solid var(--accent)';
            }
        }
        if (pane) pane.style.display = t === tab ? 'block' : 'none';
    });
    // Inicializar tab Grupos al abrirlo
    if (tab === 'grupos') initCfgGruposTab();
    // Info de almacenamiento al abrir avanzado
    if (tab === 'avanzado') {
        const colors = localStorage.getItem('usd_theme_colors') || '';
        const extra  = localStorage.getItem(CFG_EXTRA_KEY) || '';
        const kb = ((colors.length + extra.length) / 1024).toFixed(2);
        const el = document.getElementById('cfgInfoSize');
        if (el) el.textContent = `💾 Config guardada: ~${kb} KB`;
    }
}

// Exportar configuración completa como JSON
function cfgExportar() {
    const data = {
        usd_theme_colors: JSON.parse(localStorage.getItem('usd_theme_colors') || '{}'),
        usd_theme_extra:  JSON.parse(localStorage.getItem(CFG_EXTRA_KEY) || '{}'),
        plataformas: {}
    };
    ['AmoLatina','LatinMelodies','WishPark','Dream','TalkyTimes'].forEach(p => {
        const v = localStorage.getItem('cfg_plat_color_' + p);
        if (v) data.plataformas[p] = v;
    });
    const blob = new Blob([JSON.stringify(data, null, 2)], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'usd_config.json'; a.click();
    URL.revokeObjectURL(url);
}

// Importar configuración desde JSON
function cfgImportar(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            if (data.usd_theme_colors) localStorage.setItem('usd_theme_colors', JSON.stringify(data.usd_theme_colors));
            if (data.usd_theme_extra)  localStorage.setItem(CFG_EXTRA_KEY, JSON.stringify(data.usd_theme_extra));
            if (data.plataformas) {
                Object.entries(data.plataformas).forEach(([p, c]) => localStorage.setItem('cfg_plat_color_' + p, c));
            }
            toast('Configuración importada correctamente. La página se recargará.', 'success', 2500);
            location.reload();
        } catch(err) {
            toast('Archivo inválido. Asegúrate de importar un JSON exportado desde este sistema.', 'error');
        }
    };
    reader.readAsText(file);
}

// Cargar todos los valores guardados en los controles del panel al abrirlo
function cfgCargarValores() {
    const colors = JSON.parse(localStorage.getItem('usd_theme_colors') || '{}');
    const extra  = cfgGetExtra();

    const mapColors = {
        '--accent':                 ['colorAccent',      'lbl_accent'],
        '--bgMain':                 ['colorBgMain',      'lbl_bgMain'],
        '--textMain':               ['colorText',        'lbl_textMain'],
        '--textMuted':              ['colorTextMuted',   'lbl_textMuted'],
        '--panelBg':                ['colorPanel',       'lbl_panelBg'],
        '--bgSidebar':              ['colorSidebar',     'lbl_bgSidebar'],
        '--sidebarSeparatorColor':  ['colorSidebarSep',  'lbl_sidebarSep'],
        '--loginLeftBg':            ['colorLoginBg',     'lbl_loginBg'],
        '--podiumGold':             ['colorPodGold',     'lbl_podGold'],
        '--podiumSilver':           ['colorPodSilver',   'lbl_podSilver'],
        '--podiumBronze':           ['colorPodBronze',   'lbl_podBronze'],
        '--tableHeaderColor':       ['colorTableHeader', 'lbl_tableHeader'],
    };
    Object.entries(mapColors).forEach(([cssVar, [inputId, lblId]]) => {
        const val = colors[cssVar];
        if (!val) return;
        const el = document.getElementById(inputId);
        const lb = document.getElementById(lblId);
        if (el && val.startsWith('#')) el.value = val;
        if (lb) lb.textContent = val;
    });

    const mapSliders = {
        '--borderRadius':    ['sliderBorderRadius',  'lbl_borderRadius'],
        '--cardOpacity':     ['sliderCardOpacity',    'lbl_cardOpacity'],
        '--cardPadding':     ['sliderCardPadding',    'lbl_cardPadding'],
        '--fontSizePanels':  ['sliderFontSize',       'lbl_fontSize'],
        '--photoSizeSidebar':['sliderPhotoSidebar',   'lbl_photoSidebar'],
        '--photoSizeCard':   ['sliderPhotoCard',      'lbl_photoCard'],
        '--badgeBorderRadius':['sliderBadgeRadius',   'lbl_badgeRadius'],
    };
    Object.entries(mapSliders).forEach(([cssVar, [sliderId, lblId]]) => {
        const val = colors[cssVar];
        if (!val) return;
        const num = parseFloat(val);
        const sl = document.getElementById(sliderId);
        const lb = document.getElementById(lblId);
        if (sl && !isNaN(num)) sl.value = num;
        if (lb) lb.textContent = val;
    });

    // Fuente
    const font = colors['--fontFamily'];
    const fontSel = document.getElementById('fontFamilySelect');
    if (font && fontSel) {
        for (let opt of fontSel.options) { if (opt.value === font) { fontSel.value = font; break; } }
        cfgCargarFuenteGoogle(font);
    }

    // Plataformas
    const platMap = { 'AmoLatina':['colorPlat_AmoLatina','lbl_platAmo'], 'WishPark':['colorPlat_WishPark','lbl_platWish'], 'Dream':['colorPlat_Dream','lbl_platDream'], 'TalkyTimes':['colorPlat_TalkyTimes','lbl_platTalky'], 'LatinMelodies':['colorPlat_LatinMelodies','lbl_platLatin'] };
    Object.entries(platMap).forEach(([p,[inputId,lblId]]) => {
        const v = localStorage.getItem('cfg_plat_color_' + p);
        if (!v) return;
        const el = document.getElementById(inputId); if (el) el.value = v;
        const lb = document.getElementById(lblId);   if (lb) lb.textContent = v;
    });

    // Donuts
    const donutMap = { 'cfg_color_asesor_asis':['colorDonutAsis','lbl_donutAsis'], 'cfg_color_asesor_punt':['colorDonutPunt','lbl_donutPunt'], 'cfg_color_asesor_bg':['colorDonutBg','lbl_donutBg'] };
    Object.entries(donutMap).forEach(([key,[inputId,lblId]]) => {
        const v = localStorage.getItem(key);
        if (!v) return;
        const el = document.getElementById(inputId); if (el && v.startsWith('#')) el.value = v;
        const lb = document.getElementById(lblId);   if (lb) lb.textContent = v;
    });

    // Extra
    if (extra.photoShape) {
        const sel = document.getElementById('selectPhotoShape');
        if (sel) sel.value = extra.photoShape;
    }
    if (extra.tableDensity) {
        const sel = document.getElementById('selectTableDensity');
        if (sel) sel.value = extra.tableDensity;
    }
    if (extra.animaciones === false) {
        const chk = document.getElementById('chkAnimaciones');
        if (chk) { chk.checked = false; cfgAnimaciones(false); }
    }
}

// Carga fuente de Google Fonts dinámicamente
function cfgCargarFuenteGoogle(fontFamily) {
    const name = fontFamily.replace(/['"]/g,'').split(',')[0].trim();
    const googleFonts = ['Roboto','Montserrat','Inter','Poppins','Raleway','Lato','Oswald'];
    if (!googleFonts.includes(name)) return;
    const linkId = 'gfont_' + name.toLowerCase();
    if (document.getElementById(linkId)) return;
    const link = document.createElement('link');
    link.id = linkId; link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${name.replace(/ /g,'+')}:wght@400;700;900&display=swap`;
    document.head.appendChild(link);
}

// Fuentes Google se cargan dentro de cfgColor al cambiar --fontFamily

// ══════════════════════════════════════════════════════════════════
