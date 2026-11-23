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
    fundo.querySelectorAll('img').forEach((im, k) => im.classList.toggle('ativa', k === i));
    trilha.querySelectorAll('.trilha-it').forEach((b, k) => { b.classList.remove('ativa'); b.setAttribute('aria-selected', k === i); if (k === i) { void b.offsetWidth; b.classList.add('ativa'); } });
    clearTimeout(timer);
    if (!reduzido) timer = setTimeout(() => mostrar((atual + 1) % F.length), DUR);
  }
  mostrar(4); // começa pela escola

  /* cartões */
  const lista = $('#listaFases');
  F.forEach(f => {
    const c = el('article', 'fase');
    c.dataset.periodo = f.periodo;
    c.innerHTML = `
      <div class="fase-img" data-abrir="${f.id}" role="button" tabindex="0" aria-label="Detalhes de ${esc(f.titulo)}">
        <span class="fase-n">FASE ${f.n}</span>
        <span class="fase-periodo">${icone(f.periodo)}${f.periodo}</span>
        <img src="${img(f.id, 0, true)}" srcset="${img(f.id, 0, true)} 800w, ${img(f.id, 0)} 1600w" sizes="(max-width:820px) 100vw, 620px" alt="${esc(f.titulo)}: ${esc(f.local)}" loading="lazy" decoding="async">
        <img class="alt" src="${img(f.id, 1, true)}" alt="" loading="lazy" decoding="async">
      </div>
      <div class="fase-corpo">
        <span class="fase-tema">${esc(f.tema)}</span>
        <h3>${esc(f.titulo)}</h3>
        <p class="fase-resumo">${esc(f.resumo)}</p>
        <ul class="cobre">${f.cobre.map(x => `<li>${esc(x)}</li>`).join('')}</ul>
        <div class="fase-acoes">
          <a class="btn btn-prim" href="${f.url}" target="_blank" rel="noopener">Entrar</a>
          <button class="btn btn-sec" data-abrir="${f.id}">Detalhes da fase</button>
        </div>
      </div>`;
    lista.append(c);
  });
  lista.addEventListener('click', e => { const a = e.target.closest('[data-abrir]'); if (a) abrir(a.dataset.abrir); });
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

  // link direto para uma fase: portal/#ciep
  const peloEndereco = () => { const id = location.hash.slice(1); F.some(f => f.id === id) ? abrir(id, true) : fechar(true); };
  addEventListener('popstate', peloEndereco);
  if (F.some(f => '#' + f.id === location.hash)) peloEndereco();
})();
