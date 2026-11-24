// Teste pré-aula: confere rede e aparelho antes da aula. Não muda nada nos treinamentos e não envia dados.
(() => {
  const $ = s => document.querySelector(s);
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const ua = navigator.userAgent;
  const QUEST = /OculusBrowser|Quest/i.test(ua);
  const CELULAR = !QUEST && /Android|iPhone|iPad/i.test(ua);
  const APARELHO = QUEST ? 'Meta Quest' : CELULAR ? 'Celular ou tablet' : 'Computador';
  $('#aparelho').textContent = 'Este aparelho: ' + APARELHO;

  const comLimite = (p, ms) => Promise.race([p, new Promise((_, r) => setTimeout(() => r(new Error('tempo esgotado')), ms))]);
  const busca = (url, op = {}, ms = 12000) => comLimite(fetch(url, { cache: 'no-store', ...op }), ms);

  /* ---------- os testes ---------- */
  const TESTES = [
    {
      id: 'internet', titulo: 'Velocidade da internet', texto: 'Baixa um arquivo pequeno do portal e mede a velocidade.',
      async rodar() {
        const t0 = performance.now(); const r = await busca('video/ciep.mp4?t=' + Date.now(), {}, 30000);
        const b = (await r.arrayBuffer()).byteLength, s = (performance.now() - t0) / 1000, mbps = b * 8 / s / 1e6;
        const minFase = Math.max(1, Math.round(130 * 8 / mbps / 60));
        const val = mbps.toFixed(0) + ' Mbps';
        if (mbps >= 20) return { s: 'ok', val, p: `Uma fase completa leva cerca de ${minFase} min para carregar na primeira vez.` };
        if (mbps >= 5) return { s: 'aviso', val, p: `Funciona, mas cada fase leva cerca de ${minFase} min para carregar na primeira vez.`, dica: 'Abra as fases nos óculos antes da aula começar: depois da primeira vez, elas ficam guardadas e abrem rápido.' };
        return { s: 'falha', val, p: 'Conexão muito lenta para carregar os cenários durante a aula.', dica: 'Use outra rede (ou o roteador mais perto) e abra as fases com bastante antecedência.' };
      }
    },
    {
      id: 'motor', titulo: 'Motor 3D dos treinamentos (jsdelivr)', texto: 'Os treinamentos baixam o motor 3D deste site. Se ele estiver bloqueado, nenhum treino abre.',
      async rodar() {
        const t0 = performance.now(); const r = await busca('https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.min.js', {}, 15000);
        if (!r.ok) throw new Error('resposta ' + r.status); await r.arrayBuffer();
        return { s: 'ok', val: Math.round(performance.now() - t0) + ' ms', p: 'O site do motor 3D abre nesta rede.' };
      },
      falhou: () => ({ s: 'falha', p: 'Esta rede bloqueia o site do motor 3D (cdn.jsdelivr.net).', dica: 'Peça ao responsável pela rede para liberar cdn.jsdelivr.net. Se não for possível, avise: dá para colocar o motor dentro dos próprios sites.' })
    },
    ...((window.FASES || []).map(f => ({
      id: 'fase_' + f.id, titulo: `Fase ${f.n} · ${f.titulo}`, texto: f.url.replace('https://', ''),
      async rodar() {
        const t0 = performance.now(); await busca(f.url + '/?teste=' + Date.now(), { mode: 'no-cors' }, 12000);
        return { s: 'ok', val: Math.round(performance.now() - t0) + ' ms', p: 'O site da fase abre nesta rede.' };
      },
      falhou: () => ({ s: 'falha', p: 'O site desta fase não abriu nesta rede.', dica: 'Peça ao responsável pela rede para liberar os endereços terminados em vercel.app.' })
    }))),
    {
      id: 'graficos', titulo: 'Gráficos 3D do aparelho', texto: 'Confere se o navegador consegue desenhar os cenários.',
      async rodar() {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return { s: 'falha', p: 'O navegador não tem gráficos 3D (WebGL 2) ligados.', dica: 'Atualize o navegador ou use Chrome/Edge no computador.' };
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const gpu = ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : 'disponível';
        return { s: 'ok', val: '', p: 'Gráficos 3D funcionando · ' + String(gpu).replace(/^ANGLE \(|\)$/g, '').slice(0, 70) };
      }
    },
    {
      id: 'vr', titulo: 'Realidade virtual', texto: 'Confere se o aparelho consegue entrar em VR.',
      async rodar() {
        const sim = !!(navigator.xr && await comLimite(navigator.xr.isSessionSupported('immersive-vr'), 5000).catch(() => false));
        if (sim) return { s: 'ok', p: 'Este aparelho entra em realidade virtual.' };
        if (QUEST) return { s: 'falha', p: 'O navegador do Quest não liberou a realidade virtual.', dica: 'Use o app Navegador (Browser) do Quest, atualizado, e abra o portal por ele.' };
        return { s: 'info', p: `${APARELHO}: sem VR, o que é normal. O treino funciona com teclado e mouse, e a estação do instrutor não precisa de VR.` };
      }
    },
    {
      id: 'servidor', titulo: 'Monitoramento: servidor de conexão', texto: 'O monitoramento usa um serviço gratuito (PeerJS) para apresentar o óculos ao computador do instrutor.',
      async rodar() {
        await carregarPeer();
        const t0 = performance.now();
        const id = 'xptovr-teste-' + Math.random().toString(36).slice(2, 10);
        const a = new Peer(id, { debug: 0 }), b = new Peer({ debug: 0 });
        try {
          await comLimite(Promise.all([abriu(a), abriu(b)]), 12000);
          const rtt = await comLimite(new Promise((res, rej) => {
            a.on('connection', c => c.on('data', d => c.send(d)));
            const c = b.connect(id, { reliable: true });
            c.on('open', () => { const t = performance.now(); c.on('data', () => res(performance.now() - t)); c.send('ping'); });
            c.on('error', rej); b.on('error', rej);
          }), 15000);
          return { s: 'ok', val: Math.round(performance.now() - t0) + ' ms', p: `O serviço de conexão respondeu e a conexão abriu (ida e volta: ${Math.round(rtt)} ms).` };
        } finally { a.destroy(); b.destroy(); }
      },
      falhou: () => ({ s: 'aviso', p: 'Não foi possível falar com o serviço de conexão do monitoramento.', dica: 'O treino funciona normalmente; só o monitoramento do instrutor não vai conectar nesta rede. Peça para liberar 0.peerjs.com.' })
    },
    {
      id: 'direta', titulo: 'Monitoramento: conexão direta entre aparelhos', texto: 'Confere se a rede deixa o óculos e o computador conversarem diretamente.',
      async rodar() {
        const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
        const tipos = new Set();
        try {
          pc.createDataChannel('teste');
          const fim = new Promise(res => { pc.onicecandidate = e => { if (!e.candidate) return res(); const m = / typ (\w+)/.exec(e.candidate.candidate); if (m) tipos.add(m[1]); }; pc.onicegatheringstatechange = () => pc.iceGatheringState === 'complete' && res(); });
          await pc.setLocalDescription(await pc.createOffer());
          await comLimite(fim, 6000).catch(() => { });
        } finally { pc.close(); }
        if (tipos.has('srflx')) return { s: 'ok', p: 'A rede permite a conexão direta usada pelo monitoramento.' };
        if (tipos.size) return { s: 'aviso', p: 'A rede parece bloquear conexões diretas para fora (só endereço local).', dica: 'Se o óculos e o computador estiverem na MESMA rede Wi-Fi, ainda pode funcionar. Confirme fazendo um monitoramento de teste com o código. Se não conectar, é preciso um servidor de retransmissão.' };
        return { s: 'aviso', p: 'Não foi possível testar a conexão direta neste navegador.', dica: 'Confirme fazendo um monitoramento de teste com o código.' };
      }
    }
  ];

  function carregarPeer() {
    if (window.Peer) return Promise.resolve();
    return comLimite(new Promise((res, rej) => { const s = document.createElement('script'); s.src = 'https://cdn.jsdelivr.net/npm/peerjs@1.5.4/dist/peerjs.min.js'; s.onload = res; s.onerror = () => rej(new Error('não carregou')); document.head.append(s); }), 15000);
  }
  const abriu = p => new Promise((res, rej) => { p.on('open', res); p.on('error', rej); });

  /* ---------- tela ---------- */
  const lista = $('#lista');
  const resultados = {};
  function desenhar() {
    lista.innerHTML = TESTES.map(t => {
      const r = resultados[t.id] || { s: 'espera' };
      const ic = { ok: '✓', aviso: '!', falha: '✕', info: 'i' }[r.s] || '';
      return `<li class="t-item e-${r.s}"><span class="t-ic" aria-hidden="true">${ic}</span><div><h3>${esc(t.titulo)}</h3><p>${esc(r.p || t.texto)}</p>${r.dica ? `<p class="t-dica">${esc(r.dica)}</p>` : ''}</div><span class="t-val">${esc(r.val || '')}</span></li>`;
    }).join('');
  }
  desenhar();

  async function rodarTudo() {
    $('#iniciar').disabled = true; $('#iniciar').textContent = 'Testando…'; $('#acoes').hidden = true;
    for (const k of Object.keys(resultados)) delete resultados[k];
    const rs = $('#resumo'); rs.hidden = false; rs.className = 't-resumo e-rodando'; $('#selo').textContent = '';
    $('#resumoTitulo').textContent = 'Testando…'; $('#resumoTexto').textContent = 'Leva menos de um minuto.';
    desenhar();
    const um = async t => {
      resultados[t.id] = { s: 'rodando' }; desenhar();
      try { resultados[t.id] = await t.rodar(); }
      catch (e) { resultados[t.id] = t.falhou ? t.falhou(e) : { s: 'falha', p: 'Não funcionou: ' + e.message }; }
      desenhar();
    };
    // velocidade primeiro (sozinha, para medir direito); depois os sites em paralelo; por fim o resto
    await um(TESTES[0]);
    await Promise.all(TESTES.filter(t => t.id === 'motor' || t.id.startsWith('fase_')).map(um));
    for (const t of TESTES.filter(t => ['graficos', 'vr', 'servidor', 'direta'].includes(t.id))) await um(t);
    resumir();
    $('#iniciar').disabled = false; $('#iniciar').textContent = '▶ Iniciar teste'; $('#acoes').hidden = false;
  }
  function resumir() {
    const ss = Object.values(resultados).map(r => r.s);
    const rs = $('#resumo');
    if (ss.includes('falha')) { rs.className = 't-resumo e-falha'; $('#selo').textContent = '✕'; $('#resumoTitulo').textContent = 'Há um problema que impede a aula'; $('#resumoTexto').textContent = 'Veja os itens em vermelho abaixo e o que fazer em cada um.'; }
    else if (ss.includes('aviso')) { rs.className = 't-resumo e-aviso'; $('#selo').textContent = '!'; $('#resumoTitulo').textContent = 'Dá para treinar, com atenção'; $('#resumoTexto').textContent = 'Os treinos abrem. Veja os itens em amarelo antes da aula.'; }
    else { rs.className = 't-resumo e-ok'; $('#selo').textContent = '✓'; $('#resumoTitulo').textContent = 'Tudo pronto para a aula'; $('#resumoTexto').textContent = `Rede e aparelho (${APARELHO}) passaram em todos os testes.`; }
  }
  $('#iniciar').onclick = rodarTudo;
  $('#repetir').onclick = rodarTudo;
  $('#copiar').onclick = async () => {
    const txt = [`Teste pré-aula XPTO VR · ${new Date().toLocaleString('pt-BR')} · ${APARELHO}`, $('#resumoTitulo').textContent,
      ...TESTES.map(t => { const r = resultados[t.id] || {}; return `${{ ok: '[OK]', aviso: '[ATENÇÃO]', falha: '[FALHA]', info: '[INFO]' }[r.s] || '[ - ]'} ${t.titulo}${r.val ? ' (' + r.val + ')' : ''}: ${r.p || ''}`; })].join('\n');
    try { await navigator.clipboard.writeText(txt); $('#copiar').textContent = 'Copiado'; } catch { $('#copiar').textContent = 'Não foi possível copiar'; }
    setTimeout(() => $('#copiar').textContent = 'Copiar resultado', 2000);
  };
})();
