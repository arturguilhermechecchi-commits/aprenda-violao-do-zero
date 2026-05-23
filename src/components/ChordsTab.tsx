import { useState } from "react";
import { Chord, ChordVariation } from "../types";
import { playGuitarChord } from "./AcousticAudio";
import { Volume2, HelpCircle, Check, Info, Sparkles, Award, BookOpen } from "lucide-react";
import { motion } from "motion/react";

const CHORD_DATABASE: Chord[] = [
  {
    name: "C",
    altName: "Dó Maior",
    frets: ["x", 3, 2, 0, 1, 0],
    fingers: [null, 3, 2, null, 1, null],
    baseFret: 1,
    usageTip: "Ótimo acorde inicial. Certifique-se de arquear bem o dedo 1 para não abafar a primeira corda solta.",
  },
  {
    name: "G",
    altName: "Sol Maior",
    frets: [3, 2, 0, 0, 0, 3],
    fingers: [3, 2, null, null, null, 4],
    baseFret: 1,
    usageTip: "Utilize o dedo 4 (mínimo) na primeira corda para facilitar transições rápidas para o acorde de C.",
  },
  {
    name: "D",
    altName: "Ré Maior",
    frets: ["x", "x", 0, 2, 3, 2],
    fingers: [null, null, null, 1, 3, 2],
    baseFret: 1,
    usageTip: "Toque a partir da 4ª corda (Ré). Evite bater nas cordas grossas de Mi e Lá (6ª e 5ª cordas).",
  },
  {
    name: "Am",
    altName: "Lá Menor",
    frets: ["x", 0, 2, 2, 1, 0],
    fingers: [null, null, 2, 3, 1, null],
    baseFret: 1,
    usageTip: "Um dos acordes mais fáceis. Exige exatamente a mesma forma do acorde de Mi Maior (E), deslocada uma corda abaixo.",
  },
  {
    name: "Em",
    altName: "Mi Menor",
    frets: [0, 2, 2, 0, 0, 0],
    fingers: [null, 2, 3, null, null, null],
    baseFret: 1,
    usageTip: "Apenas dois dedos! Encaixa perfeitamente no rock nacional e folk. Toque todas as 6 cordas com força.",
  },
  {
    name: "E",
    altName: "Mi Maior",
    frets: [0, 2, 2, 1, 0, 0],
    fingers: [null, 2, 3, 1, null, null],
    baseFret: 1,
    usageTip: "Base de ritmos de blues e rock. Mantenha os dedos arqueados na ponta para manter o som limpo.",
  },
  {
    name: "A",
    altName: "Lá Maior",
    frets: ["x", 0, 2, 2, 2, 0],
    fingers: [null, null, 1, 2, 3, null],
    baseFret: 1,
    usageTip: "Três dedos espremidos na mesma casa (casa 2). Posicione-os na diagonal se seus dedos forem muito grossos.",
  },
  {
    name: "Dm",
    altName: "Ré Menor",
    frets: ["x", "x", 0, 2, 3, 1],
    fingers: [null, null, null, 2, 3, 1],
    baseFret: 1,
    usageTip: "Formato de triângulo. Mantenha o dedão pressionando no ponto médio da traseira do braço para flexibilidade.",
  },
  {
    name: "F",
    altName: "Fá Maior",
    frets: [1, 3, 3, 2, 1, 1],
    fingers: [1, 3, 4, 2, 1, 1],
    baseFret: 1,
    barre: {
      fret: 1,
      startString: 0,
      endString: 5,
    },
    usageTip: "Sua primeira pestana! Coloque o dedo 1 esticado bem perto do traste metálico e use a lateral dele para facilitar o som limpo.",
  },
  {
    name: "Bm",
    altName: "Si Menor",
    frets: ["x", 2, 4, 4, 3, 2],
    fingers: [null, 1, 3, 4, 2, 1],
    baseFret: 2,
    barre: {
      fret: 1,
      startString: 1,
      endString: 5,
    },
    usageTip: "A pestana mais comum e fundamental do pop-rock. O indicador prende a 5ª cordas até a 1ª corda na 2ª casa.",
  },
  {
    name: "F#m",
    altName: "Fá Sost. Menor",
    frets: [2, 4, 4, 2, 2, 2],
    fingers: [1, 3, 4, 1, 1, 1],
    baseFret: 2,
    barre: {
      fret: 1,
      startString: 0,
      endString: 5,
    },
    usageTip: "Pestana cheia cobrindo todas as 6 cordas na 2ª casa. Deixe o dedo indicador bem reto de lateral.",
  },
  {
    name: "C#m",
    altName: "Dó Sost. Menor",
    frets: ["x", 4, 6, 6, 5, 4],
    fingers: [null, 1, 3, 4, 2, 1],
    baseFret: 4,
    barre: {
      fret: 1,
      startString: 1,
      endString: 5,
    },
    usageTip: "Pestana de som melódico e romântico. Começa na 4ª casa; evite tocar a 6ª corda solta.",
  },
  {
    name: "Gm",
    altName: "Sol Menor",
    frets: [3, 5, 5, 3, 3, 3],
    fingers: [1, 3, 4, 1, 1, 1],
    baseFret: 3,
    barre: {
      fret: 1,
      startString: 0,
      endString: 5,
    },
    usageTip: "Pestana inteira na 3ª casa. O dedo indicador atua como capotraste esticado paralelo ao metal de traste.",
  },
  {
    name: "F#",
    altName: "Fá Sost. Maior",
    frets: [2, 4, 4, 3, 2, 2],
    fingers: [1, 3, 4, 2, 1, 1],
    baseFret: 2,
    barre: {
      fret: 1,
      startString: 0,
      endString: 5,
    },
    usageTip: "Idêntico ao desenho físico de Fá Maior (F), porém empurrado uma casa adiante nas cordas.",
  },
  {
    name: "B",
    altName: "Si Maior",
    frets: ["x", 2, 4, 4, 4, 2],
    fingers: [null, 1, 2, 3, 4, 1],
    baseFret: 2,
    barre: {
      fret: 1,
      startString: 1,
      endString: 5,
    },
    usageTip: "Exige bastante flexibilidade nos dedos 2, 3 e 4 espremidos perfeitamente dentro da 4ª casa.",
  },
  {
    name: "C7M",
    altName: "Dó c/ Sétima Maior",
    frets: ["x", 3, 2, 0, 0, 0],
    fingers: [null, 3, 2, null, null, null],
    baseFret: 1,
    usageTip: "Um acorde clássico da Bossa Nova e MPB. Traz uma atmosfera suave, sofisticada e relaxante, eliminando a tensão do dó maior básico.",
  },
  {
    name: "D9",
    altName: "Ré com Nona",
    frets: ["x", "x", 0, 2, 3, 0],
    fingers: [null, null, null, 1, 3, null],
    baseFret: 1,
    usageTip: "Substituto moderno e rico para o Ré maior convencional. Muito utilizado no folk e pop-rock devido ao brilho da primeira corda solta.",
  },
  {
    name: "G7",
    altName: "Sol Dominante c/ 7ª",
    frets: [3, 2, 0, 0, 0, 1],
    fingers: [3, 2, null, null, null, 1],
    baseFret: 1,
    usageTip: "Gera a tensão harmônica natural do acorde de Sol Maior. Perfeito para conduzir as transições de retorno antes de repousar no acorde de Dó.",
  },
  {
    name: "Bm7",
    altName: "Si Menor com Sétima",
    frets: ["x", 2, 4, 2, 3, 2],
    fingers: [null, 1, 3, 1, 2, 1],
    baseFret: 2,
    barre: {
      fret: 1,
      startString: 1,
      endString: 5,
    },
    usageTip: "Pestana leve e sofisticada. A inclusão da sétima ameniza a dureza do acorde menor e reduz a pressão física exigida do indicador no traste.",
  },
  {
    name: "F#m7",
    altName: "Fá Sost. Menor c/ 7ª",
    frets: [2, 4, 2, 2, 2, 2],
    fingers: [1, 3, 1, 1, 1, 1],
    baseFret: 2,
    barre: {
      fret: 1,
      startString: 0,
      endString: 5,
    },
    usageTip: "A base de praticamente todos os sambas e canções clássicas de Bossa Nova. Exige bastante do indicador apoiado paralelamente ao traste.",
  },
  {
    name: "E7(9)",
    altName: "Mi com Sétima e Nona",
    frets: [0, 2, 0, 1, 0, 2],
    fingers: [null, 2, null, 1, null, 4],
    baseFret: 1,
    usageTip: "O supremo balanço da Bossa Nova e do Jazz. Fricciona a sétima menor com a nona maior, gerando o clássico tempero acústico brasileiro.",
  },
  {
    name: "C9",
    altName: "Dó com Nona",
    frets: ["x", 3, 2, 0, 3, 0],
    fingers: [null, 2, 1, null, 3, null],
    baseFret: 1,
    usageTip: "Acorde de sonoridade moderna e rica. Muito eficaz para substituir o C comum para dar uma cor extra ao arranjo de cordas de violão folk.",
  },
  {
    name: "A7",
    altName: "Lá Dominante c/ Sétima",
    frets: ["x", 0, 2, 0, 2, 0],
    fingers: [null, null, 1, null, 2, null],
    baseFret: 1,
    usageTip: "Uma cor indispensável em blues, MPB e rock clássico. Cria uma sensação de movimento forte com apenas dois dedos pressionados.",
  },
  {
    name: "B7",
    altName: "Si Dominante c/ Sétima",
    frets: ["x", 2, 1, 2, 0, 2],
    fingers: [null, 2, 1, 3, null, 4],
    baseFret: 1,
    usageTip: "Acorde clássico de preparação. Abre caminhos espetaculares de modulação cromática no samba de raiz e modas de viola paulista.",
  },
  {
    name: "D7M",
    altName: "Ré c/ Sétima Maior",
    frets: ["x", "x", 0, 2, 2, 2],
    fingers: [null, null, null, 1, 2, 3],
    baseFret: 1,
    usageTip: "Acorde de sonoridade nostálgica e limpa, essencial no jazz, MPB e canções românticas. Substitui perfeitamente o Ré Maior simples.",
  },
  {
    name: "A7M",
    altName: "Lá c/ Sétima Maior",
    frets: ["x", 0, 2, 1, 2, 0],
    fingers: [null, null, 2, 1, 3, null],
    baseFret: 1,
    usageTip: "Uma maravilhosa cor introspectiva para canções em Lá maior. A alternância perfeita com o Lá Maior (A) ou Lá Menor (Am) para dar profundidade.",
  },
  {
    name: "G7M",
    altName: "Sol c/ Sétima Maior",
    frets: [3, "x", 4, 4, 3, "x"],
    fingers: [1, null, 3, 4, 2, null],
    baseFret: 3,
    usageTip: "Exclusivo design de Bossa Nova com o baixo na 6ª corda e acordes puxados. Abafe as cordas 5ª e 1ª com as laterais de seus dedos livres.",
  },
  {
    name: "Dm9",
    altName: "Ré Menor com Nona",
    frets: ["x", 5, 3, 5, 5, "x"],
    fingers: [null, 2, 1, 3, 4, null],
    baseFret: 3,
    usageTip: "O acorde assinatura do samba-jazz e bossa nova modernos. Oferece um som melancólico, refinado e com grande senso de espaço acústico.",
  },
  {
    name: "G7(13)",
    altName: "Sol c/ Sétima e 13ª",
    frets: [3, "x", 3, 4, 5, "x"],
    fingers: [1, null, 2, 3, 4, null],
    baseFret: 3,
    usageTip: "Um acorde altamente sofisticado de MPB e Jazz. Combina a tensão da sétima menor com o brilho colorido da décima terceira maior.",
  },
  {
    name: "Am9",
    altName: "Lá Menor com Nona",
    frets: ["x", 0, 2, 4, 1, 0],
    fingers: [null, null, 2, 4, 1, null],
    baseFret: 1,
    usageTip: "Um acorde clássico cheio de mistério e atmosfera melancólica, muito usado por compositores folk, MPB e pop-indie moderno.",
  },
  {
    name: "B7M",
    altName: "Si c/ Sétima Maior",
    frets: ["x", 2, 4, 3, 4, 2],
    fingers: [null, 1, 3, 2, 4, 1],
    baseFret: 2,
    barre: {
      fret: 1,
      startString: 1,
      endString: 5,
    },
    usageTip: "A versão sofisticada de Si Maior (B), ideal para transições suaves ou introduções românticas em tom de Mi maior.",
  },
  {
    name: "Bm7(b5)",
    altName: "Si Meio-Diminuto",
    frets: ["x", 2, 3, 2, 3, "x"],
    fingers: [null, 1, 3, 2, 4, null],
    baseFret: 2,
    usageTip: "O acorde fundamental de passagem harmônica menor (II-V-I). Traz um som dramático e sofisticado de preparação harmônica.",
  }
];

const CHORD_VARIATIONS: Record<string, ChordVariation[]> = {
  C: [
    {
      name: "Dó Padrão / Clássico",
      difficulty: "Iniciante",
      frets: ["x", 3, 2, 0, 1, 0],
      fingers: [null, 3, 2, null, 1, null],
      baseFret: 1,
      usageTip: "O formato clássico ideal para iniciantes em música acústica."
    },
    {
      name: "Dó Simplificado (Fácil)",
      difficulty: "Iniciante",
      frets: ["x", "x", 2, 0, 1, 0],
      fingers: [null, null, 2, null, 1, null],
      baseFret: 1,
      usageTip: "Toca apenas as 4 cordas agudas. Ideal para quem está começando agora."
    },
    {
      name: "Dó com Sétima Maior (C7M)",
      difficulty: "Intermediário",
      frets: ["x", 3, 2, 0, 0, 0],
      fingers: [null, 3, 2, null, null, null],
      baseFret: 1,
      usageTip: "Remover o dedo do indicador gera essa maravilhosa dissonância típica de bossa nova e MPB."
    },
    {
      name: "Dó com Pestana (C na 3ª casa)",
      difficulty: "Avançado",
      frets: ["x", 3, 5, 5, 5, 3],
      fingers: [null, 1, 3, 3, 3, 1],
      baseFret: 3,
      barre: { fret: 1, startString: 1, endString: 5 },
      usageTip: "Pestana com formato de Lá (A-shape) na 3ª casa. Oferece tom mais agudo e brilhante."
    }
  ],
  G: [
    {
      name: "Sol Standard / Aberto",
      difficulty: "Iniciante",
      frets: [3, 2, 0, 0, 0, 3],
      fingers: [3, 2, null, null, null, 4],
      baseFret: 1,
      usageTip: "Posição padrão do folk de 3 dedos com bastante brilho."
    },
    {
      name: "Sol Simplificado (Fácil)",
      difficulty: "Iniciante",
      frets: ["x", "x", 0, 0, 0, 3],
      fingers: [null, null, null, null, null, 3],
      baseFret: 1,
      usageTip: "Apenas um dedo preso de forma relaxada. Toca apenas as 4 cordas mais agudas."
    },
    {
      name: "Sol com Quatro Dedos (Rock shape)",
      difficulty: "Intermediário",
      frets: [3, 2, 0, 0, 3, 3],
      fingers: [3, 2, null, null, 3, 4],
      baseFret: 1,
      usageTip: "Formato de rock mais robusto que evita o som murcho da segunda corda."
    },
    {
      name: "Sol com Pestana (3ª casa)",
      difficulty: "Avançado",
      frets: [3, 5, 5, 4, 3, 3],
      fingers: [1, 3, 4, 2, 1, 1],
      baseFret: 3,
      barre: { fret: 1, startString: 0, endString: 5 },
      usageTip: "Formato clássico com pestana tipo Mi (E-shape). Poderoso para dinâmicas de groove e funk."
    }
  ],
  D: [
    {
      name: "Ré Padrão / Aberto",
      difficulty: "Iniciante",
      frets: ["x", "x", 0, 2, 3, 2],
      fingers: [null, null, null, 1, 3, 2],
      baseFret: 1,
      usageTip: "Forma fundamental e brilhante de 3 dedos sem pestana."
    },
    {
      name: "Ré com Nona (D9 / Moderno)",
      difficulty: "Iniciante",
      frets: ["x", "x", 0, 2, 3, 0],
      fingers: [null, null, null, 1, 3, null],
      baseFret: 1,
      usageTip: "A corda Mi aguda solta remove o som agudo tenso e entrega o clássico clima folk."
    },
    {
      name: "Ré com Pestana (5ª casa)",
      difficulty: "Avançado",
      frets: ["x", 5, 7, 7, 7, 5],
      fingers: [null, 1, 3, 3, 3, 1],
      baseFret: 5,
      barre: { fret: 1, startString: 1, endString: 5 },
      usageTip: "Pestana com forma de Lá na 5ª casa. Ótimo posicionamento para transições agudas."
    }
  ],
  Am: [
    {
      name: "Lá Menor Padrão",
      difficulty: "Iniciante",
      frets: ["x", 0, 2, 2, 1, 0],
      fingers: [null, null, 2, 3, 1, null],
      baseFret: 1,
      usageTip: "A fôrma aberta do Mi Maior transposta uma corda abaixo."
    },
    {
      name: "Lá Menor com Sétima (Am7)",
      difficulty: "Intermediário",
      frets: ["x", 0, 2, 0, 1, 0],
      fingers: [null, null, 2, null, 1, null],
      baseFret: 1,
      usageTip: "Solta o dedo 3 para adicionar a nota Sol, criando o clima calmo do pop acústico."
    },
    {
      name: "Lá Menor com Pestana (5ª casa)",
      difficulty: "Avançado",
      frets: [5, 7, 7, 5, 5, 5],
      fingers: [1, 3, 4, 1, 1, 1],
      baseFret: 5,
      barre: { fret: 1, startString: 0, endString: 5 },
      usageTip: "Formato de pestana cheia tipo Mi Menor (Em-shape) transposto à 5ª casa."
    }
  ],
  Em: [
    {
      name: "Mi Menor Padrão",
      difficulty: "Iniciante",
      frets: [0, 2, 2, 0, 0, 0],
      fingers: [null, 2, 3, null, null, null],
      baseFret: 1,
      usageTip: "O acorde aberto mais simples e reconfortante do violão."
    },
    {
      name: "Mi Menor com Sétima (Em7 / Pop)",
      difficulty: "Intermediário",
      frets: [0, 2, 2, 0, 3, 3],
      fingers: [null, 2, 3, null, 3, 4],
      baseFret: 1,
      usageTip: "Muito usado na canção pop e folk para dar preenchimento extra de agudos."
    },
    {
      name: "Mi Menor com Pestana (7ª casa)",
      difficulty: "Avançado",
      frets: ["x", 7, 9, 9, 8, 7],
      fingers: [null, 1, 3, 4, 2, 1],
      baseFret: 7,
      barre: { fret: 1, startString: 1, endString: 5 },
      usageTip: "Formato de Am com pestana na 7ª casa. Produz agudos muito limpos."
    }
  ],
  E: [
    {
      name: "Mi Maior Padrão",
      difficulty: "Iniciante",
      frets: [0, 2, 2, 1, 0, 0],
      fingers: [null, 2, 3, 1, null, null],
      baseFret: 1,
      usageTip: "Estilo folk clássico, todas as 6 cordas ativas."
    },
    {
      name: "Mi com Sétima (E7)",
      difficulty: "Intermediário",
      frets: [0, 2, 0, 1, 0, 0],
      fingers: [null, 2, null, 1, null, null],
      baseFret: 1,
      usageTip: "Levantar o dedo anelar introduz a sétima menor ideal para a cadência do Blues."
    },
    {
      name: "Mi com Pestana (7ª casa)",
      difficulty: "Avançado",
      frets: ["x", 7, 9, 9, 9, 7],
      fingers: [null, 1, 3, 3, 3, 1],
      baseFret: 7,
      barre: { fret: 1, startString: 1, endString: 5 },
      usageTip: "Formato de Lá com pestana na 7ª casa."
    }
  ],
  A: [
    {
      name: "Lá Maior Aberto",
      difficulty: "Iniciante",
      frets: ["x", 0, 2, 2, 2, 0],
      fingers: [null, null, 1, 2, 3, null],
      baseFret: 1,
      usageTip: "Três dedos esmagados na segunda casa."
    },
    {
      name: "Lá Alternativo / Sétima (A7)",
      difficulty: "Iniciante",
      frets: ["x", 0, 2, 0, 2, 0],
      fingers: [null, null, 1, null, 2, null],
      baseFret: 1,
      usageTip: "Apenas dois dedos prendendo as cordas 4ª e 2ª."
    },
    {
      name: "Lá com Pestana (5ª casa)",
      difficulty: "Avançado",
      frets: [5, 7, 7, 6, 5, 5],
      fingers: [1, 3, 4, 2, 1, 1],
      baseFret: 5,
      barre: { fret: 1, startString: 0, endString: 5 },
      usageTip: "O formato de Mi com pestana na 5ª casa para excelente tocabilidade alta."
    }
  ],
  Dm: [
    {
      name: "Ré Menor Padrão",
      difficulty: "Iniciante",
      frets: ["x", "x", 0, 2, 3, 1],
      fingers: [null, null, null, 2, 3, 1],
      baseFret: 1,
      usageTip: "Ré Menor aberto básico em formato de triângulo invertido."
    },
    {
      name: "Ré Menor com Sétima (Dm7)",
      difficulty: "Intermediário",
      frets: ["x", "x", 0, 2, 1, 1],
      fingers: [null, null, null, 2, 1, 1],
      baseFret: 1,
      usageTip: "Apenas dois dedos, com indicador fazendo mini-pestana em duas cordas agudas."
    },
    {
      name: "Ré Menor com Pestana (5ª casa)",
      difficulty: "Avançado",
      frets: ["x", 5, 7, 7, 6, 5],
      fingers: [null, 1, 3, 4, 2, 1],
      baseFret: 5,
      barre: { fret: 1, startString: 1, endString: 5 },
      usageTip: "O formato de Am com pestana na 5ª casa."
    }
  ],
  F: [
    {
      name: "Fá Maior com Pestana Completa",
      difficulty: "Intermediário",
      frets: [1, 3, 3, 2, 1, 1],
      fingers: [1, 3, 4, 2, 1, 1],
      baseFret: 1,
      barre: { fret: 1, startString: 0, endString: 5 },
      usageTip: "Posição mítica desafiadora. Rotacione o indicador e encoste-o reto."
    },
    {
      name: "Fá Simplificado (Sem Pestana)",
      difficulty: "Iniciante",
      frets: ["x", "x", 3, 2, 1, 1],
      fingers: [null, null, 3, 2, 1, 1],
      baseFret: 1,
      usageTip: "Ótima tática para evitar a pestana e continuar a música tocando somente as cordas de baixo."
    },
    {
      name: "Fá com Sétima Maior (F7M)",
      difficulty: "Iniciante",
      frets: ["x", "x", 3, 2, 1, 0],
      fingers: [null, null, 3, 2, 1, null],
      baseFret: 1,
      usageTip: "Um acorde macio e brilhante que evita o cansaço do dedo e embeleza a melodia."
    }
  ],
  Bm: [
    {
      name: "Si Menor com Pestana",
      difficulty: "Intermediário",
      frets: ["x", 2, 4, 4, 3, 2],
      fingers: [null, 1, 3, 4, 2, 1],
      baseFret: 2,
      barre: { fret: 1, startString: 1, endString: 5 },
      usageTip: "A pestana padrão na 2ª casa de desenho Lá Menor."
    },
    {
      name: "Si Menor Simplificado",
      difficulty: "Iniciante",
      frets: ["x", "x", 4, 4, 3, 2],
      fingers: [null, null, 3, 4, 2, 1],
      baseFret: 1,
      usageTip: "Perfeito para iniciantes tocarem de forma mais tranquila."
    }
  ]
};

function getChordVariations(chord: Chord): ChordVariation[] {
  if (CHORD_VARIATIONS[chord.name]) {
    return CHORD_VARIATIONS[chord.name];
  }
  const baseDifficulty: "Iniciante" | "Intermediário" | "Avançado" = 
    BASIC_CHORD_NAMES.includes(chord.name) ? "Iniciante" : 
    chord.barre !== undefined ? "Intermediário" : "Avançado";

  return [
    {
      name: `${chord.name} Padrão`,
      difficulty: baseDifficulty,
      frets: chord.frets,
      fingers: chord.fingers,
      baseFret: chord.baseFret,
      barre: chord.barre,
      usageTip: chord.usageTip
    }
  ];
}

const BASIC_CHORD_NAMES = ["C", "G", "D", "Am", "Em", "E", "A", "Dm"];

type ChordFilter = "all" | "basic" | "pestana" | "advanced";

export default function ChordsTab() {
  const [filter, setFilter] = useState<ChordFilter>("all");
  const [selectedChord, setSelectedChord] = useState<Chord>(CHORD_DATABASE[0]);
  const [selectedVarIdx, setSelectedVarIdx] = useState<number>(0);
  const [lastPlayed, setLastPlayed] = useState<string | null>(null);

  const handlePlayChordByFrets = (frets: (number | "x")[], name: string, speed: "strum" | "fast" | "plucked" = "strum") => {
    playGuitarChord(frets, speed);
    setLastPlayed(name);
    setTimeout(() => setLastPlayed(null), 800);
  };

  const handleSelectChord = (chord: Chord) => {
    setSelectedChord(chord);
    setSelectedVarIdx(0);
  };

  const filteredChords = CHORD_DATABASE.filter((chord) => {
    if (filter === "basic") {
      return BASIC_CHORD_NAMES.includes(chord.name);
    }
    if (filter === "pestana") {
      return chord.barre !== undefined;
    }
    if (filter === "advanced") {
      return !BASIC_CHORD_NAMES.includes(chord.name) && chord.barre === undefined;
    }
    return true;
  });

  const variations = getChordVariations(selectedChord);
  const activeVariation = variations[selectedVarIdx] || variations[0];

  return (
    <div id="chords-tab-container" className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Chord Grid / Left panel */}
      <div className="lg:col-span-5 flex flex-col gap-4">
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-stone-900 dark:to-stone-950 p-4 rounded-xl border border-amber-100 dark:border-stone-800">
          <h3 className="font-bold text-sm text-slate-800 dark:text-amber-100 flex items-center gap-1.5">
            Dicionário de Acordes Práticos e Avançados
          </h3>
          <p className="text-xs text-slate-500 dark:text-stone-400 mt-1 leading-relaxed">
            Filtre abaixo para explorar desde os acordes iniciais simples até as temidas pestanas e os complexos acordes de MPB.
          </p>
        </div>

        {/* Categoria Filter Tabs */}
        <div className="flex flex-wrap gap-1 p-1 bg-slate-100 dark:bg-stone-950 rounded-xl border border-slate-200/60 dark:border-stone-850">
          <button
            onClick={() => {
              setFilter("all");
              handleSelectChord(CHORD_DATABASE[0]);
            }}
            id="filter-chords-all"
            className={`flex-1 min-w-[55px] py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
              filter === "all"
                ? "bg-stone-900 dark:bg-amber-600 text-white dark:text-stone-950"
                : "text-slate-500 dark:text-stone-400 hover:text-slate-800 dark:hover:text-stone-200"
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => {
              setFilter("basic");
              handleSelectChord(CHORD_DATABASE[0]);
            }}
            id="filter-chords-basic"
            className={`flex-1 min-w-[65px] py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
              filter === "basic"
                ? "bg-stone-900 dark:bg-amber-600 text-white dark:text-stone-950"
                : "text-slate-500 dark:text-stone-400 hover:text-slate-800 dark:hover:text-stone-200"
            }`}
          >
            Básicos
          </button>
          <button
            onClick={() => {
              setFilter("pestana");
              const firstPestana = CHORD_DATABASE.find(c => c.barre !== undefined);
              if (firstPestana) handleSelectChord(firstPestana);
            }}
            id="filter-chords-pestana"
            className={`flex-1 min-w-[75px] py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
              filter === "pestana"
                ? "bg-amber-800 dark:bg-amber-700/40 text-white dark:text-amber-400 border border-amber-800/20 dark:border-amber-500/20"
                : "text-slate-500 dark:text-stone-400 hover:text-slate-800 dark:hover:text-stone-200"
            }`}
          >
            <Award className="w-3" />
            Pestanas
          </button>
          <button
            onClick={() => {
              setFilter("advanced");
              const firstAdv = CHORD_DATABASE.find(c => !BASIC_CHORD_NAMES.includes(c.name) && c.barre === undefined);
              if (firstAdv) handleSelectChord(firstAdv);
            }}
            id="filter-chords-advanced"
            className={`flex-1 min-w-[75px] py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
              filter === "advanced"
                ? "bg-stone-900 dark:bg-amber-600 text-white dark:text-stone-950"
                : "text-slate-500 dark:text-stone-400 hover:text-slate-800 dark:hover:text-stone-200"
            }`}
          >
            <Sparkles className="w-3 h-3 text-amber-500" />
            Elevados
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {filteredChords.map((chord) => {
            const isSelected = selectedChord.name === chord.name;
            const isAdvanced = !BASIC_CHORD_NAMES.includes(chord.name) && chord.barre === undefined;
            const isPestana = chord.barre !== undefined;
            return (
              <button
                key={chord.name}
                onClick={() => handleSelectChord(chord)}
                id={`chord-select-${chord.name}`}
                className={`py-4 px-3 rounded-2xl border flex flex-col items-center justify-center transition-all relative overflow-hidden group ${
                  isSelected
                    ? "bg-amber-900 border-amber-900 text-stone-100 shadow-md scale-102"
                    : "bg-white dark:bg-stone-900 border-slate-200 dark:border-stone-800 text-slate-800 dark:text-stone-200 hover:border-amber-500 dark:hover:border-stone-750"
                }`}
              >
                {isAdvanced && (
                  <div className="absolute top-1 left-1.5">
                    <Sparkles className="w-2.5 h-2.5 text-amber-500" title="Acorde Avançado / Com Extensão" />
                  </div>
                )}
                {isPestana && (
                  <div className="absolute top-1 left-1.5">
                    <Award className="w-2.5 h-2.5 text-amber-600" title="Acorde de Pestana / Barra" />
                  </div>
                )}
                
                <span className="text-xl font-black font-mono tracking-tight block">{chord.name}</span>
                <span className={`text-[9px] truncate max-w-full text-center ${isSelected ? "text-amber-200" : "text-slate-400 dark:text-stone-500"}`}>
                  {chord.altName}
                </span>

                {/* Micro play button on hover */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlayChordByFrets(chord.frets, chord.name, "strum");
                  }}
                  title="Ouvir Acorde"
                  className={`absolute right-1 top-1 p-1 rounded-full transition opacity-0 group-hover:opacity-100 ${
                    isSelected ? "bg-amber-800 hover:bg-amber-700 text-amber-200" : "bg-slate-100 dark:bg-stone-800 text-slate-500 dark:text-stone-400"
                  }`}
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              </button>
            );
          })}
        </div>

        <div className="bg-amber-50/50 dark:bg-stone-900/35 p-4 rounded-xl border border-amber-100/40 dark:border-stone-800 flex gap-3 text-slate-600 dark:text-stone-300 text-xs text-left">
          <Info className="w-5 h-5 text-amber-600 shrink-0" />
          <div className="space-y-1">
            <span className="font-semibold block text-slate-900 dark:text-white">Dicas de Estudo Avançado:</span>
            <p className="text-[11px] text-slate-500 dark:text-stone-400 leading-normal">
              Os acordes da categoria <strong className="text-amber-600">Elevados</strong> adicionam dissonâncias magníficas que dão riqueza ao seu violão. Pratique alternar de acordes básicos para suas versões sofisticadas correspondentes (ex: <code className="bg-stone-100 dark:bg-stone-950 px-1 rounded font-mono">C</code> para <code className="bg-stone-100 dark:bg-stone-950 px-1 rounded font-mono">C7M</code>).
            </p>
          </div>
        </div>
      </div>

      {/* Chord Detail Panel / Right panel */}
      <div className="lg:col-span-7 bg-white dark:bg-stone-900 rounded-3xl border border-slate-200 dark:border-stone-800 shadow-sm p-6 flex flex-col md:flex-row gap-8 items-center md:items-stretch">
        
        {/* Dynamic Chord Diagram SVG rendering */}
        <div className="flex-1 flex flex-col items-center justify-center bg-slate-50/50 dark:bg-stone-950/20 p-4 rounded-2xl border border-slate-200/50 dark:border-stone-850 w-full max-w-[280px] md:max-w-none">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-stone-500 mb-2 font-mono">
            Diagrama Interativo (Diagram)
          </span>
          <GuitarChordDiagram chord={activeVariation} />
          
          <div className="flex gap-2 w-full mt-4">
            <button
              onClick={() => handlePlayChordByFrets(activeVariation.frets, selectedChord.name, "strum")}
              id="play-chord-strum-btn"
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-amber-800 hover:bg-amber-900 dark:bg-amber-700 dark:hover:bg-amber-600 font-medium text-stone-50 rounded-xl transition text-xs cursor-pointer border-0 shadow"
            >
              <Volume2 className="w-4 h-4" />
              Tocar Batida (Fast)
            </button>
            <button
              onClick={() => handlePlayChordByFrets(activeVariation.frets, selectedChord.name, "plucked")}
              id="play-chord-arpeggio-btn"
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-stone-800 dark:hover:bg-stone-750 font-medium text-slate-800 dark:text-stone-200 rounded-xl transition text-xs border border-slate-200/40 dark:border-stone-700 cursor-pointer shadow-sm"
            >
              <Volume2 className="w-4 h-4 text-amber-600" />
              Dedilhado (Arpeggio)
            </button>
          </div>
        </div>

        {/* Chord Explanations */}
        <div className="flex-1 flex flex-col justify-between py-2 text-left w-full">
          <div>
            <div className="flex flex-wrap items-baseline justify-between gap-y-2 mb-2">
              <div className="flex items-baseline gap-2">
                <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white font-mono">{selectedChord.name}</h2>
                <span className="text-sm font-semibold text-amber-700 dark:text-amber-400">{selectedChord.altName}</span>
              </div>
              <div className="flex items-center gap-1 bg-amber-500/10 dark:bg-amber-500/20 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase text-amber-800 dark:text-amber-400 font-mono">
                <BookOpen className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                {variations.length === 1 ? "1 Fôrma" : `${variations.length} Opções`}
              </div>
            </div>

            <p className="text-[11px] text-slate-400 dark:text-stone-500 font-semibold italic -mt-1 block">
              Acorde em fôrma ativa: {activeVariation.name}
            </p>

            <div className="h-px bg-slate-150 dark:bg-stone-800 my-4" />

            {/* Variações de Forma & Níveis de Dificuldade */}
            <div className="mb-4">
              <span className="text-[10px] font-bold text-slate-400 dark:text-stone-500 uppercase tracking-widest block mb-2 font-mono">
                Fôrmas Alternativas & Dificuldade
              </span>
              <div className="flex flex-col gap-2 max-h-[175px] overflow-y-auto pr-1">
                {variations.map((v, idx) => {
                  const isVarSelected = selectedVarIdx === idx;
                  const diffColor = 
                    v.difficulty === "Iniciante" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" :
                    v.difficulty === "Intermediário" ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20" :
                    "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20";

                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedVarIdx(idx)}
                      className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                        isVarSelected
                          ? "bg-amber-50/50 border-amber-500 dark:bg-stone-950/60 dark:border-amber-500/50 shadow-sm"
                          : "bg-slate-50/50 hover:bg-slate-100/70 border-slate-200/50 dark:bg-stone-950/10 dark:border-stone-850 hover:dark:bg-stone-900/40"
                      }`}
                    >
                      <div className="flex flex-col min-w-0 pr-2">
                        <span className={`text-[11px] font-extrabold truncate ${isVarSelected ? "text-amber-900 dark:text-amber-300" : "text-slate-700 dark:text-stone-300"}`}>
                          {v.name}
                        </span>
                        <span className="text-[9px] text-slate-400 dark:text-stone-500 mt-0.5 line-clamp-1">
                          {v.usageTip}
                        </span>
                      </div>
                      <span className={`text-[8px] font-black px-1.5 py-0.5 rounded border uppercase shrink-0 ${diffColor}`}>
                        {v.difficulty}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Explanatory notes list */}
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-bold text-slate-400 dark:text-stone-500 uppercase tracking-widest block mb-1 font-mono">
                  Posicionamento das Cordas (Cordas 6 a 1)
                </span>
                <div className="flex gap-1.5 font-mono text-sm max-w-[280px]">
                  {activeVariation.frets.map((f, idx) => (
                    <div
                      key={idx}
                      className={`flex-1 aspect-square rounded flex flex-col items-center justify-center text-xs font-bold ${
                        f === "x"
                          ? "bg-stone-100 dark:bg-stone-950 text-red-500"
                          : f === 0
                          ? "bg-amber-50 dark:bg-amber-950/20 text-green-600 border border-green-500/30"
                          : "bg-amber-900 text-amber-100"
                      }`}
                    >
                      <span>{6 - idx}ª</span>
                      <span className="text-[10px] opacity-80">{f === "x" ? "X" : f}</span>
                    </div>
                  ))}
                </div>
                <span className="text-[10px] text-slate-400 dark:text-stone-500 block mt-1.5 italic">
                  * 6=Mi grave (grossa), 1=Mi aguda (fina)
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 dark:text-stone-500 uppercase tracking-widest block mb-1 font-mono">
                  Dica de Execução Especializada
                </span>
                <p className="text-xs text-slate-600 dark:text-stone-300 leading-relaxed bg-amber-50/45 dark:bg-stone-950/25 p-3 rounded-xl border border-amber-50/20 dark:border-stone-800">
                  {activeVariation.usageTip}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-stone-800">
            <div className="flex gap-2 items-center bg-green-50 dark:bg-emerald-950/10 text-green-800 dark:text-emerald-400 p-2.5 rounded-xl border border-green-100 dark:border-emerald-900/40 text-[11px]">
              <Check className="w-4 h-4 text-green-600 shrink-0" />
              <span>Dedo firme nas casas: Use a ponta dos dedos em pé (arquear) para o som da cordas soltas ressoar!</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

/**
 * Custom dynamic Guitar Chord Diagram Component using SVG with high visual precision
 */
function GuitarChordDiagram({ chord }: { chord: { frets: (number | "x")[]; fingers: (number | null)[]; baseFret: number; barre?: { fret: number; startString: number; endString: number } } }) {
  // SVG proportions
  const width = 180;
  const height = 220;

  // Grid coordinates
  const leftMargin = 30;
  const rightMargin = 150;
  const topMargin = 40;
  const bottomMargin = 190;

  const totalStrings = 6;
  const totalFrets = 5; // showing 5 frets initially

  const colWidth = (rightMargin - leftMargin) / (totalStrings - 1);
  const rowHeight = (bottomMargin - topMargin) / totalFrets;

  // Maps index to string x coordinate
  const getStringX = (index: number) => leftMargin + (index * colWidth);
  // Maps fret number (1-index matched relative to baseFret) to Y coord
  const getFretY = (fretNum: number) => topMargin + ((fretNum - 0.5) * rowHeight);

  return (
    <svg width={width} height={height} className="text-slate-800 dark:text-slate-200">
      {/* Draw Fretboard Top Nut (thicker line if baseFret is 1) */}
      {chord.baseFret === 1 ? (
        <line
          x1={leftMargin - 2}
          y1={topMargin}
          x2={rightMargin + 2}
          y2={topMargin}
          strokeWidth="6"
          className="stroke-amber-950 dark:stroke-amber-200"
        />
      ) : (
        <line
          x1={leftMargin}
          y1={topMargin}
          x2={rightMargin}
          y2={topMargin}
          strokeWidth="2"
          className="stroke-slate-400 dark:stroke-stone-600"
        />
      )}

      {/* Draw Fretboard fret metal separators */}
      {Array.from({ length: totalFrets }).map((_, fIdx) => {
        const yCoord = topMargin + ((fIdx + 1) * rowHeight);
        return (
          <line
            key={fIdx}
            x1={leftMargin}
            y1={yCoord}
            x2={rightMargin}
            y2={yCoord}
            strokeWidth="1.5"
            className="stroke-slate-300 dark:stroke-stone-700"
          />
        );
      })}

      {/* Draw Strings */}
      {Array.from({ length: totalStrings }).map((_, sIdx) => {
        const xCoord = getStringX(sIdx);
        // String thickness increases from 1st (rightmost, index 5) to 6th (leftmost, index 0)
        const stringWeight = 0.8 + ((5 - sIdx) * 0.4);
        return (
          <line
            key={sIdx}
            x1={xCoord}
            y1={topMargin}
            x2={xCoord}
            y2={bottomMargin}
            strokeWidth={stringWeight}
            className="stroke-slate-400 dark:stroke-stone-500"
          />
        );
      })}

      {/* Mute (X) and Open (O) indicators at the top */}
      {chord.frets.map((f, sIdx) => {
        const xCoord = getStringX(sIdx);
        const yCoord = topMargin - 12;

        if (f === "x") {
          return (
            <g key={sIdx}>
              <line x1={xCoord - 4} y1={yCoord - 4} x2={xCoord + 4} y2={yCoord + 4} stroke="red" strokeWidth="2" />
              <line x1={xCoord + 4} y1={yCoord - 4} x2={xCoord - 4} y2={yCoord + 4} stroke="red" strokeWidth="2" />
            </g>
          );
        } else if (f === 0) {
          return (
            <circle
              key={sIdx}
              cx={xCoord}
              cy={yCoord}
              r="4.5"
              fill="none"
              stroke="#d97706"
              strokeWidth="2"
            />
          );
        }
        return null;
      })}

      {/* Draw Barre if applicable */}
      {chord.barre && (
        <line
          x1={getStringX(chord.barre.startString)}
          y1={getFretY(chord.barre.fret)}
          x2={getStringX(chord.barre.endString)}
          y2={getFretY(chord.barre.fret)}
          strokeWidth="14"
          strokeLinecap="round"
          className="stroke-amber-800/90 dark:stroke-amber-600/90"
        />
      )}

      {/* Draw pressed fingers points */}
      {chord.frets.map((f, sIdx) => {
        if (f !== "x" && f > 0) {
          const finger = chord.fingers[sIdx];
          const x = getStringX(sIdx);
          const relativeFret = f - chord.baseFret + 1;
          const y = getFretY(relativeFret);
          
          return (
            <g key={sIdx}>
              <circle
                cx={x}
                cy={y}
                r="10"
                className="fill-amber-900 dark:fill-amber-600"
              />
              {finger && (
                <text
                  x={x}
                  y={y + 3.5}
                  textAnchor="middle"
                  className="font-black text-[11px] fill-stone-50 font-sans"
                >
                  {finger}
                </text>
              )}
            </g>
          );
        }
        return null;
      })}

      {/* Base Fret Label if baseFret is more than 1 */}
      {chord.baseFret > 1 && (
        <text
          x={leftMargin - 16}
          y={topMargin + 16}
          textAnchor="end"
          className="font-bold text-xs font-mono fill-amber-700 dark:fill-amber-400"
        >
          {chord.baseFret}ª
        </text>
      )}
    </svg>
  );
}
