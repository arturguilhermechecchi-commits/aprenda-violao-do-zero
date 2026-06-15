import { useState, useEffect } from "react";
import { Song, SongLine, UserSession } from "../types";
import { playGuitarChord, playGuitarNote } from "./AcousticAudio";
import { Music, Play, Disc, ArrowRight, Video, FileText, CheckCircle, Edit3, Save, Sparkles, Pause, RotateCcw, Volume2, Info, GraduationCap, Flame, FileDown, BookOpen, Cloud } from "lucide-react";
import { jsPDF } from "jspdf";
import { getAccessToken } from "../lib/firebase";

const SONG_DATABASE: Song[] = [
  {
    id: "song-1",
    title: "Asa Branca",
    artist: "Luiz Gonzaga",
    bpm: 90,
    rhythm: "Baião simplificado (Toque Pop)",
    strummingPattern: ["↓", "↓", "↑", "↑", "↓", "↑"],
    chordsUsed: ["G", "C", "D"],
    videoTip: "Toque as levadas de forma bem marcada na batida do folclore nordestino.",
    lines: [
      {
        chords: [
          { chord: "G", position: 5 },
          { chord: "C", position: 28 },
        ],
        text: "Quando oiei a terra ardendo",
      },
      {
        chords: [
          { chord: "G", position: 5 },
          { chord: "C", position: 32 },
        ],
        text: "Qual fogueira de São João",
      },
      {
        chords: [
          { chord: "C", position: 0 },
          { chord: "D", position: 16 },
          { chord: "G", position: 24 },
        ],
        text: "Eu perguntei a Deus do céu, ai",
      },
      {
        chords: [
          { chord: "G", position: 0 },
          { chord: "D", position: 12 },
          { chord: "G", position: 22 },
        ],
        text: "Por que tamanha judiação",
      },
      {
        chords: [
          { chord: "G", position: 4 },
          { chord: "C", position: 25 },
        ],
        text: "Que braseiro, que fornalha",
      },
      {
        chords: [
          { chord: "G", position: 4 },
          { chord: "C", position: 25 },
        ],
        text: "Nem um pé de prantação",
      },
      {
        chords: [
          { chord: "C", position: 0 },
          { chord: "D", position: 15 },
          { chord: "G", position: 24 },
        ],
        text: "Por farta d'água perdi meu gado",
      },
      {
        chords: [
          { chord: "G", position: 0 },
          { chord: "D", position: 12 },
          { chord: "G", position: 22 },
        ],
        text: "Morreu de sede meu alazão",
      },
      {
        chords: [
          { chord: "G", position: 4 },
          { chord: "C", position: 25 },
        ],
        text: "Até mesmo a asa branca",
      },
      {
        chords: [
          { chord: "G", position: 4 },
          { chord: "C", position: 25 },
        ],
        text: "Bateu asas do sertão",
      },
      {
        chords: [
          { chord: "C", position: 0 },
          { chord: "D", position: 15 },
          { chord: "G", position: 24 },
        ],
        text: "Então eu disse, adeus Rosinha",
      },
      {
        chords: [
          { chord: "G", position: 0 },
          { chord: "D", position: 12 },
          { chord: "G", position: 22 },
        ],
        text: "Guarda contigo meu coração",
      },
      {
        chords: [
          { chord: "G", position: 4 },
          { chord: "C", position: 25 },
        ],
        text: "Hoje longe, muitas légua",
      },
      {
        chords: [
          { chord: "G", position: 4 },
          { chord: "C", position: 25 },
        ],
        text: "Numa triste solidão",
      },
      {
        chords: [
          { chord: "C", position: 0 },
          { chord: "D", position: 15 },
          { chord: "G", position: 24 },
        ],
        text: "Espero a chuva cair de novo",
      },
      {
        chords: [
          { chord: "G", position: 0 },
          { chord: "D", position: 12 },
          { chord: "G", position: 22 },
        ],
        text: "Pra mim voltar pro meu sertão",
      },
    ],
  },
  {
    id: "song-2",
    title: "Parabéns Pra Você",
    artist: "Tradicional",
    bpm: 80,
    rhythm: "Valsa (Compasso 3/4)",
    strummingPattern: ["↓", "↓", "↓"], // Down Down Down waltz
    chordsUsed: ["G", "D", "C"],
    videoTip: "Utilize o compasso de triplo toque: UMA descida mais grave e DUAS descidas agudas.",
    lines: [
      {
        chords: [{ chord: "G", position: 12 }],
        text: "Parabéns pra você",
      },
      {
        chords: [{ chord: "D", position: 12 }],
        text: "Nesta data querida",
      },
      {
        chords: [
          { chord: "D", position: 6 },
          { chord: "G", position: 22 },
        ],
        text: "Muitas felicidades",
      },
      {
        chords: [
          { chord: "G", position: 6 },
          { chord: "C", position: 22 },
        ],
        text: "Mutos anos de vida",
      },
      {
        chords: [{ chord: "G", position: 12 }],
        text: "E para o aniversariante",
      },
      {
        chords: [{ chord: "D", position: 12 }],
        text: "Uma salva de palmas",
      },
      {
        chords: [
          { chord: "D", position: 6 },
          { chord: "G", position: 22 },
        ],
        text: "Muita saúde e alegria",
      },
      {
        chords: [
          { chord: "G", position: 6 },
          { chord: "C", position: 22 },
        ],
        text: "Dentro de nossas almas",
      },
    ],
  },
  {
    id: "song-3",
    title: "Primeiros Erros",
    artist: "Capital Inicial",
    bpm: 100,
    rhythm: "Pop Nacional (Batida de Pop)",
    strummingPattern: ["↓", "↓", "↑", "↑", "↓", "↑"],
    chordsUsed: ["C", "D", "Am", "G"],
    videoTip: "Essa música segue o ciclo eterno C, D, Am, G. Ótima para treinar agilidade na troca de acordes.",
    lines: [
      {
        chords: [
          { chord: "C", position: 12 },
          { chord: "D", position: 32 },
        ],
        text: "Se seu pudesse recomeçar",
      },
      {
        chords: [
          { chord: "Am", position: 12 },
          { chord: "G", position: 32 },
        ],
        text: "Faria tudo outra vez",
      },
      {
        chords: [
          { chord: "C", position: 12 },
          { chord: "D", position: 32 },
        ],
        text: "Se eu pudesse num olhar",
      },
      {
        chords: [
          { chord: "Am", position: 12 },
          { chord: "G", position: 32 },
        ],
        text: "Te dizer o que não fiz",
      },
      {
        chords: [
          { chord: "C", position: 12 },
          { chord: "D", position: 32 },
        ],
        text: "Meu caminho é sem destino",
      },
      {
        chords: [
          { chord: "Am", position: 12 },
          { chord: "G", position: 32 },
        ],
        text: "Flutuo no ar, sem ter onde pisar",
      },
      {
        chords: [
          { chord: "C", position: 12 },
          { chord: "D", position: 32 },
        ],
        text: "Na minha vida tudo acontece",
      },
      {
        chords: [
          { chord: "Am", position: 12 },
          { chord: "G", position: 32 },
        ],
        text: "Mas minto que existo para sobreviver",
      },
      {
        chords: [
          { chord: "C", position: 12 },
          { chord: "D", position: 32 },
        ],
        text: "Mas se a chuva cair, e o vento soprar",
      },
      {
        chords: [
          { chord: "Am", position: 12 },
          { chord: "G", position: 32 },
        ],
        text: "Tu vais saber que eu nunca te esqueci",
      },
      {
        chords: [
          { chord: "C", position: 12 },
          { chord: "D", position: 32 },
        ],
        text: "E o sol reaparecer, nem vai lembrar",
      },
      {
        chords: [
          { chord: "Am", position: 12 },
          { chord: "G", position: 32 },
        ],
        text: "De tudo que se perdeu...",
      },
    ],
  },
  {
    id: "song-4",
    title: "Tempo Perdido",
    artist: "Legião Urbana",
    bpm: 114,
    rhythm: "Pop Rock Nacional",
    strummingPattern: ["↓", "↓", "↑", "↑", "↓", "↑"],
    chordsUsed: ["C", "Am", "Bm7", "Em"],
    videoTip: "O dedilhado e ritmo desta música são lentos e marcantes. Pratique a troca do Am para o sofisticado Bm7.",
    lines: [
      {
        chords: [
          { chord: "C", position: 0 },
          { chord: "Am", position: 15 },
        ],
        text: "Todos os dias antes de dormir",
      },
      {
        chords: [
          { chord: "Bm7", position: 0 },
          { chord: "Em", position: 15 },
        ],
        text: "Lembro e esqueço como foi o dia",
      },
      {
        chords: [
          { chord: "C", position: 0 },
          { chord: "Am", position: 15 },
        ],
        text: "Sempre em frente, não temos tempo a perder",
      },
      {
        chords: [
          { chord: "Bm7", position: 0 },
          { chord: "Em", position: 15 },
        ],
        text: "Não temos tempo a perder",
      },
      {
        chords: [
          { chord: "C", position: 0 },
          { chord: "Am", position: 15 },
        ],
        text: "Nosso suor sagrado é muito mais belo",
      },
      {
        chords: [
          { chord: "Bm7", position: 0 },
          { chord: "Em", position: 15 },
        ],
        text: "Que esse sangue amargo",
      },
      {
        chords: [
          { chord: "C", position: 0 },
          { chord: "Am", position: 15 },
        ],
        text: "E deixamos nossos corpos no mundo",
      },
      {
        chords: [
          { chord: "Bm7", position: 0 },
          { chord: "Em", position: 15 },
        ],
        text: "Sem medo de nada...",
      },
      {
        chords: [
          { chord: "C", position: 0 },
          { chord: "Am", position: 15 },
        ],
        text: "Veja o sol dessa manhã tão cinza",
      },
      {
        chords: [
          { chord: "Bm7", position: 0 },
          { chord: "Em", position: 15 },
        ],
        text: "A tempestade que chega é da cor dos teus olhos castanhos",
      },
      {
        chords: [
          { chord: "C", position: 0 },
          { chord: "Am", position: 15 },
        ],
        text: "Então me abraça forte e me diz mais uma vez",
      },
      {
        chords: [
          { chord: "Bm7", position: 0 },
          { chord: "Em", position: 15 },
        ],
        text: "Que já estamos distantes de tudo",
      },
      {
        chords: [
          { chord: "C", position: 0 },
          { chord: "Am", position: 15 },
        ],
        text: "Temos nosso próprio tempo",
      },
      {
        chords: [
          { chord: "Bm7", position: 0 },
          { chord: "Em", position: 15 },
        ],
        text: "Temos nosso próprio tempo...",
      },
    ],
  },
  {
    id: "song-5",
    title: "Anunciação",
    artist: "Alceu Valença",
    bpm: 112,
    rhythm: "Folk / Baião Suave (6/8 ou Pop)",
    strummingPattern: ["↓", "↓", "↑", "↑", "↓", "↑"],
    chordsUsed: ["G", "Am", "C", "D"],
    videoTip: "Mantenha a rítmica firme com energia na batida. O Am e o C criam o contraste melódico típico do Nordeste.",
    lines: [
      {
        chords: [
          { chord: "G", position: 4 },
          { chord: "C", position: 22 },
        ],
        text: "Na bruma leve das paixões que vem de dentro"
      },
      {
        chords: [
          { chord: "G", position: 4 },
          { chord: "C", position: 20 },
        ],
        text: "Tu vens chegando pra brincar no meu quintal"
      },
      {
        chords: [
          { chord: "G", position: 4 },
          { chord: "Am", position: 22 },
        ],
        text: "No teu cavalo, peito nu, cabelo ao vento"
      },
      {
        chords: [
          { chord: "G", position: 4 },
          { chord: "D", position: 20 },
          { chord: "G", position: 30 },
        ],
        text: "E o sol brilhando no seu arreio de prata"
      },
      {
        chords: [
          { chord: "G", position: 10 },
          { chord: "C", position: 22 },
        ],
        text: "Tu vens, tu vens, eu já escuto os teus sinais"
      },
      {
        chords: [
          { chord: "G", position: 10 },
          { chord: "D", position: 22 },
          { chord: "G", position: 32 },
        ],
        text: "Tu vens, tu vens, eu já escuto os teus sinais"
      },
      {
        chords: [
          { chord: "G", position: 4 },
          { chord: "C", position: 22 },
        ],
        text: "A voz do anjo sussurrou no meu ouvido"
      },
      {
        chords: [
          { chord: "G", position: 4 },
          { chord: "C", position: 20 },
        ],
        text: "Eu não duvido, já escuto os teus sinais"
      },
      {
        chords: [
          { chord: "G", position: 4 },
          { chord: "Am", position: 22 },
        ],
        text: "Que tu virias numa tarde de domingo"
      },
      {
        chords: [
          { chord: "G", position: 4 },
          { chord: "D", position: 20 },
          { chord: "G", position: 30 },
        ],
        text: "Anunciar nos sinos das catedrais"
      },
      {
        chords: [
          { chord: "G", position: 10 },
          { chord: "C", position: 22 },
        ],
        text: "Tu vens, tu vens, eu já escuto os teus sinais"
      },
      {
        chords: [
          { chord: "G", position: 10 },
          { chord: "D", position: 22 },
          { chord: "G", position: 32 },
        ],
        text: "Tu vens, tu vens, eu já escuto os teus sinais"
      }
    ]
  },
  {
    id: "song-6",
    title: "Knockin' on Heaven's Door",
    artist: "Bob Dylan",
    bpm: 70,
    rhythm: "Balada Pop Lenta",
    strummingPattern: ["↓", "↓", "↑", "↑", "↓", "↑"],
    chordsUsed: ["G", "D", "Am", "C"],
    videoTip: "Siga o ciclo clássico: G - D - Am / G - D - C. Toque de forma suave e constante com sentimento.",
    lines: [
      {
        chords: [
          { chord: "G", position: 0 },
          { chord: "D", position: 11 },
          { chord: "Am", position: 22 },
        ],
        text: "Mama, take this badge off of me"
      },
      {
        chords: [
          { chord: "G", position: 0 },
          { chord: "D", position: 11 },
          { chord: "C", position: 22 },
        ],
        text: "I can't use it anymore"
      },
      {
        chords: [
          { chord: "G", position: 0 },
          { chord: "D", position: 11 },
          { chord: "Am", position: 22 },
        ],
        text: "It's gettin' dark, too dark to see"
      },
      {
        chords: [
          { chord: "G", position: 0 },
          { chord: "D", position: 11 },
          { chord: "C", position: 22 },
        ],
        text: "Feel I'm knockin' on heaven's door"
      },
      {
        chords: [
          { chord: "G", position: 13 },
          { chord: "D", position: 24 },
          { chord: "Am", position: 35 },
        ],
        text: "Knock, knock, knockin' on heaven's door"
      },
      {
        chords: [
          { chord: "G", position: 13 },
          { chord: "D", position: 24 },
          { chord: "C", position: 35 },
        ],
        text: "Knock, knock, knockin' on heaven's door"
      },
      {
        chords: [
          { chord: "G", position: 13 },
          { chord: "D", position: 24 },
          { chord: "Am", position: 35 },
        ],
        text: "Knock, knock, knockin' on heaven's door"
      },
      {
        chords: [
          { chord: "G", position: 13 },
          { chord: "D", position: 24 },
          { chord: "C", position: 35 },
        ],
        text: "Knock, knock, knockin' on heaven's door"
      },
      {
        chords: [
          { chord: "G", position: 0 },
          { chord: "D", position: 11 },
          { chord: "Am", position: 22 },
        ],
        text: "Mama, put my guns in the ground"
      },
      {
        chords: [
          { chord: "G", position: 0 },
          { chord: "D", position: 11 },
          { chord: "C", position: 22 },
        ],
        text: "I can't shoot them anymore"
      },
      {
        chords: [
          { chord: "G", position: 0 },
          { chord: "D", position: 11 },
          { chord: "Am", position: 22 },
        ],
        text: "That long black cloud is comin' down"
      },
      {
        chords: [
          { chord: "G", position: 0 },
          { chord: "D", position: 11 },
          { chord: "C", position: 22 },
        ],
        text: "I feel I'm knockin' on heaven's door"
      },
      {
        chords: [
          { chord: "G", position: 13 },
          { chord: "D", position: 24 },
          { chord: "Am", position: 35 },
        ],
        text: "Knock, knock, knockin' on heaven's door"
      },
      {
        chords: [
          { chord: "G", position: 13 },
          { chord: "D", position: 24 },
          { chord: "C", position: 35 },
        ],
        text: "Knock, knock, knockin' on heaven's door"
      }
    ]
  },
  {
    id: "song-7",
    title: "Anna Julia",
    artist: "Los Hermanos",
    bpm: 120,
    rhythm: "Pop Rock animado (4/4)",
    strummingPattern: ["↓", "↓", "↑", "↑", "↓", "↑"],
    chordsUsed: ["G", "D", "Em", "C", "Bm"],
    videoTip: "Use a pestana em Bm no 2ª traste comprimindo as cordas firmemente com o lado do dedo indicador. Mantenha o indicador paralelo ao traste.",
    lines: [
      {
        chords: [
          { chord: "G", position: 0 },
          { chord: "D", position: 10 },
          { chord: "Em", position: 18 },
          { chord: "C", position: 28 },
        ],
        text: "Quem te vê passar assim por nós"
      },
      {
        chords: [
          { chord: "G", position: 0 },
          { chord: "D", position: 10 },
          { chord: "Em", position: 18 },
          { chord: "C", position: 28 },
        ],
        text: "Sem pretender e sem saber de nós"
      },
      {
        chords: [
          { chord: "G", position: 0 },
          { chord: "D", position: 10 },
          { chord: "Em", position: 18 },
          { chord: "C", position: 28 },
        ],
        text: "Não sabe a força que tem o teu olhar"
      },
      {
        chords: [
          { chord: "G", position: 0 },
          { chord: "D", position: 10 },
          { chord: "Em", position: 18 },
          { chord: "C", position: 28 },
        ],
        text: "E como dói te ver passar sem suspirar"
      },
      {
        chords: [
          { chord: "G", position: 8 },
          { chord: "Bm", position: 24 },
        ],
        text: "Pois você é o meu amor"
      },
      {
        chords: [
          { chord: "C", position: 8 },
          { chord: "G", position: 17 },
          { chord: "D", position: 24 },
        ],
        text: "E pra sempre contigo eu quero estar"
      },
      {
        chords: [
          { chord: "G", position: 5 },
          { chord: "Bm", position: 18 },
        ],
        text: "Anna Júlia! Oh, Anna Júlia!"
      },
      {
        chords: [
          { chord: "C", position: 0 },
          { chord: "G", position: 10 },
          { chord: "D", position: 18 },
        ],
        text: "Não sabe o quanto eu sofri por te amar"
      }
    ]
  },
  {
    id: "song-8",
    title: "Gostava Tanto de Você",
    artist: "Tim Maia",
    bpm: 88,
    rhythm: "Soul / Groove Brasileiro lento (4/4)",
    strummingPattern: ["↓", "↓↑", "↑↓", "↑"],
    chordsUsed: ["C", "Em", "F", "G", "Am"],
    videoTip: "O acorde de F (Fá Maior) exige pestana completa na primeira casa. Pressione o dedão atrás do braço em formato de pinça para dar sustentação.",
    lines: [
      {
        chords: [
          { chord: "C", position: 0 },
          { chord: "Em", position: 12 },
        ],
        text: "Não sei por que você se foi"
      },
      {
        chords: [
          { chord: "F", position: 0 },
          { chord: "G", position: 12 },
        ],
        text: "Quantas saudades eu senti"
      },
      {
        chords: [
          { chord: "C", position: 0 },
          { chord: "Em", position: 12 },
        ],
        text: "E de tristeza vou viver"
      },
      {
        chords: [
          { chord: "F", position: 0 },
          { chord: "G", position: 12 },
        ],
        text: "E aquele amor que não esqueci"
      },
      {
        chords: [
          { chord: "Am", position: 0 },
          { chord: "Em", position: 12 },
        ],
        text: "Não quero ver você chorar"
      },
      {
        chords: [
          { chord: "F", position: 0 },
          { chord: "G", position: 12 },
        ],
        text: "Não quero ver você sofrer"
      },
      {
        chords: [
          { chord: "Am", position: 0 },
          { chord: "Em", position: 12 },
        ],
        text: "Nas estradas onde eu andar"
      },
      {
        chords: [
          { chord: "F", position: 0 },
          { chord: "G", position: 12 },
        ],
        text: "Em todo lugar que eu viver"
      },
      {
        chords: [
          { chord: "C", position: 4 },
          { chord: "Em", position: 14 },
        ],
        text: "Eu vou dizer para todo mundo"
      },
      {
        chords: [
          { chord: "F", position: 4 },
          { chord: "G", position: 14 },
        ],
        text: "Que eu gostava tanto de você"
      },
      {
        chords: [
          { chord: "C", position: 4 },
          { chord: "Em", position: 14 },
        ],
        text: "Que eu gostava tanto de você"
      }
    ]
  },
  {
    id: "song-9",
    title: "House of the Rising Sun",
    artist: "The Animals",
    bpm: 78,
    rhythm: "Dedilhado Clássico 6/8 (P-i-m-a-m-i)",
    strummingPattern: ["P", "i", "m", "a", "m", "i"],
    chordsUsed: ["Am", "C", "D", "F", "E"],
    videoTip: "Esta música é a rainha do dedilhado! Toque o baixo (P) na corda correspondente, seguido pelo indicador (i) na 3ª corda, médio (m) na 2ª e anelar (a) na 1ª, voltando pelo médio e indicador.",
    lines: [
      {
        chords: [
          { chord: "Am", position: 3 },
          { chord: "C", position: 12 },
          { chord: "D", position: 22 },
          { chord: "F", position: 32 },
        ],
        text: "There is a house in New Orleans"
      },
      {
        chords: [
          { chord: "Am", position: 3 },
          { chord: "C", position: 12 },
          { chord: "E", position: 22 },
        ],
        text: "They call the Rising Sun"
      },
      {
        chords: [
          { chord: "Am", position: 3 },
          { chord: "C", position: 12 },
          { chord: "D", position: 22 },
          { chord: "F", position: 32 },
        ],
        text: "And it's been the ruin of many a poor boy"
      },
      {
        chords: [
          { chord: "Am", position: 3 },
          { chord: "E", position: 12 },
          { chord: "Am", position: 22 },
        ],
        text: "And God, I know, I'm one"
      },
      {
        chords: [
          { chord: "Am", position: 3 },
          { chord: "C", position: 12 },
          { chord: "D", position: 22 },
          { chord: "F", position: 32 },
        ],
        text: "My mother was a tailor"
      },
      {
        chords: [
          { chord: "Am", position: 3 },
          { chord: "E", position: 12 },
          { chord: "Am", position: 22 },
        ],
        text: "She sewed my new blue jeans"
      },
      {
        chords: [
          { chord: "Am", position: 3 },
          { chord: "C", position: 12 },
          { chord: "D", position: 22 },
          { chord: "F", position: 32 },
        ],
        text: "My father was a gamblin' man"
      },
      {
        chords: [
          { chord: "Am", position: 3 },
          { chord: "E", position: 12 },
          { chord: "Am", position: 22 },
        ],
        text: "Down in New Orleans"
      }
    ]
  },
  {
    id: "song-10",
    title: "Hallelujah",
    artist: "Leonard Cohen",
    bpm: 80,
    rhythm: "Dedilhado Ternário Balada (P-i-m-a-m-i)",
    strummingPattern: ["P", "i", "m", "a", "m", "i"],
    chordsUsed: ["C", "Am", "F", "G", "E7"],
    videoTip: "Pressione delicadamente o primeiro baixo do acorde e faça a subida e descida limpas com a ponta dos dedos. Ideal para testar a sensibilidade acústica.",
    lines: [
      {
        chords: [
          { chord: "C", position: 12 },
          { chord: "Am", position: 28 },
        ],
        text: "I've heard there was a secret chord"
      },
      {
        chords: [
          { chord: "C", position: 12 },
          { chord: "Am", position: 28 },
        ],
        text: "That David played, and it pleased the Lord"
      },
      {
        chords: [
          { chord: "F", position: 10 },
          { chord: "G", position: 23 },
          { chord: "C", position: 33 },
          { chord: "G", position: 40 },
        ],
        text: "But you don't really care for music, do you?"
      },
      {
        chords: [
          { chord: "C", position: 4 },
          { chord: "F", position: 13 },
          { chord: "G", position: 22 },
        ],
        text: "It goes like this, the fourth, the fifth"
      },
      {
        chords: [
          { chord: "Am", position: 4 },
          { chord: "F", position: 16 },
        ],
        text: "The minor fall, the major lift"
      },
      {
        chords: [
          { chord: "G", position: 4 },
          { chord: "E7", position: 15 },
          { chord: "Am", position: 24 },
        ],
        text: "The baffled king composing Hallelujah"
      },
      {
        chords: [
          { chord: "F", position: 13 },
          { chord: "Am", position: 27 },
        ],
        text: "Hallelujah, Hallelujah"
      },
      {
        chords: [
          { chord: "F", position: 13 },
          { chord: "C", position: 27 },
          { chord: "G", position: 33 },
          { chord: "C", position: 39 },
        ],
        text: "Hallelujah, Hallelu-u-u-u-jah"
      }
    ]
  },
  {
    id: "song-11",
    title: "Hotel California (Intro)",
    artist: "Eagles",
    bpm: 74,
    rhythm: "Dedilhado Sequencial (P-i-m-a-m-i)",
    strummingPattern: ["P", "i", "m", "a", "m", "i"],
    chordsUsed: ["Bm", "F#", "A", "E", "G", "D", "Em"],
    videoTip: "Combine dedilhado com pestana! Toque o baixo (P) e dedilhe as cordas mais agudas. O acorde F# (Fá sustenido) exige pestana completa na 2ª casa, parecida com o F.",
    lines: [
      {
        chords: [
          { chord: "Bm", position: 5 },
          { chord: "F#", position: 28 },
        ],
        text: "On a dark desert highway, cool wind in my hair"
      },
      {
        chords: [
          { chord: "A", position: 5 },
          { chord: "E", position: 28 },
        ],
        text: "Warm smell of colitas, rising up through the air"
      },
      {
        chords: [
          { chord: "G", position: 5 },
          { chord: "D", position: 28 },
        ],
        text: "Up ahead in the distance, I saw a shimmering light"
      },
      {
        chords: [
          { chord: "Em", position: 5 },
          { chord: "F#", position: 28 },
        ],
        text: "My head grew heavy and my sight grew dim, I had to stop for the night"
      }
    ]
  },
  {
    id: "song-12",
    title: "Apenas Mais uma de Amor",
    artist: "Lulu Santos",
    bpm: 82,
    rhythm: "Dedilhado Ternário Suave (P-i-m-a-m-i)",
    strummingPattern: ["P", "i", "m", "a", "m", "i"],
    chordsUsed: ["C", "G", "Am", "F", "Dm"],
    videoTip: "Excelente balada romântica. Use dedilhado contínuo subindo e descendo. O F (Fá) exige pestana na 1ª casa, alternando com acordes abertos como C e G.",
    lines: [
      {
        chords: [
          { chord: "C", position: 3 },
          { chord: "G", position: 22 },
          { chord: "Am", position: 35 },
        ],
        text: "Eu gosto tanto de você, que até prefiro esconder"
      },
      {
        chords: [
          { chord: "F", position: 3 },
          { chord: "C", position: 20 },
          { chord: "G", position: 35 },
        ],
        text: "Deixo assim ficar, subentendido"
      },
      {
        chords: [
          { chord: "C", position: 3 },
          { chord: "G", position: 22 },
          { chord: "Am", position: 35 },
        ],
        text: "Como uma ideia que existe na cabeça"
      },
      {
        chords: [
          { chord: "F", position: 3 },
          { chord: "C", position: 20 },
          { chord: "G", position: 35 },
        ],
        text: "E não tem a menor obrigação de acontecer"
      },
      {
        chords: [
          { chord: "Dm", position: 3 },
          { chord: "G", position: 24 },
        ],
        text: "Eu acho até engraçado"
      },
      {
        chords: [
          { chord: "Dm", position: 3 },
          { chord: "G", position: 24 },
        ],
        text: "As coisas que a gente sente e não diz"
      },
      {
        chords: [
          { chord: "C", position: 3 },
          { chord: "G", position: 16 },
          { chord: "Am", position: 28 },
          { chord: "F", position: 38 },
        ],
        text: "E tudo o que eu penso e sinto se desfaz num instante"
      }
    ]
  }
];

// Fret definitions for click plays
const CHORD_FRETS: Record<string, (number | "x")[]> = {
  C: ["x", 3, 2, 0, 1, 0],
  G: [3, 2, 0, 0, 0, 3],
  D: ["x", "x", 0, 2, 3, 2],
  Am: ["x", 0, 2, 2, 1, 0],
  Em: [0, 2, 2, 0, 0, 0],
  Bm7: ["x", 2, 4, 2, 3, 2],
  Bm: ["x", 2, 4, 4, 3, 2],
  F: [1, 3, 3, 2, 1, 1],
  "F#": [2, 4, 4, 3, 2, 2],
  A: ["x", 0, 2, 2, 2, 0],
  Dm: ["x", "x", 0, 2, 3, 1],
  E: [0, 2, 2, 1, 0, 0],
  E7: [0, 2, 0, 1, 0, 0],
  C7M: ["x", 3, 2, 0, 0, 0],
  D9: ["x", "x", 0, 2, 3, 0],
  G7: [3, 2, 0, 0, 0, 1],
  "F#m7": [2, 4, 2, 2, 2, 2],
  "E7(9)": [0, 2, 0, 1, 0, 2],
  C9: ["x", 3, 2, 0, 3, 0],
  A7: ["x", 0, 2, 0, 2, 0],
  B7: ["x", 2, 1, 2, 0, 2]
};

export interface RiffStep {
  // Key is stringIndex (0 to 5), Value is fret number
  notes: { [stringIndex: number]: number };
  label?: string;
}

export interface Riff {
  id: string;
  title: string;
  artist: string;
  bpm: number;
  difficulty: "Iniciante" | "Intermediário" | "Avançado";
  description: string;
  rhythmTip: string;
  steps: RiffStep[];
}

const RIFF_DATABASE: Riff[] = [
  {
    id: "riff-smoke",
    title: "Smoke on the Water",
    artist: "Deep Purple",
    bpm: 112,
    difficulty: "Iniciante",
    description: "O riff de rock supremo. Originalmente gravado tocando duas cordas (quartas justas dedilhadas simultaneamente). Pratique no andamento do compasso.",
    rhythmTip: "Toque as duas cordas (D e G) juntas com o indicador e o dedo médio puxando-as para cima, ou use uma palheta rápida pegando as duas.",
    steps: [
      { notes: { 2: 0, 3: 0 }, label: "G" },
      { notes: {} },
      { notes: { 2: 3, 3: 3 }, label: "Bb" },
      { notes: {} },
      { notes: { 2: 5, 3: 5 }, label: "C" },
      { notes: {} },
      { notes: {} },
      { notes: { 2: 0, 3: 0 }, label: "G" },
      { notes: {} },
      { notes: { 2: 3, 3: 3 }, label: "Bb" },
      { notes: {} },
      { notes: { 2: 6, 3: 6 }, label: "Db" },
      { notes: { 2: 5, 3: 5 }, label: "C" },
      { notes: {} },
      { notes: {} },
      { notes: { 2: 0, 3: 0 }, label: "G" },
      { notes: {} },
      { notes: { 2: 3, 3: 3 }, label: "Bb" },
      { notes: {} },
      { notes: { 2: 5, 3: 5 }, label: "C" },
      { notes: { 2: 3, 3: 3 }, label: "Bb" },
      { notes: {} },
      { notes: { 2: 0, 3: 0 }, label: "G" },
      { notes: {} }
    ]
  },
  {
    id: "riff-come",
    title: "Come As You Are",
    artist: "Nirvana",
    bpm: 120,
    difficulty: "Iniciante",
    description: "Grande marco do Grunge! Este riff hipnotizante usa o Mi grave aberto e notas de passagem subindo e descendo de tom no braço.",
    rhythmTip: "Mantenha o ritmo constante. Siga as marcas: traste 0, 1 e 2. O polegar toca o Mi grave (corda 6) e o indicador cuida do Lá (corda 5).",
    steps: [
      { notes: { 0: 0 }, label: "Mi" },
      { notes: { 0: 0 } },
      { notes: { 0: 1 }, label: "Fá" },
      { notes: { 0: 2 }, label: "Fá#" },
      { notes: { 1: 0 }, label: "Lá" },
      { notes: { 0: 2 } },
      { notes: { 1: 0 }, label: "Lá" },
      { notes: { 0: 2 } },
      { notes: { 0: 2 } },
      { notes: { 0: 1 } },
      { notes: { 0: 0 } },
      { notes: { 1: 2 }, label: "Si" },
      { notes: { 0: 0 } },
      { notes: { 1: 2 }, label: "Si" },
      { notes: { 0: 0 } },
      { notes: {} }
    ]
  },
  {
    id: "riff-seven",
    title: "Seven Nation Army",
    artist: "The White Stripes",
    bpm: 124,
    difficulty: "Iniciante",
    description: "Um dos riffs mais cantados de estádio de futebol e extremamente simples de tocar por ser feito inteiramente na 5ª corda (Lá).",
    rhythmTip: "Dica: Na guitarra o riff usa um pedal octaver para soar encorpado. Faça a transição esticando os dedos indicador e anelar entre as notas.",
    steps: [
      { notes: { 1: 7 }, label: "Mi" },
      { notes: {} },
      { notes: { 1: 7 } },
      { notes: { 1: 10 }, label: "Sol" },
      { notes: { 1: 7 }, label: "Mi" },
      { notes: {} },
      { notes: { 1: 5 }, label: "Ré" },
      { notes: {} },
      { notes: { 1: 3 }, label: "Dó" },
      { notes: {} },
      { notes: { 1: 2 }, label: "Si" },
      { notes: {} },
      { notes: {} }
    ]
  },
  {
    id: "riff-beatit",
    title: "Beat It",
    artist: "Michael Jackson",
    bpm: 138,
    difficulty: "Intermediário",
    description: "Riff enérgico e saltitante. Uma joia pop-rock gravada pelo lendário guitarrista Steve Lukather. Une cordas soltas com saltos rápidos para o Ré.",
    rhythmTip: "Mantenha a mão esquerda leve para pular da 6ª corda solta diretamente para os trastes da 4ª corda de forma precisa.",
    steps: [
      { notes: { 0: 0 }, label: "Mi" },
      { notes: {} },
      { notes: { 0: 3 }, label: "Sol" },
      { notes: { 2: 2 }, label: "Mi" },
      { notes: { 2: 5 }, label: "Sol" },
      { notes: { 2: 2 }, label: "Mi" },
      { notes: { 2: 4 }, label: "Fá#" },
      { notes: { 2: 2 }, label: "Mi" },
      { notes: { 2: 0 }, label: "Ré" },
      { notes: {} },
      { notes: { 2: 0 }, label: "Ré" },
      { notes: {} }
    ]
  },
  {
    id: "riff-sweetchild",
    title: "Sweet Child O' Mine",
    artist: "Guns N' Roses",
    bpm: 128,
    difficulty: "Avançado",
    description: "A linha melódica mais famosa dos anos 80. Slash criou esse riff como um mero exercício de aquecimento, mas se tornou lenda global.",
    rhythmTip: "Treine bem lento antes de acelerar! Use palhetada alternada (baixo/cima) para ganhar velocidade e manter o som de cada nota bem limpo.",
    steps: [
      { notes: { 2: 12 }, label: "D12" },
      { notes: { 4: 15 }, label: "B15" },
      { notes: { 3: 14 }, label: "G14" },
      { notes: { 3: 12 }, label: "G12" },
      { notes: { 5: 15 }, label: "e15" },
      { notes: { 3: 14 }, label: "G14" },
      { notes: { 5: 14 }, label: "e14" },
      { notes: { 3: 14 }, label: "G14" },
      { notes: { 2: 12 }, label: "D12" },
      { notes: { 4: 15 }, label: "B15" },
      { notes: { 3: 14 }, label: "G14" },
      { notes: { 3: 12 }, label: "G12" },
      { notes: { 5: 15 }, label: "e15" },
      { notes: { 3: 14 }, label: "G14" },
      { notes: { 5: 14 }, label: "e14" },
      { notes: { 3: 14 }, label: "G14" }
    ]
  },
  {
    id: "riff-ironman",
    title: "Iron Man",
    artist: "Black Sabbath",
    bpm: 80,
    difficulty: "Intermediário",
    description: "O riff primordial do metal! Tony Iommi tocando com afinação pesada e andamento solene.",
    rhythmTip: "As notas na casa 10 e 9 têm um balanço rápido. Tente fazer um pequeno vibrato (tremer levemente o dedo da nota) para dar riqueza ao som.",
    steps: [
      { notes: { 0: 2 }, label: "Fá#" },
      { notes: {} },
      { notes: { 0: 5 }, label: "Lá" },
      { notes: {} },
      { notes: { 0: 5 } },
      { notes: { 0: 7 }, label: "Si" },
      { notes: {} },
      { notes: { 0: 7 } },
      { notes: { 0: 10 }, label: "Ré" },
      { notes: { 0: 9 }, label: "Dó#" },
      { notes: { 0: 10 } },
      { notes: { 0: 9 } },
      { notes: { 0: 10 } },
      { notes: { 0: 5 }, label: "Lá" },
      { notes: {} },
      { notes: { 0: 5 } },
      { notes: { 0: 7 }, label: "Si" },
      { notes: {} },
      { notes: { 0: 7 } },
      { notes: {} }
    ]
  },
  {
    id: "riff-one",
    title: "One (Intro)",
    artist: "Metallica",
    bpm: 78,
    difficulty: "Intermediário",
    description: "O dedilhado melancólico mais famoso do heavy metal. A introdução limpa de One combina um baixo pedal e um padrão clássico de arpejo nas cordas superiores.",
    rhythmTip: "Deixe cada nota soar (let ring)! Mantenha o dedo indicador fixo na 2ª casa da 5ª corda e o dedo anelar na 4ª casa da 4ª corda, soltando apenas para tocar a corda solta.",
    steps: [
      { notes: { 1: 2 }, label: "Si" },
      { notes: { 2: 4 }, label: "Fá#" },
      { notes: { 3: 0 }, label: "Sol" },
      { notes: { 2: 4 }, label: "Fá#" },
      { notes: { 1: 2 }, label: "Si" },
      { notes: { 2: 4 }, label: "Fá#" },
      { notes: { 3: 0 }, label: "Sol" },
      { notes: { 2: 4 }, label: "Fá#" },
      { notes: { 1: 0 }, label: "Lá" },
      { notes: { 2: 4 }, label: "Fá#" },
      { notes: { 3: 0 }, label: "Sol" },
      { notes: { 2: 4 }, label: "Fá#" },
      { notes: { 1: 0 }, label: "Lá" },
      { notes: { 2: 4 }, label: "Fá#" },
      { notes: { 3: 0 }, label: "Sol" },
      { notes: { 2: 4 }, label: "Fá#" }
    ]
  },
  {
    id: "riff-puppets",
    title: "Master of Puppets (Intro)",
    artist: "Metallica",
    bpm: 110,
    difficulty: "Avançado",
    description: "A clássica e agressiva descida cromática do Thrash Metal. Tocada originalmente toda com palhetada para baixo (downpicking) extremamente rápida.",
    rhythmTip: "Toque todas as notas com palhetadas rígidas voltadas exclusivamente para baixo (downstrokes). Use o polegar e indicador firmes e abafe levemente as cordas com a palma da mão direita (palm muting).",
    steps: [
      { notes: { 0: 0 }, label: "E" },
      { notes: { 0: 0 } },
      { notes: { 1: 7 }, label: "B" },
      { notes: { 0: 0 } },
      { notes: { 0: 0 } },
      { notes: { 1: 6 }, label: "Bb" },
      { notes: { 0: 0 } },
      { notes: { 0: 0 } },
      { notes: { 1: 5 }, label: "A" },
      { notes: { 0: 0 } },
      { notes: { 1: 4 }, label: "Ab" },
      { notes: { 0: 0 } },
      { notes: { 1: 3 }, label: "G" },
      { notes: {} }
    ]
  },
  {
    id: "riff-nothing",
    title: "Nothing Else Matters (Intro)",
    artist: "Metallica",
    bpm: 92,
    difficulty: "Iniciante",
    description: "A introdução de dedilhado mais procurada por iniciantes no violão. É inteiramente tocada com cordas soltas no compasso 6/8.",
    rhythmTip: "Toque a 6ª corda (Mi grave) com o polegar, depois a 3ª corda (Sol) com o indicador, a 2ª corda (Si) com o médio e a 1ª corda (Mi agudo) com o anelar. Puxe as cordas de forma suave.",
    steps: [
      { notes: { 0: 0 }, label: "Mi" },
      { notes: { 3: 0 }, label: "Sol" },
      { notes: { 4: 0 }, label: "Si" },
      { notes: { 5: 0 }, label: "mi" },
      { notes: { 4: 0 }, label: "Si" },
      { notes: { 3: 0 }, label: "Sol" },
      { notes: { 0: 0 }, label: "Mi" },
      { notes: { 3: 0 }, label: "Sol" },
      { notes: { 4: 0 }, label: "Si" },
      { notes: { 5: 0 }, label: "mi" },
      { notes: { 4: 0 }, label: "Si" },
      { notes: { 3: 0 }, label: "Sol" }
    ]
  }
];

export default function SongsTab({ currentUser }: { currentUser: UserSession | null }) {
  const [customSongs, setCustomSongs] = useState<Song[]>([]);

  const handleFetchCustomSongs = () => {
    fetch("/api/songs")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.songs) {
          setCustomSongs(data.songs);
        }
      })
      .catch((err) => console.error("Erro ao carregar as cifras personalizadas do SQLite:", err));
  };

  useEffect(() => {
    handleFetchCustomSongs();
    
    // Listen to custom song updates from the Admin tab
    window.addEventListener("refreshCustomSongs", handleFetchCustomSongs);
    return () => {
      window.removeEventListener("refreshCustomSongs", handleFetchCustomSongs);
    };
  }, []);

  const allSongs = [...SONG_DATABASE, ...customSongs];

  const [selectedSong, setSelectedSong] = useState<Song>(SONG_DATABASE[0]);
  const [noteText, setNoteText] = useState("");
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // States for Riffs Tab
  const [subTab, setSubTab] = useState<"repertorio" | "riffs">("repertorio");
  const [selectedRiff, setSelectedRiff] = useState<Riff>(RIFF_DATABASE[0]);
  const [isPlayingRiff, setIsPlayingRiff] = useState(false);
  const [currentPlayingStep, setCurrentPlayingStep] = useState<number | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);

  // Auto playback of riff notes
  useEffect(() => {
    if (!isPlayingRiff) {
      setCurrentPlayingStep(null);
      return;
    }

    let step = 0;
    setCurrentPlayingStep(0);
    
    const playRiffStep = (stepObj: RiffStep) => {
      Object.entries(stepObj.notes || {}).forEach(([stringIdxStr, fret]) => {
        const stringIdx = parseInt(stringIdxStr, 10);
        playGuitarNote(stringIdx, fret, 0, 1.2);
      });
    };

    playRiffStep(selectedRiff.steps[0]);

    const beatDurationMs = (60000 / selectedRiff.bpm);
    const stepDurationMs = (beatDurationMs * 0.5) / playbackSpeed;

    const intervalId = setInterval(() => {
      step++;
      if (step >= selectedRiff.steps.length) {
        clearInterval(intervalId);
        setIsPlayingRiff(false);
        setCurrentPlayingStep(null);
      } else {
        setCurrentPlayingStep(step);
        playRiffStep(selectedRiff.steps[step]);
      }
    }, stepDurationMs);

    return () => {
      clearInterval(intervalId);
    };
  }, [isPlayingRiff, selectedRiff, playbackSpeed]);

  const handleSelectRiff = (riff: Riff) => {
    setIsPlayingRiff(false);
    setCurrentPlayingStep(null);
    setSelectedRiff(riff);
  };

  const handleStopRiff = () => {
    setIsPlayingRiff(false);
    setCurrentPlayingStep(null);
  };

  const handlePlayRiff = () => {
    setIsPlayingRiff(true);
  };

  const userEmail = currentUser?.email || "convidado@violao.com";

  // Fetch song training note on song/user change
  useEffect(() => {
    setSaveSuccess(false);
    fetch(`/api/notes?email=${encodeURIComponent(userEmail)}&itemId=${encodeURIComponent(selectedSong.id)}&itemType=song`)
      .then((res) => res.json())
      .then((data) => {
        setNoteText(data.content || "");
      })
      .catch((err) => console.error("Erro ao carregar anotação do repertório:", err));
  }, [userEmail, selectedSong.id]);

  const handleSaveNote = async () => {
    setIsSavingNote(true);
    setSaveSuccess(false);
    try {
      const response = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail,
          itemId: selectedSong.id,
          itemType: "song",
          content: noteText,
        }),
      });
      if (response.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Erro ao salvar anotação da música:", err);
    } finally {
      setIsSavingNote(false);
    }
  };

  const [downloadingSongbook, setDownloadingSongbook] = useState(false);
  const [downloadingSingle, setDownloadingSingle] = useState(false);
  const [uploadingToDrive, setUploadingToDrive] = useState(false);

  const handleDownloadSingleSongPDF = async (song: Song) => {
    setDownloadingSingle(true);
    try {
      const doc = new jsPDF();
      
      // Theme colors
      const primaryColor = [30, 41, 59]; // Slate (dark background / titles)
      const accentColor = [217, 119, 6];  // Amber (primary contrast)
      
      // Page setup & title banner
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(0, 0, 210, 36, "F");
      
      // Title
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.text(song.title.toUpperCase(), 15, 16);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(`Cifra de Violao - Artista: ${song.artist}`, 15, 24);
      
      const today = new Date().toLocaleDateString("pt-BR");
      doc.text(`Guitar Studio - ${today}`, 150, 16);
      
      // Info board
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("INFORMACOES DE EXECUCAO", 15, 48);
      
      doc.setDrawColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.setLineWidth(0.5);
      doc.line(15, 51, 195, 51);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(75, 85, 99);
      doc.text(`Ritmo/Levada: ${song.rhythm}`, 15, 58);
      doc.text(`BPM: ${song.bpm}`, 15, 63);
      doc.text(`Acordes Utilizados: ${song.chordsUsed.join(", ")}`, 110, 58);
      doc.text(`Padrao de Batida: ${song.strummingPattern.join(" ")}`, 110, 63);
      
      if (song.videoTip) {
        doc.setFont("helvetica", "italic");
        doc.text(`Dica de Treino: ${song.videoTip}`, 15, 69);
      }
      
      // Lyrics + Chords board
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("CIFRA DA MUSICA", 15, 82);
      doc.line(15, 85, 195, 85);
      
      let currentY = 94;
      
      song.lines.forEach((line) => {
        // If there are chords, we render them above the lyric text
        if (line.chords && line.chords.length > 0) {
          doc.setFont("courier", "bold");
          doc.setFontSize(10);
          doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
          
          let chordLine = "";
          let lastPos = 0;
          line.chords.forEach((c) => {
            const spaces = Math.max(1, Math.floor(c.position / 1.5) - lastPos);
            chordLine += " ".repeat(spaces) + c.chord;
            lastPos = Math.floor(c.position / 1.5) + c.chord.length;
          });
          
          doc.text(chordLine, 18, currentY);
          currentY += 5.5;
        }
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.5);
        doc.setTextColor(30, 41, 59);
        doc.text(line.text, 18, currentY);
        currentY += 8.5;
        
        // Multi-page check
        if (currentY > 270) {
          doc.addPage();
          currentY = 20;
        }
      });
      
      // Save
      const filename = `Cifra_${song.title.replace(/\s+/g, "_")}.pdf`;
      doc.save(filename);
      
      // Log to SQLite!
      if (currentUser?.email) {
        await fetch("/api/pdf-download/log", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: currentUser.email,
            downloadType: `Cifra: ${song.title}`
          })
        });
      }
    } catch (e) {
      console.error("Erro ao gerar PDF da música único:", e);
    } finally {
      setDownloadingSingle(false);
    }
  };

  const handleUploadSongPDFToDrive = async (song: Song) => {
    const token = getAccessToken();
    if (!token) {
      alert("Por favor, conecte sua conta Google no menu 'Google Drive' para salvar no Drive.");
      return;
    }

    setUploadingToDrive(true);
    try {
      const doc = new jsPDF();
      
      // Theme colors
      const primaryColor = [30, 41, 59];
      const accentColor = [217, 119, 6];
      
      // Page setup & title banner
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(0, 0, 210, 36, "F");
      
      // Title
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.text(song.title.toUpperCase(), 15, 16);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(`Cifra de Violao - Artista: ${song.artist}`, 15, 24);
      
      const today = new Date().toLocaleDateString("pt-BR");
      doc.text(`Guitar Studio - ${today}`, 150, 16);
      
      // Info board
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("INFORMACOES DE EXECUCAO", 15, 48);
      
      doc.setDrawColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.setLineWidth(0.5);
      doc.line(15, 51, 195, 51);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(75, 85, 99);
      doc.text(`Ritmo/Levada: ${song.rhythm}`, 15, 58);
      doc.text(`BPM: ${song.bpm}`, 15, 63);
      doc.text(`Acordes Utilizados: ${song.chordsUsed.join(", ")}`, 110, 58);
      doc.text(`Padrao de Batida: ${song.strummingPattern.join(" ")}`, 110, 63);
      
      if (song.videoTip) {
        doc.setFont("helvetica", "italic");
        doc.text(`Dica de Treino: ${song.videoTip}`, 15, 69);
      }
      
      // Lyrics + Chords board
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("CIFRA DA MUSICA", 15, 82);
      doc.line(15, 85, 195, 85);
      
      let currentY = 94;
      
      song.lines.forEach((line) => {
        if (line.chords && line.chords.length > 0) {
          doc.setFont("courier", "bold");
          doc.setFontSize(10);
          doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
          
          let chordLine = "";
          let lastPos = 0;
          line.chords.forEach((c) => {
            const spaces = Math.max(1, Math.floor(c.position / 1.5) - lastPos);
            chordLine += " ".repeat(spaces) + c.chord;
            lastPos = Math.floor(c.position / 1.5) + c.chord.length;
          });
          
          doc.text(chordLine, 18, currentY);
          currentY += 5.5;
        }
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.5);
        doc.setTextColor(30, 41, 59);
        doc.text(line.text, 18, currentY);
        currentY += 8.5;
        
        if (currentY > 270) {
          doc.addPage();
          currentY = 20;
        }
      });

      const pdfArrayBuffer = doc.output("arraybuffer");
      
      // Find or create "Guitar Studio" folder
      const folderQuery = encodeURIComponent("name = 'Guitar Studio' and mimeType = 'application/vnd.google-apps.folder' and trashed = false");
      const folderRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${folderQuery}&fields=files(id,name)`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const folderData = await folderRes.json();
      let folderId = folderData.files?.[0]?.id;

      if (!folderId) {
        const createFolderRes = await fetch("https://www.googleapis.com/drive/v3/files", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            name: "Guitar Studio",
            mimeType: "application/vnd.google-apps.folder",
            description: "Pasta reservada para salvar cifras impressas e backups de progresso do Guitar Studio."
          })
        });
        const newFolder = await createFolderRes.json();
        folderId = newFolder.id;
      }

      // Create PDF file entry on Drive
      const filename = `Cifra_${song.title.replace(/\s+/g, "_")}.pdf`;
      const createRes = await fetch("https://www.googleapis.com/drive/v3/files", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: filename,
          parents: [folderId]
        })
      });
      const fileData = await createRes.json();

      // Patch the file binary payload
      await fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileData.id}?uploadType=media`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/pdf"
        },
        body: pdfArrayBuffer
      });

      alert(`A cifra "${song.title}" foi salva diretamente no seu Google Drive com sucesso! ☁️`);

      // Log save to system
      if (currentUser?.email) {
        await fetch("/api/pdf-download/log", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: currentUser.email,
            downloadType: `OneDrive Drive: Cifra - ${song.title}`
          })
        });
      }
    } catch (e) {
      console.error("Erro ao subir PDF para o Google Drive:", e);
      alert("Erro ao enviar a cifra para o Google Drive. Certifique-se de que conectou sua conta.");
    } finally {
      setUploadingToDrive(false);
    }
  };

  const handleDownloadSongbookPDF = async () => {
    setDownloadingSongbook(true);
    try {
      const doc = new jsPDF();
      
      // Theme colors
      const primaryColor = [30, 41, 59];
      const accentColor = [217, 119, 6];
      
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(0, 0, 210, 297, "F");
      
      // Cover logo decoration
      doc.setDrawColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.setLineWidth(1.5);
      doc.rect(15, 15, 180, 267);
      
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(32);
      doc.text("GUITAR STUDIO", 105, 90, { align: "center" });
      
      doc.setFontSize(22);
      doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.text("SONGBOOK OFICIAL", 105, 115, { align: "center" });
      
      doc.setFont("helvetica", "normal");
      doc.setTextColor(200, 203, 210);
      doc.setFontSize(13);
      doc.text("O repertório completo com cifras fáceis, ritmos,", 105, 140, { align: "center" });
      doc.text("batidas detalhadas e dicas de execução de violão.", 105, 148, { align: "center" });
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(255, 255, 255);
      doc.text(`Total de Músicas: ${allSongs.length}`, 105, 195, { align: "center" });
      
      const studentName = currentUser?.username || "Estudante Dedicado";
      doc.text(`Compilado Especialmente para: ${studentName}`, 105, 210, { align: "center" });
      
      const today = new Date().toLocaleDateString("pt-BR");
      doc.setFont("helvetica", "italic");
      doc.setFontSize(10);
      doc.setTextColor(150, 153, 160);
      doc.text(`Gerado em: ${today}`, 105, 260, { align: "center" });
      
      const addHeaderFooter = (pDoc: typeof doc, pTitle: string, pArtist: string, pPageNum: number) => {
        pDoc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        pDoc.rect(0, 0, 210, 22, "F");
        
        pDoc.setTextColor(255, 255, 255);
        pDoc.setFont("helvetica", "bold");
        pDoc.setFontSize(11);
        pDoc.text("GUITAR STUDIO SONGBOOK", 15, 12);
        
        pDoc.setFont("helvetica", "italic");
        pDoc.setFontSize(9);
        pDoc.setTextColor(230, 235, 245);
        pDoc.text(`${pTitle} (${pArtist})`, 110, 12);
        
        // Footer line
        pDoc.setDrawColor(226, 232, 240);
        pDoc.setLineWidth(0.4);
        pDoc.line(15, 280, 195, 280);
        
        pDoc.setTextColor(150, 150, 150);
        pDoc.setFont("helvetica", "normal");
        pDoc.setFontSize(8);
        pDoc.text("Studio de Violão Guitar Studio - Todos os direitos reservados.", 15, 285);
        pDoc.text(`Página ${pPageNum}`, 180, 285);
      };
      
      let pageNum = 1;
      
      allSongs.forEach((song) => {
        doc.addPage();
        pageNum++;
        
        addHeaderFooter(doc, song.title, song.artist, pageNum);
        
        doc.setFillColor(248, 250, 252);
        doc.rect(15, 30, 180, 32, "F");
        
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.text(song.title, 20, 42);
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(100, 110, 125);
        doc.text(`Artista: ${song.artist} | BPM: ${song.bpm} | Ritmo: ${song.rhythm}`, 20, 48);
        doc.text(`Acordes: ${song.chordsUsed.join(", ")} | Batida: ${song.strummingPattern.join(" ")}`, 20, 54);
        
        doc.setDrawColor(accentColor[0], accentColor[1], accentColor[2]);
        doc.setLineWidth(0.5);
        doc.line(15, 68, 195, 68);
        
        let currentY = 78;
        
        song.lines.forEach((line) => {
          if (line.chords && line.chords.length > 0) {
            doc.setFont("courier", "bold");
            doc.setFontSize(9.5);
            doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
            
            let chordLine = "";
            let lastPos = 0;
            line.chords.forEach((c) => {
              const spaces = Math.max(1, Math.floor(c.position / 1.5) - lastPos);
              chordLine += " ".repeat(spaces) + c.chord;
              lastPos = Math.floor(c.position / 1.5) + c.chord.length;
            });
            
            doc.text(chordLine, 18, currentY);
            currentY += 5.5;
          }
          
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9.5);
          doc.setTextColor(15, 23, 42);
          doc.text(line.text, 18, currentY);
          currentY += 8.5;
          
          if (currentY > 265) {
            doc.addPage();
            pageNum++;
            addHeaderFooter(doc, song.title, song.artist, pageNum);
            currentY = 32;
          }
        });
        
        if (song.videoTip && currentY < 240) {
          currentY += 5;
          doc.setFillColor(254, 243, 199);
          doc.rect(15, currentY, 180, 16, "F");
          doc.setFont("helvetica", "bold");
          doc.setFontSize(8.5);
          doc.setTextColor(146, 64, 14);
          doc.text("Dica de Execução:", 18, currentY + 6);
          doc.setFont("helvetica", "italic");
          const truncatedTip = song.videoTip.length > 95 ? song.videoTip.substring(0, 92) + "..." : song.videoTip;
          doc.text(truncatedTip, 18, currentY + 11);
        }
      });
      
      doc.save("Songbook_Guitar_Studio_Completo.pdf");
      
      if (currentUser?.email) {
        await fetch("/api/pdf-download/log", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: currentUser.email,
            downloadType: "Songbook Completo"
          })
        });
      }
    } catch (e) {
      console.error("Erro ao gerar Songbook em PDF:", e);
    } finally {
      setDownloadingSongbook(false);
    }
  };

  const handleChordClick = (chordName: string) => {
    // If we have custom map use it, otherwise default to single string pluck or major open
    const frets = CHORD_FRETS[chordName] || ["x", "x", 0, 2, 3, 2];
    playGuitarChord(frets, "strum");
  };

  const renderLyricLineWithChords = (line: SongLine, lineIdx: number) => {
    // Generate styled chords line above text
    if (line.chords.length === 0) {
      return (
        <div key={lineIdx} className="py-2.5">
          <p className="text-slate-700 dark:text-stone-300 font-medium text-sm leading-relaxed">{line.text}</p>
        </div>
      );
    }

    // Build line of text with positioned absolute chords
    // A robust rendering: we'll match spacing or use split flex layout
    return (
      <div key={lineIdx} className="py-3.5 border-b border-slate-100/50 dark:border-stone-850/30">
        {/* Chords row */}
        <div className="flex gap-4 mb-1 h-6">
          {line.chords.map((c, cIdx) => (
            <button
              key={cIdx}
              onClick={() => handleChordClick(c.chord)}
              id={`song-chord-click-${lineIdx}-${cIdx}`}
              className="px-2.5 py-0.5 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-900 hover:text-stone-50 dark:hover:bg-amber-700 font-mono font-bold text-[13px] text-amber-800 dark:text-amber-400 rounded-lg border border-amber-200/50 dark:border-stone-800 transition active:scale-95 flex items-center gap-1 shadow-sm shrink-0"
              title="Clique para ouvir"
            >
              <span>{c.chord}</span>
              <span className="text-[9px] opacity-60">🎵</span>
            </button>
          ))}
        </div>
        
        {/* Lyric line text */}
        <p className="text-slate-800 dark:text-stone-250 font-bold text-sm select-auto">
          {line.text}
        </p>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Sub-tab selection toggle */}
      <div className="flex gap-2 bg-slate-100 dark:bg-stone-900/60 p-1.5 rounded-2xl border border-slate-200/50 dark:border-stone-800/80 max-w-md">
        <button
          onClick={() => {
            handleStopRiff();
            setSubTab("repertorio");
          }}
          className={`flex-1 py-2 px-4 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 border-0 cursor-pointer ${
            subTab === "repertorio"
              ? "bg-slate-900 text-white dark:bg-amber-600 dark:text-stone-950 shadow-sm"
              : "text-slate-500 dark:text-stone-400 hover:text-slate-800 dark:hover:text-stone-200 hover:bg-slate-200/45 dark:hover:bg-stone-800/40"
          }`}
        >
          <Music className="w-4 h-4" />
          Músicas Cifradas
        </button>
        <button
          onClick={() => setSubTab("riffs")}
          className={`flex-1 py-2 px-4 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 border-0 cursor-pointer ${
            subTab === "riffs"
              ? "bg-slate-900 text-white dark:bg-amber-600 dark:text-stone-950 shadow-sm"
              : "text-slate-500 dark:text-stone-400 hover:text-slate-800 dark:hover:text-stone-200 hover:bg-slate-200/45 dark:hover:bg-stone-800/40"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Riffs Famosos ✨
        </button>
      </div>

      {subTab === "repertorio" ? (
        <div id="songs-tab-container" className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Song selector column / Left */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-stone-900 dark:to-stone-950 p-4 rounded-xl border border-amber-100 dark:border-stone-800">
              <h3 className="font-bold text-xs text-amber-900 dark:text-amber-100 uppercase tracking-widest flex items-center gap-2">
                <Disc className="w-4 h-4 animate-spin text-amber-500" />
                Repertório de Treino Do Zero
              </h3>
              <p className="text-xs text-slate-500 dark:text-stone-400 mt-1 leading-normal">
                Toque canções clássicas usando os ritmos e acordes que você aprendeu. Clique nos acordes azuis/laranjas no texto para ouvir como montá-los.
              </p>
            </div>

            <button
              onClick={handleDownloadSongbookPDF}
              disabled={downloadingSongbook}
              id="download-songbook-pdf-btn"
              className="py-3 px-4 bg-amber-600 hover:bg-amber-500 font-extrabold text-xs text-white rounded-xl shadow-sm transition flex items-center justify-center gap-2 cursor-pointer border-0 disabled:opacity-50"
            >
              {downloadingSongbook ? (
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <BookOpen className="w-4 h-4 text-white" />
              )}
              <span>Baixar Songbook PDF (Repertório)</span>
            </button>

            <div className="flex flex-col gap-3">
              {allSongs.map((song) => {
                const isSelected = selectedSong.id === song.id;
                return (
                  <button
                    key={song.id}
                    onClick={() => setSelectedSong(song)}
                    id={`song-select-btn-${song.id}`}
                    className={`p-4 rounded-2xl border text-left transition relative overflow-hidden group ${
                      isSelected
                        ? "bg-white dark:bg-stone-900 border-amber-700 dark:border-amber-600 shadow"
                        : "bg-white dark:bg-stone-900 border-slate-200 dark:border-stone-800 hover:border-slate-350 dark:hover:border-stone-700"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900 dark:text-stone-100 block">
                          {song.title}
                        </h4>
                        <span className="text-xs text-slate-400 dark:text-stone-500 block">
                          {song.artist}
                        </span>
                      </div>

                      <span className="text-[10px] font-mono bg-stone-100 dark:bg-stone-950 font-bold px-2 py-1 rounded text-amber-800 dark:text-amber-400 shrink-0">
                        {song.bpm} BPM
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1 mt-3">
                      {song.chordsUsed.map((chord) => (
                        <span
                          key={chord}
                          className="text-[10px] font-bold font-mono px-2 py-0.5 bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-400 rounded-md border border-amber-100/50 dark:border-stone-800"
                        >
                          {chord}
                        </span>
                      ))}
                    </div>

                    {/* Arrow indicator on hover */}
                    <ArrowRight className="w-4 h-4 text-amber-700 absolute right-4 bottom-4 opacity-0 group-hover:opacity-100 transition translate-x-2 group-hover:translate-x-0" />
                  </button>
                );
              })}
            </div>

            <div className="bg-amber-500/5 dark:bg-stone-900 p-4 rounded-xl border border-amber-250/20 text-xs text-slate-500 leading-normal">
              <span className="font-semibold text-slate-800 dark:text-stone-200 block mb-1">💡 Regra de Ouro do Treino:</span>
              Memorize as trocas de acordes antes de começar a agitar o ritmo com a mão direita. Se preciso, toque uma única vez para baixo a cada acorde trocado.
            </div>
          </div>

          {/* Sheet Music Board / Right */}
          <div className="lg:col-span-8 bg-white dark:bg-stone-900 rounded-3xl border border-slate-200 dark:border-stone-800 p-6 flex flex-col justify-between shadow-sm">
            <div>
              {/* Header */}
              <div className="flex flex-col md:flex-row justify-between items-start gap-4 border-b border-slate-200 dark:border-stone-800 pb-5 mb-5 w-full">
                <div>
                  <div className="flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-amber-700" />
                    <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 dark:text-stone-500 font-mono">
                      Guia Cifrado Interativo
                    </span>
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                    {selectedSong.title}
                  </h2>
                  <p className="text-xs text-slate-400 dark:text-stone-400">
                    Artista: <strong className="text-slate-650 dark:text-stone-300 font-medium">{selectedSong.artist}</strong>
                  </p>
                </div>

                {/* Quick stats board */}
                <div className="flex gap-2.5 flex-wrap md:flex-nowrap">
                  <div className="px-3.5 py-2 bg-slate-50 dark:bg-stone-950 border border-slate-200 dark:border-stone-800 rounded-2xl text-center">
                    <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400 dark:text-stone-500 block">Levada</span>
                    <span className="text-xs font-bold text-slate-750 dark:text-stone-350">{selectedSong.rhythm}</span>
                  </div>

                  <div className="px-3.5 py-2 bg-slate-50 dark:bg-stone-950 border border-slate-200 dark:border-stone-800 rounded-2xl text-center">
                    <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400 dark:text-stone-550 block">Mão Esquerda</span>
                    <span className="text-xs font-bold text-amber-800 dark:text-amber-400 font-mono">
                      {selectedSong.chordsUsed.length} Acordes
                    </span>
                  </div>

                  <button
                    onClick={() => handleDownloadSingleSongPDF(selectedSong)}
                    disabled={downloadingSingle}
                    id="download-single-pdf-btn"
                    className="px-3.5 py-2 bg-amber-500/10 hover:bg-amber-500/20 active:scale-95 text-amber-900 dark:text-amber-400 font-extrabold text-xs rounded-2xl border border-amber-200/50 dark:border-stone-850 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {downloadingSingle ? (
                      <span className="w-3.5 h-3.5 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <FileDown className="w-4 h-4 text-amber-700 dark:text-amber-500" />
                    )}
                    <span>Baixar Cifra (PDF)</span>
                  </button>

                  <button
                    onClick={() => handleUploadSongPDFToDrive(selectedSong)}
                    disabled={uploadingToDrive}
                    id="upload-single-drive-btn"
                    className="px-3.5 py-2 bg-slate-900 dark:bg-stone-900 hover:bg-slate-800 dark:hover:bg-stone-800 active:scale-95 text-stone-100 dark:text-stone-300 font-extrabold text-xs rounded-2xl border border-slate-250 dark:border-stone-800 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {uploadingToDrive ? (
                      <span className="w-3.5 h-3.5 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Cloud className="w-4 h-4 text-amber-500" />
                    )}
                    <span>Salvar no Google Drive ☁️</span>
                  </button>
                </div>
              </div>

              {/* Strum sequence board */}
              <div className="bg-amber-500/5 dark:bg-stone-950/40 p-4 rounded-2xl border border-amber-100 dark:border-stone-850 flex flex-col gap-3 mb-6">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-stone-300 whitespace-nowrap">Levada de Ritmo:</span>
                  <div className="flex gap-1.5">
                    {selectedSong.strummingPattern.map((strum, sIdx) => {
                      const isDown = strum === "↓";
                      return (
                        <span
                          key={sIdx}
                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-sm ${
                            isDown
                              ? "bg-amber-800 text-stone-50"
                              : "bg-yellow-500 text-stone-900"
                          }`}
                        >
                          {strum}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {selectedSong.videoTip && (
                  <div className="text-[11px] text-slate-600 dark:text-stone-300 flex gap-1.5 items-center w-full pt-2.5 border-t border-amber-100/40 dark:border-stone-850/60 leading-relaxed">
                    <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                    <span><strong>Dica:</strong> {selectedSong.videoTip}</span>
                  </div>
                )}
              </div>

              {/* Sheet body */}
              <div className="bg-slate-50/50 dark:bg-stone-950/20 p-6 md:p-8 rounded-3xl border border-slate-205 dark:border-stone-850 font-sans shadow-inner overflow-hidden min-h-[280px]">
                <div className="max-w-md mx-auto space-y-2">
                  {selectedSong.lines.map((line, idx) => renderLyricLineWithChords(line, idx))}
                </div>
              </div>

              {/* Diário de Treino de Música - SQLite backend */}
              <div className="mt-8 pt-6 border-t border-slate-100 dark:border-stone-800 text-left">
                <h4 className="text-sm font-bold text-slate-900 dark:text-stone-100 flex items-center gap-2 mb-1.5">
                  <Edit3 className="w-4 h-4 text-amber-605" />
                  Diário de Treino de Música (Salvo no SQLite)
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-stone-400 mb-3 leading-relaxed">
                  Anote quais partes desta música você acha mais difíceis (ex: transição rápida de <strong>G</strong> para <strong>D</strong>), onde deve focar a levada ou seus tempos de andamento. Suas notas ficam vinculadas eternamente a esta música no SQLite!
                </p>
                <div className="space-y-2">
                  <textarea
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Exemplo: Praticar a transição rápida do acorde D para o G de modo mais limpo. Focar bem nas duas batidas para cima da levada..."
                    className="w-full min-h-[90px] p-3 text-xs bg-slate-50 dark:bg-stone-950 border border-slate-200 dark:border-stone-850 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-800 dark:text-stone-200"
                  />
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-slate-400 dark:text-stone-500">
                      {saveSuccess ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓ Suas anotações de música foram gravadas no SQLite!</span>
                      ) : (
                        "Anotação correspondente vinculada"
                      )}
                    </span>
                    <button
                      onClick={handleSaveNote}
                      disabled={isSavingNote}
                      id="save-song-note-btn"
                      className="px-4 py-1.5 bg-stone-900 hover:bg-stone-850 dark:bg-amber-600 dark:hover:bg-amber-500 text-white dark:text-slate-950 rounded-xl text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-40 cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      {isSavingNote ? "Salvando..." : "Gravar no Banco"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Dicionário Visual de Acordes da Música */}
              <div className="mt-8 pt-6 border-t border-slate-100 dark:border-stone-800 text-left">
                <h4 className="text-sm font-bold text-slate-900 dark:text-stone-100 flex items-center gap-2 mb-1.5">
                  <Disc className="w-4 h-4 text-amber-600 animate-pulse" />
                  Acordes Utilizados nesta Música (Clique para ouvir)
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-stone-400 mb-4 leading-relaxed">
                  Estude as posições ideais e clique em qualquer diagrama para ouvir a afinação acústica exata do acorde:
                </p>
                <div className="flex flex-wrap gap-4 pt-1">
                  {selectedSong.chordsUsed.map((chordName) => {
                    const frets = CHORD_FRETS[chordName] || ["x", "x", 0, 2, 3, 2];
                    return (
                      <SongChordCard key={chordName} name={chordName} frets={frets} />
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Action guidelines */}
            <div className="mt-8 pt-4 border-t border-slate-100 dark:border-stone-800 flex flex-col md:flex-row gap-4 justify-between items-center text-xs text-slate-400 dark:text-stone-500 text-center md:text-left">
              <span>
                Clique em qualquer cifra acima para ouvir a montagem do acorde!
              </span>
              <span className="font-bold text-amber-700 dark:text-amber-500 font-mono animate-pulse">
                ♪ Toque acompanhando no seu violão real
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div id="riffs-tab-container" className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Riffs list - Left Side */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-stone-900 dark:to-stone-950 p-4 rounded-xl border border-amber-100 dark:border-stone-800">
              <h3 className="font-bold text-xs text-amber-900 dark:text-amber-100 uppercase tracking-widest flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Treino de Riffs Interativos
              </h3>
              <p className="text-xs text-slate-500 dark:text-stone-400 mt-1 leading-normal">
                Aprenda os trechos de guitarra e violão mais influentes da história da música! Clique e ouça as notas individuais na Tablatura interativa de 6 cordas.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              {RIFF_DATABASE.map((riff) => {
                const isSelected = selectedRiff.id === riff.id;
                const diffColor = 
                  riff.difficulty === "Iniciante" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" :
                  riff.difficulty === "Intermediário" ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20" :
                  "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20";
                
                return (
                  <button
                    key={riff.id}
                    onClick={() => handleSelectRiff(riff)}
                    className={`p-4 rounded-2xl border text-left transition relative overflow-hidden group cursor-pointer ${
                      isSelected
                        ? "bg-white dark:bg-stone-900 border-2 border-amber-750 dark:border-amber-600 shadow-md"
                        : "bg-white dark:bg-stone-900 border border-slate-200 dark:border-stone-800 hover:border-slate-350 dark:hover:border-stone-700"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900 dark:text-stone-100 block">
                          {riff.title}
                        </h4>
                        <span className="text-xs text-slate-400 dark:text-stone-500 block">
                          {riff.artist}
                        </span>
                      </div>

                      <span className="text-[10px] font-mono bg-stone-100 dark:bg-stone-950 font-bold px-2 py-1 rounded text-amber-800 dark:text-amber-400 shrink-0">
                        {riff.bpm} BPM
                      </span>
                    </div>

                    <div className="flex justify-between items-center mt-3">
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded border uppercase ${diffColor}`}>
                        {riff.difficulty}
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-stone-500 font-mono">
                        {riff.steps.filter(s => Object.getOwnPropertyNames(s.notes).length > 0).length} notas
                      </span>
                    </div>

                    {/* Arrow indicator on hover */}
                    <ArrowRight className="w-4 h-4 text-amber-700 absolute right-4 bottom-4 opacity-0 group-hover:opacity-100 transition translate-x-2 group-hover:translate-x-0" />
                  </button>
                );
              })}
            </div>

            <div className="bg-amber-500/5 dark:bg-stone-900 p-4 rounded-xl border border-amber-250/20 text-xs text-slate-500 leading-normal">
              <span className="font-semibold text-slate-800 dark:text-stone-200 block mb-1">📐 Como Funciona:</span>
              O player reproduz o riff nota por nota marcando o compasso exato na tablatura horizontal. Sintonize a velocidade ideal para treinar devagar!
            </div>
          </div>

          {/* Tab Viewer Panel - Right Side */}
          <div className="lg:col-span-8 bg-white dark:bg-stone-900 rounded-3xl border border-slate-200 dark:border-stone-800 p-6 flex flex-col justify-between shadow-sm">
            <div>
              {/* Header */}
              <div className="flex flex-col md:flex-row justify-between items-start gap-4 border-b border-slate-200 dark:border-stone-800 pb-5 mb-5 w-full">
                <div>
                  <div className="flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-amber-700" />
                    <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 dark:text-stone-500 font-mono">
                      PRODUTOR DE RIFFS INTERATIVOS (TABS)
                    </span>
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                    {selectedRiff.title}
                  </h2>
                  <p className="text-xs text-slate-400 dark:text-stone-400">
                    Artista original: <strong className="text-slate-650 dark:text-stone-300 font-medium">{selectedRiff.artist}</strong>
                  </p>
                </div>

                {/* Riff difficulty marker */}
                <div className="flex gap-2.5">
                  <div className="px-3.5 py-2 bg-slate-50 dark:bg-stone-950 border border-slate-200 dark:border-stone-800 rounded-2xl text-center">
                    <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400 dark:text-stone-550 block">Dificuldade</span>
                    <span className={`text-xs font-black uppercase ${
                      selectedRiff.difficulty === "Iniciante" ? "text-emerald-600 dark:text-emerald-400" :
                      selectedRiff.difficulty === "Intermediário" ? "text-amber-700 dark:text-amber-400" :
                      "text-rose-600 dark:text-rose-450"
                    }`}>{selectedRiff.difficulty}</span>
                  </div>

                  <div className="px-3.5 py-2 bg-slate-50 dark:bg-stone-950 border border-slate-200 dark:border-stone-800 rounded-2xl text-center">
                    <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400 dark:text-stone-550 block">Andamento</span>
                    <span className="text-xs font-bold text-amber-800 dark:text-amber-400 font-mono">
                      {selectedRiff.bpm} BPM
                    </span>
                  </div>
                </div>
              </div>

              {/* Description block */}
              <p className="text-xs text-slate-600 dark:text-stone-300 mb-6 leading-relaxed">
                {selectedRiff.description}
              </p>

              {/* Sub-header and Player Controls for Riff */}
              <div className="bg-slate-50 dark:bg-stone-950/45 p-4 rounded-2xl border border-slate-200 dark:border-stone-850/60 flex flex-col sm:flex-row gap-4 items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  {isPlayingRiff ? (
                    <button
                      onClick={handleStopRiff}
                      id="stop-riff-btn"
                      className="flex items-center justify-center gap-1.5 py-2 px-4 bg-amber-800 hover:bg-amber-900 text-white rounded-xl text-xs font-bold transition border-0 cursor-pointer shadow-sm"
                    >
                      <Pause className="w-4 h-4" />
                      Pausar
                    </button>
                  ) : (
                    <button
                      onClick={handlePlayRiff}
                      id="play-riff-btn"
                      className="flex items-center justify-center gap-1.5 py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition border-0 cursor-pointer shadow-sm"
                    >
                      <Play className="w-4 h-4 fill-white" />
                      Tocar Riff
                    </button>
                  )}
                  
                  <button
                    onClick={() => {
                      handleStopRiff();
                      setTimeout(() => handlePlayRiff(), 50);
                    }}
                    id="reset-riff-btn"
                    className="p-2 bg-slate-200 hover:bg-slate-300 dark:bg-stone-800 dark:hover:bg-stone-750 text-slate-700 dark:text-stone-350 rounded-xl transition cursor-pointer border-0"
                    title="Reiniciar Execução"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>

                {/* Training Speed Toggle */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-stone-400 uppercase tracking-wider font-mono">
                    Velocidade:
                  </span>
                  <div className="flex gap-1 bg-slate-200 dark:bg-stone-900 p-0.5 rounded-lg border border-slate-300/40 dark:border-stone-800">
                    {([0.5, 0.75, 1.0, 1.25] as number[]).map((speed) => (
                      <button
                        key={speed}
                        onClick={() => setPlaybackSpeed(speed)}
                        className={`px-2 py-1 rounded text-[10px] font-bold font-mono transition border-0 cursor-pointer ${
                          playbackSpeed === speed
                            ? "bg-stone-900 text-white dark:bg-amber-500 dark:text-stone-950"
                            : "text-slate-600 hover:text-slate-900 dark:text-stone-400 hover:dark:text-stone-250 bg-transparent"
                        }`}
                      >
                        {speed}x
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* TAB EDITOR SHEET VIEW */}
              <div className="bg-stone-950 border border-slate-200 dark:border-stone-850 rounded-2xl p-6 shadow-inner relative overflow-hidden">
                <div className="absolute top-2 right-3 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="text-[8px] font-bold text-slate-500 dark:text-stone-600 font-mono uppercase tracking-widest">
                    Live TAB Synthesizer
                  </span>
                </div>

                {/* Horizontal Scroll wrapper */}
                <div className="overflow-x-auto scroller-elegant pb-2 pt-4">
                  <div className="min-w-[500px] flex flex-col gap-1">
                    
                    {/* Step headers showing numbering */}
                    <div className="flex items-center h-4 relative mb-1">
                      <span className="w-5" />
                      <div className="flex-1 flex gap-2 pl-6">
                        {selectedRiff.steps.map((_, sIdx) => {
                          const isActive = currentPlayingStep === sIdx;
                          return (
                            <div
                              key={sIdx}
                              className={`w-9 text-center font-mono text-[9px] font-bold shrink-0 ${
                                isActive ? "text-amber-500" : "text-stone-600"
                              }`}
                            >
                              {(sIdx + 1).toString().padStart(2, "0")}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Draw 6 string rows */}
                    {[
                      { label: "e", index: 5 },
                      { label: "B", index: 4 },
                      { label: "G", index: 3 },
                      { label: "D", index: 2 },
                      { label: "A", index: 1 },
                      { label: "E", index: 0 }
                    ].map((stringObj) => (
                      <div key={stringObj.index} className="flex items-center h-7 relative group">
                        {/* String label indicator */}
                        <span className="w-5 font-mono font-black text-xs text-stone-500 shrink-0 text-left">
                          {stringObj.label}
                        </span>

                        {/* Line vector line drawing standard TAB line */}
                        <div className="absolute left-6 right-0 h-[1.5px] bg-stone-800 dark:bg-stone-850 z-0" />

                        {/* Column blocks container */}
                        <div className="flex-1 flex gap-2 pl-6 z-10">
                          {selectedRiff.steps.map((step, sIdx) => {
                            const fret = step.notes[stringObj.index];
                            const hasNote = fret !== undefined;
                            const isActive = currentPlayingStep === sIdx;

                            return (
                              <button
                                key={sIdx}
                                onClick={() => {
                                  if (hasNote) {
                                    playGuitarNote(stringObj.index, fret, 0, 1.2);
                                  }
                                }}
                                className={`w-9 h-6.5 rounded flex items-center justify-center font-mono font-bold text-xs shrink-0 border-0 transition-all cursor-pointer ${
                                  isActive && hasNote
                                    ? "bg-amber-500 text-stone-950 scale-110 shadow-lg ring-2 ring-amber-400 font-black"
                                    : isActive
                                    ? "bg-amber-500/20 text-amber-505 border border-amber-500/20 font-black animate-pulse"
                                    : hasNote
                                    ? "bg-stone-900 hover:bg-stone-850 hover:scale-105 active:scale-95 border border-amber-500/30 text-amber-400 dark:text-amber-500"
                                    : "bg-transparent text-stone-700 hover:bg-white/5"
                                }`}
                                title={hasNote ? `Corda ${stringObj.label} (casa ${fret}) - Clique para ouvir` : "Silêncio"}
                              >
                                {hasNote ? fret : "-"}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}

                    {/* Bottom labels showing optional chord markers */}
                    <div className="flex items-center h-5 relative mt-1.5">
                      <span className="w-5" />
                      <div className="flex-1 flex gap-2 pl-6">
                        {selectedRiff.steps.map((step, sIdx) => {
                          const isActive = currentPlayingStep === sIdx;
                          return (
                            <div
                              key={sIdx}
                              className={`w-9 text-center font-mono text-[9px] font-black shrink-0 uppercase tracking-tight ${
                                isActive ? "text-amber-400" : "text-stone-500"
                              }`}
                            >
                              {step.label || ""}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                  </div>
                </div>

                {/* Micro instructions prompt */}
                <div className="mt-4 flex justify-between items-center text-[10px] text-stone-500 font-mono border-t border-stone-900 pt-3">
                  <span>💡 Dica: Clique em qualquer número para ouvir a nota individual</span>
                  <span>Corda 'e' = mais aguda | Corda 'E' = mais grave</span>
                </div>
              </div>

              {/* Performance tip section */}
              <div className="mt-6 p-4 bg-amber-500/5 dark:bg-stone-950/25 rounded-2xl border border-amber-500/10 dark:border-stone-850/80">
                <span className="text-[10px] font-bold text-amber-700 dark:text-amber-450 uppercase tracking-wider block mb-1.5 flex items-center gap-1 font-mono">
                  <Flame className="w-4 h-4 text-amber-600 shrink-0 animate-pulse" />
                  DICA DE EXECUÇÃO ESPECIALIZADA
                </span>
                <p className="text-xs text-slate-700 dark:text-stone-300 leading-relaxed font-sans">
                  {selectedRiff.rhythmTip}
                </p>
              </div>

              {/* Mini tab teaching manual */}
              <div className="mt-6 p-4 bg-slate-50 dark:bg-stone-950/10 rounded-2xl border border-slate-200 dark:border-stone-850 text-left">
                <span className="text-[10px] font-bold text-slate-500 dark:text-stone-400 uppercase tracking-widest block mb-1.5 font-mono">
                  COMO LER ESTE DIAGRAMA DE TABLATURA (TAB):
                </span>
                <div className="text-[11px] text-slate-500 dark:text-stone-400 leading-relaxed space-y-1">
                  • Cada uma das 6 linhas representa uma corda da guitarra/violão. A linha de cima <strong>(e)</strong> representa a corda mais fina, e a de baixo <strong>(E)</strong> a mais grossa.<br />
                  • Os números escritos nas linhas representam os <strong>trastes</strong> (as casas do braço do instrumento) nos quais você pressiona a corda correspondente antes de tocá-la.<br />
                  • O número <strong>0</strong> representa que a corda é tocada solta (sem pressionar nenhuma casa).<br />
                  • O símbolo <strong>-</strong> (traço) de silêncio denota pausa ou ausência de digitação naquele momento rítmico do riff.
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100 dark:border-stone-800 text-center font-bold text-amber-700 dark:text-amber-500 text-xs font-mono animate-pulse">
              ★ Pratique diariamente repetindo o Loop até sintonizar a perfeição!
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Custom compact Guitar Chord Card Component for Songs visual guide
 */
function SongChordCard({ name, frets }: { name: string; frets: (number | "x")[]; key?: string }) {
  const width = 88;
  const height = 110;
  const leftMargin = 14;
  const rightMargin = 74;
  const topMargin = 22;
  const bottomMargin = 96;
  const totalStrings = 6;
  const totalFrets = 4;
  const colWidth = (rightMargin - leftMargin) / (totalStrings - 1);
  const rowHeight = (bottomMargin - topMargin) / totalFrets;
  const baseFret = 1;

  const handlePlay = () => {
    playGuitarChord(frets, "strum");
  };

  return (
    <div
      onClick={handlePlay}
      className="flex flex-col items-center p-3 bg-slate-50 hover:bg-slate-100/70 dark:bg-stone-950/45 dark:hover:bg-stone-950/80 border border-slate-200/60 dark:border-stone-850 rounded-2xl w-[114px] transition-all hover:scale-105 active:scale-95 cursor-pointer text-center group shadow-sm"
      title={`Clique para ouvir ${name}`}
    >
      <span className="font-mono font-black text-xs leading-none text-slate-800 dark:text-stone-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors block mb-1.5">
        {name}
      </span>

      <svg width={width} height={height} className="text-slate-600 dark:text-stone-400">
        {/* Draw Fretboard Top Nut */}
        <line
          x1={leftMargin - 1}
          y1={topMargin}
          x2={rightMargin + 1}
          y2={topMargin}
          strokeWidth="3"
          className="stroke-amber-900/80 dark:stroke-amber-200/80"
        />

        {/* Draw Fretboard fret separators */}
        {Array.from({ length: totalFrets }).map((_, fIdx) => {
          const yCoord = topMargin + ((fIdx + 1) * rowHeight);
          return (
            <line
              key={fIdx}
              x1={leftMargin}
              y1={yCoord}
              x2={rightMargin}
              y2={yCoord}
              strokeWidth="1"
              className="stroke-slate-250 dark:stroke-stone-800"
            />
          );
        })}

        {/* Draw Strings */}
        {Array.from({ length: totalStrings }).map((_, sIdx) => {
          const xCoord = leftMargin + (sIdx * colWidth);
          const stringWeight = 0.6 + ((5 - sIdx) * 0.2);
          return (
            <line
              key={sIdx}
              x1={xCoord}
              y1={topMargin}
              x2={xCoord}
              y2={bottomMargin}
              strokeWidth={stringWeight}
              className="stroke-slate-400/85 dark:stroke-stone-600"
            />
          );
        })}

        {/* Mute (X) and Open (O) indicators at the top */}
        {frets.map((f, sIdx) => {
          const xCoord = leftMargin + (sIdx * colWidth);
          const yCoord = topMargin - 7;

          if (f === "x") {
            return (
              <g key={sIdx}>
                <line x1={xCoord - 2.5} y1={yCoord - 2.5} x2={xCoord + 2.5} y2={yCoord + 2.5} stroke="#ef4444" strokeWidth="1.2" />
                <line x1={xCoord + 2.5} y1={yCoord - 2.5} x2={xCoord - 2.5} y2={yCoord + 2.5} stroke="#ef4444" strokeWidth="1.2" />
              </g>
            );
          } else if (f === 0) {
            return (
              <circle
                key={sIdx}
                cx={xCoord}
                cy={yCoord}
                r="2.5"
                fill="none"
                stroke="#10b981"
                strokeWidth="1.2"
              />
            );
          }
          return null;
        })}

        {/* Draw pressed fingers points */}
        {frets.map((f, sIdx) => {
          if (f !== "x" && f > 0) {
            const x = leftMargin + (sIdx * colWidth);
            const relativeFret = f - baseFret + 1;
            const y = topMargin + ((relativeFret - 0.5) * rowHeight);

            return (
              <circle
                key={sIdx}
                cx={x}
                cy={y}
                r="4.5"
                className="fill-amber-700 dark:fill-amber-500"
              />
            );
          }
          return null;
        })}
      </svg>
      <span className="text-[10px] font-mono text-slate-400 dark:text-stone-500 mt-2 select-all">
        {frets.map(f => (f === "x" ? "X" : f)).join(" ")}
      </span>
    </div>
  );
}
