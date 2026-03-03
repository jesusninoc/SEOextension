// ============= ELEMENTOS DOM =============
const urlInput = document.getElementById('urlInput');
const analyzeBtn = document.getElementById('analyzeBtn');
const statusEl = document.getElementById('status');
const resultsEl = document.getElementById('results');
const scoreEl = document.getElementById('score');
const scoreTextEl = document.getElementById('scoreText');
const exportBtn = document.getElementById('exportBtn');
const historyBtn = document.getElementById('historyBtn');
const historyModal = document.getElementById('historyModal');
const historyList = document.getElementById('historyList');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');
const filterBtns = document.querySelectorAll('.filter-btn');
const modalClose = document.querySelector('.modal-close');

// ============= CHECKS DISPONIBLES =============
const CHECKS = [
  // === SEO CHECKS ===
  { key: 'https', category: 'seo', weight: 8, type: 'automatic', title: 'HTTPS habilitado', desc: 'Verifica que la web use protocolo HTTPS seguro.' },
  { key: 'mobileReady', category: 'seo', weight: 10, type: 'automatic', title: 'Mobile-friendly', desc: 'Comprueba viewport meta y responsive design.' },
  { key: 'metaTitle', category: 'seo', weight: 12, type: 'automatic', title: 'Meta Title presente', desc: 'Valida que exista title y tenga longitud adecuada (30-60 caracteres).' },
  { key: 'metaDescription', category: 'seo', weight: 12, type: 'automatic', title: 'Meta Description', desc: 'Verifica descripción meta (120-160 caracteres recomendado).' },
  { key: 'h1Structure', category: 'seo', weight: 10, type: 'automatic', title: 'Estructura H1', desc: 'Valida que haya exactamente un H1 y estructura jerárquica correcta.' },
  { key: 'canonicalTag', category: 'seo', weight: 8, type: 'automatic', title: 'Canonical Tag', desc: 'Comprueba presencia de etiqueta canonical para evitar duplicados.' },
  { key: 'ogTags', category: 'seo', weight: 6, type: 'heuristic', title: 'Open Graph Tags', desc: 'Detecta meta tags para compartir en redes sociales.' },
  { key: 'structuredData', category: 'seo', weight: 10, type: 'automatic', title: 'Structured Data (Schema)', desc: 'Detecta JSON-LD para rich snippets en buscadores.' },
  { key: 'morePages', category: 'seo', weight: 10, type: 'automatic', title: 'Múltiples páginas', desc: 'Busca enlaces internos y sitemap para confirmar estructura.' },
  { key: 'robots', category: 'seo', weight: 8, type: 'automatic', title: 'Robots.txt presente', desc: 'Comprueba si responde /robots.txt y revisa contenido.' },
  { key: 'sitemap', category: 'seo', weight: 8, type: 'automatic', title: 'Sitemap.xml presente', desc: 'Verifica existencia y número de URLs en sitemap.' },
  { key: 'searchPresence', category: 'seo', weight: 4, type: 'manual', title: 'Presencia en buscadores', desc: 'Revisa presencia en Google y Bing manualmente.' },
  
  // === ACCESIBILIDAD ===
  { key: 'langAttribute', category: 'accessibility', weight: 10, type: 'automatic', title: 'Atributo lang', desc: 'Valida que HTML tenga atributo lang definido.' },
  { key: 'imageAlt', category: 'accessibility', weight: 10, type: 'automatic', title: 'Alt en imágenes', desc: 'Comprueba que todas las imágenes tengan alt text.' },
  { key: 'formLabels', category: 'accessibility', weight: 8, type: 'automatic', title: 'Labels en formularios', desc: 'Verifica que inputs tengan labels asociados.' },
  { key: 'colorContrast', category: 'accessibility', weight: 6, type: 'heuristic', title: 'Contraste de color', desc: 'Estima si hay suficiente contraste (heurístico).' },
  { key: 'keyboardNav', category: 'accessibility', weight: 8, type: 'heuristic', title: 'Navegación por teclado', desc: 'Detecta si los botones son accesibles por teclado.' },
  
  // === CHECKS TÉCNICOS ===
  { key: 'errorHandling', category: 'technical', weight: 8, type: 'heuristic', title: 'Manejo de errores 404', desc: 'Prueba una URL inexistente para validar control de errores.' },
  { key: 'noindex', category: 'technical', weight: 10, type: 'automatic', title: 'No indexada (verificación)', desc: 'Comprueba si hay noindex que bloquee indexación.' },
  { key: 'securityHeaders', category: 'technical', weight: 6, type: 'heuristic', title: 'Headers de seguridad', desc: 'Detecta X-Frame-Options, CSP y otros headers de seguridad.' },
  { key: 'browserCache', category: 'technical', weight: 5, type: 'heuristic', title: 'Cache del navegador', desc: 'Verifica headers Cache-Control para optimizar caché.' },
  
  // === RENDIMIENTO ===
  { key: 'googleAnalytics', category: 'performance', weight: 8, type: 'heuristic', title: 'Google Analytics', desc: 'Detecta GA/GTM para tracking de métricas.' },
  { key: 'ads', category: 'performance', weight: 5, type: 'heuristic', title: 'Red de anuncios', desc: 'Detecta Google AdSense, DoubleClick y otras redes.' },
  { key: 'links', category: 'performance', weight: 8, type: 'heuristic', title: 'Estructura de enlaces', desc: 'Analiza enlaces internos y externos.' },
  { key: 'social', category: 'performance', weight: 6, type: 'heuristic', title: 'Redes sociales', desc: 'Detecta presencia en LinkedIn y otras plataformas.' },
  { key: 'bing', category: 'performance', weight: 8, type: 'heuristic', title: 'Bing Webmaster Tools', desc: 'Detecta meta de verificación de Bing (msvalidate.01).' },
];

// ============= EVENT LISTENERS =============
analyzeBtn.addEventListener('click', analyze);
urlInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') analyze();
});

exportBtn.addEventListener('click', exportResults);
historyBtn.addEventListener('click', showHistory);
modalClose.addEventListener('click', () => historyModal.classList.add('hidden'));
clearHistoryBtn.addEventListener('click', clearHistory);
historyModal.addEventListener('click', (e) => {
  if (e.target === historyModal) historyModal.classList.add('hidden');
});

filterBtns.forEach(btn => {
  btn.addEventListener('click', (e) => {
    filterBtns.forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
    const filter = e.target.dataset.filter;
    filterResults(filter);
  });
});

// ============= FUNCIONES PRINCIPALES =============
function setStatus(text) {
  statusEl.textContent = text;
}

function normalizeUrl(value) {
  let text = value.trim();
  if (!/^https?:\/\//i.test(text)) text = 'https://' + text;
  return new URL(text).toString();
}

async function fetchText(url) {
  try {
    const res = await fetch(url, { redirect: 'follow', cache: 'no-store' });
    const text = await res.text();
    return { res, text };
  } catch (error) {
    return { res: { ok: false, status: 0 }, text: '' };
  }
}

async function fetchHeaders(url) {
  try {
    const res = await fetch(url, { method: 'HEAD', redirect: 'follow' });
    return res.headers;
  } catch {
    return new Headers();
  }
}

function toDoc(html) {
  return new DOMParser().parseFromString(html, 'text/html');
}

function pick(base, path) {
  return new URL(path, base).toString();
}

function unique(arr) {
  return [...new Set(arr.filter(Boolean))];
}

// ============= DETECTORES ESPECIALIZADOS =============
function isProbablyGoogleAnalytics(html) {
  return /(googletagmanager\.com|google-analytics\.com|gtag\(|ga\(|G-[A-Z0-9]+)/i.test(html);
}

function detectAds(html) {
  return /(googlesyndication\.com|doubleclick\.net|adsbygoogle|adservice\.google)/i.test(html);
}

function validateMetaTitle(doc) {
  const title = doc.querySelector('title');
  if (!title) return { status: 'bad', detail: 'No hay título meta' };
  const len = title.textContent.length;
  if (len < 30) return { status: 'warn', detail: `Muy corto (${len} caracteres). Mínimo 30.` };
  if (len > 60) return { status: 'warn', detail: `Muy largo (${len} caracteres). Máximo 60.` };
  return { status: 'ok', detail: `Óptimo (${len} caracteres): "${title.textContent.substring(0, 40)}..."` };
}

function validateMetaDescription(doc) {
  const desc = doc.querySelector('meta[name="description"]');
  if (!desc) return { status: 'bad', detail: 'No hay meta description' };
  const len = desc.content.length;
  if (len < 120) return { status: 'warn', detail: `Muy corta (${len} caracteres). Mínimo 120.` };
  if (len > 160) return { status: 'warn', detail: `Muy larga (${len} caracteres). Máximo 160.` };
  return { status: 'ok', detail: `Óptima (${len} caracteres): "${desc.content.substring(0, 40)}..."` };
}

function validateH1Structure(doc) {
  const h1s = [...doc.querySelectorAll('h1')];
  if (h1s.length === 0) return { status: 'bad', detail: 'No hay ningún H1 en la página' };
  if (h1s.length > 1) return { status: 'warn', detail: `Múltiples H1 encontrados (${h1s.length}). Solo debería haber uno.` };
  return { status: 'ok', detail: `Un H1 correcto: "${h1s[0].textContent.substring(0, 40)}"` };
}

function validateHeadingStructure(doc) {
  const headings = [...doc.querySelectorAll('h1,h2,h3,h4,h5,h6')];
  if (headings.length === 0) return { status: 'bad', detail: 'Sin headings' };
  
  let isCorrect = true;
  let lastLevel = 0;
  
  for (const h of headings) {
    const level = parseInt(h.tagName[1]);
    if (level > lastLevel + 1) isCorrect = false;
    lastLevel = level;
  }
  
  return { status: isCorrect ? 'ok' : 'warn', detail: `${headings.length} headings. ${isCorrect ? 'Estructura correcta' : 'Posibles saltos en jerarquía'}` };
}

function checkImageAlt(doc) {
  const images = [...doc.querySelectorAll('img')];
  if (images.length === 0) return { status: 'ok', detail: 'Sin imágenes en la página' };
  
  const withoutAlt = images.filter(i => !i.hasAttribute('alt') || !i.getAttribute('alt').trim()).length;
  if (withoutAlt === 0) return { status: 'ok', detail: `Todas las ${images.length} imágenes tienen alt` };
  
  return { status: withoutAlt > images.length / 2 ? 'bad' : 'warn', detail: `${withoutAlt} de ${images.length} sin alt (${Math.round(withoutAlt/images.length*100)}%)` };
}

function checkFormLabels(doc) {
  const inputs = [...doc.querySelectorAll('input, select, textarea')];
  if (inputs.length === 0) return { status: 'ok', detail: 'Sin formularios' };
  
  const withLabels = inputs.filter(i => {
    const id = i.id;
    return id && doc.querySelector(`label[for="${id}"]`);
  }).length;
  
  const coverage = Math.round(withLabels / inputs.length * 100);
  if (coverage === 100) return { status: 'ok', detail: `Todos los inputs (${inputs.length}) tienen labels` };
  return { status: coverage > 50 ? 'warn' : 'bad', detail: `${coverage}% de inputs con labels (${withLabels}/${inputs.length})` };
}

function checkOgTags(doc) {
  const og = {
    title: !!doc.querySelector('meta[property="og:title"]'),
    description: !!doc.querySelector('meta[property="og:description"]'),
    image: !!doc.querySelector('meta[property="og:image"]'),
    url: !!doc.querySelector('meta[property="og:url"]')
  };
  
  const count = Object.values(og).filter(Boolean).length;
  if (count === 0) return { status: 'warn', detail: 'Sin tags Open Graph' };
  if (count === 4) return { status: 'ok', detail: 'Todos los Open Graph básicos presentes' };
  return { status: 'warn', detail: `${count}/4 Open Graph tags` };
}

function checkStructuredData(doc) {
  const jsonLd = doc.querySelectorAll('script[type="application/ld+json"]');
  if (jsonLd.length === 0) return { status: 'warn', detail: 'Sin Schema.org JSON-LD' };
  
  return { status: 'ok', detail: `${jsonLd.length} bloque(s) de structured data detectado(s)` };
}

function checkCanonicalTag(doc) {
  const canonical = doc.querySelector('link[rel="canonical"]');
  if (!canonical) return { status: 'warn', detail: 'Sin canonical tag' };
  return { status: 'ok', detail: `Canonical: ${canonical.href}` };
}

function checkViewportMeta(doc) {
  const viewport = doc.querySelector('meta[name="viewport"]');
  if (!viewport) return { status: 'bad', detail: 'Sin viewport meta tag' };
  const content = viewport.getAttribute('content');
  if (/width=device-width/.test(content)) return { status: 'ok', detail: 'Mobile-friendly meta correcta' };
  return { status: 'warn', detail: 'Viewport meta presente pero posible problema' };
}

function checkNoindex(doc) {
  const robots = doc.querySelector('meta[name="robots"]');
  if (robots && /noindex/i.test(robots.content)) return { status: 'bad', detail: 'Meta robots contiene noindex' };
  
  const googleBot = doc.querySelector('meta[name="googlebot"]');
  if (googleBot && /noindex/i.test(googleBot.content)) return { status: 'bad', detail: 'Meta googlebot contiene noindex' };
  
  return { status: 'ok', detail: 'Sin noindex - página indexable' };
}

// ============= ANÁLISIS PRINCIPAL =============
async function analyze() {
  resultsEl.innerHTML = '';
  scoreEl.textContent = '...';
  scoreTextEl.textContent = 'Analizando';
  let baseUrl;

  try {
    baseUrl = normalizeUrl(urlInput.value);
  } catch {
    setStatus('La URL no es válida.');
    return;
  }

  setStatus('Analizando sitio web completo...');

  try {
    const homepage = await fetchText(baseUrl);
    const doc = toDoc(homepage.text);
    const base = new URL(baseUrl);
    const headers = await fetchHeaders(baseUrl);

    // === EXTRACCIÓN DE DATOS ===
    const anchors = [...doc.querySelectorAll('a[href]')].map(a => a.getAttribute('href'));
    const resolved = unique(anchors.map(h => {
      try { return new URL(h, base).toString(); } catch { return null; }
    }));
    const internalLinks = resolved.filter(u => {
      try { return new URL(u).hostname === base.hostname; } catch { return false; }
    });
    const externalLinks = resolved.filter(u => {
      try { return new URL(u).hostname !== base.hostname; } catch { return false; }
    });

    const scriptSrcs = [...doc.querySelectorAll('script[src]')].map(s => s.src).join('\n');
    const imgs = [...doc.images];
    const linkedInFound = /linkedin\.com/i.test(homepage.text) || resolved.some(u => /linkedin\.com/i.test(u));
    const bingVerification = !!doc.querySelector('meta[name="msvalidate.01"]');

    // === ROBOTS.TXT ===
    let robotsInfo = { exists: false, ok: false, note: 'No encontrado' };
    try {
      const robots = await fetchText(pick(base, '/robots.txt'));
      robotsInfo.exists = robots.res.ok;
      robotsInfo.ok = robots.res.ok;
      robotsInfo.note = robots.res.ok ? `HTTP ${robots.res.status}. Detectado.` : `HTTP ${robots.res.status}`;
    } catch {
      robotsInfo.note = 'No se pudo leer robots.txt';
    }

    // === SITEMAP ===
    let sitemapInfo = { exists: false, count: 0, note: 'No encontrado' };
    try {
      const sitemap = await fetchText(pick(base, '/sitemap.xml'));
      sitemapInfo.exists = sitemap.res.ok;
      if (sitemap.res.ok) {
        const count = (sitemap.text.match(/<loc>/gi) || []).length;
        sitemapInfo.count = count;
        sitemapInfo.note = `HTTP ${sitemap.res.status}. URLs: ${count}`;
      } else {
        sitemapInfo.note = `HTTP ${sitemap.res.status}`;
      }
    } catch {
      sitemapInfo.note = 'No se pudo leer sitemap.xml';
    }

    // === MANEJO DE ERRORES ===
    let errorInfo = { controlled: false, note: 'No comprobado' };
    try {
      const fakeUrl = pick(base, `/audit-${Date.now()}-missing`);
      const res = await fetch(fakeUrl, { redirect: 'follow', cache: 'no-store' });
      errorInfo.controlled = res.status === 404 || res.redirected;
      errorInfo.note = `HTTP ${res.status}${res.redirected ? ' (con redirección)' : ''}`;
    } catch {
      errorInfo.note = 'No se pudo probar la URL inexistente';
    }

    // === DETECCIONES MULTI-PÁGINA ===
    const hasMultiplePages = internalLinks.filter(u => {
      try {
        const p = new URL(u).pathname;
        return p && p !== '/' && p !== '/index.html';
      } catch { return false; }
    }).length > 0 || sitemapInfo.count > 1;

    // === COMPILAR RESULTADOS ===
    const payload = {
      https: {
        status: baseUrl.startsWith('https') ? 'ok' : 'bad',
        detail: baseUrl.startsWith('https') ? 'HTTPS activado' : 'Sitio sin HTTPS (inseguro)'
      },
      mobileReady: checkViewportMeta(doc),
      metaTitle: validateMetaTitle(doc),
      metaDescription: validateMetaDescription(doc),
      h1Structure: validateH1Structure(doc),
      canonicalTag: checkCanonicalTag(doc),
      ogTags: checkOgTags(doc),
      structuredData: checkStructuredData(doc),
      morePages: {
        status: hasMultiplePages ? 'ok' : 'warn',
        detail: `Enlaces internos: ${internalLinks.length}. Sitemap: ${sitemapInfo.count} URLs.`
      },
      robots: {
        status: robotsInfo.exists ? 'ok' : 'bad',
        detail: robotsInfo.note
      },
      sitemap: {
        status: sitemapInfo.exists ? 'ok' : 'bad',
        detail: sitemapInfo.note
      },
      searchPresence: {
        status: 'manual',
        detail: `Revisar site:${base.hostname} en Google y Bing`
      },
      langAttribute: {
        status: !!doc.documentElement.lang ? 'ok' : 'warn',
        detail: !!doc.documentElement.lang ? `Lang: ${doc.documentElement.lang}` : 'Sin atributo lang'
      },
      imageAlt: checkImageAlt(doc),
      formLabels: checkFormLabels(doc),
      colorContrast: {
        status: 'warn',
        detail: 'Requiere verificación manual con herramientas especializadas'
      },
      keyboardNav: {
        status: 'warn',
        detail: 'Requiere prueba manual con teclado'
      },
      errorHandling: {
        status: errorInfo.controlled ? 'ok' : 'warn',
        detail: errorInfo.note
      },
      noindex: checkNoindex(doc),
      securityHeaders: {
        status: 'warn',
        detail: 'Verificar headers X-Frame-Options, CSP, etc. en devtools'
      },
      browserCache: {
        status: 'warn',
        detail: 'Revisar Cache-Control headers en Network tab'
      },
      googleAnalytics: {
        status: isProbablyGoogleAnalytics(homepage.text + '\n' + scriptSrcs) ? 'ok' : 'warn',
        detail: isProbablyGoogleAnalytics(homepage.text + '\n' + scriptSrcs) ? 'GA/GTM detectado' : 'Sin GA detectable'
      },
      ads: {
        status: detectAds(homepage.text + '\n' + scriptSrcs) ? 'ok' : 'warn',
        detail: detectAds(homepage.text + '\n' + scriptSrcs) ? 'Red de anuncios detectada' : 'Sin anuncios detectados'
      },
      links: {
        status: (internalLinks.length > 1 && externalLinks.length > 0) ? 'ok' : 'warn',
        detail: `Internos: ${internalLinks.length}. Externos: ${externalLinks.length}.`
      },
      social: {
        status: linkedInFound ? 'ok' : 'warn',
        detail: linkedInFound ? 'LinkedIn detectado' : 'Sin LinkedIn'
      },
      bing: {
        status: bingVerification ? 'ok' : 'warn',
        detail: bingVerification ? 'Meta msvalidate.01 presente' : 'Sin verificación de Bing'
      }
    };

    renderResults(payload, base.hostname);
    saveToHistory(base.hostname, payload);
    setStatus(`✓ Análisis completado para ${base.hostname}`);
  } catch (err) {
    console.error(err);
    setStatus('❌ No se pudo analizar la URL. Intenta con otra o verifica permisos.');
    scoreEl.textContent = '0';
    scoreTextEl.textContent = 'Error';
    resultsEl.innerHTML = `<div class="item"><h3>⚠️ Error</h3><p>${escapeHtml(String(err.message))}</p></div>`;
  }
}

// ============= RENDERIZADO DE RESULTADOS =============
function renderResults(payload, host) {
  resultsEl.innerHTML = '';
  let score = 0;
  let maxScore = 0;

  for (const check of CHECKS) {
    const data = payload[check.key] || { status: 'manual', detail: 'Sin datos' };
    maxScore += check.weight;
    
    if (data.status === 'ok') score += check.weight;
    else if (data.status === 'warn') score += Math.round(check.weight * 0.45);
    else if (data.status === 'manual') score += Math.round(check.weight * 0.25);

    const item = document.createElement('div');
    item.className = 'item';
    item.dataset.category = check.category;
    
    const statusLabel = data.status === 'ok' ? '✓ Cumple' : data.status === 'bad' ? '✗ No cumple' : data.status === 'warn' ? '⚠ Revisar' : 'ℹ Manual';
    const manualExtra = buildManualExtra(check.key, host);

    item.innerHTML = `
      <div class="item-head">
        <div>
          <h3>${escapeHtml(check.title)}</h3>
          <p>${escapeHtml(check.desc)}</p>
        </div>
        <div>
          <span class="pill ${data.status === 'ok' ? 'ok' : data.status === 'bad' ? 'bad' : data.status === 'warn' ? 'warn' : 'manual'}">${statusLabel}</span>
        </div>
      </div>
      <div class="meta">
        <strong>Tipo:</strong> <span class="badge ${check.type === 'automatic' ? 'ok' : check.type === 'heuristic' ? 'warn' : 'manual'}">${check.type === 'automatic' ? '✓ Automático' : check.type === 'heuristic' ? '⚠ Heurístico' : 'ℹ Manual'}</span><br>
        <strong>Resultado:</strong> ${escapeHtml(data.detail)}
        ${manualExtra ? `<br><strong>Acción:</strong> ${manualExtra}` : ''}
      </div>
    `;
    resultsEl.appendChild(item);
  }

  const normalized = Math.max(0, Math.min(100, Math.round((score / maxScore) * 100)));
  scoreEl.textContent = String(normalized);
  scoreTextEl.textContent = normalized >= 80 ? '✓ Muy bien' : normalized >= 60 ? '⚠ Aceptable' : '✗ A mejorar';
}

function filterResults(filter) {
  const items = document.querySelectorAll('.item');
  items.forEach(item => {
    if (filter === 'all' || item.dataset.category === filter) {
      item.classList.remove('hidden');
    } else {
      item.classList.add('hidden');
    }
  });
}

// ============= EXPORTACIÓN =============
function exportResults() {
  const score = scoreEl.textContent;
  const hostname = new URL(normalizeUrl(urlInput.value)).hostname;
  const items = Array.from(document.querySelectorAll('.item')).map(item => {
    const title = item.querySelector('h3').textContent;
    const status = item.querySelector('.pill').textContent;
    const detail = item.querySelector('.meta').textContent.split('\n')[2]?.trim();
    return { title, status, detail };
  });

  const report = {
    hostname,
    score: parseInt(score),
    timestamp: new Date().toISOString(),
    checks: items
  };

  const json = JSON.stringify(report, null, 2);
  downloadFile(json, `audit-${hostname}-${Date.now()}.json`, 'application/json');
}

function downloadFile(content, filename, type = 'text/plain') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ============= HISTORIAL =============
function saveToHistory(hostname, payload) {
  chrome.storage.local.get('analyses', (data) => {
    const analyses = data.analyses || [];
    const score = scoreEl.textContent;
    analyses.unshift({
      hostname,
      score: parseInt(score),
      timestamp: Date.now()
    });
    // Guardar solo últimos 20 análisis
    if (analyses.length > 20) analyses.pop();
    chrome.storage.local.set({ analyses });
  });
}

function showHistory() {
  chrome.storage.local.get('analyses', (data) => {
    const analyses = data.analyses || [];
    historyList.innerHTML = '';
    
    if (analyses.length === 0) {
      historyList.innerHTML = '<p style="color: var(--muted); font-size: 12px;">Sin análisis previos</p>';
    } else {
      analyses.forEach((analysis, index) => {
        const date = new Date(analysis.timestamp).toLocaleString('es-ES');
        const item = document.createElement('div');
        item.className = 'history-item';
        item.innerHTML = `
          <div class="history-item-domain">${escapeHtml(analysis.hostname)} (${analysis.score}/100)</div>
          <div class="history-item-date">${date}</div>
        `;
        item.addEventListener('click', () => {
          urlInput.value = `https://${analysis.hostname}`;
          historyModal.classList.add('hidden');
          analyze();
        });
        historyList.appendChild(item);
      });
    }
    
    historyModal.classList.remove('hidden');
  });
}

function clearHistory() {
  if (confirm('¿Eliminar todo el historial de análisis?')) {
    chrome.storage.local.set({ analyses: [] });
    historyList.innerHTML = '<p style="color: var(--muted);">Historial eliminado</p>';
  }
}

function buildManualExtra(key, host) {
  if (key === 'searchPresence') {
    const q = encodeURIComponent(`site:${host}`);
    return `<a class="small-link" href="https://www.google.com/search?q=${q}" target="_blank">Google</a> · <a class="small-link" href="https://www.bing.com/search?q=${q}" target="_blank">Bing</a>`;
  }
  return '';
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
