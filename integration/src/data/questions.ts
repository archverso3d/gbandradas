import { Question, Module, Belt } from '../types';

export const QUESTIONS: Question[] = [
  // BASICS
  {
    id: 'b1',
    text: 'Qual o tempo de luta para a categoria Adulto Faixa Preta?',
    options: ['6 minutos', '8 minutos', '10 minutos', '12 minutos'],
    correctAnswer: 2,
    explanation: 'De acordo com a IBJJF, lutas de faixa preta adulto duram 10 minutos.',
    module: Module.BASICS,
    belts: [Belt.BLACK]
  },
  {
    id: 'b2',
    text: 'Qual o tempo de luta para a categoria Adulto Faixa Azul?',
    options: ['5 minutos', '6 minutos', '7 minutos', '8 minutos'],
    correctAnswer: 1,
    explanation: 'Lutas de faixa azul adulto duram 6 minutos.',
    module: Module.BASICS,
    belts: [Belt.BLUE, Belt.PURPLE, Belt.BROWN, Belt.BLACK]
  },
  {
    id: 'b3',
    text: 'Em caso de empate em pontos e vantagens ao final da luta, qual o critério de desempate?',
    options: ['Número de punições', 'Decisão dos árbitros', 'Sorteio', 'Morte súbita'],
    correctAnswer: 1,
    explanation: 'Se houver empate total, a decisão cabe aos árbitros (central e laterais).',
    module: Module.BASICS,
    belts: [Belt.BLUE, Belt.PURPLE, Belt.BROWN, Belt.BLACK]
  },

  // POINTS
  {
    id: 'p1',
    text: 'O atleta A derruba o atleta B, que cai sentado. O atleta A mantém o controle por 3 segundos. Quantos pontos são marcados?',
    options: ['Vantagem', '2 pontos', '3 pontos', 'Nenhum ponto'],
    correctAnswer: 1,
    explanation: 'Quedas que resultam no oponente sentado ou de quatro apoios com controle de 3 segundos valem 2 pontos.',
    module: Module.POINTS,
    belts: [Belt.BLUE, Belt.PURPLE, Belt.BROWN, Belt.BLACK]
  },
  {
    id: 'p2',
    text: 'O atleta passa a guarda, estabiliza por 2 segundos e o oponente repõe a guarda. O que o árbitro deve marcar?',
    options: ['3 pontos', 'Vantagem de passagem', '2 pontos', 'Nada'],
    correctAnswer: 1,
    explanation: 'Para ganhar os 3 pontos de passagem, é necessário estabilizar por 3 segundos. Menos que isso resulta em vantagem.',
    module: Module.POINTS,
    belts: [Belt.BLUE, Belt.PURPLE, Belt.BROWN, Belt.BLACK]
  },
  {
    id: 'p3',
    text: 'Quantos pontos vale a montada pelas costas (back mount)?',
    options: ['2 pontos', '3 pontos', '4 pontos', 'Vantagem'],
    correctAnswer: 2,
    explanation: 'Tanto a montada quanto a pegada de costas valem 4 pontos.',
    module: Module.POINTS,
    belts: [Belt.BLUE, Belt.PURPLE, Belt.BROWN, Belt.BLACK]
  },
  {
    id: 'p4',
    text: 'O atleta A está na guarda 50/50 e sobe, ficando por cima por 3 segundos enquanto o atleta B permanece sentado. Quantos pontos?',
    options: ['2 pontos', 'Vantagem', 'Nada', '1 ponto'],
    correctAnswer: 0,
    explanation: 'Subir da 50/50 e estabilizar por cima vale 2 pontos de raspagem.',
    module: Module.POINTS,
    belts: [Belt.BLUE, Belt.PURPLE, Belt.BROWN, Belt.BLACK]
  },

  // FOULS
  {
    id: 'f1',
    text: 'Qual a sequência de punições progressivas antes da desclassificação por falta leve?',
    options: [
      'Punição, Punição, Punição, DQ',
      'Punição (nada), Punição (2 pts oponente), DQ',
      'Punição (nada), Punição (nada), Punição (2 pts oponente), DQ',
      'Punição (nada), Punição (vantagem oponente), Punição (2 pts oponente), DQ'
    ],
    correctAnswer: 3,
    explanation: 'A sequência correta é: 1ª Punição (nada), 2ª Punição (vantagem para oponente), 3ª Punição (2 pontos para oponente), 4ª Punição (Desclassificação).',
    module: Module.FOULS,
    belts: [Belt.BLUE, Belt.PURPLE, Belt.BROWN, Belt.BLACK]
  },
  {
    id: 'f2',
    text: 'Um atleta de faixa azul aplica uma chave de pé (straight foot lock) cruzando o pé por cima da perna do oponente em direção ao lado de fora (reaping). Qual a punição?',
    options: ['Punição leve', 'Vantagem para o oponente', 'Desclassificação imediata', 'Nada, é permitido'],
    correctAnswer: 2,
    explanation: 'Cruzamento de perna (reaping) é falta gravíssima resultando em DQ imediata em quase todas as categorias (exceto algumas regras específicas de marrom/preta no-gi recentemente, mas na regra geral IBJJF kimono é DQ).',
    module: Module.FOULS,
    belts: [Belt.BLUE, Belt.PURPLE, Belt.BROWN, Belt.BLACK]
  },
  {
    id: 'f3',
    text: 'O atleta foge da área de luta para evitar uma finalização encaixada. Qual a decisão do árbitro?',
    options: ['Reinicia no centro', 'Punição e reinicia', 'Desclassificação imediata', 'Vantagem para quem atacava'],
    correctAnswer: 2,
    explanation: 'Sair da área de luta para fugir de um golpe de finalização resulta em desclassificação imediata.',
    module: Module.FOULS,
    belts: [Belt.BLUE, Belt.PURPLE, Belt.BROWN, Belt.BLACK]
  },

  // SITUATIONS
  {
    id: 's1',
    text: 'Na posição de 50/50, ambos os atletas estão sentados. O árbitro deve iniciar a contagem de interrupção por falta de combatividade?',
    options: ['Sim, após 20 segundos', 'Não, 50/50 é exceção', 'Sim, imediatamente', 'Apenas se um deles segurar a manga'],
    correctAnswer: 0,
    explanation: 'O árbitro deve monitorar a falta de combatividade mesmo na 50/50.',
    module: Module.SITUATIONS,
    belts: [Belt.BLUE, Belt.PURPLE, Belt.BROWN, Belt.BLACK]
  },
  {
    id: 's2',
    text: 'O atleta aplica um triângulo e o oponente o levanta do chão (bate-estaca). Qual a punição para quem aplicou o levantamento?',
    options: ['Nada', 'Punição leve', 'Desclassificação imediata', '2 pontos para o oponente'],
    correctAnswer: 2,
    explanation: 'Bate-estaca (slam) é falta gravíssima e gera desclassificação.',
    module: Module.SITUATIONS,
    belts: [Belt.BLUE, Belt.PURPLE, Belt.BROWN, Belt.BLACK]
  },

  // DIFFERENCES
  {
    id: 'd1',
    text: 'A chave de rins (fechar a guarda e espremer com as pernas) é permitida para qual faixa?',
    options: ['Todas', 'Apenas Branca', 'Apenas Juvenil', 'Nenhuma (é falta em todas)'],
    correctAnswer: 3,
    explanation: 'Espremer os rins com as pernas fechadas na guarda é proibido em todas as faixas e categorias.',
    module: Module.DIFFERENCES,
    belts: [Belt.BLUE, Belt.PURPLE, Belt.BROWN, Belt.BLACK]
  },
  {
    id: 'd2',
    text: 'Mão de vaca é permitida a partir de qual faixa?',
    options: ['Branca', 'Azul', 'Roxa', 'Marrom'],
    correctAnswer: 1,
    explanation: 'Mão de vaca é permitida a partir da faixa azul (adulto).',
    module: Module.DIFFERENCES,
    belts: [Belt.BLUE, Belt.PURPLE, Belt.BROWN, Belt.BLACK]
  },
  {
    id: 'd3',
    text: 'Cervical é permitida em qual situação?',
    options: ['Nunca', 'Apenas na faixa preta', 'Apenas se for sem querer', 'Apenas se não houver alavanca'],
    correctAnswer: 0,
    explanation: 'Qualquer golpe que pressione a cervical sem ser um estrangulamento é proibido.',
    module: Module.DIFFERENCES,
    belts: [Belt.BLUE, Belt.PURPLE, Belt.BROWN, Belt.BLACK]
  },

  // Adding more to reach a good number...
  {
    id: 'p5',
    text: 'O atleta projeta o oponente, que cai de costas, mas o atleta que projetou cai fora da área de luta. O oponente cai dentro. Pontua?',
    options: ['Sim, 2 pontos', 'Não, deve cair dentro', 'Vantagem apenas', 'Reinicia em pé sem pontos'],
    correctAnswer: 0,
    explanation: 'Se o oponente cair dentro da área de combate, os pontos são válidos mesmo que o atacante saia.',
    module: Module.POINTS,
    belts: [Belt.BLUE, Belt.PURPLE, Belt.BROWN, Belt.BLACK]
  },
  {
    id: 'f4',
    text: 'O atleta coloca os dedos dentro da manga do oponente. Qual a punição?',
    options: ['Falta grave (DQ)', 'Falta leve (Punição)', 'Nada', 'Vantagem para o oponente'],
    correctAnswer: 1,
    explanation: 'Colocar dedos dentro da manga ou calça é falta leve.',
    module: Module.FOULS,
    belts: [Belt.BLUE, Belt.PURPLE, Belt.BROWN, Belt.BLACK]
  },
  {
    id: 's3',
    text: 'No berimbolo, se um atleta chuta a perna do oponente para desequilibrar, é falta?',
    options: ['Sim, se for intencional', 'Não, faz parte do movimento', 'Apenas se for na articulação', 'Sim, falta grave'],
    correctAnswer: 1,
    explanation: 'Movimentos de desequilíbrio no berimbolo são permitidos desde que não visem a articulação de forma ilegal.',
    module: Module.SITUATIONS,
    belts: [Belt.PURPLE, Belt.BROWN, Belt.BLACK]
  },
  {
    id: 'b4',
    text: 'Qual a idade mínima para competir na categoria Master 1?',
    options: ['25 anos', '30 anos', '35 anos', '40 anos'],
    correctAnswer: 1,
    explanation: 'A categoria Master 1 inicia no ano em que o atleta completa 30 anos.',
    module: Module.BASICS,
    belts: [Belt.BLUE, Belt.PURPLE, Belt.BROWN, Belt.BLACK]
  },
  {
    id: 'p6',
    text: 'O atleta A está na guarda de B. A levanta e B o acompanha, mantendo a guarda fechada no ar. A derruba B de volta no chão. Pontua?',
    options: ['Sim, 2 pontos', 'Não', 'Vantagem', '2 pontos para B'],
    correctAnswer: 1,
    explanation: 'Não há pontuação de queda se a guarda já estava fechada e o oponente apenas foi "devolvido" ao chão.',
    module: Module.POINTS,
    belts: [Belt.BLUE, Belt.PURPLE, Belt.BROWN, Belt.BLACK]
  },
  {
    id: 'd4',
    text: 'A chave de pé "Estima Lock" é permitida para qual faixa?',
    options: ['Todas', 'Azul em diante', 'Roxa em diante', 'Marrom e Preta apenas'],
    correctAnswer: 3,
    explanation: 'Estima Lock é considerada uma chave de pé que ataca a articulação de forma similar a uma chave de perna proibida para faixas menores, sendo permitida apenas para marrom e preta.',
    module: Module.DIFFERENCES,
    belts: [Belt.BROWN, Belt.BLACK]
  },
  {
    id: 'f5',
    text: 'Conversar com o árbitro durante a luta gera qual punição?',
    options: ['Nada', 'Punição leve', 'Desclassificação imediata', 'Vantagem para o oponente'],
    correctAnswer: 1,
    explanation: 'Conversar com o árbitro ou oponente é falta leve.',
    module: Module.FOULS,
    belts: [Belt.BLUE, Belt.PURPLE, Belt.BROWN, Belt.BLACK]
  },
  {
    id: 'p7',
    text: 'O atleta A está montado. O atleta B consegue colocar uma perna por dentro e repor a meia-guarda. O atleta A ganha algo?',
    options: ['Nada', 'Vantagem', '2 pontos', '1 ponto'],
    correctAnswer: 0,
    explanation: 'Perder a posição não gera pontos ou vantagens para quem estava por cima.',
    module: Module.POINTS,
    belts: [Belt.BLUE, Belt.PURPLE, Belt.BROWN, Belt.BLACK]
  },
  {
    id: 's4',
    text: 'Se um atleta desamarrar o próprio kimono intencionalmente para ganhar tempo, o que acontece?',
    options: ['Punição leve', 'Nada', 'O árbitro espera ele amarrar', 'DQ'],
    correctAnswer: 0,
    explanation: 'Desamarrar o kimono ou faixa para parar a luta é falta leve.',
    module: Module.SITUATIONS,
    belts: [Belt.BLUE, Belt.PURPLE, Belt.BROWN, Belt.BLACK]
  },
  {
    id: 'b5',
    text: 'Qual o peso máximo da categoria Leve (Light) Adulto Masculino com kimono?',
    options: ['70.0 kg', '76.0 kg', '82.3 kg', '88.3 kg'],
    correctAnswer: 1,
    explanation: 'O peso limite da categoria Leve Adulto Masculino é 76 kg.',
    module: Module.BASICS,
    belts: [Belt.BLUE, Belt.PURPLE, Belt.BROWN, Belt.BLACK]
  },
  {
    id: 'p8',
    text: 'Um atleta aplica uma queda, o oponente cai de costas, mas o atacante não estabiliza e o oponente levanta imediatamente. O que marcar?',
    options: ['2 pontos', 'Vantagem', 'Nada', 'Punição para o oponente'],
    correctAnswer: 1,
    explanation: 'Se não houver estabilização de 3 segundos, marca-se apenas vantagem.',
    module: Module.POINTS,
    belts: [Belt.BLUE, Belt.PURPLE, Belt.BROWN, Belt.BLACK]
  },
  {
    id: 'f6',
    text: 'O atleta A está vencendo por 10x0. Faltando 10 segundos, ele começa a correr da luta claramente. O que o árbitro faz?',
    options: ['Dá punição por falta de combatividade', 'Dá DQ imediata', 'Ignora pois ele está vencendo muito', 'Para a luta e dá a vitória para B'],
    correctAnswer: 0,
    explanation: 'Fugir do combate é falta de combatividade, punível com a sequência progressiva.',
    module: Module.FOULS,
    belts: [Belt.BLUE, Belt.PURPLE, Belt.BROWN, Belt.BLACK]
  },
  {
    id: 'd5',
    text: 'Suple (Suplex) é permitido em qual categoria?',
    options: ['Todas', 'Adulto apenas', 'Nenhuma (se bater a cabeça/pescoço)', 'Apenas Faixa Preta'],
    correctAnswer: 2,
    explanation: 'Suplex que projete o oponente sobre a cabeça ou pescoço é proibido.',
    module: Module.DIFFERENCES,
    belts: [Belt.BLUE, Belt.PURPLE, Belt.BROWN, Belt.BLACK]
  },
  {
    id: 's5',
    text: 'O atleta A está com um estrangulamento encaixado. O atleta B faz um gesto de "joinha" para o árbitro. O que o árbitro deve fazer?',
    options: ['Parar a luta e dar vitória para A', 'Nada, a luta continua', 'Punir B por conversar', 'Perguntar se ele está bem'],
    correctAnswer: 1,
    explanation: 'Sinais visuais não interrompem a luta, a menos que o atleta desista verbalmente ou bata.',
    module: Module.SITUATIONS,
    belts: [Belt.BLUE, Belt.PURPLE, Belt.BROWN, Belt.BLACK]
  },
  {
    id: 'p9',
    text: 'O atleta A passa a guarda, estabiliza por 4 segundos e depois monta. Quantos pontos no total?',
    options: ['3 pontos', '4 pontos', '7 pontos', 'Vantagem + 4 pontos'],
    correctAnswer: 2,
    explanation: '3 pontos da passagem + 4 pontos da montada = 7 pontos.',
    module: Module.POINTS,
    belts: [Belt.BLUE, Belt.PURPLE, Belt.BROWN, Belt.BLACK]
  },
  {
    id: 'f7',
    text: 'O atleta A aplica um triângulo. O atleta B coloca a mão por dentro da calça de A para defender. Qual a punição?',
    options: ['Nada', 'Punição leve', 'DQ', 'Vantagem para A'],
    correctAnswer: 1,
    explanation: 'Colocar a mão por dentro da calça ou manga é falta leve.',
    module: Module.FOULS,
    belts: [Belt.BLUE, Belt.PURPLE, Belt.BROWN, Belt.BLACK]
  },
  {
    id: 'b6',
    text: 'Qual a largura mínima permitida para a faixa de um atleta?',
    options: ['3 cm', '4 cm', '5 cm', '6 cm'],
    correctAnswer: 1,
    explanation: 'A faixa deve ter entre 4 e 5 cm de largura.',
    module: Module.BASICS,
    belts: [Belt.BLUE, Belt.PURPLE, Belt.BROWN, Belt.BLACK]
  },
  {
    id: 'p10',
    text: 'O atleta A raspa, mas cai direto dentro da guarda de B. Ele ganha os 2 pontos?',
    options: ['Sim, se estabilizar por 3 segundos', 'Não, precisa passar a guarda', 'Apenas vantagem', 'Sim, imediatamente'],
    correctAnswer: 0,
    explanation: 'Para ganhar os pontos de raspagem, deve-se inverter a posição e estabilizar por 3 segundos por cima, mesmo que seja dentro da guarda.',
    module: Module.POINTS,
    belts: [Belt.BLUE, Belt.PURPLE, Belt.BROWN, Belt.BLACK]
  },
  {
    id: 'd6',
    text: 'Chave de calcanhar (Heel Hook) é permitida em competições de Kimono da IBJJF?',
    options: ['Sim, para Faixa Preta', 'Sim, para Marrom e Preta', 'Não, em nenhuma faixa', 'Apenas no Absoluto'],
    correctAnswer: 2,
    explanation: 'Chave de calcanhar é proibida em todas as competições de Kimono da IBJJF.',
    module: Module.DIFFERENCES,
    belts: [Belt.BLUE, Belt.PURPLE, Belt.BROWN, Belt.BLACK]
  },
  {
    id: 'f8',
    text: 'O atleta A está na guarda de B. A se levanta para abrir a guarda e B continua segurando as mangas de A, impedindo-o de se afastar. B está fazendo falta?',
    options: ['Sim, falta de combatividade se não atacar', 'Não, é uma guarda válida', 'Sim, falta grave', 'Apenas se durar mais de 1 minuto'],
    correctAnswer: 0,
    explanation: 'Segurar sem atacar ou buscar evolução é considerado falta de combatividade.',
    module: Module.FOULS,
    belts: [Belt.BLUE, Belt.PURPLE, Belt.BROWN, Belt.BLACK]
  },
  {
    id: 's6',
    text: 'Se o tempo acabar enquanto um atleta está com uma finalização encaixada, o árbitro deve:',
    options: ['Esperar a finalização ocorrer', 'Encerrar a luta imediatamente', 'Dar mais 30 segundos', 'Dar vitória automática para quem atacava'],
    correctAnswer: 1,
    explanation: 'Acabou o tempo, acabou a luta, independente da posição.',
    module: Module.SITUATIONS,
    belts: [Belt.BLUE, Belt.PURPLE, Belt.BROWN, Belt.BLACK]
  },
  {
    id: 'p11',
    text: 'O atleta A derruba B, B cai de costas, mas A cai montado. Quantos pontos?',
    options: ['2 pontos', '4 pontos', '6 pontos', '2 pontos + vantagem de montada'],
    correctAnswer: 2,
    explanation: '2 pontos da queda + 4 pontos da montada = 6 pontos.',
    module: Module.POINTS,
    belts: [Belt.BLUE, Belt.PURPLE, Belt.BROWN, Belt.BLACK]
  },
  {
    id: 'f9',
    text: 'O atleta A limpa as mãos no kimono do oponente. Isso é permitido?',
    options: ['Sim', 'Não, falta leve', 'Não, DQ', 'Apenas se o oponente deixar'],
    correctAnswer: 1,
    explanation: 'Usar o kimono do oponente para limpar suor ou mãos é falta leve.',
    module: Module.FOULS,
    belts: [Belt.BLUE, Belt.PURPLE, Belt.BROWN, Belt.BLACK]
  },
  {
    id: 'b7',
    text: 'Qual a cor permitida para o Kimono em competições oficiais IBJJF?',
    options: ['Branco, Azul Royal ou Preto', 'Qualquer cor', 'Branco, Azul Marinho ou Preto', 'Branco ou Azul apenas'],
    correctAnswer: 0,
    explanation: 'As cores permitidas são Branco, Azul Royal ou Preto.',
    module: Module.BASICS,
    belts: [Belt.BLUE, Belt.PURPLE, Belt.BROWN, Belt.BLACK]
  },
  {
    id: 'p12',
    text: 'O atleta A está com a pegada de costas (hooks) mas cruza os pés. Ele ganha os 4 pontos?',
    options: ['Sim', 'Não, cruzar os pés invalida os pontos', 'Apenas vantagem', 'Sim, mas leva punição'],
    correctAnswer: 0,
    explanation: 'Cruzar os pés na pegada de costas não impede a marcação dos 4 pontos.',
    module: Module.POINTS,
    belts: [Belt.BLUE, Belt.PURPLE, Belt.BROWN, Belt.BLACK]
  },
  {
    id: 'd7',
    text: 'Atletas Juvenis (16-17 anos) podem aplicar triângulo puxando a cabeça?',
    options: ['Sim', 'Não, é proibido', 'Apenas se for para finalizar rápido', 'Apenas na faixa azul'],
    correctAnswer: 1,
    explanation: 'Puxar a cabeça no triângulo é proibido para categorias de base (até juvenil inclusive).',
    module: Module.DIFFERENCES,
    belts: [Belt.BLUE]
  },
  {
    id: 'f10',
    text: 'O atleta A chuta o braço do oponente para livrar uma pegada. Qual a punição?',
    options: ['Nada', 'Punição leve', 'DQ', 'Vantagem para o oponente'],
    correctAnswer: 2,
    explanation: 'Chutar o oponente é falta gravíssima (atitude antidesportiva/agressão).',
    module: Module.FOULS,
    belts: [Belt.BLUE, Belt.PURPLE, Belt.BROWN, Belt.BLACK]
  },
  {
    id: 's7',
    text: 'Se ambos os atletas puxam para a guarda ao mesmo tempo, o que o árbitro deve fazer?',
    options: ['Mandar levantar', 'Esperar 20 segundos, se ninguém subir, punir ambos e mandar levantar', 'Dar vantagem para quem subiu primeiro', 'Nada, a luta segue no chão'],
    correctAnswer: 1,
    explanation: 'Puxada dupla: o árbitro aguarda 20s. Se ninguém subir, pune ambos e reinicia em pé.',
    module: Module.SITUATIONS,
    belts: [Belt.BLUE, Belt.PURPLE, Belt.BROWN, Belt.BLACK]
  },
  {
    id: 'p13',
    text: 'O atleta A está na meia-guarda por cima. Ele consegue tirar a perna e estabilizar o cem quilos. Quantos pontos?',
    options: ['2 pontos', '3 pontos', 'Vantagem', 'Nada'],
    correctAnswer: 1,
    explanation: 'Passagem de meia-guarda para controle lateral vale 3 pontos.',
    module: Module.POINTS,
    belts: [Belt.BLUE, Belt.PURPLE, Belt.BROWN, Belt.BLACK]
  },
  {
    id: 'f11',
    text: 'O atleta A segura a faixa do oponente e a usa para estrangular. É permitido?',
    options: ['Sim', 'Não, falta leve', 'Não, DQ', 'Apenas se a faixa estiver amarrada'],
    correctAnswer: 1,
    explanation: 'Usar a própria faixa ou a do oponente para estrangular é proibido (falta leve).',
    module: Module.FOULS,
    belts: [Belt.BLUE, Belt.PURPLE, Belt.BROWN, Belt.BLACK]
  },
  {
    id: 'b8',
    text: 'Qual o tempo de descanso mínimo entre lutas para um atleta?',
    options: ['5 minutos', 'O dobro do tempo da luta', 'O mesmo tempo da luta', '15 minutos'],
    correctAnswer: 2,
    explanation: 'O atleta tem direito a um descanso igual ao tempo de duração da sua luta anterior.',
    module: Module.BASICS,
    belts: [Belt.BLUE, Belt.PURPLE, Belt.BROWN, Belt.BLACK]
  },
  {
    id: 'p14',
    text: 'O atleta A aplica uma chave de braço. O oponente defende mas acaba ficando por cima. O atleta A ganha algo?',
    options: ['Nada', 'Vantagem de finalização', '2 pontos de raspagem', 'Vantagem de raspagem'],
    correctAnswer: 1,
    explanation: 'Ataques de finalização que colocam o oponente em perigo real valem vantagem.',
    module: Module.POINTS,
    belts: [Belt.BLUE, Belt.PURPLE, Belt.BROWN, Belt.BLACK]
  },
  {
    id: 'd8',
    text: 'A chave de perna "Toe Hold" é permitida para qual faixa?',
    options: ['Azul em diante', 'Roxa em diante', 'Marrom e Preta apenas', 'Apenas Preta'],
    correctAnswer: 2,
    explanation: 'Mata-leão de pé (Toe Hold) é permitido apenas para marrom e preta.',
    module: Module.DIFFERENCES,
    belts: [Belt.BROWN, Belt.BLACK]
  },
  {
    id: 'f12',
    text: 'O atleta A coloca a mão no rosto do oponente (empurrando o nariz/boca). É permitido?',
    options: ['Sim', 'Não, falta leve', 'Não, DQ', 'Apenas se for com a mão aberta'],
    correctAnswer: 1,
    explanation: 'Colocar a mão no rosto do oponente de forma a obstruir a visão ou respiração é falta leve.',
    module: Module.FOULS,
    belts: [Belt.BLUE, Belt.PURPLE, Belt.BROWN, Belt.BLACK]
  },
  {
    id: 's8',
    text: 'Se um atleta vomita durante a luta, qual a decisão?',
    options: ['Limpa e continua', 'Punição leve', 'Desclassificação imediata', 'Vitória por WO'],
    correctAnswer: 2,
    explanation: 'Vômito ou perda de controle fisiológico durante a luta resulta em desclassificação.',
    module: Module.SITUATIONS,
    belts: [Belt.BLUE, Belt.PURPLE, Belt.BROWN, Belt.BLACK]
  },
  {
    id: 'p15',
    text: 'O atleta A está nas costas com os dois ganchos. Ele tira um gancho e coloca o pé na virilha. Ele mantém os pontos?',
    options: ['Sim', 'Não, perde os pontos', 'Os pontos já foram marcados, não se perde', 'Leva punição'],
    correctAnswer: 2,
    explanation: 'Uma vez que os pontos de pegada de costas foram marcados (após 3s), eles não são retirados se a posição mudar, a menos que o árbitro tenha errado.',
    module: Module.POINTS,
    belts: [Belt.BLUE, Belt.PURPLE, Belt.BROWN, Belt.BLACK]
  },
  {
    id: 'f13',
    text: 'O atleta A sai da área de luta para evitar uma queda que ainda não estava estabilizada. Qual a punição?',
    options: ['Punição leve e reinicia em pé', '2 pontos para o oponente e reinicia em pé', 'DQ', 'Vantagem para o oponente'],
    correctAnswer: 1,
    explanation: 'Sair da área para evitar uma pontuação (queda, raspagem, passagem) resulta em 2 pontos para o oponente e punição para o infrator.',
    module: Module.FOULS,
    belts: [Belt.BLUE, Belt.PURPLE, Belt.BROWN, Belt.BLACK]
  },
  {
    id: 'b9',
    text: 'Qual a espessura máxima permitida para a gola do Kimono?',
    options: ['0.5 cm', '1.3 cm', '2.5 cm', '5 cm'],
    correctAnswer: 1,
    explanation: 'A gola deve ter no máximo 1.3 cm de espessura.',
    module: Module.BASICS,
    belts: [Belt.BLUE, Belt.PURPLE, Belt.BROWN, Belt.BLACK]
  },
  {
    id: 'p16',
    text: 'O atleta A está por cima no cem quilos. Ele coloca o joelho na barriga e estabiliza por 3 segundos. Quantos pontos?',
    options: ['2 pontos', '3 pontos', 'Vantagem', 'Nada'],
    correctAnswer: 0,
    explanation: 'Joelho na barriga estabilizado por 3 segundos vale 2 pontos.',
    module: Module.POINTS,
    belts: [Belt.BLUE, Belt.PURPLE, Belt.BROWN, Belt.BLACK]
  },
  {
    id: 'd9',
    text: 'A chave de braço "Omoplata" é permitida para qual faixa?',
    options: ['Todas', 'Azul em diante', 'Roxa em diante', 'Apenas Marrom/Preta'],
    correctAnswer: 0,
    explanation: 'Omoplata é permitida em todas as faixas (adulto).',
    module: Module.DIFFERENCES,
    belts: [Belt.BLUE, Belt.PURPLE, Belt.BROWN, Belt.BLACK]
  },
  {
    id: 'f14',
    text: 'O atleta A agarra os dedos do oponente e os dobra para trás. Qual a punição?',
    options: ['Punição leve', 'DQ', 'Nada', 'Vantagem para o oponente'],
    correctAnswer: 1,
    explanation: 'Agarrar menos de 4 dedos é falta gravíssima (DQ).',
    module: Module.FOULS,
    belts: [Belt.BLUE, Belt.PURPLE, Belt.BROWN, Belt.BLACK]
  },
  {
    id: 's9',
    text: 'Se o kimono de um atleta rasga durante a luta, o que acontece?',
    options: ['Ele luta assim mesmo', 'O árbitro dá tempo para ele trocar', 'DQ', 'Punição leve'],
    correctAnswer: 1,
    explanation: 'Se o kimono rasgar, o árbitro concede um tempo determinado para a troca.',
    module: Module.SITUATIONS,
    belts: [Belt.BLUE, Belt.PURPLE, Belt.BROWN, Belt.BLACK]
  },
  {
    id: 'p17',
    text: 'O atleta A raspa, o oponente cai mas levanta em menos de 3 segundos. O que marcar?',
    options: ['2 pontos', 'Vantagem', 'Nada', 'Punição para o oponente'],
    correctAnswer: 1,
    explanation: 'Raspagem sem estabilização de 3 segundos vale vantagem.',
    module: Module.POINTS,
    belts: [Belt.BLUE, Belt.PURPLE, Belt.BROWN, Belt.BLACK]
  },
  {
    id: 'f15',
    text: 'O atleta A aplica uma chave de pé e o oponente grita de dor, mas não bate. O que o árbitro faz?',
    options: ['Continua a luta', 'Para a luta e dá vitória para A', 'Pune A por excesso de força', 'Pergunta se ele quer desistir'],
    correctAnswer: 1,
    explanation: 'Grito de dor durante golpe encaixado é considerado desistência verbal.',
    module: Module.FOULS,
    belts: [Belt.BLUE, Belt.PURPLE, Belt.BROWN, Belt.BLACK]
  },
  {
    id: 'b10',
    text: 'Quem decide o vencedor em caso de empate triplo (pontos, vantagens e punições)?',
    options: ['O árbitro central sozinho', 'Os três árbitros em conjunto', 'O coordenador de arbitragem', 'Sorteio'],
    correctAnswer: 1,
    explanation: 'A decisão é tomada pelos três árbitros através de sinalização simultânea.',
    module: Module.BASICS,
    belts: [Belt.BLUE, Belt.PURPLE, Belt.BROWN, Belt.BLACK]
  }
];
