# Portal XPTO VR

Portal dos treinamentos policiais em realidade virtual: uma página com as seis fases, o que cada uma cobre e o link para entrar.

| Fase | Treinamento | Site |
|---|---|---|
| 01 | A Casa em Silêncio (violência doméstica) | https://violenciadomestica-kappa.vercel.app |
| 02 | Operação Lei Seca | https://leiseca-gamma.vercel.app |
| 03 | Cassino Clandestino | https://cassino2-tan.vercel.app |
| 04 | Busca e Apreensão | https://buscaapreensao.vercel.app |
| 05 | A Mensagem (ameaça em escola, CIEP) | https://ciep-xi.vercel.app |
| 06 | Favela | https://favelavr.vercel.app |

## Arquivos

- `index.html`, `estilo.css`, `portal.js`: o site (HTML puro, sem build).
- `dados.js`: **textos de cada fase** (título, resumo, o que treina, variações, modos, base legal, link). Para mudar um texto ou incluir uma fase nova, é só aqui.
- `img/<fase>-0..4.webp`: 5 fotos por fase (a `-0` é a capa); `-sm` é a versão menor para celular. Capturadas dos próprios sites em 1920×1080.

- `video/<fase>.mp4` (720p) e `<fase>-sm.mp4` (360p, celular): clipes de 8 s gravados nos próprios sites com Chrome headless; `<fase>-capa.webp` é o primeiro quadro. Passam no fundo da tela inicial e tocam no cartão ao passar o mouse.

Link direto para uma fase: `/#casa`, `/#leiseca`, `/#cassino`, `/#busca`, `/#ciep`, `/#favela`.

Publicado no Vercel a cada push na `main`.
