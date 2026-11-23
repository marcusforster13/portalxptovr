(() => {
  const F = window.FASES;
  const $ = s => document.querySelector(s);
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const img = (id, i, sm) => `img/${id}-${i}${sm ? '-sm' : ''}.webp`;
  const icone = p => p === 'Noite'
    ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="#9fb3ff"><path d="M20 14.5A8 8 0 019.5 4a8 8 0 1010.5 10.5z"/></svg>'
    : '<svg width="12" height="12" viewBox="0 0 24 24" fill="#ffc861"><circle cx="12" cy="12" r="5"/></svg>';

  /* topo */
  const topo = $('#topo');
  const rolar = () => topo.classList.toggle('rolou', scrollY > 40);
  addEventListener('scroll', rolar, { passive: true }); rolar();

  /* herói: cenários alternando */
  const fundo = $('#heroiFundo'), trilha = $('#heroiTrilha');
  const reduzido = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const DUR = 6000;
  let atual = -1, timer;
  F.forEach((f, i) => {
    const im = el('img'); im.alt = ''; im.decoding = 'async';
    im.src = innerWidth < 820 ? img(f.id, 0, true) : img(f.id, 0);
    if (i) im.loading = 'lazy';
    fundo.append(im);
    const b = el('button', 'trilha-it', `<b>${esc(f.titulo)}</b>${esc(f.tema)}`);
    b.setAttribute('role', 'tab'); b.style.setProperty('--dur', DUR + 'ms');
    b.onclick = () => mostrar(i, true);
    trilha.append(b);
  });
  function mostrar(i, manual) {
    if (i === atual) return;
    atual = i;
    const hf = $('#hudFase'), hl = $('#hudLocal');
    if (hf) { hf.textContent = `FASE ${F[i].n} · ${F[i].titulo.toUpperCase()}`; hl.textContent = F[i].local.toUpperCase(); }
    fundo.querySelectorAll('img').forEach((im, k) => im.classList.toggle('ativa', k === i));
    trilha.querySelectorAll('.trilha-it').forEach((b, k) => { b.classList.remove('ativa'); b.setAttribute('aria-selected', k === i); if (k === i) { void b.offsetWidth; b.classList.add('ativa'); } });
    clearTimeout(timer);
    if (!reduzido) timer = setTimeout(() => mostrar((atual + 1) % F.length), DUR);
  }
  mostrar(4); // começa pela escola

  /* cartões: seleção de missão */
  const lista = $('#listaFases');
  const SETA = '<svg class="seta" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  F.forEach(f => {
    const c = el('article', 'fase');
    c.dataset.periodo = f.periodo;
    c.innerHTML = `
      <div class="fase-img" data-abrir="${f.id}" role="button" tabindex="0" aria-label="Detalhes de ${esc(f.titulo)}">
        <span class="fase-n">FASE ${f.n}</span>
        <span class="fase-periodo">${icone(f.periodo)}${f.periodo.toUpperCase()}</span>
        <img class="principal" src="${img(f.id, 0, true)}" srcset="${img(f.id, 0, true)} 800w, ${img(f.id, 0)} 1600w" sizes="(max-width:900px) 100vw, 760px" alt="${esc(f.titulo)}: ${esc(f.local)}" loading="lazy" decoding="async">
        <span class="brilho"></span>
        <span class="cantos"><i></i><i></i><i></i><i></i></span>
        <div class="minis">${[0, 1, 2, 3].map(k => `<button data-foto="${k}" aria-label="Ver foto ${k + 1}"${k ? '' : ' class="ativa"'}><img src="${img(f.id, k, true)}" alt="" loading="lazy"></button>`).join('')}</div>
      </div>
      <div class="fase-corpo">
        <span class="fase-numero" aria-hidden="true">${f.n}</span>
        <span class="fase-tema">// ${esc(f.tema.toUpperCase())}</span>
        <h3>${esc(f.titulo)}</h3>
        <p class="fase-resumo">${esc(f.resumo)}</p>
        <dl class="ficha-hud"><dt>Local</dt><dd>${esc(f.local)}</dd><dt>Duração</dt><dd>${esc(f.duracao)}</dd><dt>Acesso</dt><dd>Meta Quest · navegador</dd></dl>
        <ul class="cobre">${f.cobre.map(x => `<li>${esc(x)}</li>`).join('')}</ul>
        <div class="fase-acoes">
          <a class="btn btn-prim" href="${f.url}" target="_blank" rel="noopener">Entrar na fase ${SETA}</a>
          <button class="btn btn-sec" data-abrir="${f.id}">Briefing completo</button>
        </div>
      </div>`;
    lista.append(c);
  });
  // miniaturas trocam a foto do cartão
  const trocaFoto = b => {
    const card = b.closest('.fase'), f = F.find(x => x.id === card.querySelector('[data-abrir]').dataset.abrir), k = +b.dataset.foto;
    const pr = card.querySelector('.principal');
    pr.srcset = `${img(f.id, k, true)} 800w, ${img(f.id, k)} 1600w`; pr.src = img(f.id, k, true);
    card.querySelectorAll('.minis button').forEach(x => x.classList.toggle('ativa', x === b));
  };
  lista.addEventListener('mouseover', e => { const b = e.target.closest('.minis button'); if (b) trocaFoto(b); });
  lista.addEventListener('click', e => {
    const b = e.target.closest('.minis button'); if (b) { e.stopPropagation(); trocaFoto(b); return; }
    const a = e.target.closest('[data-abrir]'); if (a) abrir(a.dataset.abrir);
  });
  // inclinação 3D e brilho que seguem o mouse
  if (matchMedia('(hover:hover)').matches && !reduzido) {
    lista.querySelectorAll('.fase-img').forEach(fi => {
      fi.addEventListener('mousemove', e => {
        const r = fi.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        fi.style.transform = `perspective(1200px) rotateY(${(x - .5) * 5}deg) rotateX(${(.5 - y) * 5}deg) scale(1.01)`;
        fi.style.setProperty('--mx', x * 100 + '%'); fi.style.setProperty('--my', y * 100 + '%');
      });
      fi.addEventListener('mouseleave', () => fi.style.transform = '');
    });
  }
  lista.addEventListener('keydown', e => { const a = e.target.closest('.fase-img'); if (a && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); abrir(a.dataset.abrir); } });

  // entrada suave dos cartões
  const obs = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(x => { if (x.isIntersecting) { x.target.classList.add('visivel'); obs.unobserve(x.target); } }), { threshold: .12 }) : null;
  lista.querySelectorAll('.fase').forEach((c, i) => { c.style.transitionDelay = (i % 2) * 90 + 'ms'; obs ? obs.observe(c) : c.classList.add('visivel'); });

  /* filtros */
  $('#filtros').addEventListener('click', e => {
    const b = e.target.closest('.filtro'); if (!b) return;
    document.querySelectorAll('.filtro').forEach(x => x.classList.toggle('ativo', x === b));
    lista.querySelectorAll('.fase').forEach(c => c.classList.toggle('oculta', b.dataset.f !== 'todas' && c.dataset.periodo !== b.dataset.f));
  });

  /* painel de detalhe */
  const painel = $('#painel');
  let fAtual = null, foto = 0, voltarFoco = null;
  const N_FOTOS = 5;
  function setFoto(i) {
    foto = (i + N_FOTOS) % N_FOTOS;
    $('#pFoto').src = img(fAtual.id, foto, innerWidth < 820);
    $('#pMinis').querySelectorAll('button').forEach((b, k) => b.classList.toggle('ativa', k === foto));
  }
  const lis = arr => arr.map(x => `<li>${esc(x)}</li>`).join('');
  function abrir(id, semHistorico) {
    const f = F.find(x => x.id === id); if (!f) return;
    fAtual = f; voltarFoco = document.activeElement;
    $('#pFase').textContent = `Fase ${f.n} · ${f.tema}`;
    $('#pTitulo').textContent = f.titulo;
    $('#pFoto').alt = `${f.titulo}: cenário do treinamento`;
    $('#pFicha').innerHTML = `<li>${icone(f.periodo)} <b>${f.periodo}</b></li><li><b>Local</b> · ${esc(f.local)}</li><li><b>Duração</b> · ${esc(f.duracao)}</li><li><b>Quest</b> e computador</li>`;
    $('#pOcorrencia').textContent = f.ocorrencia;
    $('#pEntrar').href = f.url;
    $('#pTreina').innerHTML = lis(f.treina);
    $('#pVarBloco').hidden = !f.variacoes.length;
    $('#pVar').innerHTML = lis(f.variacoes);
    $('#pModos').innerHTML = lis(f.modos);
    $('#pBase').innerHTML = lis(f.base);
    $('#pSensivel').textContent = f.sensivel;
    $('#pMinis').innerHTML = Array.from({ length: N_FOTOS }, (_, k) => `<button aria-label="Foto ${k + 1}"><img src="${img(f.id, k, true)}" alt=""></button>`).join('');
    $('#pMinis').querySelectorAll('button').forEach((b, k) => b.onclick = () => setFoto(k));
    setFoto(0);
    painel.hidden = false; document.body.classList.add('travado');
    painel.querySelector('.painel-caixa').scrollTop = 0;
    painel.querySelector('.fechar').focus();
    if (!semHistorico) history.pushState({ fase: id }, '', '#' + id);
  }
  function fechar(semHistorico) {
    if (painel.hidden) return;
    painel.hidden = true; document.body.classList.remove('travado');
    if (!semHistorico) history.pushState({}, '', '#fases');
    voltarFoco?.focus?.();
  }
  painel.addEventListener('click', e => { if (e.target.closest('[data-fechar]')) fechar(); });
  $('#galEsq').onclick = () => setFoto(foto - 1);
  $('#galDir').onclick = () => setFoto(foto + 1);
  addEventListener('keydown', e => {
    if (painel.hidden) return;
    if (e.key === 'Escape') fechar();
    if (e.key === 'ArrowLeft') setFoto(foto - 1);
    if (e.key === 'ArrowRight') setFoto(foto + 1);
    if (e.key === 'Tab') { // foco preso no painel
      const fs = [...painel.querySelectorAll('button,a[href]')].filter(x => x.offsetParent);
      if (e.shiftKey && document.activeElement === fs[0]) { e.preventDefault(); fs.at(-1).focus(); }
      else if (!e.shiftKey && document.activeElement === fs.at(-1)) { e.preventDefault(); fs[0].focus(); }
    }
  });
  // arrastar a foto no celular
  let x0 = null;
  $('#pFoto').addEventListener('touchstart', e => x0 = e.touches[0].clientX, { passive: true });
  $('#pFoto').addEventListener('touchend', e => { if (x0 == null) return; const d = e.changedTouches[0].clientX - x0; if (Math.abs(d) > 40) setFoto(foto + (d < 0 ? 1 : -1)); x0 = null; });

  $('#pCopiar').onclick = async () => {
    const b = $('#pCopiar');
    try { await navigator.clipboard.writeText(fAtual.url); b.textContent = 'Link copiado'; }
    catch { b.textContent = fAtual.url.replace('https://', ''); }
    setTimeout(() => b.textContent = 'Copiar link', 2200);
  };

  /* abertura: some quando a capa carregou (no máximo 2,2 s) */
  const capa = fundo.querySelectorAll('img')[atual];
  const liberar = () => { if (!document.body.classList.contains('carregando')) return; document.body.classList.remove('carregando'); setTimeout(() => document.body.classList.add('pronto'), 250); };
  Promise.all([new Promise(r => setTimeout(r, 1150)), capa.decode ? capa.decode().catch(() => { }) : Promise.resolve()]).then(liberar);
  setTimeout(liberar, 2200);

  /* relógio do HUD */
  const hora = $('#hudHora');
  const tique = () => { const d = new Date(); hora.textContent = d.toLocaleTimeString('pt-BR') + ' · ' + d.toLocaleDateString('pt-BR'); };
  tique(); setInterval(tique, 1000);

  /* barra de progresso da rolagem */
  const prog = $('#progresso');
  const rolagem = () => { const m = document.documentElement.scrollHeight - innerHeight; prog.style.transform = `scaleX(${m > 0 ? scrollY / m : 0})`; };
  addEventListener('scroll', rolagem, { passive: true }); rolagem();

  /* faixa com os temas */
  const termos = ['Violência doméstica', 'Lei Seca', 'Uso da força', 'Mandado de busca', 'Ameaça em escola', 'ADPF 635', 'Cadeia de custódia', 'Entrada em domicílio', 'Etilômetro', 'Crise com reféns', 'Abordagem', 'Meta Quest'];
  $('#faixa').innerHTML = [...termos, ...termos].map(t => `<span>${esc(t)}</span>`).join('');

  /* revelação ao rolar e contadores */
  document.querySelectorAll('.secao-cab,.recurso,.passos li,.controles,.filtros').forEach(x => x.classList.add('surge'));
  const obs2 = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(x => {
    if (!x.isIntersecting) return;
    x.target.classList.add('visivel'); obs2.unobserve(x.target);
    const n = x.target.querySelector('[data-conta]');
    if (n && !reduzido) { const fim = +n.dataset.conta, suf = n.dataset.suf || '', t0 = performance.now(); const passo = t => { const p = Math.min(1, (t - t0) / 1200), v = Math.round(fim * (1 - Math.pow(1 - p, 3))); n.textContent = v + suf; if (p < 1) requestAnimationFrame(passo); }; requestAnimationFrame(passo); }
  }), { threshold: .15 }) : null;
  document.querySelectorAll('.surge').forEach((x, i) => { x.style.transitionDelay = (i % 4) * 80 + 'ms'; obs2 ? obs2.observe(x) : x.classList.add('visivel'); });

  // link direto para uma fase: portal/#ciep
  const peloEndereco = () => { const id = location.hash.slice(1); F.some(f => f.id === id) ? abrir(id, true) : fechar(true); };
  addEventListener('popstate', peloEndereco);
  if (F.some(f => '#' + f.id === location.hash)) peloEndereco();
})();
