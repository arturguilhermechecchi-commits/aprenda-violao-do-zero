import { useState, useEffect } from "react";
import { Chord, ChordVariation, UserSession } from "../types";
import { playGuitarChord } from "./AcousticAudio";
import { Volume2, HelpCircle, Check, Info, Sparkles, Award, BookOpen, Lock, Music, Zap, Link } from "lucide-react";
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
  },
  {
    name: "C#dim",
    altName: "Dó Sost. Diminuto",
    frets: ["x", 4, 5, 3, 5, "x"],
    fingers: [null, 2, 4, 1, 3, null],
    baseFret: 3,
    usageTip: "Clássico acorde diminuto de aproximação cromática. Resolva um semitom acima na tônica secundária (Dm).",
  },
  {
    name: "D#dim",
    altName: "Ré Sost. Diminuto",
    frets: ["x", "x", 1, 2, 1, 2],
    fingers: [null, null, 1, 3, 2, 4],
    baseFret: 1,
    usageTip: "Passagem harmônica perfeita entre Ré Maior (D) e Mi Menor (Em). Mantenha o som das outras cordas silenciado.",
  },
  {
    name: "Edim",
    altName: "Mi Diminuto",
    frets: ["x", "x", 2, 3, 2, 3],
    fingers: [null, null, 1, 3, 2, 4],
    baseFret: 2,
    usageTip: "Som altamente polarizado e tenso. Ele é simétrico e pode ser transportado ao longo do braço a cada 3 casas.",
  },
  {
    name: "F#dim",
    altName: "Fá Sost. Diminuto",
    frets: [2, "x", 1, 2, 1, "x"],
    fingers: [2, null, 1, 3, 1, null],
    baseFret: 1,
    usageTip: "Gera uma preparação tensa fantástica para caminhar em direção a Sol Maior (G). Abafe as cordas 5 e 1 com a lateral dos dedos.",
  },
  {
    name: "G#dim",
    altName: "Sol Sost. Diminuto",
    frets: [4, "x", 3, 4, 3, "x"],
    fingers: [2, null, 1, 3, 1, null],
    baseFret: 3,
    usageTip: "O mestre dos sambas antigos. É a ponte ideal para carregar intensidade dramática até desaguar em Lá Menor (Am).",
  },
  {
    name: "Adim",
    altName: "Lá Diminuto",
    frets: ["x", 0, 1, 2, 1, 2],
    fingers: [null, null, 1, 3, 2, 4],
    baseFret: 1,
    usageTip: "Usado com maestria no Choro, Jazz e Violão Cigano para transições elegantes de acordes agudos."
  },
  {
    name: "C#",
    altName: "Dó Sost. Maior",
    frets: ["x", 4, 6, 6, 6, 4],
    fingers: [null, 1, 3, 4, 2, 1],
    baseFret: 4,
    barre: {
      fret: 1,
      startString: 1,
      endString: 5
    },
    usageTip: "Pestana idêntica ao Si Maior (B), porém duas casas adiante. Excelente sonoridade cheia e vibrante."
  },
  {
    name: "D#m",
    altName: "Ré Sost. Menor",
    frets: ["x", 6, 8, 8, 7, 6],
    fingers: [null, 1, 3, 4, 2, 1],
    baseFret: 6,
    barre: {
      fret: 1,
      startString: 1,
      endString: 5
    },
    usageTip: "Usa a digitação clássica de Am transposta para a 6ª casa. Traz um tom melancólico e misterioso."
  },
  {
    name: "G#",
    altName: "Sol Sost. Maior",
    frets: [4, 6, 6, 5, 4, 4],
    fingers: [1, 3, 4, 2, 1, 1],
    baseFret: 4,
    barre: {
      fret: 1,
      startString: 0,
      endString: 5
    },
    usageTip: "Design idêntico a Fá Maior (F), deslocado para a 4ª casa do braço do violão. Perfeito para dar brilho e peso."
  },
  {
    name: "G#m",
    altName: "Sol Sost. Menor",
    frets: [4, 6, 6, 4, 4, 4],
    fingers: [1, 3, 4, 1, 1, 1],
    baseFret: 4,
    barre: {
      fret: 1,
      startString: 0,
      endString: 5
    },
    usageTip: "Idêntico ao formato de F#m, porém na 4ª casa. Tonalidade dramática muito comum em canções pop contemporâneas."
  },
  {
    name: "Bb",
    altName: "Si Bemol Maior",
    frets: ["x", 1, 3, 3, 3, 1],
    fingers: [null, 1, 3, 4, 2, 1],
    baseFret: 1,
    barre: {
      fret: 1,
      startString: 1,
      endString: 5
    },
    usageTip: "Fique de olho na inclinação do polegar no verso do braço. Ajuda a obter pressão uniforme em todas as cinco cordas prendidas."
  },
  {
    name: "Bbm",
    altName: "Si Bemol Menor",
    frets: ["x", 1, 3, 3, 2, 1],
    fingers: [null, 1, 3, 4, 2, 1],
    baseFret: 1,
    barre: {
      fret: 1,
      startString: 1,
      endString: 5
    },
    usageTip: "Pestana localizada na primeira casa. A proximidade da pestana com a pestana fixa do violão exige um pouco mais de força."
  },
  {
    name: "Cdim",
    altName: "Dó Diminuto",
    frets: ["x", 3, 4, 2, 4, "x"],
    fingers: [null, 2, 4, 1, 3, null],
    baseFret: 2,
    usageTip: "Transição perfeita de aproximação cromática para Dm ou C#m. Extremamente jazzístico."
  },
  {
    name: "Ddim",
    altName: "Ré Diminuto",
    frets: ["x", "x", 0, 1, 0, 1],
    fingers: [null, null, null, 2, null, 1],
    baseFret: 1,
    usageTip: "Sonoridade aberta e muito simples de executar. Excelente ponte para transições em tom de Ré Maior."
  },
  {
    name: "Fdim",
    altName: "Fá Diminuto",
    frets: ["x", "x", 3, 4, 3, 4],
    fingers: [null, null, 1, 3, 2, 4],
    baseFret: 3,
    usageTip: "Prepara uma entrada de altíssima tensão emocional antes de repousar na tônica principal (normalmente F# ou Gb)."
  },
  {
    name: "Bdim",
    altName: "Si Diminuto",
    frets: ["x", 2, 3, 1, 3, "x"],
    fingers: [null, 2, 4, 1, 3, null],
    baseFret: 1,
    usageTip: "Excelente e clássica transição para o acorde de C ou de Am em MPB e Bossa Nova."
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
  ],
  "C7M": [
    {
      name: "C7M Aberto",
      difficulty: "Intermediário",
      frets: ["x", 3, 2, 0, 0, 0],
      fingers: [null, 3, 2, null, null, null],
      baseFret: 1,
      usageTip: "Shape básico de bossa nova e MPB. Traz uma atmosfera suave, sofisticada e relaxante."
    },
    {
      name: "C7M com Pestana (3ª casa)",
      difficulty: "Avançado",
      frets: ["x", 3, 5, 4, 5, 3],
      fingers: [null, 1, 3, 2, 4, 1],
      baseFret: 3,
      barre: { fret: 1, startString: 1, endString: 5 },
      usageTip: "Formato de Jazz (Drop 2) muito versátil para passagens cromáticas de meio de braço."
    },
    {
      name: "C7M Bossa Nova (8ª casa)",
      difficulty: "Avançado",
      frets: [8, "x", 9, 9, 8, "x"],
      fingers: [1, null, 3, 4, 2, null],
      baseFret: 8,
      usageTip: "Clássico encadeamento de Bossa Nova com o polegar marcando o baixo em Dó na 6ª corda."
    }
  ],
  "D9": [
    {
      name: "Ré com Nona Aberto (D9)",
      difficulty: "Iniciante",
      frets: ["x", "x", 0, 2, 3, 0],
      fingers: [null, null, null, 1, 3, null],
      baseFret: 1,
      usageTip: "Substituto moderno e rico para o Ré maior convencional com bastante brilho de violão folk."
    },
    {
      name: "D9 Sofisticado (Bossa Nova)",
      difficulty: "Avançado",
      frets: ["x", 5, 4, 5, 5, "x"],
      fingers: [null, 2, 1, 3, 4, null],
      baseFret: 4,
      usageTip: "Excelente fôrma de Samba e Jazz com o polegar de apoio nas cordas centrais."
    }
  ],
  "G7": [
    {
      name: "Sol Dominante com Sétima (G7) Aberto",
      difficulty: "Iniciante",
      frets: [3, 2, 0, 0, 0, 1],
      fingers: [3, 2, null, null, null, 1],
      baseFret: 1,
      usageTip: "Gera a tensão harmônica natural do acorde de Sol Maior antes de repousar em Dó."
    },
    {
      name: "G7 com Pestana (3ª casa)",
      difficulty: "Intermediário",
      frets: [3, 5, 3, 4, 3, 3],
      fingers: [1, 3, 1, 2, 1, 1],
      baseFret: 3,
      barre: { fret: 1, startString: 0, endString: 5 },
      usageTip: "Clássico formato de E7 com pestana na 3ª casa, muito comum em blues."
    },
    {
      name: "G7 Moderno (Bossa / Jazz)",
      difficulty: "Avançado",
      frets: [3, "x", 3, 4, 3, "x"],
      fingers: [1, null, 2, 3, 1, null],
      baseFret: 3,
      usageTip: "Elegante fôrma com notas limpas e baixo abafado nas cordas internas."
    }
  ],
  "Bm7": [
    {
      name: "Si Menor com Sétima (Bm7)",
      difficulty: "Intermediário",
      frets: ["x", 2, 4, 2, 3, 2],
      fingers: [null, 1, 3, 1, 2, 1],
      baseFret: 2,
      barre: { fret: 1, startString: 1, endString: 5 },
      usageTip: "Pestana leve e muito confortável no violão, ótima para condução acústica."
    },
    {
      name: "Bm7 Bossa Nova de 6ª Corda",
      difficulty: "Avançado",
      frets: [7, "x", 7, 7, 7, "x"],
      fingers: [1, null, 2, 3, 4, null],
      baseFret: 7,
      usageTip: "Shape exclusivo para puxar o dedilhado no samba com baixo forte no Si."
    }
  ],
  "F#m7": [
    {
      name: "Fá Sost. Menor com Sétima (F#m7)",
      difficulty: "Intermediário",
      frets: [2, 4, 2, 2, 2, 2],
      fingers: [1, 3, 1, 1, 1, 1],
      baseFret: 2,
      barre: { fret: 1, startString: 0, endString: 5 },
      usageTip: "Base de praticamente todos os sambas e canções clássicas de Bossa Nova."
    },
    {
      name: "F#m7 Bossa Nova (9ª casa)",
      difficulty: "Avançado",
      frets: ["x", 9, 11, 9, 10, 9],
      fingers: [null, 1, 3, 1, 2, 1],
      baseFret: 9,
      barre: { fret: 1, startString: 1, endString: 5 },
      usageTip: "Formato agudo com pestana na 9ª casa, excelente tom agudo harmônico."
    }
  ],
  "E7(9)": [
    {
      name: "E7(9) Bossa Nova",
      difficulty: "Avançado",
      frets: ["x", 7, 6, 7, 7, "x"],
      fingers: [null, 2, 1, 3, 4, null],
      baseFret: 6,
      usageTip: "O supremo balanço da Bossa Nova e do Jazz. Fricciona a sétima menor com a nona maior."
    },
    {
      name: "E7(9) Aberto (Blues)",
      difficulty: "Intermediário",
      frets: [0, 2, 0, 1, 0, 2],
      fingers: [null, 2, null, 1, null, 4],
      baseFret: 1,
      usageTip: "Combina o brilho do Mi grave aberto com a fôrma de blues acústico e swing."
    }
  ],
  "C9": [
    {
      name: "Dó com Nona (C9) Aberto",
      difficulty: "Iniciante",
      frets: ["x", 3, 2, 0, 3, 0],
      fingers: [null, 2, 1, null, 3, null],
      baseFret: 1,
      usageTip: "Sonoridade moderna e brilhante para substituir o C clássico folk."
    },
    {
      name: "C9 Groove (Pestana na 3ª casa)",
      difficulty: "Avançado",
      frets: ["x", 3, 2, 3, 3, 3],
      fingers: [null, 2, 1, 3, 4, 4],
      baseFret: 2,
      usageTip: "Traz a energia do Funk e Soul com pegada rítmica nas cordas agudas."
    }
  ],
  "A7": [
    {
      name: "Lá com Sétima (A7) Aberto",
      difficulty: "Iniciante",
      frets: ["x", 0, 2, 0, 2, 0],
      fingers: [null, null, 1, null, 2, null],
      baseFret: 1,
      usageTip: "Gera tensão com apenas 2 dedos, indispensável para blues e samba de raiz."
    },
    {
      name: "A7 com Pestana (5ª casa)",
      difficulty: "Intermediário",
      frets: [5, 7, 5, 6, 5, 5],
      fingers: [1, 3, 1, 2, 1, 1],
      baseFret: 5,
      barre: { fret: 1, startString: 0, endString: 5 },
      usageTip: "Clássica pestana na 5ª casa e pegada percussiva marcante de guitarra blues."
    },
    {
      name: "A7 Bossa Nova sem Pestana",
      difficulty: "Avançado",
      frets: ["x", 12, 11, 12, 10, "x"],
      fingers: [null, 3, 2, 4, 1, null],
      baseFret: 10,
      usageTip: "Selecione esta elegante fôrma alta para solos e arranjos jazzísticos agudos."
    }
  ],
  "B7": [
    {
      name: "Si com Sétima (B7) Aberto",
      difficulty: "Intermediário",
      frets: ["x", 2, 1, 2, 0, 2],
      fingers: [null, 2, 1, 3, null, 4],
      baseFret: 1,
      usageTip: "Acorde de preparação espetacular, rico para as modulações na música popular."
    },
    {
      name: "B7 com Pestana (2ª casa)",
      difficulty: "Avançado",
      frets: ["x", 2, 4, 2, 4, 2],
      fingers: [null, 1, 3, 1, 4, 1],
      baseFret: 2,
      barre: { fret: 1, startString: 1, endString: 5 },
      usageTip: "Usa fôrma móvel com pestana esticada para dinâmicas mais ágeis."
    }
  ],
  "D7M": [
    {
      name: "Ré com Sétima Maior (D7M) Aberto",
      difficulty: "Iniciante",
      frets: ["x", "x", 0, 2, 2, 2],
      fingers: [null, null, null, 1, 2, 3],
      baseFret: 1,
      usageTip: "Sua doçura e nostalgia fazem dele um dos acorde mais amados da MPB."
    },
    {
      name: "D7M Moderno (5ª casa)",
      difficulty: "Avançado",
      frets: ["x", 5, 7, 6, 7, 5],
      fingers: [null, 1, 3, 2, 4, 1],
      baseFret: 5,
      barre: { fret: 1, startString: 1, endString: 5 },
      usageTip: "Oferece um ar extremamente sofisticado e moderno para andamentos lentos de jazz."
    }
  ],
  "A7M": [
    {
      name: "Lá com Sétima Maior (A7M) Aberto",
      difficulty: "Iniciante",
      frets: ["x", 0, 2, 1, 2, 0],
      fingers: [null, null, 2, 1, 3, null],
      baseFret: 1,
      usageTip: "Uma maravilhosa e calmo fôrma introspectiva com apenas 3 dedos."
    },
    {
      name: "A7M Bossa Nova (5ª casa)",
      difficulty: "Avançado",
      frets: [5, "x", 6, 6, 5, "x"],
      fingers: [1, null, 3, 4, 2, null],
      baseFret: 5,
      usageTip: "Clássico encadeamento brasileiro sem pestana com notas cheias no baixo da 6ª corda."
    }
  ],
  "G7M": [
    {
      name: "Sol com Sétima Maior (G7M) Bossa Nova",
      difficulty: "Avançado",
      frets: [3, "x", 4, 4, 3, "x"],
      fingers: [1, null, 3, 4, 2, null],
      baseFret: 3,
      usageTip: "Usa o polegar de forma leve na 6ª corda para conduzir as marcantes levadas sincopadas."
    },
    {
      name: "G7M com Pestana na 10ª casa",
      difficulty: "Avançado",
      frets: ["x", 10, 12, 11, 12, 10],
      fingers: [null, 1, 3, 2, 4, 1],
      baseFret: 10,
      barre: { fret: 1, startString: 1, endString: 5 },
      usageTip: "Brilhante sonoridade de jazz no registro alto do braço do violão."
    }
  ],
  "Dm9": [
    {
      name: "Ré Menor com Nona (Dm9) Bossa Nova",
      difficulty: "Avançado",
      frets: ["x", 5, 3, 5, 5, "x"],
      fingers: [null, 2, 1, 3, 4, null],
      baseFret: 3,
      usageTip: "Clássica fôrma sofisticada e romântica da bossa nova e do piano acústico."
    },
    {
      name: "Dm9 Simplificado Estilo Lofi",
      difficulty: "Intermediário",
      frets: ["x", "x", 0, 2, 1, 0],
      fingers: [null, null, null, 2, 1, null],
      baseFret: 1,
      usageTip: "Excepcional fôrma que se beneficia da corda Mi aguda solta para gerar tensão Lofi."
    }
  ],
  "G7(13)": [
    {
      name: "Sol com Sétima e Décima Terceira G7(13)",
      difficulty: "Avançado",
      frets: [3, "x", 3, 4, 5, "x"],
      fingers: [1, null, 2, 3, 4, null],
      baseFret: 3,
      usageTip: "Fricção jazzística mítica combinando o baixo, a sétima menor e o brilho da 13ª."
    },
    {
      name: "G7(13) Aberto",
      difficulty: "Avançado",
      frets: [3, 2, 0, 0, 0, 0],
      fingers: [2, 1, null, null, null, null],
      baseFret: 1,
      usageTip: "A tática de deixar a 1ª e 2ª cordas soltas cria um preenchimento surpreendência."
    }
  ],
  "Am9": [
    {
      name: "Lá Menor com Nona (Am9) Aberto",
      difficulty: "Intermediário",
      frets: ["x", 0, 2, 4, 1, 0],
      fingers: [null, null, 2, 4, 1, null],
      baseFret: 1,
      usageTip: "Abstrato e misterioso, ideal para dedilhados lentos e reflexivos."
    },
    {
      name: "Am9 Bossa Nova (5ª casa)",
      difficulty: "Avançado",
      frets: [5, "x", 5, 5, 5, 7],
      fingers: [1, null, 1, 1, 1, 3],
      baseFret: 5,
      barre: { fret: 1, startString: 0, endString: 4 },
      usageTip: "Mini-pestana prendendo a 5ª casa e esticando o dedo mínimo na 7ª casa."
    }
  ],
  "B7M": [
    {
      name: "Si com Sétima Maior (B7M) Padrão",
      difficulty: "Intermediário",
      frets: ["x", 2, 4, 3, 4, 2],
      fingers: [null, 1, 3, 2, 4, 1],
      baseFret: 2,
      barre: { fret: 1, startString: 1, endString: 5 },
      usageTip: "Fôrma clássica e doce que cria uma introdução romântica fantástica em Mi Maior."
    },
    {
      name: "B7M Bossa Novo Puxado (7ª casa)",
      difficulty: "Avançado",
      frets: [7, "x", 8, 8, 7, "x"],
      fingers: [1, null, 3, 4, 2, null],
      baseFret: 7,
      usageTip: "Une o marcante grave da 6ª corda com as elegantes puxadas de MPB."
    }
  ],
  "Bm7(b5)": [
    {
      name: "Si Meio-Diminuto Bm7(b5) MPB",
      difficulty: "Avançado",
      frets: ["x", 2, 3, 2, 3, "x"],
      fingers: [null, 1, 3, 2, 4, null],
      baseFret: 2,
      usageTip: "O acorde fundamental de passagem harmônica menor (II-V-I). Traz o clima dramático de jazz."
    },
    {
      name: "Bm7(b5) Baixo na 6ª Corda",
      difficulty: "Avançado",
      frets: [7, "x", 7, 7, 6, "x"],
      fingers: [2, null, 3, 4, 1, null],
      baseFret: 6,
      usageTip: "Excelente shape com inversão para preencher o baixo de samba e bossas."
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

interface HarmonicFieldMember {
  degree: string;
  chordName: string;
  role: "Tônica" | "Subdominante" | "Dominante" | "Dominante Pas." | "Dominante Natural" | "Dominante Harmônico" | "Tônica (Atuante)";
  description: string;
}

interface HarmonicField {
  key: string;
  mainChord: string;
  description: string;
  chords: HarmonicFieldMember[];
}

const HARMONIC_FIELDS: HarmonicField[] = [
  {
    key: "Dó Maior (C)",
    mainChord: "C",
    description: "O campo mais básico e brilhante do violão. Não possui nenhum sustenido (#) ou bemol (b). Perfeito para baladas doces e pop acústico.",
    chords: [
      { degree: "I", chordName: "C", role: "Tônica", description: "Acorde de repouso e resolução principal." },
      { degree: "I7M", chordName: "C7M", role: "Tônica", description: "Variação sofisticada do primeiro grau (Bossa Nova)." },
      { degree: "IIm", chordName: "Dm", role: "Subdominante", description: "Prepara o caminho, gerando um som suave de transição." },
      { degree: "IIIm", chordName: "Em", role: "Tônica (Atuante)", description: "Grau melancólico subordinado ao repouso." },
      { degree: "IV", chordName: "F", role: "Subdominante", description: "Gera sensação de suspensão e afastamento da tônica." },
      { degree: "V", chordName: "G", role: "Dominante", description: "Acorde de tensionamento forte que exige resolução voltando ao C." },
      { degree: "V7", chordName: "G7", role: "Dominante", description: "Tensão máxima com trítono clássico de preparação dominante." },
      { degree: "VIm", chordName: "Am", role: "Tônica (Atuante)", description: "Relativo menor oficial. Excelente para pontes reflexivas." },
      { degree: "VIIm7(b5)", chordName: "Bm7(b5)", role: "Dominante Pas.", description: "Meio-diminuto que adiciona dramaticidade jazzística." }
    ]
  },
  {
    key: "Dó Sustenido Maior (C#)",
    mainChord: "C#",
    description: "Tonalidade com sonorizaçao brilhante e cheia, rica em sustenidos. Possui 7 sustenidos.",
    chords: [
      { degree: "I", chordName: "C#", role: "Tônica", description: "Grau de estabilidade e repouso principal." },
      { degree: "IIm", chordName: "D#m", role: "Subdominante", description: "Excelente para caminhos de passagem suave." },
      { degree: "IIIm", chordName: "Fm", role: "Tônica", description: "Grau que serve como substituto suave da tônica." },
      { degree: "IV", chordName: "F#", role: "Subdominante", description: "Gera afastamento e sensação de amplitude." },
      { degree: "V", chordName: "G#", role: "Dominante", description: "Tensão clássica para preparar o repouso absoluto no C#." },
      { degree: "V7", chordName: "G#7", role: "Dominante", description: "Tensão máxima que puxa fortemente para a tônica." },
      { degree: "VIm", chordName: "A#m", role: "Tônica", description: "Relativo menor que acrescenta sobriedade." }
    ]
  },
  {
    key: "Ré Maior (D)",
    mainChord: "D",
    description: "Excelente para ritmos rápidos, pop nacional e rock. Possui 2 sustenidos (Fá# e Dó#).",
    chords: [
      { degree: "I", chordName: "D", role: "Tônica", description: "Alegre e extremamente vibrante." },
      { degree: "I7M", chordName: "D7M", role: "Tônica", description: "Textura aveludada romântica." },
      { degree: "IIm", chordName: "Em", role: "Subdominante", description: "Passagem fácil e de som redondo de dedilhado." },
      { degree: "IIIm", chordName: "F#m", role: "Tônica", description: "Contraste sereno e nostálgico." },
      { degree: "IV", chordName: "G", role: "Subdominante", description: "Contrapeso robusto e aberto." },
      { degree: "V", chordName: "A", role: "Dominante", description: "Encaminhamento direto e tenso rumo ao repouso." },
      { degree: "V7", chordName: "A7", role: "Dominante", description: "Tensão clássica indispensável de blues acústico." },
      { degree: "VIm", chordName: "Bm", role: "Tônica", description: "Relativo menor dramático que fecha bem estrofes." }
    ]
  },
  {
    key: "Mi Bemol Maior (Eb)",
    mainChord: "Eb",
    description: "Tonalidade com sonoridade aveludada e profunda, bastante usada em metais e arranjos sofisticados.",
    chords: [
      { degree: "I", chordName: "Eb", role: "Tônica", description: "Estabilidade principal da tonalidade com som encorpado." },
      { degree: "IIm", chordName: "Fm", role: "Subdominante", description: "Preparador melancólico de harmonia." },
      { degree: "IIIm", chordName: "Gm", role: "Tônica", description: "Sabor reflexivo com menor estável." },
      { degree: "IV", chordName: "Ab", role: "Subdominante", description: "Abertura aberta e cheia de ar." },
      { degree: "V", chordName: "Bb", role: "Dominante", description: "Empurrão de tensão harmônica." },
      { degree: "V7", chordName: "Bb7", role: "Dominante", description: "Preparador essencial para resolver no Eb." },
      { degree: "VIm", chordName: "Cm", role: "Tônica", description: "Relativo menor expressivo e nostálgico." }
    ]
  },
  {
    key: "Mi Maior (E)",
    mainChord: "E",
    description: "A tonalidade preferida dos tocadores de blues de Chicago, folk e modas de viola. 4 sustenidos (Fá#, Dó#, Sol# e Ré#).",
    chords: [
      { degree: "I", chordName: "E", role: "Tônica", description: "Som poderoso aproveitando todos os graves do violão de 6 cordas." },
      { degree: "IIm", chordName: "F#m", role: "Subdominante", description: "Acorde de suporte indispensável." },
      { degree: "IIIm", chordName: "C#m", role: "Tônica", description: "Nostalgias de menor relativo." },
      { degree: "IV", chordName: "A", role: "Subdominante", description: "Mudança aberta com os agudos livres." },
      { degree: "V", chordName: "B", role: "Dominante", description: "Tensão com abertura rítmica." },
      { degree: "V7", chordName: "B7", role: "Dominante", description: "A fôrma aberta de B7 gera uma das tensões mais ricas do violão." }
    ]
  },
  {
    key: "Fá Maior (F)",
    mainChord: "F",
    description: "Uma tonalidade robusta que exige pestana forte no violão, proporcionando canções encorpadas e expressivas.",
    chords: [
      { degree: "I", chordName: "F", role: "Tônica", description: "Base tônica com peso e sustentação na pestana." },
      { degree: "IIm", chordName: "Gm", role: "Subdominante", description: "Sonoridade suavemente sombria de preparação." },
      { degree: "IIIm", chordName: "Am", role: "Tônica", description: "Alternativa melancólica e levemente estável." },
      { degree: "IV", chordName: "Bb", role: "Subdominante", description: "Abertura de espaço e frescor melódico de passagem." },
      { degree: "V", chordName: "C", role: "Dominante", description: "Tensão luminosa de encaminhamento." },
      { degree: "V7", chordName: "C7", role: "Dominante", description: "Preparação dominante perfeita para voltar ao repouso no F." },
      { degree: "VIm", chordName: "Dm", role: "Tônica", description: "Relativo menor oficial que confere drama e emoção." }
    ]
  },
  {
    key: "Fá Sustenido Maior (F#)",
    mainChord: "F#",
    description: "Tonalidade ultra vibrante e complexa, com pestanas e timbres brilhantes no violão.",
    chords: [
      { degree: "I", chordName: "F#", role: "Tônica", description: "Grande brilho e estabilidade harmônica." },
      { degree: "IIm", chordName: "G#m", role: "Subdominante", description: "Gesto clássico de avanço e suspensão." },
      { degree: "IIIm", chordName: "A#m", role: "Tônica", description: "Contraponto estável romântico menor." },
      { degree: "IV", chordName: "B", role: "Subdominante", description: "Abertura cheia e limpa." },
      { degree: "V", chordName: "C#", role: "Dominante", description: "Tensão de impulsão clássica." },
      { degree: "V7", chordName: "C#7", role: "Dominante", description: "Tensão total para retorno glorioso à tônica F#." },
      { degree: "VIm", chordName: "D#m", role: "Tônica", description: "Relativo de extrema melancolia." }
    ]
  },
  {
    key: "Sol Maior (G)",
    mainChord: "G",
    description: "Um dos campos harmônicos mais populares no violão folk e sertanejo universitário. Contém 1 sustenido (Fá#).",
    chords: [
      { degree: "I", chordName: "G", role: "Tônica", description: "Base feliz e sólida da tonalidade." },
      { degree: "I7M", chordName: "G7M", role: "Tônica", description: "Som ultra-relaxante de fim de tarde." },
      { degree: "IIm", chordName: "Am", role: "Subdominante", description: "Transição suave e melancólica." },
      { degree: "IIIm", chordName: "Bm", role: "Tônica", description: "Ponto triste de estabilidade harmônica menor." },
      { degree: "IV", chordName: "C", role: "Subdominante", description: "Abertura de espaço e frescor melódico." },
      { degree: "V", chordName: "D", role: "Dominante", description: "Arremates de tensão brilhantes." },
      { degree: "V7", chordName: "D9", role: "Dominante", description: "A nona adiciona luxo resolvendo de volta no Sol." },
      { degree: "VIm", chordName: "Em", role: "Tônica", description: "Relativo melancólico de peso extremo." }
    ]
  },
  {
    key: "Lá Bemol Maior (Ab)",
    mainChord: "Ab",
    description: "Tonalidade doce e calorosa, de timbre fechado e aveludado.",
    chords: [
      { degree: "I", chordName: "Ab", role: "Tônica", description: "Tonalidade principal com timbre encorpado." },
      { degree: "IIm", chordName: "Bbm", role: "Subdominante", description: "Passagem melindrosa e intimista." },
      { degree: "IIIm", chordName: "Cm", role: "Tônica", description: "Tonalidade menor melancólica de estabilidade." },
      { degree: "IV", chordName: "Db", role: "Subdominante", description: "Efeito amplo de abertura de ar." },
      { degree: "V", chordName: "Eb", role: "Dominante", description: "Vigor com tensão que empurra de volta." },
      { degree: "V7", chordName: "Eb7", role: "Dominante", description: "Preparador mestre para resolução suave." },
      { degree: "VIm", chordName: "Fm", role: "Tônica", description: "Relativo apaixonado e melancólico menor." }
    ]
  },
  {
    key: "Lá Maior (A)",
    mainChord: "A",
    description: "Muito utilizado no blues, rock clássico e na Bossa Nova tradicional. Possui 3 sustenidos (Fá#, Dó# e Sol#).",
    chords: [
      { degree: "I", chordName: "A", role: "Tônica", description: "Acorde encorpado com os baixos na 5ª corda solta." },
      { degree: "I7M", chordName: "A7M", role: "Tônica", description: "Chave harmônica favorita dos amantes de Bossa Nova." },
      { degree: "IIm", chordName: "Bm", role: "Subdominante", description: "Pestana refinada de preparação." },
      { degree: "IIIm", chordName: "C#m", role: "Tônica", description: "Sensação reflexiva e intimista." },
      { degree: "IV", chordName: "D", role: "Subdominante", description: "Aperto vibrante de expansão." },
      { degree: "V", chordName: "E", role: "Dominante", description: "Preparador fundamental carregado de brilho." },
      { degree: "V7", chordName: "E7(9)", role: "Dominante", description: "Tensão com sabor de lounge jazz e brasilidade." },
      { degree: "VIm", chordName: "F#m", role: "Tônica", description: "Balanço melódico suave e elegante." }
    ]
  },
  {
    key: "Si Bemol Maior (Bb)",
    mainChord: "Bb",
    description: "Excelente para canções de MPB, Bossa Nova e jazz acústico. Possui 2 bemóis.",
    chords: [
      { degree: "I", chordName: "Bb", role: "Tônica", description: "Grande profundidade, muito macio e elegante." },
      { degree: "IIm", chordName: "Cm", role: "Subdominante", description: "Ponto de passagem redondo menor." },
      { degree: "IIIm", chordName: "Dm", role: "Tônica", description: "Melancolia reconfortante de suporte estável." },
      { degree: "IV", chordName: "Eb", role: "Subdominante", description: "Contrabalanço de ar que amplia a harmonia." },
      { degree: "V", chordName: "F", role: "Dominante", description: "Tensão luminosa clássica." },
      { degree: "V7", chordName: "F7", role: "Dominante", description: "Tensão com tritono perfeito de retorno para Bb." },
      { degree: "VIm", chordName: "Gm", role: "Tônica", description: "Relativo menor oficial forte e solene." }
    ]
  },
  {
    key: "Si Maior (B)",
    mainChord: "B",
    description: "Possui brilho penetrante e timbre muito vivo no violão. 5 sustenidos.",
    chords: [
      { degree: "I", chordName: "B", role: "Tônica", description: "Base brilhante and cheia de energia harmônica." },
      { degree: "IIm", chordName: "C#m", role: "Subdominante", description: "Ponto clássico menor de suporte rítmico." },
      { degree: "IIIm", chordName: "D#m", role: "Tônica", description: "Grau melancólico com afinação rica." },
      { degree: "IV", chordName: "E", role: "Subdominante", description: "Abertura limpa de grande amplitude." },
      { degree: "V", chordName: "F#", role: "Dominante", description: "Preparação brilhante e incisiva." },
      { degree: "V7", chordName: "F#7", role: "Dominante", description: "Tensão dominante irresistível puxando para o si." },
      { degree: "VIm", chordName: "G#m", role: "Tônica", description: "Relativo que confere drama denso." }
    ]
  },
  {
    key: "Dó Menor (Cm)",
    mainChord: "Cm",
    description: "Sonoridade dramática e densa, excelente para expressar sentimentos misteriosos ou solenes.",
    chords: [
      { degree: "Im", chordName: "Cm", role: "Tônica", description: "Fundação escura de enorme dramaticidade." },
      { degree: "IIm7(b5)", chordName: "Dm7(b5)", role: "Subdominante", description: "Prepara com angústia de meio-diminuto." },
      { degree: "bIII", chordName: "Eb", role: "Tônica", description: "O refúgio tônico maior brilhante e alegre." },
      { degree: "IVm", chordName: "Fm", role: "Subdominante", description: "Suporte melancólico clássico e sombrio." },
      { degree: "Vm", chordName: "Gm", role: "Dominante Natural", description: "Transição suave de clima nórdico." },
      { degree: "V7", chordName: "G7", role: "Dominante Harmônico", description: "Força dramática imperativa de retorno ao repouso." },
      { degree: "bVI", chordName: "Ab", role: "Subdominante", description: "Aumento de dinâmica épica e inspiradora." },
      { degree: "bVII", chordName: "Bb", role: "Dominante", description: "Caminho natural de glória maior." }
    ]
  },
  {
    key: "Dó Sustenido Menor (C#m)",
    mainChord: "C#m",
    description: "Um dos tons menores favoritos para violão acústico e pop rock. Muito expressivo e fácil encaixe harmônico.",
    chords: [
      { degree: "Im", chordName: "C#m", role: "Tônica", description: "Melancolia robusta, linda dedilhada de passagem." },
      { degree: "IIm7(b5)", chordName: "D#m7(b5)", role: "Subdominante", description: "Tensão meio-diminuta elegante." },
      { degree: "bIII", chordName: "E", role: "Tônica", description: "Passagem aberta e iluminada de tônica maior." },
      { degree: "IVm", chordName: "F#m", role: "Subdominante", description: "Cria atmosfera de recolhimento e profundidade." },
      { degree: "Vm", chordName: "G#m", role: "Dominante Natural", description: "Base límpida e repousante suave menor." },
      { degree: "V7", chordName: "G#7", role: "Dominante Harmônico", description: "Clássico preparador dominante de forte retorno." },
      { degree: "bVI", chordName: "A", role: "Subdominante", description: "Abertura tônica com grande fôlego acústico." },
      { degree: "bVII", chordName: "B", role: "Dominante", description: "Força de transição brilhante." }
    ]
  },
  {
    key: "Ré Menor (Dm)",
    mainChord: "Dm",
    description: "Tonalidade preferida para baladas profundas, canções renascentistas e músicas de clima misterioso.",
    chords: [
      { degree: "Im", chordName: "Dm", role: "Tônica", description: "O acorde mais triste possível, segundo cientistas harmônicos." },
      { degree: "IIm7(b5)", chordName: "Em7(b5)", role: "Subdominante", description: "Preparação tensa meio-diminuta para a cadência menor." },
      { degree: "bIII", chordName: "F", role: "Tônica", description: "Abertura acolhedora de esperança e brilho maior." },
      { degree: "IVm", chordName: "Gm", role: "Subdominante", description: "Dramático e clássico de canções românticas." },
      { degree: "Vm", chordName: "Am", role: "Dominante Natural", description: "Clima limpo, nórdico ou medieval." },
      { degree: "V7", chordName: "A7", role: "Dominante Harmônico", description: "Prepara de forma imponente a entrada do Ré Menor." },
      { degree: "bVI", chordName: "Bb", role: "Subdominante", description: "Gera sensação de amplitude e emoção crescente." },
      { degree: "bVII", chordName: "C", role: "Dominante", description: "Ponto suave de apoio e transição de repouso." }
    ]
  },
  {
    key: "Mi Bemol Menor (Ebm)",
    mainChord: "Ebm",
    description: "Pesado, misterioso e profundo. Uma tonalidade carregada de sentimento de súplica ou introspecção profunda.",
    chords: [
      { degree: "Im", chordName: "D#m", role: "Tônica", description: "Tônica sombria mas infinitamente expressiva." },
      { degree: "IIm7(b5)", chordName: "Fm7(b5)", role: "Subdominante", description: "Tensão meio-diminuta complexa." },
      { degree: "bIII", chordName: "Gb", role: "Tônica", description: "Ponto maior de repouso refrescante." },
      { degree: "IVm", chordName: "Abm", role: "Subdominante", description: "Suporte profundo de base." },
      { degree: "Vm", chordName: "Bbm", role: "Dominante Natural", description: "Contraste pacífico e suave menor." },
      { degree: "V7", chordName: "Bb7", role: "Dominante Harmônico", description: "Fecho tenso clássico rumo à tônica." },
      { degree: "bVI", chordName: "B", role: "Subdominante", description: "Gera energia grandiosa de libertação." },
      { degree: "bVII", chordName: "Db", role: "Dominante", description: "Apoio harmônico maior de transição." }
    ]
  },
  {
    key: "Mi Menor (Em)",
    mainChord: "Em",
    description: "Som de peso no rock nacional, folk nórdico e baladas acústicas intensas.",
    chords: [
      { degree: "Im", chordName: "Em", role: "Tônica", description: "O acorde menor mais fácil e encorpado do violão." },
      { degree: "IIm7(b5)", chordName: "F#m7(b5)", role: "Subdominante", description: "Pestana meio-diminuta de passagem melódica." },
      { degree: "bIII", chordName: "G", role: "Tônica", description: "Relativo alegre que contrasta a escuridão do Em." },
      { degree: "IVm", chordName: "Am", role: "Subdominante", description: "Sensação de profundidade no meio da música." },
      { degree: "Vm", chordName: "Bm", role: "Dominante Natural", description: "Base clássica e fresca de transição suave." },
      { degree: "V7", chordName: "B7", role: "Dominante Harmônico", description: "Tensão clássica e forte de resolução para Em." },
      { degree: "bVI", chordName: "C", role: "Subdominante", description: "Brilho aberto e expansivo de esperança." },
      { degree: "bVII", chordName: "D", role: "Dominante", description: "Ponto de partida clássico de retorno para Sol maior." }
    ]
  },
  {
    key: "Fá Menor (Fm)",
    mainChord: "Fm",
    description: "Tonalidade melancólica extrema, com som profundo e lamentos harmônicos requintados.",
    chords: [
      { degree: "Im", chordName: "Fm", role: "Tônica", description: "Sabor de extrema escuridão e seriedade de timbre." },
      { degree: "IIm7(b5)", chordName: "Gm7(b5)", role: "Subdominante", description: "Sinalizador melancólico sofisticado." },
      { degree: "bIII", chordName: "Ab", role: "Tônica", description: "O escape alegre tônico oficial." },
      { degree: "IVm", chordName: "Bbm", role: "Subdominante", description: "Efeito nostálgico e comovente de fado." },
      { degree: "Vm", chordName: "Cm", role: "Dominante Natural", description: "Grau que desacelera a tensão dramaticamente." },
      { degree: "V7", chordName: "C7", role: "Dominante Harmônico", description: "Tensão majestosa e forte imperativa sobre Fm." },
      { degree: "bVI", chordName: "Db", role: "Subdominante", description: "Abertura épica cheia de esperança." },
      { degree: "bVII", chordName: "Eb", role: "Dominante", description: "Base maior de resolução e contraste." }
    ]
  },
  {
    key: "Fá Sustenido Menor (F#m)",
    mainChord: "F#m",
    description: "Muito amada na música popular brasileira e pop rock de tons reflexivos e profundidade poética.",
    chords: [
      { degree: "Im", chordName: "F#m", role: "Tônica", description: "Postura elegante de timbre equilibrado nas pestanas." },
      { degree: "IIm7(b5)", chordName: "G#m7(b5)", role: "Subdominante", description: "Preparador melancólico mestre." },
      { degree: "bIII", chordName: "A", role: "Tônica", description: "Brilho relaxante e espaçoso de tônica amorosa maior." },
      { degree: "IVm", chordName: "Bm", role: "Subdominante", description: "Suporte intimista excelente para rascunhos de compasso." },
      { degree: "Vm", chordName: "C#m", role: "Dominante Natural", description: "Suavidade de passagem no meio de estrofes." },
      { degree: "V7", chordName: "C#7", role: "Dominante Harmônico", description: "Gera forte empuxo espanhol direto ao repouso." },
      { degree: "bVI", chordName: "D", role: "Subdominante", description: "Contraste bonito e expansivo aberto." },
      { degree: "bVII", chordName: "E", role: "Dominante", description: "Transição natural de repouso resolutivo." }
    ]
  },
  {
    key: "Sol Menor (Gm)",
    mainChord: "Gm",
    description: "Elegante e melancólico, muito comum no samba antigo, choro e no jazz melancólico.",
    chords: [
      { degree: "Im", chordName: "Gm", role: "Tônica", description: "Repouso elegante de sabor tradicional e refinado." },
      { degree: "IIm7(b5)", chordName: "Am7(b5)", role: "Subdominante", description: "Cadência meio-diminuta clássica brasileira." },
      { degree: "bIII", chordName: "Bb", role: "Tônica", description: "Repouso tômico maior de brilho sofisticadamente macio." },
      { degree: "IVm", chordName: "Cm", role: "Subdominante", description: "Delineador dramático de grande melancolia." },
      { degree: "Vm", chordName: "Dm", role: "Dominante Natural", description: "Suave transmutação de tons." },
      { degree: "V7", chordName: "D7", role: "Dominante Harmônico", description: "Alavanca de tensão clássica de re-resolução rápida." },
      { degree: "bVI", chordName: "Eb", role: "Subdominante", description: "Amplitude de tom que areja as estrofes." },
      { degree: "bVII", chordName: "F", role: "Dominante", description: "Acorde de suporte brilhante e impulsão maior." }
    ]
  },
  {
    key: "Sol Sustenido Menor (G#m)",
    mainChord: "G#m",
    description: "Altamente emotiva, com timbre denso e afinação com grande coloração acústica.",
    chords: [
      { degree: "Im", chordName: "G#m", role: "Tônica", description: "Base escura de grande introspecção." },
      { degree: "IIm7(b5)", chordName: "A#m7(b5)", role: "Subdominante", description: "Preparador sofisticado meio-diminuto." },
      { degree: "bIII", chordName: "B", role: "Tônica", description: "Teto luminoso de estabilidade maior." },
      { degree: "IVm", chordName: "C#m", role: "Subdominante", description: "Contraste intimista menor excelente." },
      { degree: "Vm", chordName: "D#m", role: "Dominante Natural", description: "Suave andamento melancólico." },
      { degree: "V7", chordName: "D#7", role: "Dominante Harmônico", description: "Tensão imposta clássica." },
      { degree: "bVI", chordName: "E", role: "Subdominante", description: "Contrapeso robusto de libertação emocional." },
      { degree: "bVII", chordName: "F#", role: "Dominante", description: "Base brilhante e luminosa de passagem ampla." }
    ]
  },
  {
    key: "Lá Menor (Am)",
    mainChord: "Am",
    description: "Tonalidade melancólica e introspectiva por excelência. Sem acidentes na armadura, mas usa acordes harmônicos ricos (como E7).",
    chords: [
      { degree: "Im", chordName: "Am", role: "Tônica", description: "Fundação sombria e linda das canções mais sentimentais." },
      { degree: "IIm7(b5)", chordName: "Bm7(b5)", role: "Subdominante", description: "Acorde de desequilíbrio dramático usado na descida." },
      { degree: "bIII", chordName: "C", role: "Tônica", description: "O repouso alternativo alegre da música." },
      { degree: "IVm", chordName: "Dm", role: "Subdominante", description: "Nostalgia clássica do fado e canção popular." },
      { degree: "Vm", chordName: "Em", role: "Dominante Natural", description: "Cria uma melancolia limpa medieval." },
      { degree: "V7", chordName: "E7", role: "Dominante Harmônico", description: "Aproximação espanhola flamenca e rítmica de preparação tônica." },
      { degree: "bVI", chordName: "F", role: "Subdominante", description: "Aumento emotivo épico." },
      { degree: "bVII", chordName: "G", role: "Dominante", description: "Prepara o retorno à claridade." }
    ]
  },
  {
    key: "Si Bemol Menor (Bbm)",
    mainChord: "Bbm",
    description: "Uma tonalidade profunda, luxuosa e misteriosa, excelente para composições reflexivas lentas.",
    chords: [
      { degree: "Im", chordName: "Bbm", role: "Tônica", description: "Base tônica aveludada, escura e intimista." },
      { degree: "IIm7(b5)", chordName: "Cm7(b5)", role: "Subdominante", description: "Cadência de passagem meio-diminuta elegante." },
      { degree: "bIII", chordName: "Db", role: "Tônica", description: "Relativo alegre limpo de repouso." },
      { degree: "IVm", chordName: "Ebm", role: "Subdominante", description: "Intensidade sentimental e melancólica clássica." },
      { degree: "Vm", chordName: "Fm", role: "Dominante Natural", description: "Suavidade que acalma o drama." },
      { degree: "V7", chordName: "F7", role: "Dominante Harmônico", description: "Tensão alta que puxa vigorosamente rumo à tônica." },
      { degree: "bVI", chordName: "Gb", role: "Subdominante", description: "Amplitude que areja o sentimento melancólico." },
      { degree: "bVII", chordName: "Ab", role: "Dominante", description: "Brilho suave maior e apoio de passagem harmônica." }
    ]
  },
  {
    key: "Si Menor (Bm)",
    mainChord: "Bm",
    description: "Umas das tonalidades menores mais belas no violão, extremamente usada em arranjos de violão dedilhado.",
    chords: [
      { degree: "Im", chordName: "Bm", role: "Tônica", description: "Sensação profunda de nostalgia e estabilidade." },
      { degree: "IIm7(b5)", chordName: "C#m7(b5)", role: "Subdominante", description: "Prepara a cadência com toque doloroso jazzístico." },
      { degree: "bIII", chordName: "D", role: "Tônica", description: "Equilíbrio feliz e tônico maior brilhante de passagem." },
      { degree: "IVm", chordName: "Em", role: "Subdominante", description: "Grande suporte de graves encorpados de passagem." },
      { degree: "Vm", chordName: "F#m", role: "Dominante Natural", description: "Conexão suave menor melancólica." },
      { degree: "V7", chordName: "F#7", role: "Dominante Harmônico", description: "Tensão de preparação clássica indispensável." },
      { degree: "bVI", chordName: "G", role: "Subdominante", description: "Contraste vibrante aberto de esperança." },
      { degree: "bVII", chordName: "A", role: "Dominante", description: "Base brilhante e luminosa de transição." }
    ]
  }
];

const BASIC_CHORD_NAMES = ["C", "G", "D", "Am", "Em", "E", "A", "Dm"];

type ChordFilter = "all" | "basic" | "pestana" | "advanced" | "diminuto";

export default function ChordsTab({ currentUser }: { currentUser?: UserSession | null }) {
  const [filter, setFilter] = useState<ChordFilter>("all");
  const [selectedChord, setSelectedChord] = useState<Chord>(CHORD_DATABASE[0]);
  const [selectedVarIdx, setSelectedVarIdx] = useState<number>(0);
  const [lastPlayed, setLastPlayed] = useState<string | null>(null);

  const [activeFieldIndex, setActiveFieldIndex] = useState<number>(0);

  // Reset matched field index when chord changes
  useEffect(() => {
    setActiveFieldIndex(0);
  }, [selectedChord]);

  // States for database-backed harmonic fields
  const [dbHarmonicFields, setDbHarmonicFields] = useState<HarmonicField[]>(HARMONIC_FIELDS);

  useEffect(() => {
    let isMounted = true;
    fetch("/api/harmonic-fields")
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        if (isMounted && data.fields && data.fields.length > 0) {
          setDbHarmonicFields(data.fields);
        }
      })
      .catch((err) => {
        console.error("Erro ao carregar campos harmônicos do banco de dados:", err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // States for database-backed chord lock
  const [isChordLockActive, setIsChordLockActive] = useState(true);
  const [dbUserLevel, setDbUserLevel] = useState("Iniciante");

  useEffect(() => {
    let isMounted = true;
    const emailParam = currentUser?.email ? `?email=${encodeURIComponent(currentUser.email)}` : "";
    fetch(`/api/chords/lock-status${emailParam}`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        if (isMounted) {
          setIsChordLockActive(data.globalLocked);
          setDbUserLevel(data.userLevel);
        }
      })
      .catch((err) => {
        console.error("Erro ao puxar travas de acordes no SQLite:", err);
      });
    return () => {
      isMounted = false;
    };
  }, [currentUser]);

  const isLockedForUser = isChordLockActive && dbUserLevel !== "Avançado";

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
      return !BASIC_CHORD_NAMES.includes(chord.name) && chord.barre === undefined && !chord.name.includes("dim");
    }
    if (filter === "diminuto") {
      return chord.name.includes("dim");
    }
    return true;
  });

  const variations = getChordVariations(selectedChord);
  const activeVariation = variations[selectedVarIdx] || variations[0];

  const matchedFields = dbHarmonicFields.filter((field) => 
    field.mainChord === selectedChord.name || 
    field.chords.some((member) => member.chordName === selectedChord.name)
  );
  const activeField = matchedFields[activeFieldIndex];

  const userEmail = currentUser?.email || "convidado@violao.com";
  const [hfNoteText, setHfNoteText] = useState<string>("");
  const [isSavingHfNote, setIsSavingHfNote] = useState<boolean>(false);
  const [hfNoteSaveSuccess, setHfNoteSaveSuccess] = useState<boolean>(false);

  // Load notes for the current active harmonic field when active field changes
  useEffect(() => {
    if (!activeField) {
      setHfNoteText("");
      return;
    }
    setHfNoteSaveSuccess(false);
    fetch(`/api/notes?email=${encodeURIComponent(userEmail)}&itemId=${encodeURIComponent("harmonic-field-" + activeField.key)}&itemType=harmonic_field`)
      .then((res) => res.json())
      .then((data) => {
        setHfNoteText(data.content || "");
      })
      .catch((err) => console.error("Erro ao carregar anotações do campo harmônico:", err));
  }, [userEmail, activeField?.key]);

  const handleSaveHfNote = async () => {
    if (!activeField) return;
    setIsSavingHfNote(true);
    setHfNoteSaveSuccess(false);
    try {
      const response = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail,
          itemId: "harmonic-field-" + activeField.key,
          itemType: "harmonic_field",
          content: hfNoteText,
        }),
      });
      if (response.ok) {
        setHfNoteSaveSuccess(true);
        setTimeout(() => setHfNoteSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Erro ao salvar anotação do campo harmônico:", err);
    } finally {
      setIsSavingHfNote(false);
    }
  };

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
              const firstAdv = CHORD_DATABASE.find(c => !BASIC_CHORD_NAMES.includes(c.name) && c.barre === undefined && !c.name.includes("dim"));
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
          <button
            onClick={() => {
              setFilter("diminuto");
              const firstDim = CHORD_DATABASE.find(c => c.name.includes("dim"));
              if (firstDim) handleSelectChord(firstDim);
            }}
            id="filter-chords-diminuto"
            className={`flex-1 min-w-[75px] py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
              filter === "diminuto"
                ? "bg-amber-800 dark:bg-amber-700/40 text-white dark:text-amber-400 border border-amber-800/20 dark:border-amber-500/20"
                : "text-slate-500 dark:text-stone-400 hover:text-slate-800 dark:hover:text-stone-200"
            }`}
          >
            <Music className="w-3 h-3 text-amber-500 animate-pulse" />
            Diminutos º
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {filteredChords.map((chord) => {
            const isSelected = selectedChord.name === chord.name;
            const isAdvanced = !BASIC_CHORD_NAMES.includes(chord.name) && chord.barre === undefined;
            const isPestana = chord.barre !== undefined;
            return (
              <div
                key={chord.name}
                role="button"
                tabIndex={0}
                onClick={() => handleSelectChord(chord)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleSelectChord(chord);
                  }
                }}
                id={`chord-select-${chord.name}`}
                className={`py-4 px-3 rounded-2xl border flex flex-col items-center justify-center transition-all relative overflow-hidden group cursor-pointer select-none outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
                  isSelected
                    ? "bg-amber-900 border-amber-900 text-stone-100 shadow-md scale-102"
                    : "bg-white dark:bg-stone-900 border-slate-200 dark:border-stone-800 text-slate-800 dark:text-stone-200 hover:border-amber-500 dark:hover:border-stone-750"
                }`}
              >
                {isAdvanced && (
                  <div className="absolute top-1 left-1.5 flex items-center gap-0.5">
                    {isLockedForUser ? (
                      <Lock className="w-2.5 h-2.5 text-rose-500" title="Acorde Avançado Bloqueado" />
                    ) : (
                      <Sparkles className="w-2.5 h-2.5 text-amber-500" title="Acorde Avançado / Com Extensão" />
                    )}
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
                {!isLockedForUser && (
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
                )}
                {isAdvanced && isLockedForUser && (
                  <div className="absolute right-1.5 top-1.5 opacity-40">
                    <Lock className="w-3 h-3 text-slate-400 dark:text-stone-500" />
                  </div>
                )}
              </div>
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
      <div className="lg:col-span-7 bg-white dark:bg-stone-900 rounded-3xl border border-slate-200 dark:border-stone-800 shadow-sm p-6 flex flex-col gap-8 relative min-h-[460px]">
        {activeVariation.difficulty === "Avançado" && isLockedForUser ? (
          <div className="flex-1 w-full flex flex-col items-center justify-center text-center p-8 bg-gradient-to-b from-stone-50 to-red-50/10 dark:from-stone-950 dark:to-stone-900 rounded-2xl border border-red-200/50 dark:border-red-950/20 my-auto">
            <div className="p-4 bg-red-100 dark:bg-red-500/10 text-red-650 dark:text-red-400 rounded-full mb-4 animate-pulse">
              <Lock className="w-10 h-10" />
            </div>
            
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
              🔒 Acorde Avançado Bloqueado
            </h3>
            
            <p className="text-xs text-slate-500 dark:text-stone-400 mt-2 max-w-sm leading-normal">
              Esta variação harmônica possui extensões sofisticadas e dedilhados exclusivos reservados para alunos de nível <strong className="text-amber-600 uppercase">Avançado</strong>.
            </p>

            <div className="my-5 p-4 bg-white dark:bg-stone-950/90 rounded-xl border border-slate-200/60 dark:border-stone-850/80 text-left w-full max-w-md">
              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-500 uppercase tracking-wider block mb-1.5 font-mono">
                Como Desbloquear no Banco de Dados:
              </span>
              <p className="text-xs text-slate-650 dark:text-stone-300 leading-relaxed space-y-1">
                • Navegue até a aba <strong className="text-slate-800 dark:text-white">Lições</strong>.<br />
                • Realize o <strong className="text-slate-800 dark:text-white">Exame Avançado</strong> para atualizar e gravar seu novo nível no banco de dados SQLite.<br />
                • Ou peça para seu instrutor <strong className="text-slate-850 dark:text-white">Artur</strong> liberar o acesso nas configurações globais do Painel Admin!
              </p>
            </div>

            <div className="text-[10px] text-slate-400 dark:text-stone-550 font-mono">
              Seu Nível Atual: <span className="font-bold uppercase text-red-500">{dbUserLevel}</span> • Bloqueio Ativo: <span className="font-bold text-red-500">SIM</span>
            </div>
          </div>
        ) : (
          <>
            {/* Dynamic Chord Diagram SVG rendering */}
            <div className="flex flex-col items-center justify-center bg-slate-50/50 dark:bg-stone-950/20 p-4 rounded-2xl border border-slate-200/50 dark:border-stone-850 w-full max-w-md mx-auto">
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
                      const isVarLocked = v.difficulty === "Avançado" && isLockedForUser;
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
                          
                          <div className="flex items-center gap-1.5 shrink-0">
                            {isVarLocked && (
                              <span className="flex items-center gap-0.5 bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/25 px-1 py-0.5 rounded text-[8px] font-bold font-mono">
                                <Lock className="w-2 h-2" /> RESTRITO
                              </span>
                            )}
                            <span className={`text-[8px] font-black px-1.5 py-0.5 rounded border uppercase shrink-0 ${diffColor}`}>
                              {v.difficulty}
                            </span>
                          </div>
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

                  {/* Campo Harmônico Relativo Section */}
                  <div className="border-t border-slate-100 dark:border-stone-800 pt-4">
                    <div className="flex flex-col gap-2 mb-2">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="text-[10px] font-bold text-slate-400 dark:text-stone-500 uppercase tracking-widest block font-mono">
                          🎶 Campos Harmônicos Relacionados
                        </span>
                        {matchedFields.length > 1 && (
                          <div className="flex gap-1 flex-wrap">
                            {matchedFields.map((field, idx) => (
                              <button
                                key={field.key}
                                onClick={() => setActiveFieldIndex(idx)}
                                className={`px-2 py-0.5 rounded text-[9px] font-bold transition-all border cursor-pointer ${
                                  activeFieldIndex === idx
                                    ? "bg-amber-100 border-amber-300 text-amber-900 dark:bg-amber-950 dark:border-amber-800 dark:text-amber-200"
                                    : "bg-stone-50 border-stone-200 text-slate-500 dark:bg-stone-900 dark:border-stone-800 hover:text-slate-800 dark:hover:text-stone-200"
                                }`}
                              >
                                {field.key.split(" ")[0]} {field.key.includes("Menor") ? "m" : ""}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {activeField ? (
                      <div className="bg-gradient-to-br from-slate-50 to-amber-50/20 dark:from-stone-950 dark:to-stone-950 p-4 rounded-2xl border border-slate-200/50 dark:border-stone-850">
                        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                          <span className="font-bold text-xs text-slate-800 dark:text-white">
                            Campo de {activeField.key}
                          </span>
                          <span className="text-[9px] px-1.5 py-0.5 font-bold rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/25 dark:text-emerald-400 dark:bg-emerald-950/20 uppercase tracking-wider scale-95">
                            Estudo de Escala
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-stone-400 leading-normal mb-3">
                          {activeField.description}
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {activeField.chords.map((m) => {
                            const target = CHORD_DATABASE.find(c => c.name === m.chordName);
                            const roleColor = 
                              m.role === "Tônica" || m.role === "Tônica (Atuante)"
                                ? "border-emerald-500/25 text-emerald-700 bg-emerald-500/5 dark:text-emerald-400 dark:border-emerald-500/15"
                                : m.role.startsWith("Dominante")
                                ? "border-red-500/25 text-red-700 bg-red-500/5 dark:text-red-400 dark:border-red-500/15"
                                : "border-amber-500/25 text-amber-700 bg-amber-500/5 dark:text-amber-400 dark:border-amber-500/15";
                            
                            const isCurrent = m.chordName === selectedChord.name;

                            return (
                              <div
                                key={m.degree}
                                className={`group/member p-2 rounded-xl flex items-center justify-between gap-1.5 border transition-all text-left ${
                                  isCurrent
                                    ? "bg-amber-50 border-amber-400 dark:bg-amber-950/20 dark:border-amber-500/50"
                                    : "bg-white dark:bg-stone-900 border-slate-100 dark:border-stone-800 hover:border-amber-400 dark:hover:border-stone-700"
                                }`}
                              >
                                <div className="flex flex-col min-w-0 flex-1">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="font-mono text-[9px] opacity-60 font-bold">{m.degree}</span>
                                    <button
                                      onClick={() => {
                                        if (target) {
                                          handleSelectChord(target);
                                        }
                                      }}
                                      className={`text-xs font-black tracking-tight hover:underline font-mono cursor-pointer ${
                                        isCurrent ? "text-amber-950 dark:text-amber-300" : "text-slate-800 dark:text-stone-200"
                                      }`}
                                    >
                                      {m.chordName}
                                    </button>
                                    <span className={`text-[8px] font-black uppercase px-1 py-0.1 border rounded leading-none shrink-0 scale-90 ${roleColor}`}>
                                      {m.role}
                                    </span>
                                  </div>
                                  <span className="text-[9px] text-slate-400 dark:text-stone-500 mt-0.5 truncate leading-tight block" title={m.description}>
                                    {m.description}
                                  </span>
                                </div>

                                <div className="flex gap-0.5 shrink-0">
                                  {target ? (
                                    <>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handlePlayChordByFrets(target.frets, target.name, "strum");
                                        }}
                                        title={`Tocar ${m.chordName}`}
                                        className="p-1 rounded bg-slate-100 hover:bg-amber-100 dark:bg-stone-800 dark:hover:bg-amber-950/40 text-slate-500 hover:text-amber-700 dark:text-stone-400 dark:hover:text-amber-400 transition cursor-pointer"
                                      >
                                        <Volume2 className="w-3 h-3" />
                                      </button>
                                      {target.name !== selectedChord.name && (
                                        <button
                                          onClick={() => {
                                            handleSelectChord(target);
                                          }}
                                          title="Visualizar no braço"
                                          className="p-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-stone-800 dark:hover:bg-stone-750 text-slate-500 dark:text-stone-400 transition cursor-pointer"
                                        >
                                          <Link className="w-3 h-3" />
                                        </button>
                                      )}
                                    </>
                                  ) : (
                                    <span className="text-[8px] font-semibold text-slate-300 dark:text-stone-600">N/A</span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Area de Anotações do Campo Harmônico */}
                        <div className="mt-4 pt-4 border-t border-slate-200/60 dark:border-stone-850/60">
                          <label className="flex items-center gap-1.5 text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-2 font-mono">
                            📝 Bloco de Notas: Estudo Harmônico ({activeField.key.split(" ")[0]})
                          </label>
                          <textarea
                            value={hfNoteText}
                            onChange={(e) => setHfNoteText(e.target.value)}
                            placeholder="Escreva aqui suas anotações para este campo harmônico (dicas de passagens de acordes, ideias de progressões de violão, rascunhos de composições...)"
                            className="w-full h-20 p-2.5 text-[11px] leading-relaxed rounded-xl border border-slate-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-slate-800 dark:text-stone-200 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-all resize-none placeholder-slate-400 dark:placeholder-stone-600 shadow-sm"
                          />
                          <div className="flex justify-end mt-1.5">
                            <button
                              onClick={handleSaveHfNote}
                              disabled={isSavingHfNote}
                              className={`flex items-center gap-1 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all shadow-sm cursor-pointer ${
                                hfNoteSaveSuccess
                                  ? "bg-emerald-500 text-white border border-emerald-600"
                                  : "bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white border border-amber-600"
                              }`}
                            >
                              {isSavingHfNote ? (
                                <span>Salvando...</span>
                              ) : hfNoteSaveSuccess ? (
                                <>
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Salvo!</span>
                                </>
                              ) : (
                                <span>Salvar Anotações</span>
                              )}
                            </button>
                          </div>
                        </div>

                      </div>
                    ) : (
                      <div className="bg-slate-50 dark:bg-stone-950 p-4 rounded-xl border border-slate-200/50 dark:border-stone-850 text-center text-[10px] text-slate-400 dark:text-stone-500 leading-normal">
                        Nenhum campo harmônico padrão cadastrado para este acorde de extensão complexa.
                      </div>
                    )}
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
          </>
        )}
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
