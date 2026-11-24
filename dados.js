// Cada fase do portal. Para incluir uma nova, copie um bloco, troque os textos e ponha as fotos em img/<id>-0..4.webp
window.FASES = [
  {
    id: 'casa', n: '01', titulo: 'A Casa em Silêncio', tema: 'Violência doméstica',
    url: 'https://violenciadomestica-kappa.vercel.app',
    periodo: 'Noite', local: 'Casa num condomínio do Rio de Janeiro', duracao: '15 a 25 min + debriefing',
    resumo: 'Chegada a uma casa logo depois de um episódio de violência doméstica: vítima ferida, agressor possivelmente no local e uma criança na casa. A história é contada pelos objetos.',
    ocorrencia: 'A guarnição atende um chamado num condomínio à noite. Dentro da casa, móveis revirados, marcas na parede e objetos fora do lugar reconstituem os minutos anteriores. O policial explora a cena e lê cada vestígio nos marcadores âmbar.',
    treina: [
      'Chegar e acessar o local com segurança, reconhecendo quando a entrada sem mandado é legítima (flagrante ou pedido de socorro)',
      'Controlar a cena: localizar o agressor, separar as partes e neutralizar riscos',
      'Atender a vítima sem revitimizar: socorro, escuta, proteção e informação de direitos',
      'Reconhecer, isolar e registrar vestígios sem alterar o local (cadeia de custódia)',
      'Entender que a lesão corporal em violência doméstica não depende da vontade da vítima para seguir',
      'Encaminhar para DEAM, IML, saúde, abrigo e rede de proteção, incluindo a criança'
    ],
    variacoes: [],
    modos: ['Exploração guiada por marcadores de vestígios', 'Vista da rua, da viatura, dos vizinhos e da portaria'],
    base: ['Lei 11.340/2006 (Maria da Penha), arts. 10-A e 11', 'CF art. 5º, XI', 'CPP arts. 158-A a 158-F'],
    sensivel: 'Violência doméstica contra a mulher. Ligue 180 (Central de Atendimento à Mulher) · Emergência 190.',
    cobre: ['Entrada sem mandado', 'Vestígios', 'Atendimento à vítima', 'Rede de proteção']
  },
  {
    id: 'leiseca', n: '02', titulo: 'Operação Lei Seca', tema: 'Fiscalização de trânsito',
    url: 'https://leiseca-gamma.vercel.app',
    periodo: 'Noite', local: 'Blitz numa avenida do Rio de Janeiro', duracao: '10 a 20 min por atendimento',
    resumo: 'Uma blitz completa, com tenda, etilômetro e viaturas. O agente aborda o condutor, aplica o teste e decide o encaminhamento certo.',
    ocorrencia: 'A blitz está montada: cones, tenda, mesa de equipamentos e apoio. Os carros chegam um a um. O policial faz a abordagem, confere documentos, observa sinais de alteração, conduz o teste do etilômetro e decide entre liberar, autuar ou conduzir à delegacia.',
    treina: [
      'Abordagem segura e comunicação com o condutor',
      'Conferência de documentos e do veículo',
      'Observação dos sinais de alteração da capacidade psicomotora',
      'Aplicação do teste do etilômetro e leitura do resultado',
      'Conduta na recusa ao teste',
      'Decisão: infração administrativa, crime de trânsito ou liberação'
    ],
    variacoes: ['Condutor regular, com álcool ou que recusa o teste', 'Sinais de alteração visíveis ou não', 'Com ou sem passageiro', 'Documentos em dia ou irregulares'],
    modos: ['Exploração: marcadores explicam cada parte da blitz', 'História: três atendimentos guiados', 'Treino: atendimento sorteado com objetivos e dicas', 'Avaliação: sem dicas, nota mínima 70 e nenhuma falha grave'],
    base: ['CTB arts. 165, 165-A, 276, 277 e 306', 'Resolução Contran nº 1.031/2026'],
    sensivel: '',
    cobre: ['Abordagem', 'Etilômetro', 'Recusa', 'Crime de trânsito']
  },
  {
    id: 'cassino', n: '03', titulo: 'Cassino Clandestino', tema: 'Jogo de azar e uso da força',
    url: 'https://cassino2-tan.vercel.app',
    periodo: 'Noite', local: 'Fundos de um bar no Rio de Janeiro', duracao: '15 a 25 min',
    resumo: 'Denúncia de jogo de azar nos fundos de um bar. Quando dá para entrar, como conter quem reage, o que apreender e como recusar um suborno.',
    ocorrencia: 'Uma denúncia anônima aponta jogo de azar atrás do balcão do Bar do Zé. O bar está aberto ao público; a porta "PRIVATIVO" não. Lá dentro há máquinas caça-níquel, roleta, mesa de pôquer, um escritório trancado e uma sala reservada escondida atrás de uma estante falsa no depósito.',
    treina: [
      'Chegada: rádio, apoio para cobrir os fundos e entrada com o parceiro',
      'Quando pode entrar (flagrante visível, consentimento registrado) e quando não pode (só a denúncia anônima)',
      'Contenção: anúncio, comando verbal, reação a agressão armada e fuga pelos fundos',
      'Identificação do responsável, da funcionária e dos apostadores; recusa da oferta de dinheiro',
      'Apreensão de máquinas, dinheiro, fichas, cadernos, celular, computador e gravador das câmeras',
      'Enquadramento, algemas e condução'
    ],
    variacoes: ['Indícios visíveis ou nenhum', 'Consentimento dado ou negado', 'Segurança que se rende ou reage armado', 'Apostadores que ficam ou tentam fugir', 'Oferta de suborno'],
    modos: ['Exploração', 'História: 3 ocorrências guiadas', 'Treino: objetivos e dicas', 'Avaliação: sem dicas, relatório com nota e download em JSON'],
    base: ['CF art. 5º, XI', 'Decreto-Lei 3.688/1941 (Contravenções Penais), art. 50', 'CP art. 333', 'CP arts. 23 e 25', 'Súmula Vinculante 11'],
    sensivel: 'Simula uso da força (arma de fogo e granada de efeito moral), prisão e oferta de suborno.',
    cobre: ['Entrada em local', 'Uso da força', 'Apreensão', 'Suborno']
  },
  {
    id: 'busca', n: '04', titulo: 'Busca e Apreensão', tema: 'Cumprimento de mandado',
    url: 'https://buscaapreensao.vercel.app',
    periodo: 'Dia', local: 'Apartamento 302, prédio residencial no Rio de Janeiro', duracao: '15 a 25 min',
    resumo: 'O policial militar apoia o cumprimento de um mandado num apartamento. O mandado muda a cada rodada e gavetas, armários e portas abrem de verdade.',
    ocorrencia: 'Portaria, corredor do 3º andar, o apartamento 302 completo e a sala do vizinho do 301. O policial civil é o responsável pelo mandado; o jogador, em apoio, confere o documento, propõe e faz. O mandado procura eletrônicos e documentos, e cada móvel pode esconder alguma coisa.',
    treina: [
      'Conferir o mandado: endereço, morador, motivo e horário permitido',
      'Mostrar e ler o mandado ao morador e intimá-lo a abrir',
      'Quando a porta pode ser arrombada e o que fazer se não houver ninguém em casa',
      'Busca metódica cômodo a cômodo, abrindo gavetas, armários, geladeira e forno',
      'Separar o que o mandado autoriza apreender do que não autoriza',
      'Uso proporcional da arma de fogo e da arma de choque'
    ],
    variacoes: ['Mandado diferente a cada rodada', 'Morador que colabora, resiste ou não está', 'Objetos escondidos em lugares diferentes'],
    modos: ['História: 5 cumprimentos guiados', 'Treino: objetivos e dicas', 'Avaliação: sem dicas', 'Voz sintética nos personagens'],
    base: ['CF art. 5º, XI', 'CPP arts. 243 e 245', 'Lei 13.869/2019, art. 22'],
    sensivel: '',
    cobre: ['Mandado', 'Busca domiciliar', 'Cadeia de custódia', 'Arma de choque']
  },
  {
    id: 'ciep', n: '05', titulo: 'A Mensagem', tema: 'Ameaça em escola',
    url: 'https://ciep-xi.vercel.app', monitor: true,
    periodo: 'Dia', local: 'Escola pública no estilo dos CIEPs, no Rio de Janeiro', duracao: '20 a 30 min',
    resumo: 'A direção de uma escola recebeu o print de uma suposta ameaça de ataque. O policial precisa verificar a origem, o contexto e a atualidade da mensagem antes de decidir.',
    ocorrencia: 'O policial chega com o parceiro e encontra uma funcionária preocupada, um responsável exaltado e relatos contraditórios. Print, câmeras, frequência, livro de ocorrências e a sala de operações ajudam a separar o boato da ameaça real. A escola tem pátio, quadra, refeitório, salas de aula e alunos de uniforme.',
    treina: [
      'Chegada: rádio, portaria e redução de tensão com o responsável exaltado (que pode filmar)',
      'Verificação: print (data, remetente, detalhes concretos), câmeras, frequência, livro de ocorrências e consulta à central',
      'Contato com o adolescente: abordagem calma, conversa reservada com a direção e a família, sem expor',
      'Ameaça ativa (numa das variações): comunicação, abrigamento, ordem verbal e força proporcional',
      'Missão Sala 201: crise com reféns na sala de aula',
      'Decisão compatível com os fatos verificados, registro e orientação à escola'
    ],
    variacoes: ['Mensagem antiga que voltou a circular', 'Aluno que escreveu como "brincadeira"', 'Aluno em sofrimento, alvo de intimidação', 'Ameaça real'],
    modos: ['Exploração', 'História: 4 ocorrências guiadas', 'Treino: objetivos e dicas', 'Avaliação: sem dicas', 'Treino de ameaça ativa e Missão Sala 201'],
    base: ['ECA', 'CF art. 227', 'CP arts. 147, 23 e 25', 'CPP art. 244', 'Lei 13.060/2014', 'Súmula Vinculante 11'],
    sensivel: 'Ameaça em escola e uso da força, sem cenas de violência contra crianças: os alunos ficam abrigados, fora de cena. Situação fictícia; pessoas e mensagens inventadas.',
    cobre: ['Verificação de ameaça', 'Mediação', 'Proteção de alunos', 'Crise com reféns']
  },
  {
    id: 'favela', n: '06', titulo: 'Favela', tema: 'Operação em comunidade',
    url: 'https://favelavr.vercel.app',
    periodo: 'Dia', local: 'Comunidade na encosta, junto ao mar', duracao: '20 a 30 min',
    resumo: 'Uma favela inteira modelada à mão, com escadarias, becos e lajes. Uma denúncia sorteada leva a guarnição morro acima, e o caminho também avalia.',
    ocorrencia: 'A guarnição desce da viatura na entrada da comunidade, junto ao mar, e recebe uma denúncia do Disque-Denúncia. O destino fica longe e no alto: o policial sobe por escadarias e becos, onde podem aparecer um olheiro com rádio, moradores com compras ou uma criança jogando bola.',
    treina: [
      'Deslocamento seguro por escadarias e becos, com comunicação à central',
      'Tratar moradores como moradores: cumprimentar, pedir passagem, sem abordagem sem fundada suspeita',
      'Proteger crianças e nunca seguir em linha de tiro com elas por perto',
      'Entrada em casa: flagrante visível, consentimento ou mandado; denúncia anônima sozinha não basta',
      'Resposta proporcional se o suspeito se render, fugir ou atirar',
      'Apreensão com cadeia de custódia, sem mexer no celular sem ordem judicial'
    ],
    variacoes: ['Missão 1 · Depósito', 'Missão 2 · Residência', 'Missão 3 · Bar da praça', 'Missão 4 · Oficina', 'Eventos do caminho sorteados'],
    modos: ['Exploração', 'História', 'Treino: dicas do instrutor', 'Avaliação: nota de 0 a 100 e base legal'],
    base: ['ADPF 635 (STF)', 'CF art. 5º, XI', 'CPP arts. 158-A a 158-F e 244', 'Lei 11.343/2006, art. 33', 'Súmula Vinculante 11'],
    sensivel: 'Confronto armado sorteado. Crianças aparecem só como moradores a proteger, sempre fora da linha de tiro. Sem logotipos, facções ou nomes reais.',
    cobre: ['Patrulha a pé', 'ADPF 635', 'Entrada em domicílio', 'Confronto']
  }
];
