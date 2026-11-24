// Estação do instrutor: conecta direto ao óculos (PeerJS/WebRTC), mostra a visão do aluno e o estado do treino.
(() => {
  const $ = s => document.querySelector(s);
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const fmt = s => { s = Math.max(0, s || 0); return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`; };
  const NOMES_FASE = { casa: 'Fase 01 · A Casa em Silêncio', leiseca: 'Fase 02 · Operação Lei Seca', cassino: 'Fase 03 · Cassino Clandestino', busca: 'Fase 04 · Busca e Apreensão', ciep: 'Fase 05 · A Mensagem', favela: 'Fase 06 · Favela' };

  let peer = null, conn = null, codigo = '', info = null, est = null, tAtual = 0, tRelogio = 0, origemEsp = '*', iframePronto = false;
  const trajeto = [], notas = [], mensagens = [], linhaLocal = [];
  let npcs = [], pose = null;

  const status = (txt, cls) => { const s = $('#status'); s.className = 'e-status ' + (cls || ''); s.querySelector('span').textContent = txt; };

  /* ---------- conexão ---------- */
  const q = new URLSearchParams(location.search);
  if (q.get('codigo')) $('#codigo').value = q.get('codigo').replace(/\D/g, '').slice(0, 5);
  $('#codigo').addEventListener('input', e => e.target.value = e.target.value.replace(/\D/g, '').slice(0, 5));
  $('#formCodigo').addEventListener('submit', e => { e.preventDefault(); conectar($('#codigo').value); });

  function conectar(c) {
    codigo = c; $('#erro').textContent = '';
    status('Conectando…', 'espera');
    if (!peer || peer.destroyed) {
      peer = new Peer({ debug: 0 });
      peer.on('error', er => {
        if (er.type === 'peer-unavailable') { status('Desconectado'); $('#erro').textContent = 'Nenhum óculos com esse código. Confira o número que aparece no topo da tela do aluno.'; }
        else if (er.type === 'network' || er.type === 'server-error') $('#erro').textContent = 'Sem conexão com o serviço. Verifique a internet deste computador.';
      });
    }
    const abrir = () => {
      conn = peer.connect('xptovr-' + codigo, { reliable: true });
      const limite = setTimeout(() => { if (!conn.open) { status('Desconectado'); $('#erro').textContent ||= 'O óculos não respondeu. Confira o código e se o aluno abriu a fase com monitoramento.'; } }, 15000);
      conn.on('open', () => { clearTimeout(limite); status('Ao vivo · ' + codigo, 'ok'); });
      conn.on('data', receber);
      conn.on('close', () => { status('Conexão perdida · tentando de novo', 'espera'); setTimeout(() => { if (codigo && (!conn || !conn.open)) abrir(); }, 3000); });
    };
    peer.open ? abrir() : peer.once('open', abrir);
  }
  $('#sair').onclick = () => { codigo = ''; conn?.close(); peer?.destroy(); location.href = 'monitor.html'; };

  /* ---------- espectador (iframe com o próprio site do treino) ---------- */
  const ifr = $('#espectador');
  addEventListener('message', ev => {
    if (ev.source !== ifr.contentWindow) return;
    if (ev.data?.tipo === 'espectador-pronto') { iframePronto = true; setTimeout(() => $('#vistaCarregando').classList.add('some'), 1200); mandarVista(); }
  });
  const paraIframe = m => { if (iframePronto) ifr.contentWindow?.postMessage(m, origemEsp); };
  let vista = 'aluno';
  const mandarVista = () => paraIframe({ tipo: 'vista', vista });
  document.querySelectorAll('.vb').forEach(b => b.onclick = () => { vista = b.dataset.vista; document.querySelectorAll('.vb').forEach(x => x.classList.toggle('ativo', x === b)); mandarVista(); });

  /* ---------- dados do óculos ---------- */
  function receber(m) {
    if (!m || typeof m !== 'object') return;
    switch (m.tipo) {
      case 'ola': {
        const novo = !info || info.url !== m.url; info = m;
        $('#telaConectar').hidden = true; $('#telaEstacao').hidden = false; $('#sair').hidden = false;
        $('#sFase').textContent = NOMES_FASE[m.fase] || m.titulo || 'Treinamento';
        document.title = `${NOMES_FASE[m.fase] || 'Treino'} · Estação do instrutor`;
        if (novo) {
          const u = new URL(m.url); if (!/^https:$/.test(u.protocol) && !/^(localhost|127\.0\.0\.1)$/.test(u.hostname)) return;
          origemEsp = u.origin; u.searchParams.set('espectador', '1'); iframePronto = false;
          $('#vistaCarregando').classList.remove('some'); ifr.src = u.href;
        }
        montarObjetivos(); montarControles();
        break;
      }
      case 'pose':
        pose = m; paraIframe(m);
        $('#hudVR').textContent = m.vr ? 'NO ÓCULOS (VR)' : 'NAVEGADOR'; $('#hudArma').hidden = !m.arma;
        { const u = trajeto[trajeto.length - 1]; if (!u || Math.hypot(u[0] - m.p[0], u[1] - m.p[2]) > .35) { trajeto.push([m.p[0], m.p[2]]); if (trajeto.length > 4000) trajeto.shift(); } }
        break;
      case 'npcs': npcs = m.lista || []; paraIframe(m); break;
      case 'relogio': if (m.t != null) { tAtual = m.t; tRelogio = m.pausado ? 0 : performance.now(); } else if (!m.ativo) tRelogio = 0; controlesEstado(m); break;
      case 'estado': est = m; tAtual = m.t; tRelogio = m.ativo && !m.pausado ? performance.now() : 0; desenharEstado(); controlesEstado(m); break;
    }
  }

  /* ---------- painel ---------- */
  const nomeVar = (k, v) => info?.nomesVar?.[k]?.[v] || v;
  function montarObjetivos() {
    const grupos = {};
    for (const [id, a] of Object.entries(info?.catalogo || {})) if (a.tipo === 'acao') (grupos[a.fase] ||= []).push([id, a]);
    $('#sObj').innerHTML = Object.entries(grupos).map(([f, itens]) => `<h3>${esc(f)}</h3><ul>${itens.map(([id, a]) => `<li data-id="${esc(id)}">${esc(a.texto)}</li>`).join('')}</ul>`).join('') || '<p class="vazio">Sem lista de objetivos.</p>';
    desenharEstado();
  }
  function desenharEstado() {
    if (!est) return;
    $('#sModo').textContent = { historia: 'História (guiado)', treino: 'Treino (com dicas)', avaliacao: 'Avaliação (sem dicas)', exploracao: 'Exploração' }[est.modo] || est.modo || '—';
    $('#sOcorr').textContent = est.ocorrencia ? `${est.ocorrencia.n ? est.ocorrencia.n + 'ª · ' : ''}${est.ocorrencia.titulo || ''}` : (est.ativo ? 'em andamento' : 'aguardando início');
    const vars = Object.entries(est.variacao || {});
    $('#sVar').innerHTML = vars.length ? vars.map(([k, v]) => `<li><b>${esc(k)}</b>${esc(nomeVar(k, v))}</li>`).join('') : '<li class="vazio">definida quando o treino começa</li>';
    const feitos = new Map(est.feitos || []);
    let pts = 0; for (const id of feitos.keys()) pts += info?.catalogo?.[id]?.pontos || 0;
    $('#pAcertos').textContent = feitos.size;
    $('#pDesc').textContent = [...est.erros, ...est.graves].reduce((s, e) => s + (e.pontos || 0), 0);
    $('#pGraves').textContent = est.graves.length;
    document.querySelectorAll('#sObj li').forEach(li => li.classList.toggle('ok', feitos.has(li.dataset.id)));
    const erros = [...est.graves.map(g => ({ ...g, grave: true })), ...est.erros].sort((a, b) => b.t - a.t);
    $('#sErros').innerHTML = erros.length ? erros.map(e => `<li class="${e.grave ? 'grave' : ''}">${e.grave ? '⚠ ' : ''}${esc(e.texto)}<small>${fmt(e.t)} · ${e.pontos} pts${e.base ? ' · ' + esc(e.base) : ''}</small></li>`).join('') : '<li class="vazio">nenhum até agora</li>';
    const fatos = est.ocorrencia?.fatos || [];
    $('#sFatos').innerHTML = fatos.length ? fatos.map(f => `<li>${esc(f)}</li>`).join('') : '<li class="vazio">nenhum ainda</li>';
    const r = est.relatorio;
    if (r) { const f = $('#final'); f.hidden = false; f.className = 'final ' + (r.aprovado ? 'aprovado' : 'reprovado'); f.innerHTML = `<b>${r.nota}/100</b>${r.aprovado ? 'Aprovado' : 'Não aprovado'} · ${esc(r.tempo)}`; }
    desenharLinha();
  }
  function desenharLinha() {
    const itens = (est?.log || []).map(l => { const a = info?.catalogo?.[l.id] || {}, e = [...(est.erros || []), ...(est.graves || [])].find(x => x.id === l.id); return { t: l.t, texto: a.texto || e?.texto || l.id, cls: a.tipo === 'grave' ? 'grave' : a.tipo === 'erro' ? 'erro' : '' }; });
    const tudo = [...itens, ...linhaLocal].sort((a, b) => b.t - a.t);
    $('#linha').innerHTML = tudo.length ? tudo.map(i => `<li class="${i.cls}"><time>${fmt(i.t)}</time><span>${esc(i.texto)}</span></li>`).join('') : '<li class="vazio">Os acontecimentos aparecem aqui assim que o treino começa.</li>';
  }
  const tempoTreino = () => tRelogio ? tAtual + (performance.now() - tRelogio) / 1000 : tAtual;
  setInterval(() => { $('#sTempo').textContent = fmt(tempoTreino()); }, 250);

  /* ---------- mensagens e anotações ---------- */
  const RAPIDAS = ['Comunique a central pelo rádio.', 'Observe as mãos das pessoas.', 'Mantenha distância segura.', 'Fale com calma e reduza a tensão.', 'Confirme as informações antes de decidir.'];
  $('#rapidas').innerHTML = RAPIDAS.map(t => `<button type="button">${esc(t)}</button>`).join('');
  $('#rapidas').onclick = e => { const b = e.target.closest('button'); if (b) enviarMsg(b.textContent); };
  $('#formMsg').addEventListener('submit', e => { e.preventDefault(); const v = $('#msg').value.trim(); if (v) { enviarMsg(v); $('#msg').value = ''; } });
  let como = 'instrutor';
  document.querySelectorAll('.como button').forEach(b => b.onclick = () => { como = b.dataset.como; document.querySelectorAll('.como button').forEach(x => x.classList.toggle('ativo', x === b)); });
  function enviarMsg(texto) {
    if (!conn?.open) return;
    conn.send({ tipo: 'mensagem', texto, como });
    const t = tempoTreino(); mensagens.push({ t, texto, como }); marcar((como === 'central' ? 'Central (rádio): ' : 'Instrutor: ') + texto);
  }
  const marcar = texto => { linhaLocal.push({ t: tempoTreino(), texto, cls: 'instrutor' }); desenharLinha(); };

  /* ---------- controles do instrutor ---------- */
  const cmd = m => conn?.open && conn.send({ tipo: 'comando', ...m });
  let ctl = { ativo: false, pausado: false }, ultEventos = '';
  function montarControles() {
    $('#cModo').innerHTML = (info.modos || []).map(([k, n]) => `<option value="${esc(k)}"${k === 'treino' ? ' selected' : ''}>${esc(n)}</option>`).join('');
    $('#cVars').innerHTML = Object.entries(info.variacoes || {}).map(([k, ops]) => `<label>${esc(k)}<select data-var="${esc(k)}"><option value="">Sortear</option>${ops.map(o => `<option value="${esc(o)}">${esc(nomeVar(k, o))}</option>`).join('')}</select></label>`).join('');
    $('#controles').hidden = !(info.modos || []).length;
  }
  $('#cIniciar').onclick = () => {
    const variacao = {}; document.querySelectorAll('#cVars select').forEach(s => { if (s.value) variacao[s.dataset.var] = s.value; });
    cmd({ acao: 'iniciar', modo: $('#cModo').value, variacao });
    marcar(`Instrutor iniciou o treino (${$('#cModo').selectedOptions[0]?.textContent || ''}${Object.keys(variacao).length ? ', variação escolhida' : ', variação sorteada'}).`);
  };
  $('#cPausa').onclick = () => { cmd({ acao: ctl.pausado ? 'retomar' : 'pausar' }); marcar(ctl.pausado ? 'Instrutor retomou o treino.' : 'Instrutor pausou o treino.'); };
  $('#cEncerrar').onclick = () => { if (confirm('Encerrar o treino agora? O óculos mostra o relatório final ao aluno.')) { cmd({ acao: 'encerrar' }); marcar('Instrutor encerrou o treino.'); } };
  $('#cEventos').onclick = e => {
    const b = e.target.closest('button[data-ev]'); if (!b || b.disabled) return;
    if (b.dataset.ev === 'disparos' && !confirm('Antecipar a ameaça? Os disparos acontecem agora no corredor.')) return;
    cmd({ acao: 'evento', id: b.dataset.ev }); marcar('Instrutor disparou o evento: ' + b.querySelector('b').textContent + '.');
  };
  function controlesEstado(m) {
    ctl = { ativo: !!m.ativo, pausado: !!m.pausado };
    $('#ctlInicio').hidden = ctl.ativo; $('#ctlAtivo').hidden = !ctl.ativo;
    const bp = $('#cPausa'); bp.textContent = ctl.pausado ? '▶ Retomar' : '⏸ Pausar'; bp.classList.toggle('pausado', ctl.pausado);
    $('#hudPausa').hidden = !ctl.pausado; $('#vistaPausa').hidden = !ctl.pausado;
    const chave = JSON.stringify(m.eventos || null); if (m.eventos && chave !== ultEventos) ultEventos = chave, $('#cEventos').innerHTML = m.eventos.map(ev => `<button type="button" data-ev="${esc(ev.id)}"${ev.ok ? '' : ' disabled'}><b>${esc(ev.label)}</b>${!ev.ok && ev.so ? `<small>${esc(ev.so)}</small>` : ''}</button>`).join('');
  }
  $('#formNota').addEventListener('submit', e => {
    e.preventDefault(); const v = $('#nota').value.trim(); if (!v) return;
    const t = tempoTreino(); notas.push({ t, texto: v }); $('#nota').value = '';
    $('#notas').innerHTML = notas.map(n => `<li><time>${fmt(n.t)}</time>${esc(n.texto)}</li>`).join('');
  });
  $('#baixar').onclick = () => {
    const dados = { fase: info?.fase, codigo, exportado: new Date().toISOString(), estado: est, relatorio: est?.relatorio || null, notas_do_instrutor: notas, mensagens_enviadas: mensagens, acoes_do_instrutor: linhaLocal, trajeto };
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' }));
    a.download = `sessao_${info?.fase || 'treino'}_${new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-')}.json`; a.click();
  };

  /* ---------- mapa ---------- */
  const cv = $('#mapa'), g = cv.getContext('2d');
  function desenharMapa() {
    requestAnimationFrame(desenharMapa);
    const W = cv.width, Hh = cv.height; g.clearRect(0, 0, W, Hh);
    const pts = [...trajeto, ...npcs.map(n => [n.p[0], n.p[2]])]; if (pose) pts.push([pose.p[0], pose.p[2]]);
    if (!pts.length) { g.fillStyle = '#56607a'; g.font = '14px Inter'; g.textAlign = 'center'; g.fillText('aguardando posição do aluno', W / 2, Hh / 2); return; }
    let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity;
    for (const [x, z] of pts) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); z0 = Math.min(z0, z); z1 = Math.max(z1, z); }
    const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, esc_ = Math.min(W / Math.max(16, x1 - x0 + 8), Hh / Math.max(12, z1 - z0 + 8));
    const P = (x, z) => [W / 2 + (x - cx) * esc_, Hh / 2 + (z - cz) * esc_];
    g.strokeStyle = 'rgba(255,255,255,.05)'; g.lineWidth = 1;
    const passo = 5 * esc_; for (let x = (W / 2 - cx * esc_) % passo; x < W; x += passo) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, Hh); g.stroke(); }
    for (let y = (Hh / 2 - cz * esc_) % passo; y < Hh; y += passo) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
    if (trajeto.length > 1) { g.strokeStyle = 'rgba(0,212,230,.35)'; g.lineWidth = 2; g.beginPath(); trajeto.forEach(([x, z], i) => { const [a, b] = P(x, z); i ? g.lineTo(a, b) : g.moveTo(a, b); }); g.stroke(); }
    g.font = '11px Inter'; g.textAlign = 'center';
    for (const n of npcs) { const [a, b] = P(n.p[0], n.p[2]); g.fillStyle = '#ffb547'; g.beginPath(); g.arc(a, b, 4.5, 0, 7); g.fill(); g.fillStyle = 'rgba(255,217,160,.8)'; g.fillText(n.nome || '', a, b - 9); }
    if (pose) {
      const [a, b] = P(pose.p[0], pose.p[2]); const [qx, qy, qz, qw] = pose.q;
      const yaw = Math.atan2(2 * (qw * qy + qx * qz), 1 - 2 * (qy * qy + qx * qx));
      g.save(); g.translate(a, b); g.rotate(-yaw);
      g.fillStyle = 'rgba(0,212,230,.18)'; g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, 34, -Math.PI / 2 - .55, -Math.PI / 2 + .55); g.closePath(); g.fill();
      g.fillStyle = '#00d4e6'; g.shadowColor = '#00d4e6'; g.shadowBlur = 12; g.beginPath(); g.moveTo(0, -9); g.lineTo(6, 6); g.lineTo(0, 3); g.lineTo(-6, 6); g.closePath(); g.fill();
      g.restore();
    }
  }
  desenharMapa();
})();
